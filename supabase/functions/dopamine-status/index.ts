import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIMEZONE = "America/New_York";

function getMonthKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TIMEZONE }).substring(0, 7);
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
    const now = new Date();
    const today = now.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
    const monthKey = getMonthKey(now);

    // Get current draw status
    const { data: drawData } = await supabaseClient
      .from("giveaway_draws")
      .select("id, draw_date, status")
      .eq("month_key", monthKey)
      .single();

    const isDrawLocked = drawData?.status === "locked" || drawData?.status === "drawn" || drawData?.status === "published";

    // Get config
    const { data: configData } = await supabaseClient
      .from("app_config")
      .select("key, value")
      .in("key", ["vip_entry_multiplier", "streak_bonus_days", "streak_bonus_entries", "vip_streak_bonus_entries"]);

    const config = Object.fromEntries(configData?.map(c => [c.key, parseInt(c.value)]) || []);

    // Get wheel config for frontend
    const { data: wheelConfig } = await supabaseClient
      .from("wheel_config")
      .select("segment_index, label, icon, outcome_type, entry_type, entry_quantity, free_weight, vip_weight")
      .eq("is_active", true)
      .order("segment_index");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      // Unauthenticated user - return public info only
      return new Response(JSON.stringify({ 
        is_authenticated: false,
        is_vip: false,
        spins_remaining: 0,
        max_spins: 1,
        is_draw_locked: isDrawLocked,
        draw_date: drawData?.draw_date || null,
        month_key: monthKey,
        wheel_config: wheelConfig || [],
        vip_multiplier: config.vip_entry_multiplier || 2
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ 
        is_authenticated: false,
        is_vip: false,
        spins_remaining: 0,
        max_spins: 1,
        is_draw_locked: isDrawLocked,
        draw_date: drawData?.draw_date || null,
        month_key: monthKey,
        wheel_config: wheelConfig || [],
        vip_multiplier: config.vip_entry_multiplier || 2
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const userId = userData.user.id;

    // Get VIP status
    const { data: vipData } = await supabaseClient
      .from("vip_subscriptions")
      .select("is_active, expires_at, is_comp")
      .eq("user_id", userId)
      .single();

    const isVip = vipData?.is_active && (!vipData.expires_at || new Date(vipData.expires_at) > new Date());
    const isComp = vipData?.is_comp || false;
    const maxSpins = isVip ? 2 : 1;

    // Get today's spin count
    const { data: spinCount } = await supabaseClient
      .from("daily_spin_counts")
      .select("spin_count")
      .eq("user_id", userId)
      .eq("spin_date", today)
      .single();

    const currentSpins = spinCount?.spin_count || 0;
    const spinsRemaining = Math.max(0, maxSpins - currentSpins);

    // Get streak data
    const { data: streakData } = await supabaseClient
      .from("user_streaks")
      .select("current_streak, longest_streak, last_spin_date")
      .eq("user_id", userId)
      .single();

    // Get current month entry totals
    const { data: entryData } = await supabaseClient
      .from("giveaway_entries")
      .select("entry_type, quantity")
      .eq("user_id", userId)
      .eq("month_key", monthKey);

    const entryTotals = {
      general: 0,
      massage: 0,
      pt: 0,
      total: 0
    };

    entryData?.forEach(e => {
      if (e.entry_type === "general") entryTotals.general += e.quantity;
      else if (e.entry_type === "massage") entryTotals.massage += e.quantity;
      else if (e.entry_type === "pt") entryTotals.pt += e.quantity;
    });
    entryTotals.total = entryTotals.general + entryTotals.massage + entryTotals.pt;

    // Get recent spins (last 10)
    const { data: recentSpins } = await supabaseClient
      .from("spins")
      .select("id, segment_index, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get published winners for social proof
    const { data: recentWinners } = await supabaseClient
      .from("giveaway_winners")
      .select("entry_type, winner_name_public, announced_at")
      .not("announced_at", "is", null)
      .order("announced_at", { ascending: false })
      .limit(5);

    return new Response(JSON.stringify({
      is_authenticated: true,
      is_vip: isVip,
      is_comp: isComp,
      spins_remaining: spinsRemaining,
      max_spins: maxSpins,
      spins_used_today: currentSpins,
      
      // Entry totals for this month
      entry_totals: entryTotals,
      month_key: monthKey,
      
      // VIP benefits
      vip_multiplier: config.vip_entry_multiplier || 2,
      
      // Streak info
      streak: {
        current: streakData?.current_streak || 0,
        longest: streakData?.longest_streak || 0,
        last_spin_date: streakData?.last_spin_date || null,
        bonus_days: config.streak_bonus_days || 3,
        bonus_entries: isVip ? (config.vip_streak_bonus_entries || 10) : (config.streak_bonus_entries || 5)
      },
      
      // Draw info
      draw: {
        date: drawData?.draw_date || null,
        status: drawData?.status || "scheduled",
        is_locked: isDrawLocked
      },
      
      // Wheel config for frontend
      wheel_config: wheelConfig || [],
      
      // Recent activity
      recent_spins: recentSpins || [],
      recent_winners: recentWinners || [],
      
      // VIP expiry
      vip_expires_at: vipData?.expires_at
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Status error:", error);
    const errorMessage = error instanceof Error ? error.message : "Status error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});