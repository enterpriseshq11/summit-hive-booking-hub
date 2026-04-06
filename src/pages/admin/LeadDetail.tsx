import { useParams, Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, Phone, Mail, Calendar, MessageSquare, FileText,
  Clock, RefreshCw, Copy, Upload, ChevronRight, ChevronLeft, X,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useRef } from "react";
import { toast } from "sonner";

const PIPELINE_STAGES = [
  "new", "contact_attempted", "responded", "warm_lead", "hot_lead",
  "proposal_sent", "contract_sent", "deposit_pending", "booked", "won", "lost",
];

const LOST_REASONS = [
  "No Response", "Budget", "Chose Competitor",
  "Date Not Available", "Duplicate Lead", "Other",
];

const UNIT_COLORS: Record<string, string> = {
  summit: "bg-amber-500/20 text-amber-400",
  spa: "bg-purple-500/20 text-purple-400",
  fitness: "bg-green-500/20 text-green-400",
  coworking: "bg-blue-500/20 text-blue-400",
  voice_vault: "bg-orange-500/20 text-orange-400",
  mobile_homes: "bg-zinc-500/20 text-zinc-400",
  elevated_by_elyse: "bg-pink-500/20 text-pink-400",
};

const DETAIL_SECTION_LABELS: Record<string, string> = {
  summit: "Event Details", spa: "Service Details", fitness: "Membership Details",
  coworking: "Office Inquiry Details", voice_vault: "Session Details",
  elevated_by_elyse: "Styling Details", mobile_homes: "Inquiry Details",
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isOwner = authUser?.roles?.includes("owner");
  const [newNote, setNewNote] = useState("");
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const [lostNotes, setLostNotes] = useState("");
  const [showLogDialog, setShowLogDialog] = useState<string | null>(null);
  const [logNotes, setLogNotes] = useState("");
  const [logDuration, setLogDuration] = useState("");
  const [logOutcome, setLogOutcome] = useState("reached");
  const [followUpDate, setFollowUpDate] = useState("");
  const [syncingGhl, setSyncingGhl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const { data } = await supabase.from("crm_activity_events").select("*").eq("entity_id", id!).eq("entity_type", "lead").order("created_at", { ascending: false }).limit(100);
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

  const { data: documents = [] } = useQuery({
    queryKey: ["lead-documents", id],
    queryFn: async () => {
      const { data } = await supabase.from("lead_documents").select("*").eq("lead_id", id!).order("created_at", { ascending: false });
      return (data || []) as any[];
    },
    enabled: !!id,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members-for-assign"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, first_name, last_name, email");
      return data || [];
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!newNote.trim() || !authUser?.id) return;
      await supabase.from("crm_lead_notes").insert({ lead_id: id!, content: newNote, created_by: authUser.id });
      await supabase.from("crm_activity_events").insert({
        event_type: "note_added" as any, entity_type: "lead", entity_id: id!,
        actor_id: authUser.id, entity_name: `${authUser.profile?.first_name} ${authUser.profile?.last_name}`,
        event_category: "note_added",
        metadata: { note_preview: newNote.substring(0, 100) },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-notes", id] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", id] });
      setNewNote("");
      toast.success("Note added");
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase.from("crm_leads").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", id] });
    },
  });

  const STAGE_LABELS: Record<string, string> = {
    new: "New Lead", contact_attempted: "Contact Attempted", responded: "Responded",
    warm_lead: "Warm Lead", hot_lead: "Hot Lead", proposal_sent: "Proposal Sent",
    contract_sent: "Contract Out", deposit_pending: "Deposit Received",
    booked: "Booked", won: "Completed", completed: "Completed", lost: "Lost",
  };

  // Map DB enum value → ghl_pipeline_stage_webhooks.stage_name
  // The webhook table uses "completed" while the DB enum uses "won"
  const toWebhookStageName = (dbStage: string) => dbStage === "won" ? "completed" : dbStage;

  const fireGhlStageWebhook = async (previousStage: string, newStage: string) => {
    if (!lead) return;
    try {
      // Check ghl_sync_in_progress to prevent infinite loop
      const { data: freshLead } = await supabase
        .from("crm_leads")
        .select("ghl_sync_in_progress")
        .eq("id", lead.id)
        .maybeSingle();

      if ((freshLead as any)?.ghl_sync_in_progress) {
        await supabase.from("crm_activity_events").insert({
          event_type: "lead_updated" as any, entity_type: "lead", entity_id: id!,
          metadata: {
            action: "ghl_webhook_skipped",
            message: `GHL outbound webhook skipped — sync in progress`,
          },
        });
        return;
      }

      const webhookStageName = toWebhookStageName(newStage);
      const { data: webhookConfig } = await (supabase as any)
        .from("ghl_pipeline_stage_webhooks")
        .select("webhook_url, is_active")
        .eq("stage_name", webhookStageName)
        .maybeSingle();

      if (!webhookConfig?.webhook_url || !webhookConfig.is_active) {
        await supabase.from("crm_activity_events").insert({
          event_type: "lead_updated" as any, entity_type: "lead", entity_id: id!,
          event_category: "ghl_webhook_fired",
          metadata: {
            action: "ghl_webhook_skipped",
            message: `GHL webhook skipped — no URL configured or inactive for ${STAGE_LABELS[newStage] || newStage} stage`,
          },
        });
        return;
      }

      const assignedMemberForWebhook = teamMembers.find((m: any) => m.id === lead.assigned_employee_id);
      const payload = {
        event: "pipeline_stage_changed",
        lead_id: lead.id,
        lead_name: lead.lead_name,
        email: lead.email,
        phone: lead.phone,
        business_unit: lead.business_unit,
        previous_stage_key: previousStage,
        previous_stage_name: STAGE_LABELS[previousStage] || previousStage,
        new_stage_key: newStage,
        new_stage_name: STAGE_LABELS[newStage] || newStage,
        assigned_to: assignedMemberForWebhook
          ? `${assignedMemberForWebhook.first_name} ${assignedMemberForWebhook.last_name}`
          : null,
        timestamp: new Date().toISOString(),
        source: lead.source,
      };

      const res = await fetch(webhookConfig.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const statusText = res.ok ? "success" : "failed";
      await supabase.from("crm_activity_events").insert({
        event_type: "lead_updated" as any, entity_type: "lead", entity_id: id!,
        event_category: statusText === "success" ? "ghl_webhook_fired" : "ghl_webhook_failed",
        metadata: {
          action: statusText === "success" ? "ghl_webhook_fired" : "ghl_webhook_failed",
          message: `GHL webhook ${statusText === "success" ? "fired" : "FAILED"} — stage moved to ${STAGE_LABELS[newStage] || newStage} — HTTP ${res.status}`,
          http_status: res.status,
          stage: newStage,
        },
      });
      // Create alert on webhook failure with source_filter for role-based visibility
      if (!res.ok) {
        await supabase.from("crm_alerts").insert({
          alert_type: "ghl_webhook_failed",
          title: `GHL webhook failed for ${lead.lead_name}`,
          description: `Stage ${STAGE_LABELS[newStage] || newStage} webhook returned HTTP ${res.status}`,
          entity_type: "lead",
          entity_id: lead.id,
          source_filter: lead.source || null,
          severity: "high",
          target_roles: ["owner", "manager", "operations", "ads_lead"],
        } as any);
      }
    } catch (err) {
      await supabase.from("crm_activity_events").insert({
        event_type: "lead_updated" as any, entity_type: "lead", entity_id: id!,
        event_category: "ghl_webhook_failed",
        metadata: {
          action: "ghl_webhook_failed",
          message: `GHL webhook FAILED — stage moved to ${STAGE_LABELS[newStage] || newStage} — Error: ${String(err)}`,
          stage: newStage,
        },
      });
      // Create alert on webhook failure with source_filter
      await supabase.from("crm_alerts").insert({
        alert_type: "ghl_webhook_failed",
        title: `GHL webhook failed for ${lead.lead_name}`,
        description: `Stage ${STAGE_LABELS[newStage] || newStage} webhook error: ${String(err)}`,
        entity_type: "lead",
        entity_id: lead.id,
        source_filter: lead.source || null,
        severity: "high",
        target_roles: ["owner", "manager", "operations", "ads_lead"],
      } as any);
    }
  };

  const moveStage = async (direction: "next" | "prev") => {
    if (!lead) return;
    const currentIdx = PIPELINE_STAGES.indexOf(lead.status || "new");
    const newIdx = direction === "next" ? currentIdx + 1 : currentIdx - 1;
    if (newIdx < 0 || newIdx >= PIPELINE_STAGES.length) return;
    const newStage = PIPELINE_STAGES[newIdx];
    if (newStage === "lost") { setShowLostDialog(true); return; }
    const previousStage = lead.status || "new";
    await updateLeadMutation.mutateAsync({ status: newStage });
    await supabase.from("crm_activity_events").insert({
      event_type: "stage_changed" as any, entity_type: "lead", entity_id: id!,
      actor_id: authUser?.id,
      entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
      event_category: "stage_changed",
      metadata: { previous_stage: previousStage, new_stage: newStage },
    });
    await fireGhlStageWebhook(previousStage, newStage);
    toast.success(`Moved to ${newStage.replace(/_/g, " ")}`);
  };

  const markAsLost = async () => {
    await updateLeadMutation.mutateAsync({ status: "lost", lost_reason: lostReason });
    await supabase.from("crm_activity_events").insert({
      event_type: "stage_changed" as any, entity_type: "lead", entity_id: id!,
      actor_id: authUser?.id,
      entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
      event_category: "stage_changed",
      metadata: { previous_stage: lead?.status, new_stage: "lost", reason: lostReason, notes: lostNotes },
    });
    setShowLostDialog(false);
    toast.success("Lead marked as lost");
  };

  const reopenLead = async () => {
    await updateLeadMutation.mutateAsync({ status: "warm_lead", lost_reason: null });
    await supabase.from("crm_activity_events").insert({
      event_type: "stage_changed" as any, entity_type: "lead", entity_id: id!,
      actor_id: authUser?.id,
      entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
      event_category: "stage_changed",
      metadata: { previous_stage: "lost", new_stage: "warm_lead", action: "reopened" },
    });
    toast.success("Lead reopened");
  };

  const logContact = async () => {
    if (!showLogDialog) return;
    await supabase.from("crm_leads").update({
      last_contacted_at: new Date().toISOString(),
      contact_attempts: (lead?.contact_attempts || 0) + 1,
    }).eq("id", id!);
    await supabase.from("crm_activity_events").insert({
      event_type: "lead_contacted" as any, entity_type: "lead", entity_id: id!,
      actor_id: authUser?.id,
      entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
      event_category: "lead_updated",
      metadata: { method: showLogDialog, notes: logNotes, duration: logDuration, outcome: logOutcome },
    });
    queryClient.invalidateQueries({ queryKey: ["lead-detail", id] });
    queryClient.invalidateQueries({ queryKey: ["lead-timeline", id] });
    setShowLogDialog(null);
    setLogNotes("");
    setLogDuration("");
    toast.success(`${showLogDialog} logged`);
  };

  const scheduleFollowUp = async () => {
    if (!followUpDate) return;
    await updateLeadMutation.mutateAsync({ follow_up_due: followUpDate });
    await supabase.from("crm_activity_events").insert({
      event_type: "note_added" as any, entity_type: "lead", entity_id: id!,
      actor_id: authUser?.id,
      entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
      event_category: "note_added",
      metadata: { action: "follow_up_scheduled", date: followUpDate },
    });
    setFollowUpDate("");
    toast.success("Follow-up scheduled");
  };

  const assignToMember = async (memberId: string) => {
    await updateLeadMutation.mutateAsync({ assigned_employee_id: memberId });
    const member = teamMembers.find((m: any) => m.id === memberId);
    await supabase.from("crm_activity_events").insert({
      event_type: "note_added" as any, entity_type: "lead", entity_id: id!,
      actor_id: authUser?.id,
      entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
      event_category: "lead_updated",
      metadata: { action: "assigned_to_changed", assigned_to: `${member?.first_name} ${member?.last_name}` },
    });
    toast.success(`Assigned to ${member?.first_name}`);
  };

  const uploadDocument = async (file: File) => {
    const filePath = `${id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("lead-documents").upload(filePath, file);
    if (uploadError) { toast.error("Upload failed: " + uploadError.message); return; }
    const { data: urlData } = supabase.storage.from("lead-documents").getPublicUrl(filePath);
    const { error: dbError } = await supabase.from("lead_documents").insert({
      lead_id: id!, file_name: file.name, file_type: file.type,
      file_url: urlData.publicUrl, storage_bucket_path: filePath,
      file_size_bytes: file.size, uploaded_by: authUser?.id,
    } as any);
    if (dbError) {
      // DB insert failed — attempt cleanup of orphaned file
      console.error("DB insert failed for document, cleaning up storage:", dbError);
      const { error: cleanupError } = await supabase.storage.from("lead-documents").remove([filePath]);
      // Log to orphaned_files if cleanup also fails
      if (cleanupError) {
        await supabase.from("orphaned_files").insert({
          file_path: filePath, lead_id: id, intended_for: file.name,
          upload_timestamp: new Date().toISOString(),
          cleanup_attempted: true, cleanup_status: `cleanup_failed: ${cleanupError.message}`,
          cleanup_attempted_at: new Date().toISOString(),
        } as any);
      }
      toast.error("Failed to save document record: " + dbError.message);
      return;
    }
    await supabase.from("crm_activity_events").insert({
      event_type: "note_added" as any, entity_type: "lead", entity_id: id!,
      actor_id: authUser?.id,
      entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
      event_category: "document_uploaded",
      metadata: { action: "document_attached", file_name: file.name },
    });
    queryClient.invalidateQueries({ queryKey: ["lead-documents", id] });
    queryClient.invalidateQueries({ queryKey: ["lead-timeline", id] });
    toast.success("Document uploaded");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  if (isLoading) return <AdminLayout><div className="text-zinc-400 text-center py-12">Loading...</div></AdminLayout>;
  if (!lead) return <AdminLayout><div className="text-zinc-400 text-center py-12">Lead not found</div></AdminLayout>;

  const followUpStatus = lead.follow_up_due
    ? new Date(lead.follow_up_due) < new Date() ? "overdue"
    : new Date(lead.follow_up_due).toDateString() === new Date().toDateString() ? "today" : "future"
    : "none";
  const ghlStatus = intakeData?.ghl_webhook_status || "pending";
  const unitColor = UNIT_COLORS[lead.business_unit] || "bg-zinc-500/20 text-zinc-400";
  const currentStageIdx = PIPELINE_STAGES.indexOf(lead.status || "new");
  const assignedMember = teamMembers.find((m: any) => m.id === lead.assigned_employee_id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <Link to="/admin/leads" className="text-zinc-400 hover:text-white flex items-center gap-1 mb-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Leads
            </Link>
            <h1 className="text-2xl font-bold text-white">{lead.lead_name}</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className={unitColor}>{(lead.business_unit || "").replace(/_/g, " ")}</Badge>
              <Badge className="bg-blue-500/20 text-blue-400">{(lead.status || "new").replace(/_/g, " ")}</Badge>
              {lead.source && <Badge variant="outline" className="border-zinc-600 text-zinc-400">{String(lead.source).replace(/_/g, " ")}</Badge>}
              {assignedMember && <Badge variant="outline" className="border-zinc-600 text-zinc-300">{assignedMember.first_name} {assignedMember.last_name}</Badge>}
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {lead.follow_up_due && (
              <Badge className={followUpStatus === "overdue" ? "bg-red-500/20 text-red-400" : followUpStatus === "today" ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"}>
                <Calendar className="h-3 w-3 mr-1" />
                Follow-up: {format(new Date(lead.follow_up_due), "MMM d, yyyy")}
              </Badge>
            )}
            <Badge className={ghlStatus === "fired" ? "bg-green-500/20 text-green-400" : ghlStatus === "failed" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}>
              GHL: {ghlStatus === "fired" ? "Synced" : ghlStatus === "failed" ? "Failed" : "Pending"}
            </Badge>
            {/* Item 11: Manual GHL sync — owner/manager only */}
            {(isOwner || authUser?.roles?.includes("manager")) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-amber-400"
                disabled={syncingGhl}
                onClick={async () => {
                  setSyncingGhl(true);
                  try {
                    const { data: webhookConfig } = await (supabase as any)
                      .from("ghl_webhook_config")
                      .select("webhook_url")
                      .eq("business_unit", lead.business_unit)
                      .maybeSingle();
                    if (!webhookConfig?.webhook_url) {
                      toast.error("No GHL webhook URL configured for this business unit. Go to Settings to add it.");
                      setSyncingGhl(false);
                      return;
                    }
                    const payload = {
                      event: "new_lead",
                      lead_id: lead.id,
                      lead_name: lead.lead_name,
                      email: lead.email,
                      phone: lead.phone,
                      business_unit: lead.business_unit,
                      source: lead.source,
                      submission_timestamp: new Date().toISOString(),
                    };
                    const res = await fetch(webhookConfig.webhook_url, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (res.ok) {
                      toast.success("GHL sync successful");
                      await supabase.from("crm_activity_events").insert({
                        event_type: "lead_updated" as any, entity_type: "lead", entity_id: id!,
                        actor_id: authUser?.id,
                        entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
                        event_category: "ghl_webhook_fired",
                        metadata: { action: "manual_ghl_sync", message: `Manual GHL sync triggered by ${authUser?.profile?.first_name} ${authUser?.profile?.last_name} — ${new Date().toISOString()}` },
                      });
                    } else {
                      toast.error(`GHL sync failed: HTTP ${res.status}`, { duration: Infinity });
                      await supabase.from("crm_activity_events").insert({
                        event_type: "lead_updated" as any, entity_type: "lead", entity_id: id!,
                        actor_id: authUser?.id,
                        entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
                        event_category: "ghl_webhook_failed",
                        metadata: { action: "manual_ghl_sync_failed", message: `Manual GHL sync failed — HTTP ${res.status}` },
                      });
                    }
                    queryClient.invalidateQueries({ queryKey: ["lead-detail", id] });
                    queryClient.invalidateQueries({ queryKey: ["lead-timeline", id] });
                  } catch (err: any) {
                    toast.error(`GHL sync failed: ${err.message}`, { duration: Infinity });
                  } finally {
                    setSyncingGhl(false);
                  }
                }}
              >
                {syncingGhl ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                Sync to GHL
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-zinc-300"><Mail className="h-4 w-4 text-zinc-500" />{lead.email || "—"}</div>
                  {lead.email && <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" onClick={() => copyToClipboard(lead.email!)}><Copy className="h-3 w-3" /></Button>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-zinc-300"><Phone className="h-4 w-4 text-zinc-500" />{lead.phone || "—"}</div>
                  {lead.phone && <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" onClick={() => copyToClipboard(lead.phone!)}><Copy className="h-3 w-3" /></Button>}
                </div>
                <div className="flex items-center gap-3 text-zinc-300"><Clock className="h-4 w-4 text-zinc-500" />Created {format(new Date(lead.created_at!), "MMM d, yyyy 'at' h:mm a")}</div>
                <div className="text-zinc-500 text-xs">Lead ID: {lead.id}</div>
              </CardContent>
            </Card>

            {/* Submission Details */}
            {intakeData?.form_data && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-white text-lg">{DETAIL_SECTION_LABELS[lead.business_unit] || "Submission Details"}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(intakeData.form_data as Record<string, any>)
                      .filter(([k]) => !["first_name", "last_name", "email", "phone", "source"].includes(k))
                      .map(([key, value]) => (
                        <div key={key}>
                          <span className="text-zinc-500 text-sm capitalize">{key.replace(/_/g, " ")}</span>
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
                      {note.profiles?.first_name} {note.profiles?.last_name} · {format(new Date(note.created_at), "MMM d 'at' h:mm a")}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Documents</CardTitle>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3 w-3 mr-1" /> Upload
                  </Button>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => e.target.files?.[0] && uploadDocument(e.target.files[0])} />
                </div>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? <p className="text-zinc-500 text-sm">No documents attached</p> : (
                  <div className="space-y-2">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border border-zinc-800 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-zinc-500" />
                          <div>
                            <p className="text-zinc-300 text-sm">{doc.file_name}</p>
                            <p className="text-zinc-600 text-xs">{format(new Date(doc.created_at), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="text-amber-400">View</Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Timeline</CardTitle></CardHeader>
              <CardContent>
                {timeline.length === 0 ? <p className="text-zinc-500 text-sm">No activity yet</p> : (
                  <div className="space-y-3">
                    {timeline.map((event: any) => (
                      <div key={event.id} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">{event.event_type?.replace(/_/g, " ")}</Badge>
                            {event.entity_name && <span className="text-zinc-500 text-xs">by {event.entity_name}</span>}
                          </div>
                          {event.metadata && typeof event.metadata === "object" && (
                            <p className="text-zinc-400 text-sm mt-0.5">
                              {event.metadata.method && `Method: ${event.metadata.method}`}
                              {event.metadata.previous_stage && ` ${event.metadata.previous_stage} → ${event.metadata.new_stage}`}
                              {event.metadata.action && ` ${event.metadata.action.replace(/_/g, " ")}`}
                              {event.metadata.file_name && ` — ${event.metadata.file_name}`}
                              {event.metadata.note_preview && ` — "${event.metadata.note_preview}"`}
                            </p>
                          )}
                          <p className="text-zinc-600 text-xs mt-0.5">{format(new Date(event.created_at), "MMM d 'at' h:mm a")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column — Actions */}
          <div className="space-y-4">
            {/* Stage Movement */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Pipeline Stage</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-zinc-700 text-zinc-300" onClick={() => moveStage("prev")} disabled={currentStageIdx <= 0}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button size="sm" className="flex-1 bg-amber-500 text-black hover:bg-amber-400" onClick={() => moveStage("next")} disabled={currentStageIdx >= PIPELINE_STAGES.length - 1}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <Select value={lead.status || "new"} onValueChange={async (v) => {
                  if (v === "lost") { setShowLostDialog(true); } else {
                    const previousStage = lead.status || "new";
                    await updateLeadMutation.mutateAsync({ status: v });
                    await supabase.from("crm_activity_events").insert({
                      event_type: "stage_changed" as any, entity_type: "lead", entity_id: id!,
                      actor_id: authUser?.id,
                      entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
                      metadata: { previous_stage: previousStage, new_stage: v },
                    });
                    await fireGhlStageWebhook(previousStage, v);
                    toast.success(`Moved to ${v.replace(/_/g, " ")}`);
                  }
                }}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
                {lead.status === "lost" && (
                  <Button size="sm" variant="outline" className="w-full border-green-500/50 text-green-400" onClick={reopenLead}>
                    Reopen Lead
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Log Contact */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Log Contact</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 justify-start" onClick={() => setShowLogDialog("call")}>
                  <Phone className="h-4 w-4 mr-2" /> Log a Call
                </Button>
                <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 justify-start" onClick={() => setShowLogDialog("email")}>
                  <Mail className="h-4 w-4 mr-2" /> Log an Email
                </Button>
                <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 justify-start" onClick={() => setShowLogDialog("text")}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Log a Text
                </Button>
              </CardContent>
            </Card>

            {/* Schedule Follow-Up */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Schedule Follow-Up</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Input type="datetime-local" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
                <Button size="sm" className="w-full bg-amber-500 text-black hover:bg-amber-400" onClick={scheduleFollowUp} disabled={!followUpDate}>
                  <Calendar className="h-4 w-4 mr-1" /> Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Assign Team Member */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-lg">Assign To</CardTitle></CardHeader>
              <CardContent>
                <Select value={lead.assigned_employee_id || ""} onValueChange={assignToMember}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Select team member..." /></SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Lead Info */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Contact Attempts</span><span className="text-white">{lead.contact_attempts || 0}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Last Contacted</span><span className="text-white">{lead.last_contacted_at ? format(new Date(lead.last_contacted_at), "MMM d") : "Never"}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Temperature</span><span className="text-white capitalize">{lead.temperature || "—"}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Lost Dialog */}
      <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader><DialogTitle>Mark Lead as Lost</DialogTitle></DialogHeader>
          <Select value={lostReason} onValueChange={setLostReason}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Select reason..." /></SelectTrigger>
            <SelectContent>{LOST_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          {lostReason === "Other" && (
            <Textarea value={lostNotes} onChange={e => setLostNotes(e.target.value)} placeholder="Please explain why this lead is being marked as lost... (required)" className="bg-zinc-800 border-zinc-700 text-white" rows={2} />
          )}
          {lostReason !== "Other" && (
            <Textarea value={lostNotes} onChange={e => setLostNotes(e.target.value)} placeholder="Additional notes (optional)" className="bg-zinc-800 border-zinc-700 text-white" rows={2} />
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setShowLostDialog(false)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-400 text-white" onClick={markAsLost} disabled={!lostReason || (lostReason === "Other" && !lostNotes.trim())}>Mark as Lost</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Contact Dialog */}
      <Dialog open={!!showLogDialog} onOpenChange={open => { if (!open) setShowLogDialog(null); }}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader><DialogTitle>Log a {showLogDialog}</DialogTitle></DialogHeader>
          {showLogDialog === "call" && (
            <>
              <div><Label className="text-zinc-400 text-sm">Duration (minutes)</Label><Input type="number" value={logDuration} onChange={e => setLogDuration(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" /></div>
              <div><Label className="text-zinc-400 text-sm">Outcome</Label>
                <Select value={logOutcome} onValueChange={setLogOutcome}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reached">Reached</SelectItem>
                    <SelectItem value="no_answer">No Answer</SelectItem>
                    <SelectItem value="left_voicemail">Left Voicemail</SelectItem>
                    <SelectItem value="wrong_number">Wrong Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {showLogDialog === "email" && (
            <div><Label className="text-zinc-400 text-sm">Subject Line</Label><Input value={logDuration} onChange={e => setLogDuration(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Email subject" /></div>
          )}
          <Textarea value={logNotes} onChange={e => setLogNotes(e.target.value)} placeholder="Notes..." className="bg-zinc-800 border-zinc-700 text-white" rows={2} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setShowLogDialog(null)}>Cancel</Button>
            <Button className="bg-amber-500 text-black hover:bg-amber-400" onClick={logContact}>Log {showLogDialog}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
