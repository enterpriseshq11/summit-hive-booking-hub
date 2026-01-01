import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// VIP Dopamine Club price - fetched from app_config table
// Fallback to hardcoded value if config not found
const DEFAULT_VIP_PRICE_ID = "price_1SkqpQPFNT8K72RIwLP5skz4";

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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Must be logged in" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get VIP price from config table
    const { data: configData } = await supabaseClient
      .from("app_config")
      .select("value")
      .eq("key", "VIP_PRICE_ID")
      .single();
    
    const vipPriceId = configData?.value || DEFAULT_VIP_PRICE_ID;
    console.log("Using VIP price ID:", vipPriceId);

    // Check if already VIP
    const { data: vipData } = await supabaseClient
      .from("vip_subscriptions")
      .select("is_active, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (vipData?.is_active) {
      return new Response(JSON.stringify({ error: "Already a VIP member" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get or create Stripe customer
    let customerId = vipData?.stripe_customer_id;
    
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id }
        });
        customerId = customer.id;
      }

      // Save customer ID
      await supabaseClient
        .from("vip_subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          is_active: false
        }, { onConflict: "user_id" });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: vipPriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dopamine-drop?vip=success`,
      cancel_url: `${origin}/dopamine-drop?vip=canceled`,
      metadata: { user_id: user.id }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("VIP checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Checkout failed";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
