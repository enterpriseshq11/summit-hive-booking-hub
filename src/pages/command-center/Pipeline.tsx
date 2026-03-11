import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin";
import { useCrmLeads, useUpdateCrmLead } from "@/hooks/useCrmLeads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Mail, Phone, User, GripVertical, Flame, Snowflake, Thermometer, Filter } from "lucide-react";
import {
  pipelineStages,
  temperatureConfig,
  type CrmLeadStatus,
  type LeadTemperature,
} from "@/constants/pipelineConfig";
import { isToday } from "date-fns";

// ─── Filter Types ───
type QuickFilter =
  | "all"
  | "hot_leads"
  | "follow_ups_today"
  | "new_not_contacted"
  | "deposit_pending"
  | "contracts_outstanding";

const quickFilters: { key: QuickFilter; label: string; icon?: React.ReactNode }[] = [
  { key: "all", label: "All Leads" },
  { key: "hot_leads", label: "Hot Leads", icon: <Flame className="h-3.5 w-3.5" /> },
  { key: "follow_ups_today", label: "Follow Ups Today" },
  { key: "new_not_contacted", label: "New / Not Contacted" },
  { key: "deposit_pending", label: "Deposit Pending" },
  { key: "contracts_outstanding", label: "Contracts Out" },
];

// ─── Temperature Badge ───
function TemperatureBadge({ temp }: { temp: string | null }) {
  const t = (temp as LeadTemperature) || "cold";
  const cfg = temperatureConfig[t] || temperatureConfig.cold;
  const Icon = t === "hot" ? Flame : t === "warm" ? Thermometer : Snowflake;
  return (
    <Badge variant="outline" className={cn("text-[10px] gap-1 px-1.5 py-0", cfg.color)}>
      <Icon className="h-2.5 w-2.5" />
      {cfg.label}
    </Badge>
  );
}

