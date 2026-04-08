import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRUSTED_GHL_LOCATION_ID = "u13ENqQ110HeXyg36sNv";

const logStep = (step: string, details?: any) => {
  console.log(`[GHL-INBOUND] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

/**
 * GHL stage name → internal DB enum value mapping.
 */
const STAGE_MAP: Record<string, string> = {
  "New Lead": "new", "Contact Attempted": "contact_attempted", "Responded": "responded",
  "Warm Lead": "warm_lead", "Hot Lead": "hot_lead", "Proposal Sent": "proposal_sent",
  "Contract Out": "contract_sent", "Contract Sent": "contract_sent",
  "Deposit Received": "deposit_pending", "Deposit Pending": "deposit_pending",
  "Booked": "booked", "Completed": "won", "Lost": "lost",
  "new": "new", "contact_attempted": "contact_attempted", "responded": "responded",
  "warm_lead": "warm_lead", "hot_lead": "hot_lead", "proposal_sent": "proposal_sent",
  "contract_sent": "contract_sent", "contract_out": "contract_sent",
  "deposit_pending": "deposit_pending", "deposit_received": "deposit_pending",
  "booked": "booked", "completed": "won", "won": "won", "lost": "lost",
};

const VALID_STAGES = new Set([
  "new", "contact_attempted", "responded", "warm_lead", "hot_lead",
  "proposal_sent", "contract_sent", "deposit_pending", "booked",
  "won", "lost", "follow_up_needed", "no_response",
]);

const STAGE_LABELS: Record<string, string> = {
  new: "New Lead", contact_attempted: "Contact Attempted", responded: "Responded",
  warm_lead: "Warm Lead", hot_lead: "Hot Lead", proposal_sent: "Proposal Sent",
  contract_sent: "Contract Out", deposit_pending: "Deposit Received",
  booked: "Booked", won: "Completed", lost: "Lost",
};

/** Map GHL tags/custom fields to internal business_unit */
function resolveBusinessUnit(body: any): string {
  const tags = (body?.tags || []).map((t: string) => t.toLowerCase());
  const buField = (body?.business_unit || body?.customField?.business_unit || "").toLowerCase();

  if (tags.includes("mobile homes") || tags.includes("a-z estates") || tags.includes("mobile_homes") ||
      buField === "mobile_homes" || buField === "mobile homes" || buField === "a-z estates") {
    return "mobile_homes";
  }
  if (buField && ["summit", "spa", "fitness", "coworking", "voice_vault"].includes(buField)) {
    return buField;
  }
  return "summit"; // default business unit
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();

    // Verify shared secret or trusted GHL location
    const secret = Deno.env.get("GHL_INBOUND_WEBHOOK_SECRET");
    const authHeader = req.headers.get("authorization") || "";
    const sigHeader = req.headers.get("x-ghl-signature") || "";
    const querySecret = new URL(req.url).searchParams.get("secret") || "";
    const locationId = body?.locationId || body?.location_id || body?.location?.id || body?.contact?.locationId || "";
    const isTrustedLocation = locationId === TRUSTED_GHL_LOCATION_ID;

    if (secret) {
      const token = authHeader.replace("Bearer ", "");
      const isSecretMatch = token === secret || sigHeader === secret || querySecret === secret;

      if (!isSecretMatch && !isTrustedLocation) {
        logStep("Unauthorized — secret mismatch");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }

      logStep("Webhook authorized", {
        auth_mode: isSecretMatch ? "secret" : "trusted_location",
        locationId: locationId || null,
      });
    } else {
      logStep("WARNING: GHL_INBOUND_WEBHOOK_SECRET not set — requests are unverified");
    }

    const event = body?.event || body?.type || "";
    logStep("Received payload", { event, contact_id: body?.contact_id });

    // ─── Route by event type ───
    if (event === "contact.created" || event === "ContactCreate" || event === "contact_created") {
      return await handleContactCreated(supabase, body);
    }

    // Default: treat as stage change (backward compatible)
    return await handleStageChanged(supabase, body);

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    logStep("ERROR", { message: msg });

    try {
      await supabase.from("edge_function_errors").insert({
        function_name: "ghl-inbound-webhook",
        error_message: msg,
        stack_trace: stack || null,
        payload: { note: "Error during GHL inbound webhook processing" },
      });
    } catch (_) { /* best effort */ }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// ─── Handler: contact.created ───
async function handleContactCreated(supabase: any, body: any) {
  const contactId = body?.contact_id || body?.id || body?.contactId;
  const firstName = body?.first_name || body?.firstName || body?.name?.split(" ")[0] || "";
  const lastName = body?.last_name || body?.lastName || body?.name?.split(" ").slice(1).join(" ") || "";
  const fullName = body?.name || body?.full_name || `${firstName} ${lastName}`.trim();
  const email = body?.email || null;
  const phone = body?.phone || null;
  const source = body?.source || body?.lead_source || "ghl";
  const stageRaw = body?.stage || body?.pipeline_stage || body?.new_stage || "new";
  const businessUnit = resolveBusinessUnit(body);

  if (!fullName && !email && !phone) {
    logStep("contact.created — no usable contact data");
    return new Response(
      JSON.stringify({ received: true, warning: "No usable contact data" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  // Check for duplicate by ghl_contact_id or email
  if (contactId) {
    const { data: existing } = await supabase
      .from("crm_leads")
      .select("id")
      .eq("ghl_contact_id", contactId)
      .maybeSingle();
    if (existing) {
      logStep("contact.created — duplicate by ghl_contact_id", { contactId });
      return new Response(
        JSON.stringify({ received: true, skipped: true, reason: "duplicate_contact_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  }

  if (email) {
    const { data: existing } = await supabase
      .from("crm_leads")
      .select("id")
      .eq("email", email)
      .eq("business_unit", businessUnit)
      .maybeSingle();
    if (existing) {
      // Link ghl_contact_id if we don't have it
      if (contactId) {
        await supabase.from("crm_leads")
          .update({ ghl_contact_id: contactId })
          .eq("id", existing.id);
      }
      logStep("contact.created — duplicate by email", { email, businessUnit });
      return new Response(
        JSON.stringify({ received: true, skipped: true, reason: "duplicate_email", lead_id: existing.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  }

  // Map initial stage
  const mappedStage = STAGE_MAP[stageRaw] || STAGE_MAP[stageRaw?.trim()] || "new";
  const finalStage = VALID_STAGES.has(mappedStage) ? mappedStage : "new";

  // Map source string to enum
  const SOURCE_MAP: Record<string, string> = {
    "facebook": "social_media", "fb": "social_media", "instagram": "social_media",
    "google": "google_ads", "google_ads": "google_ads",
    "website": "website", "web": "website", "form": "website",
    "referral": "referral", "phone": "phone", "walk_in": "walk_in",
    "ghl": "other",
  };
  const mappedSource = SOURCE_MAP[source.toLowerCase()] || "other";

  // Create the lead
  const { data: newLead, error: insertError } = await supabase
    .from("crm_leads")
    .insert({
      lead_name: fullName || "GHL Contact",
      email,
      phone,
      business_unit: businessUnit,
      status: finalStage,
      source: mappedSource,
      ghl_contact_id: contactId || null,
    })
    .select("id")
    .single();

  if (insertError) {
    logStep("contact.created — insert failed", { error: insertError.message });
    return new Response(
      JSON.stringify({ error: "Failed to create lead", details: insertError.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  // Log to timeline
  await supabase.from("crm_activity_events").insert({
    event_type: "status_change" as any,
    entity_type: "lead",
    entity_id: newLead.id,
    entity_name: fullName,
    event_category: "lead_created",
    metadata: {
      action: "ghl_inbound_contact_created",
      description: `New lead created via GHL sync — ${fullName}`,
      ghl_contact_id: contactId,
      source: mappedSource,
      business_unit: businessUnit,
      initial_stage: finalStage,
    },
  });

  logStep("contact.created — lead created", { leadId: newLead.id, name: fullName, businessUnit });

  return new Response(
    JSON.stringify({ received: true, lead_id: newLead.id, stage: finalStage }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}

// ─── Handler: stage changed ───
async function handleStageChanged(supabase: any, body: any) {
  const contactId = body?.contact_id;
  const email = body?.email;
  const newStageRaw = body?.new_stage;
  const businessUnit = body?.business_unit;

  if (!newStageRaw) {
    logStep("Missing new_stage in payload");
    return new Response(JSON.stringify({ error: "Missing new_stage" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  const mappedStage = STAGE_MAP[newStageRaw] || STAGE_MAP[newStageRaw.trim()];

  if (!mappedStage || !VALID_STAGES.has(mappedStage)) {
    logStep("Unrecognized stage name", { raw: newStageRaw, mapped: mappedStage });
    await supabase.from("crm_activity_events").insert({
      event_type: "status_change" as any,
      entity_type: "lead",
      event_category: "ghl_webhook_failed",
      metadata: {
        action: "ghl_inbound_unmapped_stage",
        description: `GHL inbound webhook received unrecognized stage name: ${newStageRaw} for lead ${email || contactId || "unknown"}`,
        raw_stage: newStageRaw, contact_id: contactId, email,
      },
    });
    return new Response(
      JSON.stringify({ received: true, warning: `Unrecognized stage: ${newStageRaw}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  logStep("Mapped stage", { raw: newStageRaw, mapped: mappedStage });

  // Find matching lead
  let lead: any = null;

  if (contactId) {
    const { data } = await supabase.from("crm_leads")
      .select("id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id")
      .eq("ghl_contact_id", contactId).maybeSingle();
    if (data) lead = data;
  }

  if (!lead && email) {
    if (businessUnit) {
      const { data } = await supabase.from("crm_leads")
        .select("id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id")
        .eq("email", email).eq("business_unit", businessUnit)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) lead = data;
    }
    if (!lead) {
      const { data } = await supabase.from("crm_leads")
        .select("id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id")
        .eq("email", email)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) lead = data;
    }
  }

  if (!lead) {
    logStep("No matching lead found", { contactId, email });
    return new Response(
      JSON.stringify({ received: true, warning: "No matching lead found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  if (lead.status === mappedStage) {
    const syncedAt = new Date().toISOString();

    await supabase.from("crm_leads").update({
      ghl_sync_in_progress: false,
      ghl_last_synced_at: syncedAt,
      ...(contactId && !lead.ghl_contact_id ? { ghl_contact_id: contactId } : {}),
    }).eq("id", lead.id);

    await supabase.from("lead_intake_submissions").update({
      ghl_webhook_status: "confirmed",
      ghl_webhook_response: {
        source: "ghl_inbound_webhook",
        confirmation: "stage_already_matched",
        contact_id: contactId,
        stage: mappedStage,
        confirmed_at: syncedAt,
      },
    }).eq("lead_id", lead.id);

    logStep("Lead already at target stage, marking outbound sync confirmed", { leadId: lead.id, stage: mappedStage });
    return new Response(
      JSON.stringify({ received: true, skipped: true, reason: "already_at_stage" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  // Set sync flag
  await supabase.from("crm_leads").update({ ghl_sync_in_progress: true }).eq("id", lead.id);

  const { error: updateError } = await supabase.from("crm_leads")
    .update({ status: mappedStage }).eq("id", lead.id);

  if (updateError) {
    logStep("Failed to update lead stage", { error: updateError.message });
    await supabase.from("crm_leads").update({ ghl_sync_in_progress: false }).eq("id", lead.id);
    return new Response(
      JSON.stringify({ error: "Failed to update lead" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  await supabase.from("crm_activity_events").insert({
    event_type: "status_change" as any,
    entity_type: "lead", entity_id: lead.id, entity_name: lead.lead_name,
    event_category: "stage_changed",
    metadata: {
      action: "ghl_inbound_sync",
      description: `Stage updated via GHL sync — moved to ${STAGE_LABELS[mappedStage] || mappedStage}`,
      ghl_contact_id: contactId, previous_stage: lead.status, new_stage: mappedStage,
    },
  });

  const syncedAt = new Date().toISOString();

  await supabase.from("crm_leads").update({
    ghl_sync_in_progress: false,
    ghl_last_synced_at: syncedAt,
    ...(contactId && !lead.ghl_contact_id ? { ghl_contact_id: contactId } : {}),
  }).eq("id", lead.id);

  await supabase.from("lead_intake_submissions").update({
    ghl_webhook_status: "confirmed",
    ghl_webhook_response: {
      source: "ghl_inbound_webhook",
      confirmation: "stage_updated",
      contact_id: contactId,
      stage: mappedStage,
      confirmed_at: syncedAt,
    },
  }).eq("lead_id", lead.id);

  logStep("Lead updated successfully", { leadId: lead.id, newStage: mappedStage });

  return new Response(
    JSON.stringify({ received: true, lead_id: lead.id, new_stage: mappedStage }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}
