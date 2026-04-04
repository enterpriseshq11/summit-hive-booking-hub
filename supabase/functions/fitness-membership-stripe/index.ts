import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { name, email, monthly_amount, membership_type, business_unit } = body;
      const unit = business_unit || "fitness";

      // Create or find customer
      const customers = await stripe.customers.list({ email, limit: 1 });
      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ name, email });
        customerId = customer.id;
      }

      // Create price
      const price = await stripe.prices.create({
        unit_amount: Math.round(monthly_amount * 100),
        currency: "usd",
        recurring: { interval: "month" },
        product_data: { name: membership_type || "Monthly Membership" },
        metadata: { business_unit: unit },
      });

      // Create subscription with metadata for business unit mapping
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        metadata: { business_unit: unit, membership_type: membership_type || "standard" },
      });

      const nextBilling = new Date(subscription.current_period_end * 1000)
        .toISOString()
        .split("T")[0];

      return new Response(
        JSON.stringify({
          customer_id: customerId,
          subscription_id: subscription.id,
          next_billing_date: nextBilling,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "pause") {
      const { subscription_id } = body;
      await stripe.subscriptions.update(subscription_id, {
        pause_collection: { behavior: "void" },
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "resume") {
      const { subscription_id } = body;
      await stripe.subscriptions.update(subscription_id, {
        pause_collection: "",
      } as any);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cancel") {
      const { subscription_id } = body;
      await stripe.subscriptions.cancel(subscription_id);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[FITNESS-MEMBERSHIP-STRIPE]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
