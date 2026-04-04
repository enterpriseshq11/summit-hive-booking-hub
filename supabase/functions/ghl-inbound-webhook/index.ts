import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[GHL-INBOUND] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

/**
 * Comprehensive GHL stage name → internal DB enum value mapping.
 * Handles display labels, internal keys, and case variations.
 * DB enum uses "won" for Completed; GHL webhook table uses "completed" as stage_name.
 */
const STAGE_MAP: Record<string, string> = {
  // Display labels (what Rose configures in GHL)
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
  // Internal key values (lowercase)
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

// All valid internal stage keys (DB enum values)
const VALID_STAGES = new Set([
  "new", "contact_attempted", "responded", "warm_lead", "hot_lead",
  "proposal_sent", "contract_sent", "deposit_pending", "booked",
  "won", "lost", "follow_up_needed", "no_response",
]);

// Internal stage key → display labels
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
    // Verify shared secret
    const secret = Deno.env.get("GHL_INBOUND_WEBHOOK_SECRET");
    const authHeader = req.headers.get("authorization") || "";
    const sigHeader = req.headers.get("x-ghl-signature") || "";

    if (secret) {
      const token = authHeader.replace("Bearer ", "");
      if (token !== secret && sigHeader !== secret) {
        logStep("Unauthorized — secret mismatch");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
    } else {
      logStep("WARNING: GHL_INBOUND_WEBHOOK_SECRET not set — requests are unverified");
    }

    const body = await req.json();
    logStep("Received payload", { event: body?.event, contact_id: body?.contact_id });

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

    // Map GHL stage to internal stage key (try exact match then trimmed)
    const mappedStage = STAGE_MAP[newStageRaw] || STAGE_MAP[newStageRaw.trim()];

    // Handle unrecognized stage names
    if (!mappedStage || !VALID_STAGES.has(mappedStage)) {
      logStep("Unrecognized stage name", { raw: newStageRaw, mapped: mappedStage });

      await supabase.from("crm_activity_events").insert({
        event_type: "status_change" as any,
        entity_type: "lead",
        event_category: "ghl_webhook_failed",
        metadata: {
          action: "ghl_inbound_unmapped_stage",
          description: `GHL inbound webhook received unrecognized stage name: ${newStageRaw} for lead ${email || contactId || "unknown"}`,
          raw_stage: newStageRaw,
          contact_id: contactId,
          email: email,
        },
      });

      return new Response(
        JSON.stringify({ received: true, warning: `Unrecognized stage: ${newStageRaw}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("Mapped stage", { raw: newStageRaw, mapped: mappedStage });

    // Find matching lead — try ghl_contact_id first, then email+business_unit, then email
    let lead: any = null;

    if (contactId) {
      const { data } = await supabase
        .from("crm_leads")
        .select("id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id")
        .eq("ghl_contact_id", contactId)
        .maybeSingle();
      if (data) lead = data;
    }

    if (!lead && email) {
      if (businessUnit) {
        const { data } = await supabase
          .from("crm_leads")
          .select("id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id")
          .eq("email", email)
          .eq("business_unit", businessUnit)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) lead = data;
      }

      if (!lead) {
        const { data } = await supabase
          .from("crm_leads")
          .select("id, lead_name, status, business_unit, ghl_sync_in_progress, ghl_contact_id")
          .eq("email", email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
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

    // If already at this stage, skip
    if (lead.status === mappedStage) {
      logStep("Lead already at target stage, skipping", { leadId: lead.id, stage: mappedStage });
      return new Response(
        JSON.stringify({ received: true, skipped: true, reason: "already_at_stage" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Set sync flag to prevent outbound webhook loop
    await supabase.from("crm_leads")
      .update({ ghl_sync_in_progress: true })
      .eq("id", lead.id);

    // Update stage
    const { error: updateError } = await supabase.from("crm_leads")
      .update({ status: mappedStage })
      .eq("id", lead.id);

    if (updateError) {
      logStep("Failed to update lead stage", { error: updateError.message });
      await supabase.from("crm_leads")
        .update({ ghl_sync_in_progress: false })
        .eq("id", lead.id);
      return new Response(
        JSON.stringify({ error: "Failed to update lead" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Log to timeline
    await supabase.from("crm_activity_events").insert({
      event_type: "status_change" as any,
      entity_type: "lead",
      entity_id: lead.id,
      entity_name: lead.lead_name,
      event_category: "stage_changed",
      metadata: {
        action: "ghl_inbound_sync",
        description: `Stage updated via GHL sync — moved to ${STAGE_LABELS[mappedStage] || mappedStage}`,
        ghl_contact_id: contactId,
        previous_stage: lead.status,
        new_stage: mappedStage,
      },
    });

    // Store ghl_contact_id if we matched by email and don't have it yet
    if (contactId && !lead.ghl_contact_id) {
      await supabase.from("crm_leads")
        .update({ ghl_contact_id: contactId })
        .eq("id", lead.id);
    }

    // Clear sync flag
    await supabase.from("crm_leads")
      .update({ ghl_sync_in_progress: false })
      .eq("id", lead.id);

    logStep("Lead updated successfully", { leadId: lead.id, newStage: mappedStage });

    return new Response(
      JSON.stringify({ received: true, lead_id: lead.id, new_stage: mappedStage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
