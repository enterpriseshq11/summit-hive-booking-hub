import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import { useCrmLead, useUpdateCrmLead } from "@/hooks/useCrmLeads";
import { useCrmActivity } from "@/hooks/useCrmActivity";
import { useCrmRevenue, useCreateCrmRevenue } from "@/hooks/useCrmRevenue";
import { useCrmCommissions } from "@/hooks/useCrmCommissions";
import { useCrmEmployees } from "@/hooks/useCrmEmployees";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  Calendar,
  User,
  Clock,
  DollarSign,
  FileText,
  Send,
  Plus,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CrmLeadStatus = Database["public"]["Enums"]["crm_lead_status"];
type BusinessType = Database["public"]["Enums"]["business_type"];

const statusColors: Record<CrmLeadStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  qualified: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  proposal_sent: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  won: "bg-green-500/20 text-green-400 border-green-500/50",
  lost: "bg-red-500/20 text-red-400 border-red-500/50",
};

const statusLabels: Record<CrmLeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);
  const [newRevenue, setNewRevenue] = useState({ amount: "", description: "" });

  const { data: lead, isLoading: leadLoading } = useCrmLead(id);
  const { data: employees } = useCrmEmployees();
  const updateLead = useUpdateCrmLead();
  const createRevenue = useCreateCrmRevenue();

  // Get lead notes
  const { data: notes } = useQuery({
    queryKey: ["crm_lead_notes", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("crm_lead_notes")
        .select(`
          *,
          created_by_profile:profiles!crm_lead_notes_created_by_fkey(first_name, last_name)
        `)
        .eq("lead_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Get activity for this lead
  const { data: activities } = useCrmActivity({
    entityType: "lead",
    entityId: id,
  });

  // Get revenue events for this lead
  const { data: revenueEvents } = useCrmRevenue();
  const leadRevenue = revenueEvents?.filter((r) => r.lead_id === id) || [];

  // Get commissions related to this lead's revenue
  const { data: allCommissions } = useCrmCommissions();
  const leadCommissions = allCommissions?.filter((c) =>
    leadRevenue.some((r) => r.id === c.revenue_event_id)
  ) || [];

  // Create note mutation
  const createNote = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("crm_lead_notes").insert({
        lead_id: id!,
        content,
        created_by: user?.id!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_lead_notes", id] });
      setNoteContent("");
      toast.success("Note added");
    },
    onError: (error) => {
      toast.error("Failed to add note: " + error.message);
    },
  });

  const handleAddRevenue = async () => {
    if (!lead || !newRevenue.amount) return;
    await createRevenue.mutateAsync({
      amount: parseFloat(newRevenue.amount),
      description: newRevenue.description,
      business_unit: lead.business_unit,
      lead_id: lead.id,
      employee_attributed_id: lead.assigned_employee_id,
      recorded_by: "", // Will be set by hook
    });
    setIsAddRevenueOpen(false);
    setNewRevenue({ amount: "", description: "" });
  };

  if (leadLoading) {
    return (
      <CommandCenterLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      </CommandCenterLayout>
    );
  }

  if (!lead) {
    return (
      <CommandCenterLayout>
        <div className="text-center py-12">
          <p className="text-zinc-500">Lead not found</p>
          <Button
            variant="outline"
            onClick={() => navigate("/command-center/leads")}
            className="mt-4"
          >
            Back to Leads
          </Button>
        </div>
      </CommandCenterLayout>
    );
  }

  const totalRevenue = leadRevenue.reduce((s, r) => s + Number(r.amount), 0);
  const pendingCommission = leadCommissions
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + Number(c.amount), 0);

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/command-center/leads")}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">{lead.lead_name}</h1>
              {lead.company_name && (
                <p className="text-zinc-400 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {lead.company_name}
                </p>
              )}
            </div>
          </div>
          <Badge className={cn("text-sm", statusColors[lead.status || "new"])}>
            {statusLabels[lead.status || "new"]}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Info */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Lead Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">Email</Label>
                    <div className="flex items-center gap-2 text-zinc-100">
                      <Mail className="h-4 w-4 text-zinc-500" />
                      {lead.email || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">Phone</Label>
                    <div className="flex items-center gap-2 text-zinc-100">
                      <Phone className="h-4 w-4 text-zinc-500" />
                      {lead.phone || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">Business Unit</Label>
                    <div className="text-zinc-100 capitalize">{lead.business_unit}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">Source</Label>
                    <div className="text-zinc-100 capitalize">
                      {lead.source?.replace("_", " ") || "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">Created</Label>
                    <div className="flex items-center gap-2 text-zinc-100">
                      <Calendar className="h-4 w-4 text-zinc-500" />
                      {lead.created_at ? format(new Date(lead.created_at), "PPP") : "—"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">Follow-up Due</Label>
                    <div className="flex items-center gap-2 text-zinc-100">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      {lead.follow_up_due
                        ? format(new Date(lead.follow_up_due), "PPP")
                        : "Not set"}
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-500 text-xs">Status</Label>
                    <Select
                      value={lead.status || "new"}
                      onValueChange={(v) =>
                        updateLead.mutate({ id: lead.id, status: v as CrmLeadStatus })
                      }
                    >
                      <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs">Assigned To</Label>
                    <Select
                      value={lead.assigned_employee_id || "unassigned"}
                      onValueChange={(v) =>
                        updateLead.mutate({
                          id: lead.id,
                          assigned_employee_id: v === "unassigned" ? null : v,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {employees?.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {activities?.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No activity recorded yet</p>
                ) : (
                  <div className="space-y-4">
                    {activities?.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-zinc-100 capitalize">
                              {activity.event_type.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {activity.created_at &&
                                formatDistanceToNow(new Date(activity.created_at), {
                                  addSuffix: true,
                                })}
                            </span>
                          </div>
                          {activity.before_data && activity.after_data && (
                            <p className="text-xs text-zinc-400 mt-1">
                              {activity.event_type === "lead_status_changed" && (
                                <>
                                  Changed from{" "}
                                  <span className="text-zinc-300">
                                    {(activity.before_data as any).status}
                                  </span>{" "}
                                  to{" "}
                                  <span className="text-zinc-300">
                                    {(activity.after_data as any).status}
                                  </span>
                                </>
                              )}
                              {activity.event_type === "lead_assigned" && (
                                <>Lead was reassigned</>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-zinc-100">Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={() => createNote.mutate(noteContent)}
                    disabled={!noteContent.trim() || createNote.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {notes?.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No notes yet</p>
                ) : (
                  <div className="space-y-3">
                    {notes?.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                      >
                        <p className="text-zinc-100 text-sm">{note.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                          <span>
                            {note.created_by_profile?.first_name}{" "}
                            {note.created_by_profile?.last_name}
                          </span>
                          <span>
                            {note.created_at &&
                              formatDistanceToNow(new Date(note.created_at), {
                                addSuffix: true,
                              })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revenue Summary */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-zinc-100">Revenue</CardTitle>
                <Dialog open={isAddRevenueOpen} onOpenChange={setIsAddRevenueOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">Add Revenue</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="text-zinc-300">Amount *</Label>
                        <Input
                          type="number"
                          value={newRevenue.amount}
                          onChange={(e) =>
                            setNewRevenue({ ...newRevenue, amount: e.target.value })
                          }
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label className="text-zinc-300">Description</Label>
                        <Textarea
                          value={newRevenue.description}
                          onChange={(e) =>
                            setNewRevenue({ ...newRevenue, description: e.target.value })
                          }
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                          placeholder="Booking, package sale, etc."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddRevenueOpen(false)}
                          className="border-zinc-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddRevenue}
                          disabled={!newRevenue.amount || createRevenue.isPending}
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          Add Revenue
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-100 mb-4">
                  {formatCurrency(totalRevenue)}
                </div>
                {leadRevenue.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No revenue recorded</p>
                ) : (
                  <div className="space-y-2">
                    {leadRevenue.map((rev) => (
                      <div
                        key={rev.id}
                        className="flex items-center justify-between p-2 bg-zinc-800 rounded"
                      >
                        <div>
                          <div className="text-sm text-zinc-100">
                            {formatCurrency(Number(rev.amount))}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {rev.description || "Revenue"}
                          </div>
                        </div>
                        <div className="text-xs text-zinc-500">
                          {rev.revenue_date &&
                            format(new Date(rev.revenue_date), "MMM d")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Commission Preview */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  Commission Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leadCommissions.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No commissions linked</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Pending</span>
                      <span className="text-yellow-400 font-medium">
                        {formatCurrency(pendingCommission)}
                      </span>
                    </div>
                    {leadCommissions.map((comm) => (
                      <div
                        key={comm.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-zinc-500">
                          {comm.employee?.first_name} {comm.employee?.last_name}
                        </span>
                        <Badge
                          className={cn(
                            "text-xs",
                            comm.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : comm.status === "approved"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                          )}
                        >
                          {formatCurrency(Number(comm.amount))}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status History */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                {activities?.filter((a) => a.event_type === "lead_status_changed")
                  .length === 0 ? (
                  <p className="text-zinc-500 text-sm">No status changes</p>
                ) : (
                  <div className="space-y-2">
                    {activities
                      ?.filter((a) => a.event_type === "lead_status_changed")
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500">→</span>
                            <span className="text-zinc-100 capitalize">
                              {(activity.after_data as any)?.status?.replace("_", " ")}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {activity.created_at &&
                              format(new Date(activity.created_at), "MMM d")}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment History */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Assignment History</CardTitle>
              </CardHeader>
              <CardContent>
                {activities?.filter((a) => a.event_type === "lead_assigned").length ===
                0 ? (
                  <p className="text-zinc-500 text-sm">No reassignments</p>
                ) : (
                  <div className="space-y-2">
                    {activities
                      ?.filter((a) => a.event_type === "lead_assigned")
                      .map((activity) => (
                        <div key={activity.id} className="text-sm">
                          <div className="text-zinc-100">Reassigned</div>
                          <div className="text-xs text-zinc-500">
                            {activity.created_at &&
                              formatDistanceToNow(new Date(activity.created_at), {
                                addSuffix: true,
                              })}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CommandCenterLayout>
  );
}
