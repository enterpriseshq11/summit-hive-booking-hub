import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIMEZONE = "America/New_York";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        is_authenticated: false,
        is_vip: false,
        spins_remaining: 0
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
        spins_remaining: 0
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
    const today = new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
    const { data: spinCount } = await supabaseClient
      .from("daily_spin_counts")
      .select("spin_count")
      .eq("user_id", userId)
      .eq("spin_date", today)
      .single();

    const currentSpins = spinCount?.spin_count || 0;
    const spinsRemaining = Math.max(0, maxSpins - currentSpins);

    // Get ticket counts
    const { data: standardTickets } = await supabaseClient
      .from("giveaway_tickets")
      .select("multiplier")
      .eq("user_id", userId)
      .eq("pool", "standard");

    const { data: vipTickets } = await supabaseClient
      .from("giveaway_tickets")
      .select("multiplier")
      .eq("user_id", userId)
      .eq("pool", "vip");

    const standardCount = standardTickets?.reduce((sum, t) => sum + (t.multiplier || 1), 0) || 0;
    const vipCount = vipTickets?.reduce((sum, t) => sum + (t.multiplier || 1), 0) || 0;

    // Get recent spins
    const { data: recentSpins } = await supabaseClient
      .from("spins")
      .select(`
        id,
        segment_index,
        is_vip_locked_hit,
        created_at,
        prizes (name)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get claims
    const { data: claims } = await supabaseClient
      .from("claims")
      .select(`
        id,
        claim_code,
        status,
        redemption_deadline,
        created_at,
        spins (
          prizes (name)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return new Response(JSON.stringify({
      is_authenticated: true,
      is_vip: isVip,
      is_comp: isComp,
      spins_remaining: spinsRemaining,
      max_spins: maxSpins,
      spins_used_today: currentSpins,
      tickets: {
        standard: standardCount,
        vip: vipCount,
        total: standardCount + vipCount
      },
      recent_spins: recentSpins || [],
      claims: claims || [],
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
