import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TRUSTED_GHL_LOCATION_ID = "u13ENqQ110HeXyg36sNv";

const logStep = (step: string, details?: any) => {
  console.log(
    `[GHL-INBOUND] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`,
  );
};

/**
 * GHL stage name → internal DB enum value mapping.
 */
const STAGE_MAP: Record<string, string> = {
  "New Lead": "new",
  "Contact Attempted": "contact_attempted",
  "Responded": "responded",
  "Warm Lead": "warm_lead",
  "Hot Lead": "hot_lead",
  "Proposal Sent": "proposal_sent",
  "Contract Out": "contract_sent",
  "Contract Sent": "contract_sent",
  "Deposit Received": "deposit_pending",
  "Deposit Pending": "deposit_pending",
  "Booked": "booked",
  "Completed": "won",
  "Lost": "lost",
  "new": "new",
  "contact_attempted": "contact_attempted",
  "responded": "responded",
  "warm_lead": "warm_lead",
  "hot_lead": "hot_lead",
  "proposal_sent": "proposal_sent",
  "contract_sent": "contract_sent",
  "contract_out": "contract_sent",
  "deposit_pending": "deposit_pending",
  "deposit_received": "deposit_pending",
  "booked": "booked",
  "completed": "won",
  "won": "won",
  "lost": "lost",
};

const VALID_STAGES = new Set([
  "new",
  "contact_attempted",
  "responded",
  "warm_lead",
  "hot_lead",
  "proposal_sent",
  "contract_sent",
  "deposit_pending",
  "booked",
  "won",
  "lost",
  "follow_up_needed",
  "no_response",
]);

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
  lost: "Lost",
};

/** Map GHL tags to internal business_unit */
const TAG_TO_BUSINESS_UNIT: Record<string, string> = {
  "az-hive": "coworking",
  "az-summit": "summit",
  "az-spa": "spa",
  "az-fitness": "fitness",
  "az-elevated": "elevated_by_elyse",
  "az-360-photobooth": "photo_booth",
  "az-voice-vault": "voice_vault",
  "mobile homes": "mobile_homes",
  "a-z estates": "mobile_homes",
  "az estates": "mobile_homes",
  "mobile_homes": "mobile_homes",
};

const PIPELINE_TO_BUSINESS_UNIT: Record<string, string> = {
  R39pNfUKfehKhx0gQ22y: "coworking",
  eyLsMGGgEikqtiTsWrSD: "summit",
  T9xQFgbvNDWd0SRuL3Bt: "elevated_by_elyse",
  jiTtAKTcMGFcfCDl9vQB: "spa",
  hKnG56sPWawRe2Z4E8Sk: "fitness",
  To9CU7VONlcaRPkd9lac: "photo_booth",
  MLC9I84M2xohkODg92TY: "voice_vault",
};

function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function mapStage(rawStage: unknown): string | null {
  const raw = String(rawStage ?? "").trim();
  if (!raw) return null;
  return STAGE_MAP[raw] || STAGE_MAP[normalizeKey(raw)] || null;
}

function safeHeaderSnapshot(headers: Headers): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (const [key, value] of headers.entries()) {
    if (["authorization", "cookie", "x-ghl-signature"].includes(key.toLowerCase())) continue;
    snapshot[key] = value;
  }
  return snapshot;
}

