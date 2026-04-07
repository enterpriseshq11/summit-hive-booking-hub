import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAGE_LABELS: Record<string, string> = {
  new: "New Lead",
  contact_attempted: "Contact Attempted",
  responded: "Responded",
  warm_lead: "Warm Lead",
  hot_lead: "Hot Lead",
  proposal_sent: "Proposal Sent",
  contract_sent: "Contract Out",
  deposit_pending: "Deposit Received",
  booked: "Booked",
  won: "Completed",
  completed: "Completed",
  lost: "Lost",
};

const getConfigBusinessUnit = (businessUnit: string) =>
  businessUnit === "mobile_homes" ? "mobile_homes" : "default";

const parseMaybeJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const getOutboundWebhookStatus = (httpOk: boolean) => {
  if (!httpOk) return "failed";
  return "accepted";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return new Response(JSON.stringify({ success: false, error: "Backend configuration is incomplete" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ success: false, error: "Missing authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const leadId = typeof body?.leadId === "string" ? body.leadId : "";
    const previousStage = typeof body?.previousStage === "string" ? body.previousStage : "";
    const newStage = typeof body?.newStage === "string" ? body.newStage : "";
    const skipWebhook = body?.skipWebhook === true;

    if (!leadId || !previousStage || !newStage) {
      return new Response(JSON.stringify({ success: false, error: "leadId, previousStage, and newStage are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: lead, error: leadError } = await admin
      .from("crm_leads")
      .select("id, lead_name, email, phone, business_unit, source, status, assigned_employee_id, ghl_contact_id, ghl_sync_in_progress")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ success: false, error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let effectiveLead = lead;

    if (lead.status !== newStage) {
      const { data: updatedLead, error: updateError } = await admin
        .from("crm_leads")
        .update({ status: newStage })
        .eq("id", leadId)
        .select("id, lead_name, email, phone, business_unit, source, status, assigned_employee_id, ghl_contact_id, ghl_sync_in_progress")
        .maybeSingle();

      if (updateError || !updatedLead) {
        return new Response(JSON.stringify({ success: false, error: updateError?.message || "Lead stage update failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      effectiveLead = updatedLead;

      // Log stage change activity
      await admin.from("crm_activity_events").insert({
        event_type: "lead_status_changed",
        actor_id: user.id,
        entity_type: "lead",
        entity_id: leadId,
        entity_name: effectiveLead.lead_name,
        event_category: "stage_changed",
        metadata: { previous_stage: previousStage, new_stage: newStage },
      });
    }

    if (skipWebhook) {
      return new Response(JSON.stringify({ success: true, status: effectiveLead.status, skippedWebhook: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (effectiveLead.ghl_sync_in_progress) {
      await admin.from("crm_activity_events").insert({
        event_type: "lead_updated",
        actor_id: user.id,
        entity_type: "lead",
        entity_id: effectiveLead.id,
        entity_name: effectiveLead.lead_name,
        event_category: "ghl_webhook_skipped",
        metadata: {
          action: "ghl_webhook_skipped",
          message: "GHL outbound webhook skipped — inbound sync in progress",
          previous_stage: previousStage,
          new_stage: newStage,
        },
      });

      return new Response(JSON.stringify({ success: true, status: effectiveLead.status, skippedWebhook: true, reason: "sync_in_progress" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const configBusinessUnit = getConfigBusinessUnit(effectiveLead.business_unit);
    const { data: webhookConfig } = await admin
      .from("ghl_outbound_webhook_config")
      .select("webhook_url, is_active")
      .eq("stage_key", newStage)
      .eq("business_unit", configBusinessUnit)
      .maybeSingle();

    if (!webhookConfig?.webhook_url || !webhookConfig.is_active) {
      const message = `No active outbound webhook configured for ${STAGE_LABELS[newStage] || newStage}`;

      await admin.from("crm_activity_events").insert({
        event_type: "lead_updated",
        actor_id: user.id,
        entity_type: "lead",
        entity_id: effectiveLead.id,
        entity_name: effectiveLead.lead_name,
        event_category: "ghl_webhook_failed",
        metadata: {
          action: "ghl_webhook_failed",
          message,
          previous_stage: previousStage,
          new_stage: newStage,
        },
      });

      await admin
        .from("lead_intake_submissions")
        .update({
          ghl_webhook_status: "failed",
          ghl_webhook_response: message,
          ghl_webhook_fired_at: null,
        })
        .eq("lead_id", effectiveLead.id);

      return new Response(JSON.stringify({ success: false, error: message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let assignedTo: string | null = null;
    if (effectiveLead.assigned_employee_id) {
      const { data: assignedProfile } = await admin
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", effectiveLead.assigned_employee_id)
        .maybeSingle();

      if (assignedProfile) {
        assignedTo = [assignedProfile.first_name, assignedProfile.last_name].filter(Boolean).join(" ") || null;
      }
    }

    const previousStageLabel = STAGE_LABELS[previousStage] || previousStage;
    const newStageLabel = STAGE_LABELS[newStage] || newStage;
    const ghlContactId = typeof effectiveLead.ghl_contact_id === "string" && effectiveLead.ghl_contact_id.trim().length > 0
      ? effectiveLead.ghl_contact_id.trim()
      : null;

    if (!ghlContactId) {
      const message = "Lead is missing a linked GHL contact ID. Backfill or relink the contact before syncing stages.";

      await admin.from("crm_activity_events").insert({
        event_type: "lead_updated",
        actor_id: user.id,
        entity_type: "lead",
        entity_id: effectiveLead.id,
        entity_name: effectiveLead.lead_name,
        event_category: "ghl_webhook_failed",
        metadata: {
          action: "ghl_webhook_failed",
          message,
          previous_stage: previousStage,
          new_stage: newStage,
          contact_id: null,
        },
      });

      await admin
        .from("lead_intake_submissions")
        .update({
          ghl_webhook_status: "failed",
          ghl_webhook_response: message,
          ghl_webhook_fired_at: null,
        })
        .eq("lead_id", effectiveLead.id);

      return new Response(JSON.stringify({ success: false, error: message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = {
      event: "pipeline_stage_changed",
      trigger_source: "a_z_command",
      lead_id: effectiveLead.id,
      id: ghlContactId,
      contact_id: ghlContactId,
      contactId: ghlContactId,
      ghl_contact_id: ghlContactId,
      contact: {
        id: ghlContactId,
        name: effectiveLead.lead_name,
        email: effectiveLead.email,
        phone: effectiveLead.phone,
      },
      lead_name: effectiveLead.lead_name,
      name: effectiveLead.lead_name,
      email: effectiveLead.email,
      phone: effectiveLead.phone,
      business_unit: effectiveLead.business_unit,
      previous_stage: previousStageLabel,
      previous_stage_key: previousStage,
      previous_stage_name: previousStageLabel,
      new_stage: newStageLabel,
      new_stage_key: newStage,
      new_stage_name: newStageLabel,
      stage: newStageLabel,
      stage_key: newStage,
      stage_name: newStageLabel,
      assigned_to: assignedTo,
      source: effectiveLead.source,
      timestamp: new Date().toISOString(),
    };

    const ghlResponse = await fetch(webhookConfig.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await ghlResponse.text();
    const parsedResponse = responseText ? parseMaybeJson(responseText) : `HTTP ${ghlResponse.status}`;
    const webhookStatus = getOutboundWebhookStatus(ghlResponse.ok);

    const intakeStatusPayload = {
      ghl_webhook_status: webhookStatus,
      ghl_webhook_response: parsedResponse,
      ghl_webhook_fired_at: ghlResponse.ok ? new Date().toISOString() : null,
    };

    const { data: updatedIntakeRows } = await admin
      .from("lead_intake_submissions")
      .update(intakeStatusPayload)
      .eq("lead_id", effectiveLead.id)
      .select("id");

    if (!updatedIntakeRows || updatedIntakeRows.length === 0) {
      await admin.from("lead_intake_submissions").insert({
        business_unit: effectiveLead.business_unit,
        form_data: {},
        source: effectiveLead.source || "manual",
        lead_id: effectiveLead.id,
        ...intakeStatusPayload,
      });
    }

    await admin.from("crm_activity_events").insert({
      event_type: "lead_updated",
      actor_id: user.id,
      entity_type: "lead",
      entity_id: effectiveLead.id,
      entity_name: effectiveLead.lead_name,
      event_category: ghlResponse.ok ? "ghl_webhook_accepted" : "ghl_webhook_failed",
      metadata: {
        action: ghlResponse.ok ? "ghl_webhook_accepted" : "ghl_webhook_failed",
        message: `GHL webhook ${ghlResponse.ok ? "accepted" : "FAILED"} — ${newStageLabel} — HTTP ${ghlResponse.status}`,
        previous_stage: previousStage,
        new_stage: newStage,
        http_status: ghlResponse.status,
        response: parsedResponse,
        contact_id: ghlContactId,
      },
    });

    if (!ghlResponse.ok) {
      await admin.from("crm_alerts").insert({
        alert_type: "ghl_webhook_failed",
        title: `GHL webhook failed for ${effectiveLead.lead_name}`,
        description: `Stage ${STAGE_LABELS[newStage] || newStage} webhook returned HTTP ${ghlResponse.status}`,
        entity_type: "lead",
        entity_id: effectiveLead.id,
        source_filter: effectiveLead.source || null,
        severity: "high",
        target_roles: ["owner", "manager", "operations", "ads_lead"],
      });
    }

    return new Response(JSON.stringify({
      success: ghlResponse.ok,
      status: effectiveLead.status,
      ghlStatus: webhookStatus,
      contactId: ghlContactId,
      response: parsedResponse,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    try {
      await admin.from("edge_function_errors").insert({
        function_name: "sync-ghl-stage",
        error_message: message,
        stack_trace: error instanceof Error ? error.stack ?? null : null,
        payload: { note: "Stage sync failure" },
      });
    } catch {
      // no-op
    }

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});