// ─── Lead Card ───
interface LeadCardProps {
  lead: {
    id: string;
    lead_name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    business_unit: string;
    temperature?: string | null;
    follow_up_due?: string | null;
    status?: string | null;
    assigned_employee?: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
  isDragging?: boolean;
}

function LeadCard({ lead, isDragging }: LeadCardProps) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isNew = lead.status === "new";
  const isFollowUpToday = lead.follow_up_due && isToday(new Date(lead.follow_up_due));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-zinc-800 border rounded-lg p-3 cursor-pointer hover:border-amber-500/50 transition-colors",
        isDragging && "opacity-50",
        isNew && "border-amber-500/70 ring-1 ring-amber-500/30",
        isFollowUpToday && !isNew && "border-yellow-500/60",
        !isNew && !isFollowUpToday && "border-zinc-700"
      )}
      onClick={() => navigate(`/admin/leads/${lead.id}`)}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-100 truncate text-sm">{lead.lead_name}</span>
            <TemperatureBadge temp={(lead as any).temperature ?? null} />
          </div>
          {lead.company_name && (
            <div className="text-xs text-zinc-500 truncate mt-0.5">{lead.company_name}</div>
          )}
          <div className="mt-1.5 space-y-0.5">
            {lead.email && (
              <div className="flex items-center gap-1 text-zinc-400 text-xs truncate">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-1 text-zinc-400 text-xs">
                <Phone className="h-3 w-3 flex-shrink-0" />
                {lead.phone}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400 capitalize px-1.5 py-0">
              {lead.business_unit}
            </Badge>
            {isFollowUpToday && (
              <Badge variant="outline" className="text-[10px] border-yellow-600/50 text-yellow-400 px-1.5 py-0">
                Follow up today
              </Badge>
            )}
          </div>
          {lead.assigned_employee && (
            <div className="flex items-center gap-1 text-zinc-500 text-xs mt-1.5">
              <User className="h-3 w-3" />
              {lead.assigned_employee.first_name} {lead.assigned_employee.last_name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Column (droppable) ───
function PipelineColumn({
  stage,
  leads,
  isLoading,
  activeId,
}: {
  stage: (typeof pipelineStages)[number];
  leads: any[];
  isLoading: boolean;
  activeId: string | null;
}) {
  return (
    <div
      id={stage.status}
      className={cn("min-w-[220px] bg-zinc-900 rounded-lg border-t-2 flex flex-col", stage.borderColor)}
    >
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-zinc-100 text-sm">{stage.label}</h3>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs">
            {leads.length}
          </Badge>
        </div>
      </div>
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="p-2 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto flex-1" id={stage.status}>
          {isLoading ? (
            <div className="text-center py-4 text-zinc-500 text-sm">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-6 text-zinc-600 text-xs">No leads</div>
          ) : (
            leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} isDragging={activeId === lead.id} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Main Pipeline Page ───
export default function CommandCenterPipeline() {
  const { data: leads, isLoading } = useCrmLeads();
  const updateLead = useUpdateCrmLead();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Apply quick filter to all leads
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    switch (quickFilter) {
      case "hot_leads":
        return leads.filter((l) => (l as any).temperature === "hot" || l.status === "hot_lead");
      case "follow_ups_today":
        return leads.filter((l) => l.follow_up_due && isToday(new Date(l.follow_up_due)));
      case "new_not_contacted":
        return leads.filter((l) => l.status === "new");
      case "deposit_pending":
        return leads.filter((l) => l.status === "deposit_pending");
      case "contracts_outstanding":
        return leads.filter((l) => l.status === "contract_sent");
      default:
        return leads;
    }
  }, [leads, quickFilter]);

  const getLeadsByStatus = (status: CrmLeadStatus) =>
    filteredLeads.filter((lead) => lead.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as CrmLeadStatus;

    if (pipelineStages.some((s) => s.status === newStatus)) {
      const lead = leads?.find((l) => l.id === leadId);
      if (lead && lead.status !== newStatus) {
        // Auto-set temperature on certain stage moves
        const autoTemp =
          newStatus === "hot_lead" || newStatus === "deposit_pending" || newStatus === "booked"
            ? "hot"
            : newStatus === "warm_lead" || newStatus === "responded" || newStatus === "proposal_sent" || newStatus === "contract_sent"
              ? "warm"
              : undefined;

        updateLead.mutate({
          id: leadId,
          status: newStatus,
          ...(autoTemp ? { temperature: autoTemp } : {}),
        } as any);
      }
    }
  };

  const activeLead = activeId ? leads?.find((l) => l.id === activeId) : null;

  // Summary stats
  const totalNew = leads?.filter((l) => l.status === "new").length ?? 0;
  const totalHot = leads?.filter((l) => (l as any).temperature === "hot" || l.status === "hot_lead").length ?? 0;
  const totalFollowUp = leads?.filter((l) => l.follow_up_due && isToday(new Date(l.follow_up_due))).length ?? 0;
  const totalDeposit = leads?.filter((l) => l.status === "deposit_pending").length ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Pipeline</h1>
          <p className="text-zinc-400 text-sm">Drag and drop leads through the booking pipeline</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "New Leads", value: totalNew, color: "text-zinc-300" },
            { label: "Hot Leads", value: totalHot, color: "text-red-400" },
            { label: "Follow Ups Today", value: totalFollowUp, color: "text-yellow-400" },
            { label: "Deposit Pending", value: totalDeposit, color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 rounded-lg border border-zinc-800 p-3">
              <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-zinc-500" />
          {quickFilters.map((f) => (
            <Button
              key={f.key}
              variant={quickFilter === f.key ? "default" : "outline"}
              size="sm"
              className={cn(
                "text-xs h-7",
                quickFilter === f.key
                  ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                  : "border-zinc-700 text-zinc-400 hover:text-zinc-200 bg-transparent"
              )}
              onClick={() => setQuickFilter(f.key)}
            >
              {f.icon}
              {f.label}
            </Button>
          ))}
        </div>

        {/* Pipeline Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {pipelineStages.map((stage) => (
              <PipelineColumn
                key={stage.status}
                stage={stage}
                leads={getLeadsByStatus(stage.status)}
                isLoading={isLoading}
                activeId={activeId}
              />
            ))}
          </div>

          <DragOverlay>{activeLead ? <LeadCard lead={activeLead} /> : null}</DragOverlay>
        </DndContext>
      </div>
    </AdminLayout>
  );
}
