import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_BUSINESS_UNIT_FIELD_KEY = "business_interest";

const BUSINESS_UNIT_TO_GHL: Record<string, string> = {
  summit: "The Summit Event Center",
  hive: "The Hive Coworking",
  coworking: "The Hive Coworking",
  spa: "Restoration Lounge Spa",
  fitness: "A-Z Total Fitness",
  photo_booth: "360 Photo Booth",
  voice_vault: "Voice Vault",
  elevated_by_elyse: "Elevated by Elyse",
};

const mapBU = (bu?: string | null) => (bu ? BUSINESS_UNIT_TO_GHL[String(bu).toLowerCase().trim()] || null : null);
const log = (m: string, d?: any) => console.log(`[BACKFILL-BU] ${m}${d ? ` — ${JSON.stringify(d)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
  const ghlApiKey = Deno.env.get("GHL_API_KEY") ?? "";

  let limit = 200;
  try {
    const body = await req.json();
    if (body?.limit) limit = Number(body.limit);
  } catch (_) {}

  try {
    const { data: leads, error } = await supabase
      .from("crm_leads")
      .select("id, lead_name, ghl_contact_id, business_unit")
      .not("ghl_contact_id", "is", null)
      .not("business_unit", "is", null)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No leads to backfill", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log(`Backfilling ${leads.length} leads`);
    const results: any[] = [];
    let succeeded = 0, skipped = 0, failed = 0;

    for (const lead of leads) {
      const value = mapBU(lead.business_unit);
      if (!value) {
        results.push({ leadId: lead.id, status: "skipped", reason: "unmapped business_unit", bu: lead.business_unit });
        skipped++;
        continue;
      }

      try {
        const res = await fetch(`${GHL_API_BASE}/contacts/${lead.ghl_contact_id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ghlApiKey}`,
            Version: "2021-07-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customFields: [{ key: GHL_BUSINESS_UNIT_FIELD_KEY, field_value: value }],
          }),
        });

        if (res.ok) {
          succeeded++;
          results.push({ leadId: lead.id, name: lead.lead_name, status: "success", value });
        } else {
          failed++;
          const errText = (await res.text()).substring(0, 200);
          results.push({ leadId: lead.id, name: lead.lead_name, status: "failed", code: res.status, error: errText });
        }
      } catch (e) {
        failed++;
        results.push({ leadId: lead.id, status: "error", error: e instanceof Error ? e.message : String(e) });
      }

      await new Promise((r) => setTimeout(r, 250));
    }

    log(`Done: ${succeeded} ok / ${failed} failed / ${skipped} skipped`);
    return new Response(
      JSON.stringify({ success: true, total: leads.length, succeeded, failed, skipped, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