function resolveBusinessUnit(body: any, fallback?: string): string | undefined {
  const pipelineId = body?.pipelineId || body?.pipeline_id || body?.opportunity?.pipelineId || body?.opportunity?.pipeline_id;
  if (pipelineId && PIPELINE_TO_BUSINESS_UNIT[pipelineId]) {
    return PIPELINE_TO_BUSINESS_UNIT[pipelineId];
  }

  const rawTags = body?.tags;
  const tags = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === "string"
      ? rawTags.split(",")
      : rawTags
        ? [rawTags]
        : [];
  const normalizedTags = tags
    .map((t: unknown) => String(t).toLowerCase().trim())
    .filter(Boolean);
  const buField =
    (body?.business_unit || body?.customField?.business_unit || "")
      .toLowerCase().trim();

  // Check tags first (most reliable from GHL workflows)
  for (const tag of normalizedTags) {
    if (TAG_TO_BUSINESS_UNIT[tag]) {
      return TAG_TO_BUSINESS_UNIT[tag];
    }
  }

  // Check explicit business_unit field
  if (buField && TAG_TO_BUSINESS_UNIT[buField]) {
    return TAG_TO_BUSINESS_UNIT[buField];
  }
  if (
    buField &&
    ["summit", "spa", "fitness", "coworking", "voice_vault", "elevated_by_elyse", "photo_booth", "mobile_homes"].includes(buField)
  ) {
    return buField;
  }

  return fallback;
}

