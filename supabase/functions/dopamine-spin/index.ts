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
    const monthKey = getMonthKey(now);

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

    // Get VIP entry multiplier from config
    const { data: configData } = await supabaseClient
      .from("app_config")
      .select("key, value")
      .in("key", ["vip_entry_multiplier", "streak_bonus_days", "streak_bonus_entries", "vip_streak_bonus_entries"]);

    const config = Object.fromEntries(configData?.map(c => [c.key, parseInt(c.value)]) || []);
    const vipMultiplier = config.vip_entry_multiplier || 2;
    const streakBonusDays = config.streak_bonus_days || 3;
    const streakBonusEntries = config.streak_bonus_entries || 5;
    const vipStreakBonusEntries = config.vip_streak_bonus_entries || 10;

    // Get wheel config (new V2 system)
    const { data: wheelConfig, error: wheelError } = await supabaseClient
      .from("wheel_config")
      .select("*")
      .eq("is_active", true)
      .order("segment_index");

    if (wheelError || !wheelConfig?.length) {
      console.error("Wheel config error:", wheelError);
      throw new Error("Failed to load wheel configuration");
    }

    // Calculate weights and select segment
    const weights = wheelConfig.map(seg => isVip ? seg.vip_weight : seg.free_weight);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const selectedSegment = wheelConfig[selectedIndex];
    const resultToken = generateResultToken();

    // Calculate entries awarded
    let entriesAwarded = 0;
    let entryType: string | null = null;
    const isMiss = selectedSegment.outcome_type === "miss";

    if (!isMiss) {
      entryType = selectedSegment.entry_type;
      entriesAwarded = selectedSegment.entry_quantity;
      
      // Apply VIP multiplier
      if (isVip && entriesAwarded > 0) {
        entriesAwarded = entriesAwarded * vipMultiplier;
      }
    }

    // Record the spin
    const { data: spinData, error: spinError } = await supabaseClient
      .from("spins")
      .insert({
        user_id: userId,
        segment_index: selectedSegment.segment_index,
        prize_id: null, // V2 doesn't use prize_id
        ip_address: ipAddress,
        user_agent: userAgent,
        result_token: resultToken,
        is_vip_locked_hit: false // V2 doesn't have VIP-locked outcomes
      })
      .select()
      .single();

    if (spinError) {
      console.error("Spin insert error:", spinError);
      throw spinError;
    }

    // Update daily spin count
    await supabaseClient
      .from("daily_spin_counts")
      .upsert({
        user_id: userId,
        spin_date: today,
        spin_count: currentSpins + 1
      }, { onConflict: "user_id,spin_date" });

    // Award entries if not a miss
    if (!isMiss && entriesAwarded > 0 && entryType) {
      await supabaseClient
        .from("giveaway_entries")
        .insert({
          user_id: userId,
          month_key: monthKey,
          entry_type: entryType,
          quantity: entriesAwarded,
          source: isVip ? "vip_spin" : "spin",
          spin_id: spinData.id
        });
    }

    // Handle streak tracking
    const { data: streakData } = await supabaseClient
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA", { timeZone: TIMEZONE });

    let newStreak = 1;
    let streakBonusAwarded = 0;

    if (streakData) {
      if (streakData.last_spin_date === yesterdayStr) {
        // Consecutive day - increment streak
        newStreak = (streakData.current_streak || 0) + 1;
        
        // Check for streak bonus
        if (newStreak > 0 && newStreak % streakBonusDays === 0) {
          streakBonusAwarded = isVip ? vipStreakBonusEntries : streakBonusEntries;
          
          await supabaseClient
            .from("giveaway_entries")
            .insert({
              user_id: userId,
              month_key: monthKey,
              entry_type: "general",
              quantity: streakBonusAwarded,
              source: "streak",
              spin_id: spinData.id
            });
        }
      } else if (streakData.last_spin_date === today) {
        // Already spun today - keep current streak
        newStreak = streakData.current_streak || 1;
      }
      // Else: streak broken, newStreak stays at 1
    }

    await supabaseClient
      .from("user_streaks")
      .upsert({
        user_id: userId,
        current_streak: newStreak,
        last_spin_date: today,
        longest_streak: Math.max(newStreak, streakData?.longest_streak || 0),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    // Get current month entry totals
    const { data: entryTotals } = await supabaseClient
      .from("giveaway_entries")
      .select("entry_type, quantity")
      .eq("user_id", userId)
      .eq("month_key", monthKey);

    const totals = {
      general: 0,
      massage: 0,
      pt: 0
    };

    entryTotals?.forEach(e => {
      if (e.entry_type === "general") totals.general += e.quantity;
      else if (e.entry_type === "massage") totals.massage += e.quantity;
      else if (e.entry_type === "pt") totals.pt += e.quantity;
    });

    console.log("Spin result:", {
      userId,
      segment: selectedSegment.segment_index,
      outcome: selectedSegment.outcome_type,
      entriesAwarded,
      entryType,
      streak: newStreak,
      streakBonus: streakBonusAwarded
    });

    return new Response(JSON.stringify({
      success: true,
      spin_id: spinData.id,
      segment_index: selectedSegment.segment_index,
      outcome_type: selectedSegment.outcome_type,
      label: selectedSegment.label,
      icon: selectedSegment.icon,
      entries_awarded: entriesAwarded,
      entry_type: entryType,
      is_miss: isMiss,
      result_token: resultToken,
      spins_remaining: maxSpins - currentSpins - 1,
      is_vip: isVip,
      vip_multiplier: isVip ? vipMultiplier : 1,
      streak: newStreak,
      streak_bonus_awarded: streakBonusAwarded,
      entry_totals: totals,
      month_key: monthKey
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
