import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RotateCcw, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";
import { KpiTile } from "@/components/admin/KpiTile";
import {
  DYLAN_DEFAULT_TILES, VICTORIA_TILES, MARK_TILES, NASIYA_TILES,
  ELYSE_TILES, ROSE_TILES, KAE_TILES,
  type KpiTileConfig,
} from "@/hooks/useKpiData";
import { useRoleKpis, resolveKpiValue } from "@/hooks/useRoleKpis";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTile({
  tile, value, subtitle, pendingIntegration, isOwner, onRefresh, onRemove, onResize,
}: {
  tile: KpiTileConfig;
  value: string | number;
  subtitle?: string;
  pendingIntegration?: boolean;
  isOwner: boolean;
  onRefresh: () => void;
  onRemove: () => void;
  onResize: (size: "small" | "medium" | "large") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tile.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <KpiTile
        config={tile}
        value={value}
        subtitle={subtitle}
        pendingIntegration={pendingIntegration}
        isDraggable={isOwner}
        dragHandleProps={listeners}
        isOwner={isOwner}
        onRefresh={onRefresh}
        onRemove={onRemove}
        onResize={onResize}
      />
    </div>
  );
}

function getUserRole(roles: string[] | undefined): string | undefined {
  if (!roles || roles.length === 0) return undefined;
  if (roles.includes("owner")) return "owner";
  if (roles.includes("manager")) return "manager";
  if (roles.includes("sales_acquisitions")) return "sales_acquisitions";
  if (roles.includes("spa_lead")) return "spa_lead";
  if (roles.includes("marketing_lead")) return "marketing_lead";
  if (roles.includes("ops_lead")) return "ops_lead";
  if (roles.includes("ads_lead")) return "ads_lead";
  return "manager";
}

