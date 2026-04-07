import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin";
import { useCrmLeads, useUpdateCrmLead } from "@/hooks/useCrmLeads";
import { useSyncLeadStage } from "@/hooks/useSyncLeadStage";
import { supabase } from "@/integrations/supabase/client";
import { useTodaysTasks, useUpdateLeadTask } from "@/hooks/useCrmLeadTasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Mail, Phone, User, GripVertical, Flame, Snowflake, Thermometer,
  Filter, Search, ArrowUpDown, CheckCircle2, AlertTriangle,
  Calendar, Clock, TrendingUp, Target, Users, FileText,
  DollarSign, ChevronDown, ChevronUp, BarChart3,
} from "lucide-react";
import {
  pipelineStages, temperatureConfig, calculatePriorityScore, sourceLabels,
  type CrmLeadStatus, type LeadTemperature,
} from "@/constants/pipelineConfig";
import { isToday, isPast, differenceInDays, differenceInHours, format } from "date-fns";

// ─── Types ───
type QuickFilter =
  | "all" | "hot_leads" | "follow_ups_today" | "new_not_contacted"
  | "deposit_pending" | "contracts_outstanding" | "overdue_follow_ups"
  | "stalled_hot";

type SortOption = "priority" | "follow_up" | "created" | "temperature" | "name";

