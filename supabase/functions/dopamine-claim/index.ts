import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateClaimCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DOPA-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
      return new Response(JSON.stringify({ error: "Must be logged in" }), {
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
    const body = await req.json();
    const { spin_id, interested_in, consent } = body;

    if (!spin_id) {
      return new Response(JSON.stringify({ error: "Missing spin_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verify spin belongs to user and hasn't been claimed
    const { data: spin, error: spinError } = await supabaseClient
      .from("spins")
      .select(`
        id,
        user_id,
        prize_id,
        is_vip_locked_hit,
        prizes (
          id,
          name,
          instructions,
          expiry_days,
          booking_url,
          requires_manual_approval
        )
      `)
      .eq("id", spin_id)
      .single();

    if (spinError || !spin) {
      return new Response(JSON.stringify({ error: "Spin not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (spin.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    if (spin.is_vip_locked_hit) {
      return new Response(JSON.stringify({ error: "Cannot claim VIP-locked prize" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if already claimed
    const { data: existingClaim } = await supabaseClient
      .from("claims")
      .select("id")
      .eq("spin_id", spin_id)
      .single();

    if (existingClaim) {
      return new Response(JSON.stringify({ error: "Prize already claimed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 409,
      });
    }

    const prize = spin.prizes as any;
    const claimCode = generateClaimCode();
    const expiryDays = prize?.expiry_days || 30;
    const redemptionDeadline = new Date();
    redemptionDeadline.setDate(redemptionDeadline.getDate() + expiryDays);

    // Create claim
    const { data: claim, error: claimError } = await supabaseClient
      .from("claims")
      .insert({
        spin_id,
        user_id: userId,
        claim_code: claimCode,
        status: prize?.requires_manual_approval ? "pending" : "verified",
        redemption_deadline: expiryDays ? redemptionDeadline.toISOString() : null,
        interested_in,
        consent_timestamp: consent ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (claimError) throw claimError;

    return new Response(JSON.stringify({
      success: true,
      claim_id: claim.id,
      claim_code: claimCode,
      prize_name: prize?.name,
      instructions: prize?.instructions,
      redemption_deadline: redemptionDeadline.toISOString(),
      booking_url: prize?.booking_url,
      status: claim.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Claim error:", error);
    const errorMessage = error instanceof Error ? error.message : "Claim failed";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
