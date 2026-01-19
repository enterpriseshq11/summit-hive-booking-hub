import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useCrmLeads, useUpdateCrmLead } from "@/hooks/useCrmLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Mail, Phone, User, GripVertical } from "lucide-react";

type CrmLeadStatus = Database["public"]["Enums"]["crm_lead_status"];

const pipelineStages: { status: CrmLeadStatus; label: string; color: string }[] = [
  { status: "new", label: "New", color: "border-blue-500" },
  { status: "contacted", label: "Contacted", color: "border-yellow-500" },
  { status: "qualified", label: "Qualified", color: "border-purple-500" },
  { status: "proposal_sent", label: "Proposal Sent", color: "border-orange-500" },
  { status: "won", label: "Won", color: "border-green-500" },
  { status: "lost", label: "Lost", color: "border-red-500" },
];

interface LeadCardProps {
  lead: {
    id: string;
    lead_name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    business_unit: string;
    assigned_employee?: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
  isDragging?: boolean;
}

function LeadCard({ lead, isDragging }: LeadCardProps) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-zinc-800 border border-zinc-700 rounded-lg p-3 cursor-pointer hover:border-amber-500/50 transition-colors",
        isDragging && "opacity-50"
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
          <div className="font-medium text-zinc-100 truncate">{lead.lead_name}</div>
          {lead.company_name && (
            <div className="text-xs text-zinc-500 truncate">{lead.company_name}</div>
          )}
          <div className="mt-2 space-y-1">
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
          {lead.assigned_employee && (
            <div className="flex items-center gap-1 text-zinc-500 text-xs mt-2">
              <User className="h-3 w-3" />
              {lead.assigned_employee.first_name} {lead.assigned_employee.last_name}
            </div>
          )}
          <Badge
            variant="outline"
            className="mt-2 text-xs border-zinc-600 text-zinc-400 capitalize"
          >
            {lead.business_unit}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function CommandCenterPipeline() {
  const navigate = useNavigate();
  const { data: leads, isLoading } = useCrmLeads();
  const updateLead = useUpdateCrmLead();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getLeadsByStatus = (status: CrmLeadStatus) => {
    return leads?.filter((lead) => lead.status === status) || [];
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as CrmLeadStatus;

    // Check if dropped on a column
    if (pipelineStages.some((s) => s.status === newStatus)) {
      const lead = leads?.find((l) => l.id === leadId);
      if (lead && lead.status !== newStatus) {
        updateLead.mutate({ id: leadId, status: newStatus });
      }
    }
  };

  const activeLead = activeId ? leads?.find((l) => l.id === activeId) : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Pipeline</h1>
          <p className="text-zinc-400">Drag and drop leads through the sales pipeline</p>
        </div>

        {/* Pipeline Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {pipelineStages.map((stage) => {
              const stageLeads = getLeadsByStatus(stage.status);
              return (
                <div
                  key={stage.status}
                  id={stage.status}
                  className={cn(
                    "min-w-[250px] bg-zinc-900 rounded-lg border-t-2",
                    stage.color
                  )}
                >
                  <div className="p-3 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-zinc-100">{stage.label}</h3>
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                        {stageLeads.length}
                      </Badge>
                    </div>
                  </div>
                  <SortableContext
                    items={stageLeads.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div
                      className="p-2 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto"
                      id={stage.status}
                    >
                      {isLoading ? (
                        <div className="text-center py-4 text-zinc-500 text-sm">Loading...</div>
                      ) : stageLeads.length === 0 ? (
                        <div className="text-center py-8 text-zinc-600 text-sm">
                          No leads
                        </div>
                      ) : (
                        stageLeads.map((lead) => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            isDragging={activeId === lead.id}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </AdminLayout>
  );
}
