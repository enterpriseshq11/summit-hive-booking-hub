import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft, Phone, Mail, Calendar, User, MessageSquare, FileText,
  ChevronRight, Clock, RefreshCw, AlertTriangle, CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

const STAGES = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "deposit_pending", "deposit_received", "contract_sent", "contract_signed", "scheduled", "completed", "won", "lost"];
const LOST_REASONS = ["No Response", "Budget", "Chose Competitor", "Date Not Available", "Other"];

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState("");

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_leads").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["lead-notes", id],
    queryFn: async () => {
      const { data } = await supabase.from("crm_lead_notes").select("*, profiles:created_by(first_name, last_name)").eq("lead_id", id!).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ["lead-timeline", id],
    queryFn: async () => {
      const { data } = await supabase.from("crm_activity_events").select("*").eq("entity_id", id!).eq("entity_type", "lead").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: intakeData } = useQuery({
    queryKey: ["lead-intake-data", id],
    queryFn: async () => {
      const { data } = await supabase.from("lead_intake_submissions").select("*").eq("lead_id", id!).maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!newNote.trim() || !authUser?.id) return;
      const { error } = await supabase.from("crm_lead_notes").insert({
        lead_id: id!, content: newNote, created_by: authUser.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-notes", id] });
      setNewNote("");
      toast.success("Note added");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const updates: any = { status: newStatus };
      if (newStatus === "lost") updates.lost_reason = lostReason;
      if (newStatus === "contacted") updates.last_contacted_at = new Date().toISOString();
      const { error } = await supabase.from("crm_leads").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-detail", id] });
      toast.success("Status updated");
      setShowLostDialog(false);
    },
  });

  const logContactMutation = useMutation({
    mutationFn: async (method: string) => {
      await supabase.from("crm_leads").update({
        last_contacted_at: new Date().toISOString(),
        contact_attempts: (lead?.contact_attempts || 0) + 1,
      }).eq("id", id!);
      await supabase.from("crm_activity_events").insert({
        event_type: "lead_contacted" as any,
        entity_type: "lead",
        entity_id: id!,
        actor_id: authUser?.id,
        metadata: { method },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", id] });
      toast.success("Contact logged");
    },
  });

  if (isLoading) return <AdminLayout><div className="text-zinc-400 text-center py-12">Loading...</div></AdminLayout>;
  if (!lead) return <AdminLayout><div className="text-zinc-400 text-center py-12">Lead not found</div></AdminLayout>;

  const followUpStatus = lead.follow_up_due
    ? new Date(lead.follow_up_due) < new Date() ? "overdue"
    : new Date(lead.follow_up_due).toDateString() === new Date().toDateString() ? "today" : "future"
    : "none";

  const ghlStatus = intakeData?.ghl_webhook_status || "pending";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link to="/admin/leads" className="text-zinc-400 hover:text-white flex items-center gap-1 mb-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Leads
            </Link>
            <h1 className="text-2xl font-bold text-white">{lead.lead_name}</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className="bg-amber-500/20 text-amber-400">{(lead.business_unit || "").replace(/_/g, " ")}</Badge>
              <Badge className="bg-blue-500/20 text-blue-400">{(lead.status || "new").replace(/_/g, " ")}</Badge>
              {lead.temperature && <Badge className={lead.temperature === "hot" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}>{lead.temperature}</Badge>}
              {lead.source && <Badge variant="outline" className="border-zinc-600 text-zinc-400">{lead.source.replace(/_/g, " ")}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            {lead.follow_up_due && (
              <Badge className={
                followUpStatus === "overdue" ? "bg-red-500/20 text-red-400" :
                followUpStatus === "today" ? "bg-amber-500/20 text-amber-400" :
                "bg-green-500/20 text-green-400"
              }>
                <Calendar className="h-3 w-3 mr-1" />
                Follow-up: {format(new Date(lead.follow_up_due), "MMM d")}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Mail className="h-4 w-4 text-zinc-500" />{lead.email || "—"}
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Phone className="h-4 w-4 text-zinc-500" />{lead.phone || "—"}
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  Created {format(new Date(lead.created_at), "MMM d, yyyy 'at' h:mm a")}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-sm">GHL Sync:</span>
                  <Badge className={
                    ghlStatus === "fired" ? "bg-green-500/20 text-green-400" :
                    ghlStatus === "failed" ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }>
                    {ghlStatus === "fired" ? "Synced" : ghlStatus === "failed" ? "Failed" : "Pending"}
                  </Badge>
                  {ghlStatus === "failed" && (
                    <Button variant="ghost" size="sm" className="text-red-400 text-xs"><RefreshCw className="h-3 w-3 mr-1" />Resync</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Intake Data */}
            {intakeData?.form_data && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-white text-lg">Submission Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(intakeData.form_data as Record<string, any>)
                      .filter(([k]) => !["first_name", "last_name", "email", "phone"].includes(k))
                      .map(([key, value]) => (
                        <div key={key}>
                          <span className="text-zinc-500 text-sm">{key.replace(/_/g, " ")}</span>
                          <p className="text-zinc-200">{String(value)}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." className="bg-zinc-800 border-zinc-700 text-white" rows={2} />
                  <Button className="bg-amber-500 text-black hover:bg-amber-400 self-end" onClick={() => addNoteMutation.mutate()} disabled={!newNote.trim()}>Add</Button>
                </div>
                {notes.map((note: any) => (
                  <div key={note.id} className="border-l-2 border-zinc-700 pl-3 py-1">
                    <p className="text-zinc-300 text-sm">{note.content}</p>
                    <p className="text-zinc-600 text-xs mt-1">
                      {note.profiles?.first_name} {note.profiles?.last_name} • {format(new Date(note.created_at), "MMM d 'at' h:mm a")}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Timeline</CardTitle></CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {timeline.map((event: any) => (
                      <div key={event.id} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-zinc-300 text-sm">
                            {event.event_type?.replace(/_/g, " ")}
                            {event.entity_name && <span className="text-zinc-500"> — {event.entity_name}</span>}
                          </p>
                          <p className="text-zinc-600 text-xs">{format(new Date(event.created_at), "MMM d 'at' h:mm a")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Actions */}
          <div className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {/* Move to next stage */}
                <div>
                  <span className="text-zinc-500 text-xs mb-1 block">Move to Stage</span>
                  <Select value={lead.status || "new"} onValueChange={(v) => {
                    if (v === "lost") { setShowLostDialog(true); } else { updateStatusMutation.mutate(v); }
                  }}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-zinc-800 pt-3 space-y-2">
                  <span className="text-zinc-500 text-xs block">Log Contact</span>
                  <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 justify-start" onClick={() => logContactMutation.mutate("call")}>
                    <Phone className="h-4 w-4 mr-2" /> Log a Call
                  </Button>
                  <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 justify-start" onClick={() => logContactMutation.mutate("email")}>
                    <Mail className="h-4 w-4 mr-2" /> Log an Email
                  </Button>
                  <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 justify-start" onClick={() => logContactMutation.mutate("text")}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Log a Text
                  </Button>
                </div>

                <div className="border-t border-zinc-800 pt-3">
                  <span className="text-zinc-500 text-xs block mb-2">Lead Info</span>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-zinc-500">Contact Attempts</span><span className="text-white">{lead.contact_attempts || 0}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Last Contacted</span><span className="text-white">{lead.last_contacted_at ? format(new Date(lead.last_contacted_at), "MMM d") : "Never"}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Assigned To</span><span className="text-white">{lead.assigned_employee_id ? "Assigned" : "Unassigned"}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Lost Reason Dialog */}
      <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader><DialogTitle>Mark Lead as Lost</DialogTitle></DialogHeader>
          <Select value={lostReason} onValueChange={setLostReason}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Select reason..." /></SelectTrigger>
            <SelectContent>
              {LOST_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setShowLostDialog(false)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-400 text-white" onClick={() => updateStatusMutation.mutate("lost")} disabled={!lostReason}>Mark as Lost</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}