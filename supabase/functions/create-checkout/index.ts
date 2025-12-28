import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

interface CheckoutRequest {
  booking_id?: string;
  membership_tier_id?: string;
  price_amount: number;
  description: string;
  is_deposit?: boolean;
  metadata?: Record<string, string>;
  success_url?: string;
  cancel_url?: string;
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    let userId: string | undefined;
    let userEmail: string | undefined;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      userId = userData.user?.id;
      userEmail = userData.user?.email;
      logStep("User authenticated", { userId, email: userEmail });
    }

    const body: CheckoutRequest = await req.json();
    const {
      booking_id,
      membership_tier_id,
      price_amount,
      description,
      is_deposit = false,
      metadata = {},
      success_url,
      cancel_url,
    } = body;

    logStep("Request body", body);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if Stripe customer exists
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      }
    }

    // Determine if this is a subscription or one-time payment
    const mode = membership_tier_id ? "subscription" : "payment";

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (membership_tier_id) {
      // For membership, we'd need to map tier to Stripe price ID
      // For now, create a one-time price
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: description,
            metadata: { membership_tier_id },
          },
          unit_amount: Math.round(price_amount * 100),
          recurring: { interval: "month" },
        },
        quantity: 1,
      });
    } else {
      // One-time payment for booking
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: description,
            metadata: { booking_id: booking_id || "", is_deposit: String(is_deposit) },
          },
          unit_amount: Math.round(price_amount * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      success_url: success_url || `${origin}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${origin}/booking?cancelled=true`,
      metadata: {
        ...metadata,
        booking_id: booking_id || "",
        membership_tier_id: membership_tier_id || "",
        is_deposit: String(is_deposit),
        user_id: userId || "",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Create pending payment record
    if (booking_id) {
      await supabaseClient.from("payments").insert({
        booking_id,
        customer_id: userId,
        amount: price_amount,
        payment_type: is_deposit ? "deposit" : "full",
        status: "pending",
        stripe_payment_intent_id: session.payment_intent as string,
        metadata: { checkout_session_id: session.id },
      });
      logStep("Payment record created");
    }

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
