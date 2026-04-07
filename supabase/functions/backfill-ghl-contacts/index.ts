import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GHL_API_BASE = "https://services.leadconnectorhq.com";

const PIPELINE_MAP: Record<string, string> = {
  coworking: "R39pNfUKfehKhx0gQ22y",
  event_center: "eyLsMGGgEikqtiTsWrSD",
  spa: "T9xQFgbvNDWd0SRuL3Bt",
  restoration_spa: "jiTtAKTcMGFcfCDl9vQB",
  fitness: "hKnG56sPWawRe2Z4E8Sk",
  photo_booth: "To9CU7VONlcaRPkd9lac",
  voice_vault: "MLC9I84M2xohkODg92TY",
};

const log = (msg: string, d?: any) =>
  console.log(`[BACKFILL] ${msg}${d ? ` — ${JSON.stringify(d)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const ghlApiKey = Deno.env.get("GHL_API_KEY") ?? "";
  const ghlLocationId = Deno.env.get("GHL_LOCATION_ID") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const results: any[] = [];
  let batchLimit = 10;
  try {
    const body = await req.json();
    if (body?.limit) batchLimit = body.limit;
  } catch (_) {}

  try {
    const { data: leads, error } = await supabase
      .from("crm_leads")
      .select("id, lead_name, email, phone, business_unit")
      .is("ghl_contact_id", null)
      .not("email", "is", null)
      .neq("email", "")
      .order("created_at", { ascending: true })
      .limit(batchLimit);

    if (error) throw error;
    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No leads to backfill", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log(`Found ${leads.length} leads to backfill`);

    for (const lead of leads) {
      const result: any = { leadId: lead.id, name: lead.lead_name, email: lead.email };
      try {
        if (!lead.email || lead.email.trim() === "") {
          result.status = "skipped";
          result.reason = "No email";
          results.push(result);
          continue;
        }

        const nameParts = (lead.lead_name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Step 1: Search for contact using lookup endpoint
        let ghlContactId: string | null = null;

        const searchUrl = `${GHL_API_BASE}/contacts/?locationId=${ghlLocationId}&query=${encodeURIComponent(lead.email)}`;
        log("Searching GHL", { url: searchUrl });
        const searchRes = await fetch(searchUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${ghlApiKey}`,
            Version: "2021-07-28",
          },
        });

        const searchText = await searchRes.text();
        log("Search response", { status: searchRes.status, body: searchText.substring(0, 500) });

        if (searchRes.ok) {
          try {
            const sd = JSON.parse(searchText);
            const contacts = sd?.contacts || [];
            if (contacts.length > 0) {
              ghlContactId = contacts[0].id;
              log("Found existing contact", { ghlContactId });
            }
          } catch (_) {}
        }

        // Create if not found
        if (!ghlContactId) {
          log("Creating contact", { email: lead.email });
          const createRes = await fetch(`${GHL_API_BASE}/contacts/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ghlApiKey}`,
              Version: "2021-07-28",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              locationId: ghlLocationId,
              firstName,
              lastName,
              email: lead.email,
              phone: lead.phone || "",
              source: "A-Z Command Backfill",
              tags: [lead.business_unit || "general"],
            }),
          });

          const createText = await createRes.text();
          log("Create response", { status: createRes.status, body: createText.substring(0, 500) });

          if (createRes.ok) {
            try {
              const cd = JSON.parse(createText);
              ghlContactId = cd?.contact?.id || null;
            } catch (_) {}
          } else if (createRes.status === 422 || createRes.status === 400) {
            try {
              const errJson = JSON.parse(createText);
              ghlContactId = errJson?.contact?.id || errJson?.contactId || errJson?.meta?.contactId || null;
            } catch (_) {}
          }
        }

        if (!ghlContactId) {
          result.status = "failed";
          result.reason = "Could not find or create GHL contact";
          results.push(result);
          continue;
        }

        // Save contact ID
        await supabase.from("crm_leads").update({ ghl_contact_id: ghlContactId }).eq("id", lead.id);
        result.ghlContactId = ghlContactId;

        // Step 2: Create opportunity
        const pipelineId = PIPELINE_MAP[lead.business_unit] || PIPELINE_MAP["coworking"];

        const pipelineRes = await fetch(
          `${GHL_API_BASE}/opportunities/pipelines?locationId=${ghlLocationId}`,
          { headers: { Authorization: `Bearer ${ghlApiKey}`, Version: "2021-07-28" } }
        );

        let stageId: string | null = null;
        if (pipelineRes.ok) {
          const pd = await pipelineRes.json();
          const pipeline = pd?.pipelines?.find((p: any) => p.id === pipelineId);
          if (pipeline?.stages?.length > 0) {
            const newLeadStage = pipeline.stages.find((s: any) => s.name?.toLowerCase().includes("new"));
            stageId = newLeadStage?.id || pipeline.stages[0].id;
          }
        }

        if (stageId) {
          const oppRes = await fetch(`${GHL_API_BASE}/opportunities/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ghlApiKey}`,
              Version: "2021-07-28",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pipelineId,
              pipelineStageId: stageId,
              locationId: ghlLocationId,
              contactId: ghlContactId,
              name: lead.lead_name || lead.email,
              status: "open",
              source: "A-Z Command Backfill",
            }),
          });
          result.opportunityCreated = oppRes.ok;
          if (!oppRes.ok) {
            result.oppError = (await oppRes.text()).substring(0, 300);
          }
        }

        result.status = "success";

        await supabase.from("crm_activity_events").insert({
          event_type: "lead_updated" as any,
          entity_type: "lead",
          entity_id: lead.id,
          event_category: "ghl_backfill",
          metadata: { ghl_contact_id: ghlContactId, backfill: true },
        });
      } catch (e) {
        result.status = "error";
        result.error = e instanceof Error ? e.message : String(e);
      }
      results.push(result);
      await new Promise((r) => setTimeout(r, 500));
    }

    const successCount = results.filter((r) => r.status === "success").length;
    log(`Backfill complete: ${successCount}/${leads.length} succeeded`);

    return new Response(
      JSON.stringify({ success: true, total: leads.length, succeeded: successCount, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