function extractLocationId(body: any, headers?: Headers): string {
  return (
    body?.locationId ||
    body?.location_id ||
    body?.location?.id ||
    body?.contact?.locationId ||
    body?.contact?.location_id ||
    body?.contact?.location?.id ||
    body?.opportunity?.locationId ||
    body?.opportunity?.location_id ||
    body?.opportunity?.location?.id ||
    headers?.get("locationid") ||
    headers?.get("location-id") ||
    headers?.get("x-ghl-location-id") ||
    ""
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const body = await req.json();

    // ALWAYS log the incoming body + headers so we can debug GHL payload structure
    logStep("Incoming payload", {
      body,
      headers: Object.fromEntries(req.headers.entries()),
    });

    // Persist raw payload for debugging (best-effort, don't fail if it errors)
    try {
      await supabase.from("ghl_inbound_raw_payloads").insert({
        event_type: body?.event || body?.type || "unknown",
        contact_id: body?.contact?.id || body?.contactId || null,
        lead_id: body?.lead_id || body?.leadId || body?.az_command_lead_id ||
          null,
        location_id: extractLocationId(body, req.headers) || null,
        raw_body: body,
        headers: Object.fromEntries(req.headers.entries()),
      });
    } catch (rawErr) {
      logStep("Failed to persist raw payload", {
        error: (rawErr as Error).message,
      });
    }

    // Verify trusted GHL location first, then fall back to secret-based auth
    const secret = Deno.env.get("GHL_INBOUND_WEBHOOK_SECRET");
    const authHeader = req.headers.get("authorization") || "";
    const sigHeader = req.headers.get("x-ghl-signature") || "";
    const querySecret = new URL(req.url).searchParams.get("secret") || "";
    const locationId = extractLocationId(body, req.headers);
    const isTrustedLocation = locationId === TRUSTED_GHL_LOCATION_ID;

    if (isTrustedLocation) {
      logStep("Webhook authorized", {
        auth_mode: "trusted_location",
        locationId,
      });
    } else if (secret) {
      const token = authHeader.replace("Bearer ", "");
      const isSecretMatch = token === secret || sigHeader === secret ||
        querySecret === secret;

      if (!isSecretMatch) {
        logStep("Unauthorized — secret mismatch (payload still logged above)", {
          locationId,
          hasAuthHeader: !!authHeader,
          hasSigHeader: !!sigHeader,
          hasQuerySecret: !!querySecret,
        });
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }

      logStep("Webhook authorized", {
        auth_mode: "secret",
        locationId: locationId || null,
      });
    } else {
      logStep(
        "WARNING: GHL_INBOUND_WEBHOOK_SECRET not set — requests are unverified",
      );
    }

    const event = body?.event || body?.type || "";
    const hasNewStage = !!(body?.new_stage || body?.stage || body?.stageName);
    const hasLeadId = !!(body?.lead_id || body?.leadId || body?.az_command_lead_id);
    logStep("Received payload", { event, contact_id: body?.contact_id, hasNewStage, hasLeadId, keys: Object.keys(body).slice(0, 15) });

    // Debug: persist raw payload for every inbound GHL request so we can inspect what GHL actually sends
    try {
      const headerSnapshot: Record<string, string> = {};
      for (const [k, v] of req.headers.entries()) {
        if (["authorization", "cookie", "x-ghl-signature"].includes(k.toLowerCase())) continue;
        headerSnapshot[k] = v;
      }
      await supabase.from("ghl_inbound_raw_payloads").insert({
        event_type: event || null,
        contact_id: body?.contact_id || body?.contactId || extractLocationId(body, req.headers) || null,
        location_id: extractLocationId(body, req.headers) || null,
        raw_body: body,
        headers: headerSnapshot,
      });
    } catch (logErr) {
      logStep("Failed to persist raw payload (non-fatal)", { error: String(logErr) });
    }
    // TEMP: full body dump to diagnose GHL stage-change payload shape
    logStep("FULL_BODY_DEBUG", { body });

    // ─── Route by event type ───
    if (
      event === "contact.created" || event === "ContactCreate" ||
      event === "contact_created"
    ) {
      return await handleContactCreatedOrUpdated(supabase, body);
    }

    if (
      event === "contact.updated" || event === "ContactUpdate" ||
      event === "contact_updated" || event === "contact.tag_added" ||
      event === "ContactTagUpdate"
    ) {
      return await handleContactCreatedOrUpdated(supabase, body);
    }

    if (
      event === "contact.stage_changed" || event === "ContactStageUpdate" ||
      event === "stage_changed" || hasNewStage
    ) {
      return await handleStageChanged(supabase, body);
    }

    // No recognized event AND no new_stage — treat as contact upsert (GHL workflow webhooks often omit event field)
    const hasContactData = !!(body?.contact_id || body?.contactId || body?.id || body?.email || body?.phone || body?.name || body?.first_name || body?.firstName);
    if (hasContactData) {
      logStep("No event type specified, treating as contact upsert based on contact data present");
      return await handleContactCreatedOrUpdated(supabase, body);
    }

    // Nothing useful
    logStep("Unrecognized payload — no event, no stage, no contact data");
    return new Response(
      JSON.stringify({ received: true, warning: "Unrecognized payload format" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
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

// ─── Handler: contact created or updated (upsert logic) ───
async function handleContactCreatedOrUpdated(supabase: any, body: any) {
  const contactId = body?.contact_id || body?.id || body?.contactId;
  const firstName = body?.first_name || body?.firstName ||
    body?.name?.split(" ")[0] || "";
  const lastName = body?.last_name || body?.lastName ||
    body?.name?.split(" ").slice(1).join(" ") || "";
  const fullName = body?.name || body?.full_name ||
    `${firstName} ${lastName}`.trim();
  const email = body?.email || null;
  const phone = body?.phone || null;
  const source = body?.source || body?.lead_source || "ghl";
  const stageExplicit = body?.stage ?? body?.pipeline_stage ?? body?.new_stage ?? null;
  const stageRaw = stageExplicit || "new";
  const stageWasExplicit = stageExplicit !== null && stageExplicit !== undefined && String(stageExplicit).trim() !== "";
  const businessUnit = resolveBusinessUnit(body);

  if (!fullName && !email && !phone) {
    logStep("contact upsert — no usable contact data");
    return new Response(
      JSON.stringify({ received: true, warning: "No usable contact data" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  // ─── Find existing lead by ghl_contact_id or email ───
  let existingLead: any = null;

  if (contactId) {
    const { data } = await supabase
      .from("crm_leads")
      .select("id, lead_name, status, email, phone, business_unit, ghl_contact_id")
      .eq("ghl_contact_id", contactId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data) existingLead = data;
  }

  if (!existingLead && email) {
    const { data } = await supabase
      .from("crm_leads")
      .select("id, lead_name, status, email, phone, business_unit, ghl_contact_id")
      .eq("email", email)
      .eq("business_unit", businessUnit)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data) existingLead = data;
  }

  // ─── UPDATE existing lead ───
  if (existingLead) {
    const updates: Record<string, any> = {};

    // Update contact info if changed
    if (fullName && fullName !== existingLead.lead_name && fullName !== "GHL Contact") {
      updates.lead_name = fullName;
    }
    if (email && email !== existingLead.email) {
      updates.email = email;
    }
    if (phone && phone !== existingLead.phone) {
      updates.phone = phone;
    }
    if (contactId && !existingLead.ghl_contact_id) {
      updates.ghl_contact_id = contactId;
    }

    // Update stage when GHL explicitly sent one (allow "new" as a valid target stage)
    const mappedStage = STAGE_MAP[stageRaw] || STAGE_MAP[stageRaw?.trim()] || null;
    if (stageWasExplicit && mappedStage && VALID_STAGES.has(mappedStage) && mappedStage !== existingLead.status) {
      updates.status = mappedStage;
    }

    // Always update sync timestamp
    updates.ghl_last_synced_at = new Date().toISOString();
    updates.ghl_sync_in_progress = false;

    const { error: updateError } = await supabase
      .from("crm_leads")
      .update(updates)
      .eq("id", existingLead.id);

    if (updateError) {
      logStep("contact upsert — update failed", { error: updateError.message });
      return new Response(
        JSON.stringify({ error: "Failed to update lead", details: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Log activity if meaningful changes were made
    const meaningfulKeys = Object.keys(updates).filter(k => !["ghl_last_synced_at", "ghl_sync_in_progress", "ghl_contact_id"].includes(k));
    if (meaningfulKeys.length > 0) {
      await supabase.from("crm_activity_events").insert({
        event_type: updates.status ? "lead_status_changed" : "lead_updated",
        entity_type: "lead",
        entity_id: existingLead.id,
        entity_name: updates.lead_name || existingLead.lead_name,
        event_category: "ghl_inbound_update",
        metadata: {
          action: "ghl_inbound_contact_updated",
          description: `Lead updated via GHL sync${updates.status ? ` — stage changed to ${STAGE_LABELS[updates.status] || updates.status}` : ""}`,
          ghl_contact_id: contactId,
          updated_fields: meaningfulKeys,
          previous_stage: existingLead.status,
          new_stage: updates.status || existingLead.status,
        },
      });
    }

    logStep("contact upsert — existing lead updated", {
      leadId: existingLead.id,
      name: existingLead.lead_name,
      updatedFields: meaningfulKeys,
    });

    return new Response(
      JSON.stringify({
        received: true,
        lead_id: existingLead.id,
        action: "updated",
        updated_fields: meaningfulKeys,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }

  // ─── CREATE new lead ───
  const mappedStage = STAGE_MAP[stageRaw] || STAGE_MAP[stageRaw?.trim()] || "new";
  const finalStage = VALID_STAGES.has(mappedStage) ? mappedStage : "new";

  const SOURCE_MAP: Record<string, string> = {
    "facebook": "social_media",
    "fb": "social_media",
    "instagram": "social_media",
    "google": "google_ads",
    "google_ads": "google_ads",
    "website": "website",
    "web": "website",
    "form": "website",
    "referral": "referral",
    "phone": "phone",
    "walk_in": "walk_in",
    "ghl": "other",
  };
  const mappedSource = SOURCE_MAP[source.toLowerCase()] || "other";

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
      ghl_last_synced_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) {
    logStep("contact upsert — insert failed", { error: insertError.message });
    return new Response(
      JSON.stringify({ error: "Failed to create lead", details: insertError.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }

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

  logStep("contact upsert — new lead created", {
    leadId: newLead.id,
    name: fullName,
    businessUnit,
  });

  return new Response(
    JSON.stringify({ received: true, lead_id: newLead.id, action: "created", stage: finalStage }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
  );
}

// ─── Handler: stage changed ───
async function handleStageChanged(supabase: any, body: any) {
  const contactId = body?.contact_id || body?.contactId;
  const leadId = body?.lead_id || body?.leadId || body?.az_command_lead_id;
  const email = body?.email;
  const newStageRaw = body?.new_stage || body?.stage || body?.stageName;
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
    logStep("Unrecognized stage name", {
      raw: newStageRaw,
      mapped: mappedStage,
    });
    await supabase.from("crm_activity_events").insert({
      event_type: "status_change" as any,
      entity_type: "lead",
      event_category: "ghl_webhook_failed",
      metadata: {
        action: "ghl_inbound_unmapped_stage",
        description:
          `GHL inbound webhook received unrecognized stage name: ${newStageRaw} for lead ${
            email || contactId || "unknown"
          }`,
        raw_stage: newStageRaw,
        contact_id: contactId,
        email,
      },
    });
    return new Response(
      JSON.stringify({
        received: true,
        warning: `Unrecognized stage: ${newStageRaw}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  logStep("Mapped stage", { raw: newStageRaw, mapped: mappedStage });

  // Find matching lead — prefer A-Z Command Lead ID (direct UUID match)
  let lead: any = null;

  if (leadId) {
    const { data } = await supabase.from("crm_leads")
      .select(
        "id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id",
      )
      .eq("id", leadId).maybeSingle();
    if (data) lead = data;
  }

  if (!lead && contactId) {
    const { data } = await supabase.from("crm_leads")
      .select(
        "id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id",
      )
      .eq("ghl_contact_id", contactId).maybeSingle();
    if (data) lead = data;
  }

  if (!lead && email) {
    if (businessUnit) {
      const { data } = await supabase.from("crm_leads")
        .select(
          "id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id",
        )
        .eq("email", email).eq("business_unit", businessUnit)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) lead = data;
    }
    if (!lead) {
      const { data } = await supabase.from("crm_leads")
        .select(
          "id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id",
        )
        .eq("email", email)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) lead = data;
    }
  }

  if (!lead) {
    logStep("No matching lead found", { contactId, email });
    return new Response(
      JSON.stringify({ received: true, warning: "No matching lead found" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  if (lead.status === mappedStage) {
    const syncedAt = new Date().toISOString();

    await supabase.from("crm_leads").update({
      ghl_sync_in_progress: false,
      ghl_last_synced_at: syncedAt,
      ...(contactId && !lead.ghl_contact_id
        ? { ghl_contact_id: contactId }
        : {}),
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

    logStep("Lead already at target stage, marking outbound sync confirmed", {
      leadId: lead.id,
      stage: mappedStage,
    });
    return new Response(
      JSON.stringify({
        received: true,
        skipped: true,
        reason: "already_at_stage",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  // Set sync flag
  await supabase.from("crm_leads").update({ ghl_sync_in_progress: true }).eq(
    "id",
    lead.id,
  );

  const { error: updateError } = await supabase.from("crm_leads")
    .update({ status: mappedStage }).eq("id", lead.id);

  if (updateError) {
    logStep("Failed to update lead stage", { error: updateError.message });
    await supabase.from("crm_leads").update({ ghl_sync_in_progress: false }).eq(
      "id",
      lead.id,
    );
    return new Response(
      JSON.stringify({ error: "Failed to update lead" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  await supabase.from("crm_activity_events").insert({
    event_type: "status_change" as any,
    entity_type: "lead",
    entity_id: lead.id,
    entity_name: lead.lead_name,
    event_category: "stage_changed",
    metadata: {
      action: "ghl_inbound_sync",
      description: `Stage updated via GHL sync — moved to ${
        STAGE_LABELS[mappedStage] || mappedStage
      }`,
      ghl_contact_id: contactId,
      previous_stage: lead.status,
      new_stage: mappedStage,
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

  logStep("Lead updated successfully", {
    leadId: lead.id,
    newStage: mappedStage,
  });

  return new Response(
    JSON.stringify({
      received: true,
      lead_id: lead.id,
      new_stage: mappedStage,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
}
