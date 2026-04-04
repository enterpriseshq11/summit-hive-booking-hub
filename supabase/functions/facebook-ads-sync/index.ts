import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[FB-ADS-SYNC] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
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
    const accessToken = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
    const adAccountId = Deno.env.get("FACEBOOK_AD_ACCOUNT_ID");

    if (!accessToken || !adAccountId) {
      logStep("Missing Facebook credentials");
      return new Response(JSON.stringify({ error: "Facebook Ads not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Starting Facebook Ads sync");

    // Get campaign insights for last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const since = thirtyDaysAgo.toISOString().split("T")[0];
    const until = today.toISOString().split("T")[0];

    const url = `https://graph.facebook.com/v19.0/act_${adAccountId.replace("act_", "")}/insights?fields=campaign_id,campaign_name,spend,impressions,clicks,actions&level=campaign&time_range={"since":"${since}","until":"${until}"}&time_increment=1&access_token=${accessToken}&limit=500`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Facebook API error: ${err}`);
    }

    const data = await res.json();
    const campaigns = data.data || [];
    let upsertCount = 0;

    for (const c of campaigns) {
      const leads = (c.actions || []).find((a: any) => a.action_type === "lead")?.value || 0;
      const spend = parseFloat(c.spend || "0");
      const leadsNum = parseInt(String(leads), 10);
      const costPerLead = leadsNum > 0 ? spend / leadsNum : null;

      const { error } = await supabase.from("facebook_ad_campaigns").upsert(
        {
          campaign_id: `${c.campaign_id}_${c.date_start}`,
          campaign_name: c.campaign_name,
          date: c.date_start,
          spend,
          impressions: parseInt(c.impressions || "0", 10),
          clicks: parseInt(c.clicks || "0", 10),
          leads: leadsNum,
          cost_per_lead: costPerLead,
          platform: "facebook",
          synced_at: new Date().toISOString(),
        },
        { onConflict: "campaign_id" }
      );

      if (!error) upsertCount++;
    }

    // Log sync
    await supabase.from("crm_activity_events").insert({
      event_type: "status_change" as any,
      entity_type: "ad_sync",
      event_category: "settings_change",
      metadata: {
        description: `Facebook Ads sync completed — ${upsertCount} campaigns updated`,
        platform: "facebook",
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
