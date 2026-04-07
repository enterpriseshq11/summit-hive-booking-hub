import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GHL_API = "https://services.leadconnectorhq.com";

// Map A-Z Command business_unit → GHL Pipeline ID
const PIPELINE_MAP: Record<string, string> = {
  coworking:         "R39pNfUKfehKhx0gQ22y",  // The Hive Coworking
  summit:            "eyLsMGGgEikqtiTsWrSD",  // The Summit Event Center
  elevated_by_elyse: "T9xQFgbvNDWd0SRuL3Bt",  // Elevated by Elyse
  spa:               "jiTtAKTcMGFcfCDl9vQB",  // Restoration Lounge Spa
  fitness:           "hKnG56sPWawRe2Z4E8Sk",  // A-Z Total Fitness
  photo_booth:       "To9CU7VONlcaRPkd9lac",  // 360 Photo Booth
  voice_vault:       "MLC9I84M2xohkODg92TY",  // Voice Vault
};

const log = (step: string, details?: any) =>
  console.log(`[GHL-OPP] ${step}${details ? ` — ${JSON.stringify(details)}` : ""}`);

// Cache pipeline stage lookups in memory (reset on cold start)
const stageCache: Record<string, string> = {};

async function getNewLeadStageId(pipelineId: string, ghlApiKey: string, locationId: string): Promise<string | null> {
  if (stageCache[pipelineId]) return stageCache[pipelineId];

  const res = await fetch(`${GHL_API}/opportunities/pipelines?locationId=${locationId}`, {
    headers: {
      "Authorization": `Bearer ${ghlApiKey}`,
      "Version": "2021-07-28",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    log("Failed to fetch pipelines", { status: res.status, error: err });
    return null;
  }

  const data = await res.json();
  const pipelines = data?.pipelines || [];

  for (const pipeline of pipelines) {
    if (pipeline.id === pipelineId) {
      const stages = pipeline.stages || [];
      // Find stage named "New Lead" (case-insensitive)
      const newLeadStage = stages.find((s: any) =>
        s.name?.toLowerCase().replace(/\s+/g, "") === "newlead"
      );
      if (newLeadStage) {
        stageCache[pipelineId] = newLeadStage.id;
        log("Cached New Lead stage", { pipelineId, stageId: newLeadStage.id, stageName: newLeadStage.name });
        return newLeadStage.id;
      }
      // Fallback: use the first stage
      if (stages.length > 0) {
        stageCache[pipelineId] = stages[0].id;
        log("No 'New Lead' stage found, using first stage", { pipelineId, stageId: stages[0].id, stageName: stages[0].name });
        return stages[0].id;
      }
    }
  }

  log("Pipeline not found in GHL response", { pipelineId });
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const ghlApiKey = Deno.env.get("GHL_API_KEY") ?? "";
  const ghlLocationId = Deno.env.get("GHL_LOCATION_ID") ?? "";

  if (!ghlApiKey || !ghlLocationId) {
    return new Response(
      JSON.stringify({ success: false, error: "GHL credentials not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    const body = await req.json();
    const { leadId, ghlContactId, leadName, businessUnit } = body;

    if (!leadId || !ghlContactId || !leadName || !businessUnit) {
      return new Response(
        JSON.stringify({ success: false, error: "leadId, ghlContactId, leadName, and businessUnit are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pipelineId = PIPELINE_MAP[businessUnit];
    if (!pipelineId) {
      log("No pipeline mapped for business unit", { businessUnit });
      return new Response(
        JSON.stringify({ success: false, error: `No GHL pipeline mapped for business unit: ${businessUnit}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch the "New Lead" stage ID dynamically from GHL
    const stageId = await getNewLeadStageId(pipelineId, ghlApiKey, ghlLocationId);
    if (!stageId) {
      log("Could not resolve New Lead stage", { pipelineId, businessUnit });
      return new Response(
        JSON.stringify({ success: false, error: "Could not resolve New Lead stage in GHL pipeline" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check if opportunity already exists for this contact in this pipeline
    const searchRes = await fetch(
      `${GHL_API}/opportunities/search?location_id=${ghlLocationId}&pipeline_id=${pipelineId}&contact_id=${ghlContactId}`,
      { headers: { "Authorization": `Bearer ${ghlApiKey}`, "Version": "2021-07-28" } },
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const existing = (searchData?.opportunities || []).find(
        (o: any) => o.pipelineId === pipelineId && o.contact?.id === ghlContactId
      );
      if (existing) {
        log("Opportunity already exists, skipping creation", { opportunityId: existing.id, pipelineId });
        // Log activity
        await supabase.from("crm_activity_events").insert({
          event_type: "lead_updated" as any,
          entity_type: "lead",
          entity_id: leadId,
          event_category: "ghl_opportunity_exists",
          metadata: {
            action: "ghl_opportunity_already_exists",
            description: `GHL opportunity already exists — ID: ${existing.id}`,
            ghl_opportunity_id: existing.id,
            pipeline_id: pipelineId,
            business_unit: businessUnit,
          },
        });
        return new Response(
          JSON.stringify({ success: true, opportunity_id: existing.id, pipeline_id: pipelineId, already_existed: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else {
      const errText = await searchRes.text();
      log("Opportunity search failed, will attempt creation", { status: searchRes.status, error: errText });
    }

    log("Creating opportunity", { ghlContactId, pipelineId, stageId, leadName });

    const oppRes = await fetch(`${GHL_API}/opportunities/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ghlApiKey}`,
        "Version": "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pipelineId,
        pipelineStageId: stageId,
        locationId: ghlLocationId,
        contactId: ghlContactId,
        name: leadName,
        status: "open",
      }),
    });

    const oppText = await oppRes.text();

    if (!oppRes.ok) {
      // Handle duplicate error gracefully
      if (oppRes.status === 400 && oppText.includes("duplicate")) {
        log("Duplicate opportunity detected via 400, treating as success", { ghlContactId, pipelineId });
        return new Response(
          JSON.stringify({ success: true, already_existed: true, note: "Duplicate detected by GHL" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      log("Opportunity creation failed", { status: oppRes.status, error: oppText });
      return new Response(
        JSON.stringify({ success: false, error: `GHL opportunity creation failed: ${oppText}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let oppData: any;
    try { oppData = JSON.parse(oppText); } catch (_) { oppData = {}; }
    const opportunityId = oppData?.opportunity?.id || null;

    log("Opportunity created", { opportunityId, pipelineId, stageId });

    // Log activity
    await supabase.from("crm_activity_events").insert({
      event_type: "lead_updated" as any,
      entity_type: "lead",
      entity_id: leadId,
      event_category: "ghl_opportunity_created",
      metadata: {
        action: "ghl_opportunity_created",
        description: `GHL opportunity created — Pipeline: ${pipelineId}, Stage: New Lead`,
        ghl_contact_id: ghlContactId,
        ghl_opportunity_id: opportunityId,
        pipeline_id: pipelineId,
        stage_id: stageId,
        business_unit: businessUnit,
      },
    });

    return new Response(
      JSON.stringify({ success: true, opportunity_id: opportunityId, pipeline_id: pipelineId, stage_id: stageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });

    try {
      await supabase.from("edge_function_errors").insert({
        function_name: "ghl-create-opportunity",
        error_message: msg,
        stack_trace: error instanceof Error ? error.stack : null,
      });
    } catch (_) { /* best effort */ }

    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
