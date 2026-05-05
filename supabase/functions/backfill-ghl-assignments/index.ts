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

  // Step 1: Fetch GHL users to build ID → name/email map
  const usersRes = await fetch(
    `https://services.leadconnectorhq.com/users/search?companyId=${GHL_LOCATION_ID}&locationId=${GHL_LOCATION_ID}`,
    {
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: "2021-07-28",
      },
    },
  );

  // Try location-based user lookup
  const usersRes2 = await fetch(
    `https://services.leadconnectorhq.com/users/?locationId=${GHL_LOCATION_ID}`,
    {
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: "2021-07-28",
      },
    },
  );

  const usersData = await usersRes.json().catch(() => ({}));
  const usersData2 = await usersRes2.json().catch(() => ({}));

  // Build GHL user ID → {name, email} map from both responses
  const ghlUserMap: Record<string, { name: string; email: string }> = {};

  const allUsers = [
    ...(usersData?.users || []),
    ...(usersData2?.users || []),
  ];

  for (const u of allUsers) {
    const id = u.id || u.userId;
    if (id) {
      ghlUserMap[id] = {
        name: `${u.firstName || u.first_name || ""} ${u.lastName || u.last_name || ""}`.trim(),
        email: (u.email || "").toLowerCase(),
      };
    }
  }

  // Step 2: Get profiles
  const { data: profiles } = await supabase.from("profiles").select("id, first_name, last_name, email");
  if (!profiles?.length) {
    return new Response(JSON.stringify({ error: "No profiles" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  function matchProfile(ghlUserId: string): { profileId: string; matchedVia: string } | null {
    const ghlUser = ghlUserMap[ghlUserId];
    if (!ghlUser) return null;

    // Email match
    if (ghlUser.email) {
      const p = profiles!.find((p: any) => p.email?.toLowerCase() === ghlUser.email);
      if (p) return { profileId: p.id, matchedVia: `email:${ghlUser.email}` };
    }

    // First name match
    const firstName = ghlUser.name.split(/\s+/)[0]?.toLowerCase();
    if (firstName) {
      const p = profiles!.find((p: any) => p.first_name?.toLowerCase() === firstName);
      if (p) return { profileId: p.id, matchedVia: `first_name:${firstName}` };
    }

    return null;
  }

  // Step 3: Get unassigned leads
  const { data: leads } = await supabase
    .from("crm_leads")
    .select("id, lead_name, ghl_contact_id")
    .not("ghl_contact_id", "is", null)
    .is("assigned_employee_id", null)
    .limit(50);

  if (!leads?.length) {
    return new Response(JSON.stringify({ message: "No leads to backfill", ghlUsers: ghlUserMap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const details: any[] = [];

  for (const lead of leads) {
    try {
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

      const match = matchProfile(assignedTo);
      if (!match) {
        skipped++;
        details.push({
          lead: lead.lead_name,
          status: "no_profile_match",
          ghlUserId: assignedTo,
          ghlUser: ghlUserMap[assignedTo] || "unknown_ghl_user",
        });
        continue;
      }

      const { error: upErr } = await supabase
        .from("crm_leads")
        .update({ assigned_employee_id: match.profileId })
        .eq("id", lead.id);

      if (upErr) {
        errors++;
        details.push({ lead: lead.lead_name, status: "update_failed", error: upErr.message });
      } else {
        updated++;
        details.push({ lead: lead.lead_name, status: "assigned", ...match });
      }

      await new Promise((r) => setTimeout(r, 700));
    } catch (e) {
      errors++;
      details.push({ lead: lead.lead_name, status: "error", error: (e as Error).message });
    }
  }

  return new Response(
    JSON.stringify({ total: leads.length, updated, skipped, errors, ghlUsersFound: Object.keys(ghlUserMap).length, ghlUserMap, details }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
  );
});
