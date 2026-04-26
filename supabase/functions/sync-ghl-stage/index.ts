import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

const GHL_API = "https://services.leadconnectorhq.com";

// Map A-Z Command business_unit → GHL Pipeline ID
const PIPELINE_MAP: Record<string, string> = {
  coworking: "R39pNfUKfehKhx0gQ22y",
  summit: "eyLsMGGgEikqtiTsWrSD",
  elevated_by_elyse: "T9xQFgbvNDWd0SRuL3Bt",
  spa: "jiTtAKTcMGFcfCDl9vQB",
  fitness: "hKnG56sPWawRe2Z4E8Sk",
  photo_booth: "To9CU7VONlcaRPkd9lac",
  voice_vault: "MLC9I84M2xohkODg92TY",
};

// Cache: pipelineId → { stageName → stageId }
const stageCache: Record<string, Record<string, string>> = {};

const log = (step: string, details?: any) =>
  console.log(`[GHL-SYNC] ${step}${details ? ` — ${JSON.stringify(details)}` : ""}`);

/**
 * Fire any active per-stage webhook rows configured in
 * ghl_outbound_webhook_config for the lead's new stage. POSTs a
 * pipeline_stage_changed payload and stamps last_fired_at / last_status
 * so the Integrations UI reflects the most recent attempt.
 */
async function firePipelineStageWebhooks(
  admin: any,
  params: {
    lead: any;
    previousStage: string | null;
    newStage: string;
    contactId?: string | null;
    opportunityId?: string | null;
  },
) {
  const { lead, previousStage, newStage, contactId, opportunityId } = params;
  try {
    const { data: rows, error } = await admin
      .from("ghl_outbound_webhook_config")
      .select("id, stage_key, stage_label, webhook_url, is_active")
      .eq("stage_key", newStage)
      .eq("is_active", true);

    if (error) {
      log("Outbound webhook config fetch failed", { error: error.message });
      return;
    }
    if (!rows || rows.length === 0) {
      log("No active outbound webhook configured for stage", { stage: newStage });
      return;
    }

    const newStageName = STAGE_LABELS[newStage] || newStage;
    const previousStageName = previousStage
      ? STAGE_LABELS[previousStage] || previousStage
      : null;

    for (const row of rows) {
      if (!row.webhook_url) continue;
      const stamp = new Date().toISOString();
      let status: "success" | "failed" = "failed";
      let detail = "";

      try {
        const payload = {
          event: "pipeline_stage_changed",
          lead_id: lead.id,
          lead_name: lead.lead_name,
          email: lead.email || null,
          phone: lead.phone || null,
          business_unit: lead.business_unit || null,
          previous_stage_key: previousStage,
          previous_stage_name: previousStageName,
          new_stage_key: newStage,
          new_stage_name: newStageName,
          assigned_to: lead.assigned_to || null,
          source: lead.source || null,
          ghl_contact_id: contactId || null,
          ghl_opportunity_id: opportunityId || null,
          timestamp: stamp,
        };

        const res = await fetch(row.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        detail = `HTTP ${res.status}`;
        status = res.ok ? "success" : "failed";
        // Drain body so the connection releases.
        try { await res.text(); } catch { /* ignore */ }
      } catch (e) {
        detail = e instanceof Error ? e.message : String(e);
        status = "failed";
      }

      await admin
        .from("ghl_outbound_webhook_config")
        .update({
          last_fired_at: stamp,
          last_tested_at: stamp,
          last_status: status,
        })
        .eq("id", row.id);

      log("Outbound webhook fired", {
        stage: newStage,
        url_host: (() => { try { return new URL(row.webhook_url).host; } catch { return "?"; } })(),
        status,
        detail,
      });
    }
  } catch (e) {
    log("firePipelineStageWebhooks error", { error: e instanceof Error ? e.message : String(e) });
  }
}

async function getPipelineStages(
  pipelineId: string,
  ghlApiKey: string,
  locationId: string,
): Promise<Record<string, string>> {
  if (stageCache[pipelineId]) return stageCache[pipelineId];

  const res = await fetch(
    `${GHL_API}/opportunities/pipelines?locationId=${locationId}`,
    {
      headers: {
        Authorization: `Bearer ${ghlApiKey}`,
        Version: "2021-07-28",
      },
    },
  );

  if (!res.ok) {
    log("Failed to fetch pipelines", { status: res.status });
    return {};
  }

  const data = await res.json();
  const pipelines = data?.pipelines || [];
  const pipeline = pipelines.find((p: any) => p.id === pipelineId);

  if (!pipeline) {
    log("Pipeline not found", { pipelineId });
    return {};
  }

  const map: Record<string, string> = {};
  for (const s of pipeline.stages || []) {
    // Normalize: "New Lead" → "newlead"
    const key = (s.name || "").toLowerCase().replace(/\s+/g, "");
    map[key] = s.id;
  }
  stageCache[pipelineId] = map;
  log("Cached pipeline stages", { pipelineId, stages: Object.keys(map) });
  return map;
}

function resolveGhlStageId(
  stages: Record<string, string>,
  azStageKey: string,
): string | null {
  const label = STAGE_LABELS[azStageKey] || azStageKey;
  const normalized = label.toLowerCase().replace(/\s+/g, "");

  // Direct match
  if (stages[normalized]) return stages[normalized];

  // Try the raw key
  const rawNorm = azStageKey.toLowerCase().replace(/[_\s]+/g, "");
  if (stages[rawNorm]) return stages[rawNorm];

  // Fallback: partial match
  for (const [k, v] of Object.entries(stages)) {
    if (k.includes(normalized) || normalized.includes(k)) return v;
  }

  return null;
}

async function findOpportunity(
  contactId: string,
  pipelineId: string,
  ghlApiKey: string,
  locationId: string,
): Promise<string | null> {
  // Search opportunities by contact
  const url = `${GHL_API}/opportunities/search?location_id=${locationId}&contact_id=${contactId}&pipeline_id=${pipelineId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ghlApiKey}`,
      Version: "2021-07-28",
    },
  });

  if (!res.ok) {
    log("Opportunity search failed", { status: res.status });
    return null;
  }

  const data = await res.json();
  const opps = data?.opportunities || [];
  if (opps.length > 0) {
    log("Found opportunity", { id: opps[0].id, pipeline: pipelineId });
    return opps[0].id;
  }

  return null;
}

