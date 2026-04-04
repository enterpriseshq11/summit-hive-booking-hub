import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[GOOGLE-ADS-SYNC] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
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
    const customerId = Deno.env.get("GOOGLE_ADS_CUSTOMER_ID");
    const developerToken = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");
    const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET");
    const refreshToken = Deno.env.get("GOOGLE_ADS_REFRESH_TOKEN");

    if (!customerId || !developerToken || !refreshToken || !clientId || !clientSecret) {
      logStep("Missing Google Ads credentials");
      return new Response(JSON.stringify({ error: "Google Ads not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Starting Google Ads sync");

    // Get OAuth access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Google OAuth failed: ${await tokenRes.text()}`);
    }

    const { access_token } = await tokenRes.json();

    // Query Google Ads API
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const since = thirtyDaysAgo.toISOString().split("T")[0].replace(/-/g, "");
    const until = today.toISOString().split("T")[0].replace(/-/g, "");

    const cleanCustomerId = customerId.replace(/-/g, "");
    const query = `SELECT campaign.id, campaign.name, segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign WHERE segments.date BETWEEN '${thirtyDaysAgo.toISOString().split("T")[0]}' AND '${today.toISOString().split("T")[0]}' ORDER BY segments.date DESC`;

    const gaqlRes = await fetch(
      `https://googleads.googleapis.com/v16/customers/${cleanCustomerId}/googleAds:searchStream`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "developer-token": developerToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!gaqlRes.ok) {
      const err = await gaqlRes.text();
      throw new Error(`Google Ads API error: ${err}`);
    }

    const results = await gaqlRes.json();
    let upsertCount = 0;

    for (const batch of (results || [])) {
      for (const row of (batch.results || [])) {
        const campaignId = row.campaign?.id;
        const campaignName = row.campaign?.name;
        const date = row.segments?.date;
        const costMicros = parseInt(row.metrics?.costMicros || "0", 10);
        const spend = costMicros / 1_000_000;
        const impressions = parseInt(row.metrics?.impressions || "0", 10);
        const clicks = parseInt(row.metrics?.clicks || "0", 10);
        const conversions = parseFloat(row.metrics?.conversions || "0");
        const leads = Math.round(conversions);
        const costPerLead = leads > 0 ? spend / leads : null;

        const { error } = await supabase.from("google_ad_campaigns").upsert(
          {
            campaign_id: `${campaignId}_${date}`,
            campaign_name: campaignName,
            date,
            spend,
            impressions,
            clicks,
            leads,
            cost_per_lead: costPerLead,
            platform: "google",
            synced_at: new Date().toISOString(),
          },
          { onConflict: "campaign_id" }
        );

        if (!error) upsertCount++;
      }
    }

    // Log sync
    await supabase.from("crm_activity_events").insert({
      event_type: "status_change" as any,
      entity_type: "ad_sync",
      event_category: "settings_change",
      metadata: {
        description: `Google Ads sync completed — ${upsertCount} campaigns updated`,
        platform: "google",
      },
    });

    logStep("Sync complete", { upsertCount });

    return new Response(JSON.stringify({ success: true, campaigns_synced: upsertCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
