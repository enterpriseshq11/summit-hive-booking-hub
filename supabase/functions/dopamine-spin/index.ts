import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIMEZONE = "America/New_York";

function generateResultToken(): string {
  return crypto.randomUUID().replace(/-/g, "").substring(0, 16).toUpperCase();
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Must be logged in to spin" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = userData.user.id;
    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // Check VIP status
    const { data: vipData } = await supabaseClient
      .from("vip_subscriptions")
      .select("is_active, expires_at")
      .eq("user_id", userId)
      .single();

    const isVip = vipData?.is_active && (!vipData.expires_at || new Date(vipData.expires_at) > new Date());
    const maxSpins = isVip ? 2 : 1;

    // Get today's date in ET timezone
    const now = new Date();
    const today = now.toLocaleDateString("en-CA", { timeZone: TIMEZONE });

    // Check daily spin count
    const { data: spinCount } = await supabaseClient
      .from("daily_spin_counts")
      .select("spin_count")
      .eq("user_id", userId)
      .eq("spin_date", today)
      .single();

    const currentSpins = spinCount?.spin_count || 0;
    if (currentSpins >= maxSpins) {
      return new Response(JSON.stringify({ 
        error: "Daily spin limit reached",
        spins_remaining: 0,
        is_vip: isVip,
        reset_time: "midnight ET"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Get wheel segments with prizes
    const { data: segments, error: segmentsError } = await supabaseClient
      .from("wheel_segments")
      .select(`
        segment_index,
        prize_id,
        prizes (
          id,
          name,
          access_level,
          free_weight,
          vip_weight,
          daily_cap,
          weekly_cap,
          active
        )
      `)
      .order("segment_index");

    if (segmentsError || !segments?.length) {
      throw new Error("Failed to load wheel configuration");
    }

    // Get prize cap tracking for today
    const weekStart = getWeekStart(now);
    const { data: capData } = await supabaseClient
      .from("prize_cap_tracking")
      .select("prize_id, daily_count, weekly_count")
      .eq("tracking_date", today);

    const capMap = new Map(capData?.map(c => [c.prize_id, c]) || []);

    // Build eligible prizes with weights
    const eligibleSegments: { segment_index: number; prize_id: string; weight: number; prize: any }[] = [];

    for (const seg of segments) {
      const prize = seg.prizes as any;
      if (!prize || !prize.active) continue;

      // VIP-only prizes are not eligible for free users
      if (prize.access_level === "vip" && !isVip) {
        // Still add to segments but with 0 weight (for locked hit detection)
        eligibleSegments.push({
          segment_index: seg.segment_index,
          prize_id: prize.id,
          weight: 0,
          prize
        });
        continue;
      }

      // Check caps
      const caps = capMap.get(prize.id);
      const dailyCount = caps?.daily_count || 0;
      const weeklyCount = caps?.weekly_count || 0;

      if (prize.daily_cap && dailyCount >= prize.daily_cap) continue;
      if (prize.weekly_cap && weeklyCount >= prize.weekly_cap) continue;

      const weight = isVip ? prize.vip_weight : prize.free_weight;
      if (weight > 0) {
        eligibleSegments.push({
          segment_index: seg.segment_index,
          prize_id: prize.id,
          weight,
          prize
        });
      }
    }

    if (eligibleSegments.filter(s => s.weight > 0).length === 0) {
      return new Response(JSON.stringify({ error: "No prizes available. Try again later." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      });
    }

    // Weighted random selection
    const totalWeight = eligibleSegments.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedSegment = eligibleSegments.find(s => s.weight > 0)!;

    for (const seg of eligibleSegments) {
      if (seg.weight <= 0) continue;
      random -= seg.weight;
      if (random <= 0) {
        selectedSegment = seg;
        break;
      }
    }

    const resultToken = generateResultToken();
    const isVipLockedHit = selectedSegment.prize.access_level === "vip" && !isVip;

    // Record the spin
    const { data: spinData, error: spinError } = await supabaseClient
      .from("spins")
      .insert({
        user_id: userId,
        segment_index: selectedSegment.segment_index,
        prize_id: selectedSegment.prize_id,
        ip_address: ipAddress,
        user_agent: userAgent,
        result_token: resultToken,
        is_vip_locked_hit: isVipLockedHit
      })
      .select()
      .single();

    if (spinError) throw spinError;

    // Update daily spin count
    await supabaseClient
      .from("daily_spin_counts")
      .upsert({
        user_id: userId,
        spin_date: today,
        spin_count: currentSpins + 1
      }, { onConflict: "user_id,spin_date" });

    // Update prize cap tracking (only if not a locked hit)
    if (!isVipLockedHit) {
      await supabaseClient
        .from("prize_cap_tracking")
        .upsert({
          prize_id: selectedSegment.prize_id,
          tracking_date: today,
          daily_count: (capMap.get(selectedSegment.prize_id)?.daily_count || 0) + 1,
          weekly_count: (capMap.get(selectedSegment.prize_id)?.weekly_count || 0) + 1,
          week_start: weekStart
        }, { onConflict: "prize_id,tracking_date" });

      // If prize is giveaway entry, create ticket
      if (selectedSegment.prize.name.toLowerCase().includes("giveaway")) {
        const multiplier = selectedSegment.prize.name.toLowerCase().includes("mega") ? 10 : 1;
        const pool = selectedSegment.prize.access_level === "vip" ? "vip" : "standard";
        
        await supabaseClient
          .from("giveaway_tickets")
          .insert({
            user_id: userId,
            pool,
            multiplier,
            source: "spin",
            spin_id: spinData.id
          });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      spin_id: spinData.id,
      segment_index: selectedSegment.segment_index,
      prize_id: selectedSegment.prize_id,
      prize_name: selectedSegment.prize.name,
      is_vip_locked_hit: isVipLockedHit,
      result_token: resultToken,
      spins_remaining: maxSpins - currentSpins - 1,
      is_vip: isVip
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Spin error:", error);
    const errorMessage = error instanceof Error ? error.message : "Spin failed";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