const quickFilters: { key: QuickFilter; label: string; icon?: React.ReactNode }[] = [
  { key: "all", label: "All Leads" },
  { key: "hot_leads", label: "Hot Leads", icon: <Flame className="h-3.5 w-3.5" /> },
  { key: "follow_ups_today", label: "Follow Ups Today" },
  { key: "overdue_follow_ups", label: "Overdue Follow Ups", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  { key: "new_not_contacted", label: "New / Not Contacted" },
  { key: "deposit_pending", label: "Deposit Pending" },
  { key: "contracts_outstanding", label: "Contracts Out" },
  { key: "stalled_hot", label: "Stalled Hot Leads" },
];

// ─── Helper: check if lead is stalled hot (>7 days in hot_lead) ───
function isStalledHot(lead: any): boolean {
  if (lead.status !== "hot_lead") return false;
  if (!lead.updated_at) return false;
  return differenceInDays(new Date(), new Date(lead.updated_at)) > 7;
}

function isFollowUpOverdue(lead: any): boolean {
  if (!lead.follow_up_due) return false;
  if (["booked", "lost", "no_response"].includes(lead.status)) return false;
  return isPast(new Date(lead.follow_up_due)) && !isToday(new Date(lead.follow_up_due));
}

function isDepositOverdue(lead: any): boolean {
  if (lead.status !== "contract_sent") return false;
  if (!lead.updated_at) return false;
  return differenceInDays(new Date(), new Date(lead.updated_at)) > 5;
}

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

// ─── Enhanced Lead Card ───
interface LeadCardProps {
  lead: any;
  isDragging?: boolean;
  showPriority?: boolean;
}

function LeadCard({ lead, isDragging, showPriority }: LeadCardProps) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const isNew = lead.status === "new";
  const followUpToday = lead.follow_up_due && isToday(new Date(lead.follow_up_due));
  const followUpOverdue = isFollowUpOverdue(lead);
  const stalledHot = isStalledHot(lead);
  const depositOvd = isDepositOverdue(lead);
  const priority = calculatePriorityScore(lead);

  const cardStyle = {
    ...style,
    boxShadow: followUpOverdue ? "0 0 8px rgba(239, 68, 68, 0.4)" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      className={cn(
        "bg-zinc-800 rounded-lg p-3 cursor-pointer transition-colors relative group",
        isDragging && "opacity-50",
        followUpOverdue
          ? "border border-zinc-700 border-l-[3px] border-l-red-500"
          : isNew
          ? "border border-amber-500/70 ring-1 ring-amber-500/30"
          : stalledHot
          ? "border border-orange-500/70 ring-1 ring-orange-500/30"
          : depositOvd
          ? "border border-purple-500/70 ring-1 ring-purple-500/30"
          : followUpToday && !isNew
          ? "border border-yellow-500/60"
          : "border border-zinc-700 hover:border-amber-500/50"
      )}
      onClick={() => navigate(`/admin/leads/${lead.id}`)}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes} {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-100 truncate text-sm">{lead.lead_name}</span>
            <TemperatureBadge temp={lead.temperature ?? null} />
            {showPriority && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-600/50 text-amber-400">
                {priority}
              </Badge>
            )}
          </div>

          {/* Contact info */}
          <div className="mt-1 space-y-0.5">
            {lead.email && (
              <div className="flex items-center gap-1 text-zinc-400 text-xs truncate">
                <Mail className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-1 text-zinc-400 text-xs">
                <Phone className="h-3 w-3 flex-shrink-0" /> {lead.phone}
              </div>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {lead.source && (
              <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400 px-1.5 py-0">
                {sourceLabels[lead.source] || lead.source}
              </Badge>
            )}
            {(lead.contact_attempts ?? 0) > 0 && (
              <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400 px-1.5 py-0">
                Attempts: {lead.contact_attempts}
              </Badge>
            )}
          </div>

          {/* Dates row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {lead.last_contacted_at && (
              <span className="text-[10px] text-zinc-500">
                Last: {format(new Date(lead.last_contacted_at), "MMM d")}
              </span>
            )}
            {lead.follow_up_due && (
              <span className={cn(
                "text-[10px]",
                followUpOverdue ? "text-red-400 font-medium" :
                followUpToday ? "text-yellow-400" : "text-zinc-500"
              )}>
                FU: {format(new Date(lead.follow_up_due), "MMM d")}
              </span>
            )}
          </div>

          {/* Flags — Item 8: overdue badge red bg + white text */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {followUpOverdue && (
              <Badge className="text-[10px] bg-red-500 text-white px-1.5 py-0 border-0">
                Follow Up Overdue
              </Badge>
            )}
            {stalledHot && (
              <Badge variant="outline" className="text-[10px] border-orange-600/50 text-orange-400 px-1.5 py-0">
                Stalled Hot Lead
              </Badge>
            )}
            {depositOvd && (
              <Badge variant="outline" className="text-[10px] border-purple-600/50 text-purple-400 px-1.5 py-0">
                Deposit Overdue
              </Badge>
            )}
            {followUpToday && !followUpOverdue && (
              <Badge variant="outline" className="text-[10px] border-yellow-600/50 text-yellow-400 px-1.5 py-0">
                Follow up today
              </Badge>
            )}
          </div>

          {lead.assigned_employee && (
            <div className="flex items-center gap-1 text-zinc-500 text-xs mt-1">
              <User className="h-3 w-3" />
              {lead.assigned_employee.first_name} {lead.assigned_employee.last_name}
            </div>
          )}
        </div>
      </div>
      {/* Item 13: Hover action bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-9 bg-black/70 rounded-b-lg flex items-center justify-evenly transition-opacity",
          "opacity-0 group-hover:opacity-100",
          // Touch devices: always show
          "@[pointer:coarse]:opacity-100"
        )}
        style={{ pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="text-zinc-300 hover:text-amber-400 p-1.5"
          title="Log Contact"
          onClick={(e) => { e.stopPropagation(); /* TODO: open log modal */ }}
        >
          <Phone className="h-4 w-4" />
        </button>
        <button
          className="text-zinc-300 hover:text-amber-400 p-1.5"
          title="View Full Detail"
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/leads/${lead.id}`); }}
        >
          <FileText className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Pipeline Column ───
function PipelineColumn({ stage, leads, isLoading, activeId, showPriority }: {
  stage: (typeof pipelineStages)[number];
  leads: any[];
  isLoading: boolean;
  activeId: string | null;
  showPriority: boolean;
}) {
  return (
    <div id={stage.status} className={cn("min-w-[240px] bg-zinc-900 rounded-lg border-t-2 flex flex-col", stage.borderColor)}>
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-zinc-100 text-sm">{stage.label}</h3>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs">{leads.length}</Badge>
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
              <LeadCard key={lead.id} lead={lead} isDragging={activeId === lead.id} showPriority={showPriority} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Conversion Dashboard ───
function ConversionDashboard({ leads }: { leads: any[] }) {
  const getCount = (status: string) => leads.filter((l) => l.status === status).length;
  const total = leads.length;
  const responded = getCount("responded") + getCount("warm_lead") + getCount("hot_lead") + getCount("proposal_sent") + getCount("contract_sent") + getCount("deposit_pending") + getCount("booked");
  const proposals = getCount("proposal_sent") + getCount("contract_sent") + getCount("deposit_pending") + getCount("booked");
  const contracts = getCount("contract_sent") + getCount("deposit_pending") + getCount("booked");
  const deposits = getCount("deposit_pending") + getCount("booked");
  const booked = getCount("booked");

  const rate = (num: number, den: number) => den > 0 ? `${Math.round((num / den) * 100)}%` : "—";

  const stats = [
    { label: "Total Leads", value: total, color: "text-zinc-300" },
    { label: "Contacted", value: getCount("contact_attempted") + responded, color: "text-yellow-400" },
    { label: "Warm Leads", value: getCount("warm_lead"), color: "text-orange-400" },
    { label: "Hot Leads", value: getCount("hot_lead"), color: "text-red-400" },
    { label: "Contracts Sent", value: getCount("contract_sent"), color: "text-purple-400" },
    { label: "Deposit Pending", value: getCount("deposit_pending"), color: "text-amber-400" },
    { label: "Booked", value: booked, color: "text-green-400" },
  ];

  const funnelRates = [
    { label: "Lead → Responded", value: rate(responded, total) },
    { label: "Responded → Proposal", value: rate(proposals, responded) },
    { label: "Proposal → Contract", value: rate(contracts, proposals) },
    { label: "Contract → Deposit", value: rate(deposits, contracts) },
    { label: "Deposit → Booked", value: rate(booked, deposits) },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-center">
            <div className={cn("text-xl font-bold", s.color)}>{s.value}</div>
            <div className="text-[10px] text-zinc-500 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {funnelRates.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 whitespace-nowrap">
            <span className="text-[10px] text-zinc-500">{f.label}</span>
            <span className="text-xs font-semibold text-amber-400">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Today's Actions Panel ───
function TodaysActionsPanel({ leads, tasks }: { leads: any[]; tasks: any[] }) {
  const navigate = useNavigate();
  const updateTask = useUpdateLeadTask();

  const newNotContacted = leads.filter((l) => l.status === "new");
  const followUpsToday = leads.filter((l) => l.follow_up_due && isToday(new Date(l.follow_up_due)));
  const followUpsOverdue = leads.filter((l) => isFollowUpOverdue(l));
  const hotNotContacted24h = leads.filter((l) => {
    if (l.temperature !== "hot" && l.status !== "hot_lead") return false;
    if (!l.last_contacted_at) return true;
    return differenceInHours(new Date(), new Date(l.last_contacted_at)) > 24;
  });
  const depositPending = leads.filter((l) => l.status === "deposit_pending");
  const contractsWaiting = leads.filter((l) => l.status === "contract_sent");

  const sections = [
    { title: "New Leads (Not Contacted)", items: newNotContacted, color: "border-l-zinc-500", icon: <Target className="h-3.5 w-3.5 text-zinc-400" /> },
    { title: "Follow Ups Overdue", items: followUpsOverdue, color: "border-l-red-500", icon: <AlertTriangle className="h-3.5 w-3.5 text-red-400" />, isOverdue: true },
    { title: "Follow Ups Due Today", items: followUpsToday, color: "border-l-yellow-500", icon: <Clock className="h-3.5 w-3.5 text-yellow-400" /> },
    { title: "Hot Leads (No Contact 24h)", items: hotNotContacted24h, color: "border-l-red-500", icon: <Flame className="h-3.5 w-3.5 text-red-400" /> },
    { title: "Deposit Pending", items: depositPending, color: "border-l-amber-500", icon: <DollarSign className="h-3.5 w-3.5 text-amber-400" /> },
    { title: "Contracts Waiting", items: contractsWaiting, color: "border-l-purple-500", icon: <FileText className="h-3.5 w-3.5 text-purple-400" /> },
  ];

  const [expanded, setExpanded] = useState(true);

  // Item 9: overdue count color logic
  const overdueCount = followUpsOverdue.length;
  const overdueColor = overdueCount === 0 ? "text-green-500" : overdueCount <= 5 ? "text-amber-500" : "text-red-500";

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="py-3 px-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-zinc-100 text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-500" />
            Today's Actions
          </CardTitle>
          {expanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {/* Item 9: Prominent overdue count */}
          <div className="text-center py-2">
            <div className={cn("text-[32px] font-bold leading-none", overdueColor)}>{overdueCount}</div>
            <div className="text-[13px] text-zinc-400 mt-1">Follow Ups Overdue</div>
          </div>
          <Separator className="bg-zinc-800" />
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-1.5">
                {section.icon}
                <span className="text-xs font-medium text-zinc-300">{section.title}</span>
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px] ml-auto">{section.items.length}</Badge>
              </div>
              {section.items.length === 0 ? (
                <p className="text-[10px] text-zinc-600 pl-5">None</p>
              ) : (
                <div className="space-y-1 pl-1">
                  {section.items.slice(0, 5).map((lead) => (
                    <div
                      key={lead.id}
                      className={cn(
                        "border-l-2 pl-2 py-1 cursor-pointer hover:bg-zinc-800/50 rounded-r",
                        // Item 8: red left border for overdue leads in sidebar
                        (section as any).isOverdue ? "border-l-red-500" : section.color
                      )}
                      onClick={() => navigate(`/admin/leads/${lead.id}`)}
                    >
                      <div className="text-xs text-zinc-200">{lead.lead_name}</div>
                      <div className="text-[10px] text-zinc-500">
                        {lead.phone || lead.email || "No contact info"}
                      </div>
                    </div>
                  ))}
                  {section.items.length > 5 && (
                    <p className="text-[10px] text-zinc-500 pl-2">+{section.items.length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Tasks due today */}
          {tasks && tasks.length > 0 && (
            <div>
              <Separator className="bg-zinc-800 mb-3" />
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-zinc-300">Tasks Due</span>
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px] ml-auto">{tasks.length}</Badge>
              </div>
              <div className="space-y-1 pl-1">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="border-l-2 border-l-green-500 pl-2 py-1 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs text-zinc-200">{task.title}</div>
                      <div className="text-[10px] text-zinc-500">
                        {task.assigned_profile ? `${task.assigned_profile.first_name} ${task.assigned_profile.last_name}` : "Unassigned"}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-zinc-500 hover:text-green-400"
                      onClick={() => updateTask.mutate({ id: task.id, is_completed: true, completed_at: new Date().toISOString() })}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Lead Source Summary ───
function LeadSourceSummary({ leads }: { leads: any[] }) {
  const bySource = useMemo(() => {
    const counts: Record<string, { total: number; booked: number }> = {};
    leads.forEach((l) => {
      const src = l.source || "other";
      if (!counts[src]) counts[src] = { total: 0, booked: 0 };
      counts[src].total++;
      if (l.status === "booked") counts[src].booked++;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 8);
  }, [leads]);

  if (bySource.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <BarChart3 className="h-4 w-4 text-zinc-500 flex-shrink-0" />
      {bySource.map(([src, data]) => (
        <div key={src} className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 whitespace-nowrap flex items-center gap-2">
          <span className="text-[10px] text-zinc-400">{sourceLabels[src] || src}</span>
          <span className="text-xs font-medium text-zinc-200">{data.total}</span>
          {data.booked > 0 && (
            <span className="text-[10px] text-green-400">({data.booked} booked)</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Pipeline Page ───
export default function CommandCenterPipeline() {
  const { data: leads, isLoading } = useCrmLeads();
  const { data: todayTasks } = useTodaysTasks();
  const updateLead = useUpdateCrmLead();
  const syncStage = useSyncLeadStage();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDashboard, setShowDashboard] = useState(true);
  const [showActions, setShowActions] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Search + filter
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    let result = leads;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) =>
        l.lead_name.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.company_name?.toLowerCase().includes(q)
      );
    }

    // Quick filter
    switch (quickFilter) {
      case "hot_leads":
        result = result.filter((l) => (l as any).temperature === "hot" || l.status === "hot_lead");
        break;
      case "follow_ups_today":
        result = result.filter((l) => l.follow_up_due && isToday(new Date(l.follow_up_due)));
        break;
      case "overdue_follow_ups":
        result = result.filter((l) => isFollowUpOverdue(l));
        break;
      case "new_not_contacted":
        result = result.filter((l) => l.status === "new");
        break;
      case "deposit_pending":
        result = result.filter((l) => l.status === "deposit_pending");
        break;
      case "contracts_outstanding":
        result = result.filter((l) => l.status === "contract_sent");
        break;
      case "stalled_hot":
        result = result.filter((l) => isStalledHot(l));
        break;
    }

    return result;
  }, [leads, quickFilter, searchQuery]);

  // Sort leads within each column
  const sortLeads = (columnLeads: any[]) => {
    return [...columnLeads].sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return calculatePriorityScore(b) - calculatePriorityScore(a);
        case "follow_up":
          if (!a.follow_up_due && !b.follow_up_due) return 0;
          if (!a.follow_up_due) return 1;
          if (!b.follow_up_due) return -1;
          return new Date(a.follow_up_due).getTime() - new Date(b.follow_up_due).getTime();
        case "temperature": {
          const tempOrder = { hot: 0, warm: 1, cold: 2 };
          return (tempOrder[(a.temperature as keyof typeof tempOrder) || "cold"] || 2) -
                 (tempOrder[(b.temperature as keyof typeof tempOrder) || "cold"] || 2);
        }
        case "name":
          return a.lead_name.localeCompare(b.lead_name);
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  const getLeadsByStatus = (status: CrmLeadStatus) =>
    sortLeads(filteredLeads.filter((lead) => lead.status === status));

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const STAGE_LABELS: Record<string, string> = {
    new: "New Lead", contact_attempted: "Contact Attempted", responded: "Responded",
    warm_lead: "Warm Lead", hot_lead: "Hot Lead", proposal_sent: "Proposal Sent",
    contract_sent: "Contract Out", deposit_pending: "Deposit Received",
    booked: "Booked", won: "Completed", completed: "Completed", lost: "Lost",
  };

  // Legacy webhook function removed — all GHL sync now uses direct API via sync-ghl-stage edge function

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as CrmLeadStatus;

    if (pipelineStages.some((s) => s.status === newStatus)) {
      const lead = leads?.find((l) => l.id === leadId);
      if (lead && lead.status !== newStatus) {
        const previousStage = lead.status;
        const autoTemp =
          newStatus === "hot_lead" || newStatus === "deposit_pending" || newStatus === "booked"
            ? "hot"
            : newStatus === "warm_lead" || newStatus === "responded" || newStatus === "proposal_sent" || newStatus === "contract_sent"
              ? "warm"
              : undefined;

        // Use sync-ghl-stage edge function for reliable persistence + GHL sync
        syncStage.mutate({
          leadId,
          previousStage: previousStage || "new",
          newStage: newStatus,
        }, {
          onSuccess: () => {
            toast.success(`${lead.lead_name} moved to ${STAGE_LABELS[newStatus] || newStatus}`);
          },
        });
      }
    }
  };

  const activeLead = activeId ? leads?.find((l) => l.id === activeId) : null;
  const allLeads = leads || [];

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Lead Pipeline</h1>
            <p className="text-zinc-400 text-sm">Drag and drop leads through the booking pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDashboard(!showDashboard)}
              className={cn("text-xs border-zinc-700", showDashboard ? "bg-zinc-800 text-zinc-200" : "text-zinc-400")}
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1" /> Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className={cn("text-xs border-zinc-700", showActions ? "bg-zinc-800 text-zinc-200" : "text-zinc-400")}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Actions
            </Button>
          </div>
        </div>

        {/* Conversion Dashboard */}
        {showDashboard && <ConversionDashboard leads={allLeads} />}

        {/* Lead Source Summary */}
        <LeadSourceSummary leads={allLeads} />

        {/* Today's Actions + Pipeline Layout */}
        <div className={cn("flex gap-4", showActions ? "" : "")}>
          {showActions && (
            <div className="w-[280px] flex-shrink-0 hidden xl:block">
              <TodaysActionsPanel leads={allLeads} tasks={todayTasks || []} />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-3">
            {/* Search + Sort + Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[140px] h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-100">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="priority">Priority Score</SelectItem>
                  <SelectItem value="follow_up">Follow Up Date</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-zinc-500" />
              {quickFilters.map((f) => (
                <Button
                  key={f.key}
                  variant={quickFilter === f.key ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-[11px] h-6 px-2",
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
              {/* Item 34: mobile scroll hint gradient */}
              <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none z-10 md:hidden" />
              <div className="flex gap-3 overflow-x-auto pb-4">
                {pipelineStages.map((stage) => (
                  <PipelineColumn
                    key={stage.status}
                    stage={stage}
                    leads={getLeadsByStatus(stage.status)}
                    isLoading={isLoading}
                    activeId={activeId}
                    showPriority={sortBy === "priority"}
                  />
                ))}
              </div>
              </div>
              <DragOverlay>{activeLead ? <LeadCard lead={activeLead} showPriority={sortBy === "priority"} /> : null}</DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Mobile: Today's Actions below pipeline */}
        {showActions && (
          <div className="xl:hidden">
            <TodaysActionsPanel leads={allLeads} tasks={todayTasks || []} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