async function updateOpportunityStage(
  opportunityId: string,
  stageId: string,
  ghlApiKey: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch(`${GHL_API}/opportunities/${opportunityId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${ghlApiKey}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pipelineStageId: stageId }),
  });

  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const ghlApiKey = Deno.env.get("GHL_API_KEY") ?? "";
  const ghlLocationId = Deno.env.get("GHL_LOCATION_ID") ?? "";

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Backend configuration is incomplete" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!ghlApiKey || !ghlLocationId) {
    return new Response(
      JSON.stringify({ success: false, error: "GHL credentials not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing authorization" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const leadId = typeof body?.leadId === "string" ? body.leadId : "";
    const previousStage = typeof body?.previousStage === "string" ? body.previousStage : "";
    const newStage = typeof body?.newStage === "string" ? body.newStage : "";
    const skipWebhook = body?.skipWebhook === true;

    if (!leadId || !previousStage || !newStage) {
      return new Response(
        JSON.stringify({ success: false, error: "leadId, previousStage, and newStage are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch lead
    const { data: lead, error: leadError } = await admin
      .from("crm_leads")
      .select("id, lead_name, email, phone, business_unit, source, status, assigned_employee_id, ghl_contact_id, ghl_sync_in_progress")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ success: false, error: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let effectiveLead = lead;

    // Update stage in DB if needed
    if (lead.status !== newStage) {
      const { data: updatedLead, error: updateError } = await admin
        .from("crm_leads")
        .update({ status: newStage })
        .eq("id", leadId)
        .select("id, lead_name, email, phone, business_unit, source, status, assigned_employee_id, ghl_contact_id, ghl_sync_in_progress")
        .maybeSingle();

      if (updateError || !updatedLead) {
        return new Response(
          JSON.stringify({ success: false, error: updateError?.message || "Lead stage update failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      effectiveLead = updatedLead;

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
      return new Response(
        JSON.stringify({ success: true, status: effectiveLead.status, skippedWebhook: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Skip if inbound sync is in progress
    if (effectiveLead.ghl_sync_in_progress) {
      await admin.from("crm_activity_events").insert({
        event_type: "lead_updated",
        actor_id: user.id,
        entity_type: "lead",
        entity_id: effectiveLead.id,
        entity_name: effectiveLead.lead_name,
        event_category: "ghl_sync_skipped",
        metadata: {
          action: "ghl_sync_skipped",
          message: "GHL sync skipped — inbound sync in progress",
          previous_stage: previousStage,
          new_stage: newStage,
        },
      });

      return new Response(
        JSON.stringify({ success: true, status: effectiveLead.status, skippedWebhook: true, reason: "sync_in_progress" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate GHL contact ID
    const ghlContactId =
      typeof effectiveLead.ghl_contact_id === "string" && effectiveLead.ghl_contact_id.trim().length > 0
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
        event_category: "ghl_sync_failed",
        metadata: { action: "ghl_sync_failed", message, previous_stage: previousStage, new_stage: newStage },
      });

      await admin.from("lead_intake_submissions")
        .update({ ghl_webhook_status: "failed", ghl_webhook_response: message, ghl_webhook_fired_at: null })
        .eq("lead_id", effectiveLead.id);

      return new Response(JSON.stringify({ success: false, error: message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve pipeline
    const pipelineId = PIPELINE_MAP[effectiveLead.business_unit] || null;
    if (!pipelineId) {
      const message = `No GHL pipeline mapped for business unit: ${effectiveLead.business_unit}`;
      log("No pipeline", { business_unit: effectiveLead.business_unit });

      await admin.from("crm_activity_events").insert({
        event_type: "lead_updated",
        actor_id: user.id,
        entity_type: "lead",
        entity_id: effectiveLead.id,
        entity_name: effectiveLead.lead_name,
        event_category: "ghl_sync_failed",
        metadata: { action: "ghl_sync_failed", message, previous_stage: previousStage, new_stage: newStage },
      });

      return new Response(JSON.stringify({ success: false, error: message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get pipeline stages from GHL
    const stages = await getPipelineStages(pipelineId, ghlApiKey, ghlLocationId);
    const targetStageId = resolveGhlStageId(stages, newStage);

    if (!targetStageId) {
      const message = `Could not resolve GHL stage for "${STAGE_LABELS[newStage] || newStage}" in pipeline ${pipelineId}. Available: ${Object.keys(stages).join(", ")}`;
      log("Stage not found", { newStage, pipelineId, available: Object.keys(stages) });

      await admin.from("crm_activity_events").insert({
        event_type: "lead_updated",
        actor_id: user.id,
        entity_type: "lead",
        entity_id: effectiveLead.id,
        entity_name: effectiveLead.lead_name,
        event_category: "ghl_sync_failed",
        metadata: { action: "ghl_sync_failed", message, previous_stage: previousStage, new_stage: newStage },
      });

      return new Response(JSON.stringify({ success: false, error: message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the opportunity in GHL
    let opportunityId = await findOpportunity(ghlContactId, pipelineId, ghlApiKey, ghlLocationId);

    if (!opportunityId) {
      // Auto-create opportunity if missing
      log("No opportunity found, creating one", { ghlContactId, pipelineId });
      const createRes = await fetch(`${GHL_API}/opportunities/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pipelineId,
          pipelineStageId: targetStageId,
          locationId: ghlLocationId,
          contactId: ghlContactId,
          name: effectiveLead.lead_name,
          status: "open",
        }),
      });

      const createBody = await createRes.text();
      if (createRes.ok) {
        try {
          const parsed = JSON.parse(createBody);
          opportunityId = parsed?.opportunity?.id || null;
          log("Created opportunity", { opportunityId });
        } catch {
          log("Created opportunity but could not parse response");
        }

        // If we just created with the correct stage, we're done
        const syncStatus = createRes.ok ? "accepted" : "failed";
        await admin.from("lead_intake_submissions")
          .update({
            ghl_webhook_status: syncStatus,
            ghl_webhook_response: `Opportunity created with stage ${STAGE_LABELS[newStage] || newStage}`,
            ghl_webhook_fired_at: new Date().toISOString(),
          })
          .eq("lead_id", effectiveLead.id);

        await admin.from("crm_activity_events").insert({
          event_type: "lead_updated",
          actor_id: user.id,
          entity_type: "lead",
          entity_id: effectiveLead.id,
          entity_name: effectiveLead.lead_name,
          event_category: "ghl_api_synced",
          metadata: {
            action: "ghl_opportunity_created_with_stage",
            message: `Created GHL opportunity at stage "${STAGE_LABELS[newStage] || newStage}"`,
            opportunity_id: opportunityId,
            pipeline_id: pipelineId,
            stage_id: targetStageId,
            new_stage: newStage,
            contact_id: ghlContactId,
          },
        });

        return new Response(
          JSON.stringify({
            success: true,
            status: effectiveLead.status,
            ghlStatus: "synced",
            method: "api_create",
            opportunityId,
            contactId: ghlContactId,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } else {
        const message = `Failed to create GHL opportunity: ${createBody}`;
        log("Opportunity creation failed", { status: createRes.status, body: createBody });

        await admin.from("crm_activity_events").insert({
          event_type: "lead_updated",
          actor_id: user.id,
          entity_type: "lead",
          entity_id: effectiveLead.id,
          entity_name: effectiveLead.lead_name,
          event_category: "ghl_sync_failed",
          metadata: { action: "ghl_sync_failed", message, http_status: createRes.status },
        });

        return new Response(JSON.stringify({ success: false, error: message }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Update the opportunity stage via API
    log("Updating opportunity stage", { opportunityId, targetStageId, stage: STAGE_LABELS[newStage] });
    const updateResult = await updateOpportunityStage(opportunityId, targetStageId, ghlApiKey);

    const syncStatus = updateResult.ok ? "accepted" : "failed";
    const syncMessage = updateResult.ok
      ? `Stage updated to "${STAGE_LABELS[newStage] || newStage}" via API`
      : `API update failed: HTTP ${updateResult.status} — ${updateResult.body}`;

    // Update intake submission
    const { data: updatedIntakeRows } = await admin
      .from("lead_intake_submissions")
      .update({
        ghl_webhook_status: syncStatus,
        ghl_webhook_response: syncMessage,
        ghl_webhook_fired_at: updateResult.ok ? new Date().toISOString() : null,
      })
      .eq("lead_id", effectiveLead.id)
      .select("id");

    if (!updatedIntakeRows || updatedIntakeRows.length === 0) {
      await admin.from("lead_intake_submissions").insert({
        business_unit: effectiveLead.business_unit,
        form_data: {},
        source: effectiveLead.source || "manual",
        lead_id: effectiveLead.id,
        ghl_webhook_status: syncStatus,
        ghl_webhook_response: syncMessage,
        ghl_webhook_fired_at: updateResult.ok ? new Date().toISOString() : null,
      });
    }

    // Log activity
    await admin.from("crm_activity_events").insert({
      event_type: "lead_updated",
      actor_id: user.id,
      entity_type: "lead",
      entity_id: effectiveLead.id,
      entity_name: effectiveLead.lead_name,
      event_category: updateResult.ok ? "ghl_api_synced" : "ghl_sync_failed",
      metadata: {
        action: updateResult.ok ? "ghl_stage_updated_via_api" : "ghl_api_update_failed",
        message: syncMessage,
        previous_stage: previousStage,
        new_stage: newStage,
        opportunity_id: opportunityId,
        pipeline_id: pipelineId,
        stage_id: targetStageId,
        http_status: updateResult.status,
        contact_id: ghlContactId,
      },
    });

    if (!updateResult.ok) {
      await admin.from("crm_alerts").insert({
        alert_type: "ghl_sync_failed",
        title: `GHL stage sync failed for ${effectiveLead.lead_name}`,
        description: `Stage "${STAGE_LABELS[newStage] || newStage}" API update returned HTTP ${updateResult.status}`,
        entity_type: "lead",
        entity_id: effectiveLead.id,
        source_filter: effectiveLead.source || null,
        severity: "high",
        target_roles: ["owner", "manager", "operations", "ads_lead"],
      });
    }

    return new Response(
      JSON.stringify({
        success: updateResult.ok,
        status: effectiveLead.status,
        ghlStatus: syncStatus,
        method: "api_update",
        opportunityId,
        contactId: ghlContactId,
        stageId: targetStageId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
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
