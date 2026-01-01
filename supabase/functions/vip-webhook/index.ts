import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const webhookSecret = Deno.env.get("STRIPE_VIP_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("Stripe not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log("VIP Webhook event:", event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID
        const { data: vipRecord } = await supabaseClient
          .from("vip_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (vipRecord) {
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          const expiresAt = new Date(subscription.current_period_end * 1000);

          await supabaseClient
            .from("vip_subscriptions")
            .update({
              is_active: isActive,
              expires_at: expiresAt.toISOString(),
              stripe_subscription_id: subscription.id
            })
            .eq("user_id", vipRecord.user_id);

          console.log(`VIP status updated for user ${vipRecord.user_id}: active=${isActive}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: vipRecord } = await supabaseClient
          .from("vip_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (vipRecord) {
          await supabaseClient
            .from("vip_subscriptions")
            .update({
              is_active: false,
              stripe_subscription_id: null
            })
            .eq("user_id", vipRecord.user_id);

          console.log(`VIP subscription canceled for user ${vipRecord.user_id}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const attemptCount = invoice.attempt_count || 1;

        console.log(`Payment failed for customer ${customerId}, attempt ${attemptCount}`);

        // After 3 failed attempts, mark VIP as inactive but preserve expires_at
        // This allows grace period based on original expiration
        if (attemptCount >= 3) {
          const { data: vipRecord } = await supabaseClient
            .from("vip_subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (vipRecord) {
            await supabaseClient
              .from("vip_subscriptions")
              .update({ is_active: false })
              .eq("user_id", vipRecord.user_id);

            console.log(`VIP deactivated due to payment failure for user ${vipRecord.user_id}`);
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("VIP webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Webhook error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