export default function AdminDashboard() {
  const { authUser } = useAuth();
  const isOwner = authUser?.roles?.includes("owner") || false;
  const currentRole = getUserRole(authUser?.roles);

  // Consolidated KPI data via role-based DB function
  const { data: kpiData, refetch: refetchKpis } = useRoleKpis(currentRole);

  // Determine which tiles to show based on role
  const getDefaultTiles = useCallback((): KpiTileConfig[] => {
    if (!authUser?.roles) return DYLAN_DEFAULT_TILES;
    const roles = authUser.roles;
    if (roles.includes("owner")) return DYLAN_DEFAULT_TILES;
    if (roles.includes("manager")) return VICTORIA_TILES;
    if (roles.includes("sales_acquisitions")) return MARK_TILES;
    if (roles.includes("spa_lead")) return NASIYA_TILES;
    if (roles.includes("marketing_lead")) return ELYSE_TILES;
    if (roles.includes("ops_lead")) return ROSE_TILES;
    if (roles.includes("ads_lead")) return KAE_TILES;
    return VICTORIA_TILES;
  }, [authUser?.roles]);

  const [tiles, setTiles] = useState<KpiTileConfig[]>(getDefaultTiles());
  const [layoutDirty, setLayoutDirty] = useState(false);
  const [payrollDateOpen, setPayrollDateOpen] = useState(false);
  const [payrollDate, setPayrollDate] = useState<Date | undefined>();

  // Save payroll date
  const savePayrollDate = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const { error } = await (supabase as any)
      .from("admin_settings")
      .update({ value: dateStr, updated_by: authUser?.id, updated_at: new Date().toISOString() })
      .eq("key", "next_payroll_run_date");
    if (!error) {
      setPayrollDate(date);
      setPayrollDateOpen(false);
      refetchKpis();
      await supabase.from("crm_activity_events").insert({
        event_type: "setting_changed" as any,
        entity_type: "admin_settings",
        entity_id: "next_payroll_run_date",
        actor_id: authUser?.id,
        metadata: { action: "payroll_date_updated", new_value: dateStr },
      });
      toast.success(`Next Payroll Run Date set to ${format(date, "MMM d, yyyy")}`);
    } else {
      toast.error("Failed to save payroll date");
    }
  };

  // Load saved layout for owner
  useEffect(() => {
    if (!isOwner || !authUser?.id) return;
    supabase
      .from("dashboard_layouts")
      .select("layout_json")
      .eq("user_id", authUser.id)
      .eq("is_default", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.layout_json) {
          try {
            const saved = data.layout_json as unknown as KpiTileConfig[];
            if (Array.isArray(saved) && saved.length > 0) {
              setTiles(saved);
            }
          } catch { /* use defaults */ }
        }
      });
  }, [isOwner, authUser?.id]);

  const refetchAll = () => {
    refetchKpis();
    toast.success("Dashboard refreshed");
  };

  // Get value for a tile from consolidated data
  const getTileValue = (id: string): { value: string | number; subtitle?: string; pending?: boolean } => {
    // Special case for payroll_next — needs separate admin_settings query  
    if (id === "payroll_next") {
      const resolved = resolveKpiValue(id, kpiData);
      return resolved;
    }
    return resolveKpiValue(id, kpiData);
  };

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTiles((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);
        setLayoutDirty(true);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const saveLayout = async () => {
    if (!authUser?.id) return;
    const { error } = await supabase
      .from("dashboard_layouts")
      .upsert(
        { user_id: authUser.id, layout_json: tiles as any, is_default: true },
        { onConflict: "user_id" }
      );
    if (error) {
      toast.error("Failed to save layout");
    } else {
      toast.success("Layout saved");
      setLayoutDirty(false);
    }
  };

  const resetLayout = () => {
    setTiles(getDefaultTiles());
    setLayoutDirty(true);
    toast.info("Layout reset to default");
  };

  const removeTile = (id: string) => {
    setTiles((prev) => prev.filter((t) => t.id !== id));
    setLayoutDirty(true);
  };

  const resizeTile = (id: string, size: "small" | "medium" | "large") => {
    setTiles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, size } : t))
    );
    setLayoutDirty(true);
  };

  const addTile = () => {
    const allTiles = DYLAN_DEFAULT_TILES;
    const missing = allTiles.filter((t) => !tiles.find((x) => x.id === t.id));
    if (missing.length === 0) {
      toast.info("All tiles are already on your dashboard");
      return;
    }
    setTiles((prev) => [...prev, missing[0]]);
    setLayoutDirty(true);
    toast.success(`Added "${missing[0].title}" tile`);
  };

  const renderTiles = () => {
    return tiles.map((tile) => {
      const { value, subtitle, pending } = getTileValue(tile.id);

      // Special handling for payroll_next tile - inline date editor for owner
      if (tile.id === "payroll_next" && isOwner) {
        return (
          <div key={tile.id}>
            <Popover open={payrollDateOpen} onOpenChange={setPayrollDateOpen}>
              <PopoverTrigger asChild>
                <div className="cursor-pointer">
                  {isOwner ? (
                    <SortableTile
                      tile={tile}
                      value={value}
                      subtitle={subtitle ? `${subtitle} — Click to edit` : "Click to set date"}
                      pendingIntegration={pending}
                      isOwner={isOwner}
                      onRefresh={refetchAll}
                      onRemove={() => removeTile(tile.id)}
                      onResize={(size) => resizeTile(tile.id, size)}
                    />
                  ) : (
                    <KpiTile config={tile} value={value} subtitle={subtitle} pendingIntegration={pending} onRefresh={refetchAll} isOwner={false} />
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={payrollDate}
                  onSelect={(date) => { if (date) savePayrollDate(date); }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      }

      if (isOwner) {
        return (
          <SortableTile
            key={tile.id}
            tile={tile}
            value={value}
            subtitle={subtitle}
            pendingIntegration={pending}
            isOwner={isOwner}
            onRefresh={refetchAll}
            onRemove={() => removeTile(tile.id)}
            onResize={(size) => resizeTile(tile.id, size)}
          />
        );
      }

      return (
        <KpiTile
          key={tile.id}
          config={tile}
          value={value}
          subtitle={subtitle}
          pendingIntegration={pending}
          onRefresh={refetchAll}
          isOwner={false}
        />
      );
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400">
              Welcome back, {authUser?.profile?.first_name || "Admin"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={addTile}>
                  <Plus className="h-4 w-4 mr-1" /> Add Tile
                </Button>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={resetLayout}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
                {layoutDirty && (
                  <Button size="sm" className="bg-amber-500 text-black hover:bg-amber-400" onClick={saveLayout}>
                    <Save className="h-4 w-4 mr-1" /> Save Layout
                  </Button>
                )}
              </>
            )}
            <Badge variant="outline" className="border-zinc-700 text-zinc-400 capitalize">
              {authUser?.roles?.[0]?.replace(/_/g, " ") || "Staff"}
            </Badge>
          </div>
        </div>

        {isOwner ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tiles.map((t) => t.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {renderTiles()}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {renderTiles()}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
