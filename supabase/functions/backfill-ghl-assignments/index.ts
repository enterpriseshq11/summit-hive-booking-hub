import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const GHL_API_KEY = Deno.env.get("GHL_API_KEY");
  const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID");

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    return new Response(JSON.stringify({ error: "Missing GHL credentials" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  // Get all profiles for matching
  const { data: profiles } = await supabase.from("profiles").select("id, first_name, last_name, email");
  if (!profiles?.length) {
    return new Response(JSON.stringify({ error: "No profiles found" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  // Get unassigned leads with GHL contact IDs
  const { data: leads, error: leadsErr } = await supabase
    .from("crm_leads")
    .select("id, lead_name, ghl_contact_id")
    .not("ghl_contact_id", "is", null)
    .is("assigned_employee_id", null)
    .limit(30);

  if (leadsErr || !leads?.length) {
    return new Response(JSON.stringify({ error: leadsErr?.message || "No leads to backfill" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  function matchProfile(assignedTo: string): string | null {
    const val = assignedTo.trim().toLowerCase();
    if (!val) return null;

    // Email match
    if (val.includes("@")) {
      const p = profiles!.find((p: any) => p.email?.toLowerCase() === val);
      if (p) return p.id;
    }

    // First name match
    const byFirst = profiles!.find((p: any) => p.first_name?.toLowerCase() === val);
    if (byFirst) return byFirst.id;

    // Full name match
    const parts = val.split(/\s+/);
    if (parts.length >= 2) {
      const p = profiles!.find((p: any) =>
        p.first_name?.toLowerCase() === parts[0] &&
        p.last_name?.toLowerCase() === parts.slice(1).join(" ")
      );
      if (p) return p.id;
    }

    return null;
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const details: any[] = [];

  for (const lead of leads) {
    try {
      // Fetch contact from GHL
      const res = await fetch(
        `https://services.leadconnectorhq.com/contacts/${lead.ghl_contact_id}`,
        {
          headers: {
            Authorization: `Bearer ${GHL_API_KEY}`,
            Version: "2021-07-28",
          },
        },
      );

      if (!res.ok) {
        skipped++;
        details.push({ lead: lead.lead_name, status: "ghl_fetch_failed", code: res.status });
        continue;
      }

      const data = await res.json();
      const assignedTo = data?.contact?.assignedTo || data?.assignedTo || "";

      if (!assignedTo) {
        skipped++;
        details.push({ lead: lead.lead_name, status: "no_assignedTo" });
        continue;
      }

      const profileId = matchProfile(assignedTo);
      if (!profileId) {
        skipped++;
        details.push({ lead: lead.lead_name, status: "no_profile_match", assignedTo });
        continue;
      }

      const { error: upErr } = await supabase
        .from("crm_leads")
        .update({ assigned_employee_id: profileId })
        .eq("id", lead.id);

      if (upErr) {
        errors++;
        details.push({ lead: lead.lead_name, status: "update_failed", error: upErr.message });
      } else {
        updated++;
        details.push({ lead: lead.lead_name, status: "assigned", profileId });
      }

      // Rate limit: GHL allows ~100 req/min on v2
      await new Promise((r) => setTimeout(r, 700));
    } catch (e) {
      errors++;
      details.push({ lead: lead.lead_name, status: "error", error: (e as Error).message });
    }
  }

  return new Response(
    JSON.stringify({ total: leads.length, updated, skipped, errors, details }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
  );
});
