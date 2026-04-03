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
  useRevenueKpis, useLeadKpis, useOpsKpis, useTeamKpis,
  DYLAN_DEFAULT_TILES, VICTORIA_TILES, MARK_TILES, NASIYA_TILES,
  ELYSE_TILES, ROSE_TILES, KAE_TILES,
  type KpiTileConfig,
} from "@/hooks/useKpiData";
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

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function AdminDashboard() {
  const { authUser } = useAuth();
  const isOwner = authUser?.roles?.includes("owner") || false;

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
      refetchTeam();
      // Log activity
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

  // KPI data hooks
  const { data: revenue, refetch: refetchRevenue } = useRevenueKpis();
  const { data: leads, refetch: refetchLeads } = useLeadKpis(authUser?.id);
  const { data: ops, refetch: refetchOps } = useOpsKpis();
  const { data: team, refetch: refetchTeam } = useTeamKpis();

  const refetchAll = () => {
    refetchRevenue();
    refetchLeads();
    refetchOps();
    refetchTeam();
    toast.success("Dashboard refreshed");
  };

  // Get value for a tile
  const getTileValue = (id: string): { value: string | number; subtitle?: string; pending?: boolean } => {
    switch (id) {
      case "rev_today":
        return { value: formatCurrency(revenue?.totalRevenueToday || 0) };
      case "rev_month":
        return { value: formatCurrency(revenue?.totalRevenueMonth || 0) };
      case "stripe_today":
        return { value: formatCurrency(revenue?.stripePaymentsToday || 0), pending: !revenue?.stripeIntegrated };
      case "outstanding":
        return { value: formatCurrency(revenue?.outstandingBalances || 0) };
      case "rev_summit":
        return { value: formatCurrency(revenue?.unitRevenue?.summit || 0), subtitle: "This Month" };
      case "rev_spa":
        return { value: formatCurrency(revenue?.unitRevenue?.spa || 0), subtitle: "This Month" };
      case "rev_fitness":
        return { value: formatCurrency(revenue?.unitRevenue?.fitness || 0), subtitle: "This Month" };
      case "rev_hive":
        return { value: formatCurrency(revenue?.unitRevenue?.coworking || 0), subtitle: "This Month" };
      case "rev_vault":
        return { value: formatCurrency(revenue?.unitRevenue?.voice_vault || 0), subtitle: "This Month" };
      case "rev_mobile":
        return { value: formatCurrency(revenue?.unitRevenue?.mobile_homes || 0), subtitle: "This Month" };
      case "rev_elevated":
        return { value: formatCurrency(revenue?.unitRevenue?.elevated_by_elyse || 0), subtitle: "This Month" };
      case "rev_spa_today":
        return { value: formatCurrency(0), pending: true, subtitle: "Today" };
      case "leads_active":
        return { value: leads?.totalActive || 0 };
      case "leads_new":
        return { value: leads?.newLeadsWeek || 0 };
      case "leads_contacted":
        return { value: leads?.contactedToday || 0, subtitle: "Today" };
      case "leads_overdue":
        return { value: leads?.overdue || 0 };
      case "leads_hot":
        return { value: leads?.hotNoContact || 0 };
      case "pipeline_rate":
      case "pipeline_rate_top":
        return { value: `${leads?.conversionRate || 0}%` };
      case "leads_source":
        return {
          value: Object.entries(leads?.sourceBreakdown || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ") || "No data",
        };
      case "leads_unit":
        return {
          value: Object.entries(leads?.unitBreakdown || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ") || "No data",
        };
      case "leads_new_spa":
        return { value: leads?.unitBreakdown?.spa || 0 };
      case "bookings_today":
      case "bookings_today_spa":
        return { value: ops?.bookingsToday || 0 };
      case "bookings_week":
        return { value: ops?.bookingsWeek || 0 };
      case "approvals":
        return { value: ops?.pendingApprovals || 0 };
      case "offices":
        return { value: ops?.openOffices || "0/0" };
      case "memberships":
        return { value: ops?.activeMemberships || 0 };
      case "comm_pending":
        return { value: formatCurrency(team?.commissionPending || 0) };
      case "comm_approved":
        return { value: formatCurrency(team?.commissionApproved || 0) };
      case "comm_paid":
        return { value: formatCurrency(0), pending: true };
      case "payroll_next": {
        if (team?.nextPayrollDate) {
          try {
            const d = parseISO(team.nextPayrollDate);
            const daysLeft = differenceInDays(d, new Date());
            return {
              value: format(d, "MMM d, yyyy"),
              subtitle: daysLeft > 0 ? `${daysLeft} days remaining` : daysLeft === 0 ? "Today" : `${Math.abs(daysLeft)} days overdue`,
            };
          } catch {
            return { value: team.nextPayrollDate, subtitle: "Set in Settings" };
          }
        }
        return { value: "Not Set", subtitle: "Click to set date" };
      }
      case "promotions_active":
        return { value: 0, pending: true };
      case "schedule_today":
        return { value: ops?.bookingsToday || 0, subtitle: "Appointments" };
      case "schedule_gaps":
        return { value: 0, pending: true, subtitle: "Days with no bookings" };
      case "pipeline_breakdown":
        return { value: "—", pending: true };
      case "cost_per_lead":
        return { value: "Manual Entry", pending: true };
      default:
        return { value: "—" };
    }
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
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {renderTiles()}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {renderTiles()}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
