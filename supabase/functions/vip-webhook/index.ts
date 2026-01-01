import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * VIP Status Rules (Stripe-native):
 * - ACTIVE: subscription.status = "active" OR "trialing"
 * - ACTIVE (grace): subscription.status = "past_due" AND current_period_end > now
 * - INACTIVE: subscription.status = "canceled" OR "unpaid" OR "incomplete_expired"
 * - INACTIVE: subscription.status = "past_due" AND current_period_end < now
 */

function isSubscriptionActive(subscription: Stripe.Subscription): boolean {
  const status = subscription.status;
  const periodEnd = new Date(subscription.current_period_end * 1000);
  const now = new Date();
  
  // Explicitly active statuses
  if (status === "active" || status === "trialing") {
    return true;
  }
  
  // Grace period: past_due but still within billing period
  if (status === "past_due" && periodEnd > now) {
    return true;
  }
  
  // All other statuses are inactive
  return false;
}

async function findUserByCustomerId(supabase: any, customerId: string) {
  const { data } = await supabase
    .from("vip_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.user_id;
}

async function findUserBySessionMetadata(supabase: any, session: Stripe.Checkout.Session) {
  // Try metadata first
  if (session.metadata?.user_id) {
    return session.metadata.user_id;
  }
  // Fall back to customer ID lookup
  if (session.customer) {
    return await findUserByCustomerId(supabase, session.customer as string);
  }
  return null;
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
      // Allow unsigned events for testing, but log warning
      console.warn("Processing unsigned webhook event - ensure STRIPE_VIP_WEBHOOK_SECRET is set in production");
      event = JSON.parse(body);
    }

    console.log("[VIP-WEBHOOK] Event received:", event.type);

    switch (event.type) {
      // ============================================
      // CHECKOUT SESSION COMPLETED
      // ============================================
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode !== "subscription") {
          console.log("[VIP-WEBHOOK] Ignoring non-subscription checkout");
          break;
        }

        const userId = await findUserBySessionMetadata(supabaseClient, session);
        if (!userId) {
          console.error("[VIP-WEBHOOK] Could not find user for checkout session:", session.id);
          break;
        }

        // Fetch the subscription to get accurate status
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const isActive = isSubscriptionActive(subscription);
          const expiresAt = new Date(subscription.current_period_end * 1000);

          await supabaseClient
            .from("vip_subscriptions")
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              is_active: isActive,
              expires_at: expiresAt.toISOString()
            }, { onConflict: "user_id" });

          console.log(`[VIP-WEBHOOK] Checkout completed - user ${userId} VIP active=${isActive}`);
        }
        break;
      }

      // ============================================
      // SUBSCRIPTION CREATED / UPDATED
      // ============================================
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const userId = await findUserByCustomerId(supabaseClient, customerId);
        if (!userId) {
          console.warn(`[VIP-WEBHOOK] No user found for customer ${customerId}`);
          break;
        }

        const isActive = isSubscriptionActive(subscription);
        const expiresAt = new Date(subscription.current_period_end * 1000);

        await supabaseClient
          .from("vip_subscriptions")
          .update({
            is_active: isActive,
            expires_at: expiresAt.toISOString(),
            stripe_subscription_id: subscription.id
          })
          .eq("user_id", userId);

        console.log(`[VIP-WEBHOOK] Subscription ${event.type} - user ${userId}: status=${subscription.status}, active=${isActive}`);
        break;
      }

      // ============================================
      // SUBSCRIPTION DELETED (Canceled)
      // ============================================
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userId = await findUserByCustomerId(supabaseClient, customerId);
        if (!userId) {
          console.warn(`[VIP-WEBHOOK] No user found for customer ${customerId}`);
          break;
        }

        // Subscription deleted = definitively inactive
        // Keep expires_at for historical record
        await supabaseClient
          .from("vip_subscriptions")
          .update({
            is_active: false,
            stripe_subscription_id: null
          })
          .eq("user_id", userId);

        console.log(`[VIP-WEBHOOK] Subscription deleted - user ${userId} VIP deactivated`);
        break;
      }

      // ============================================
      // INVOICE PAYMENT SUCCEEDED
      // ============================================
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          console.log("[VIP-WEBHOOK] Invoice not tied to subscription, skipping");
          break;
        }

        const userId = await findUserByCustomerId(supabaseClient, customerId);
        if (!userId) {
          console.warn(`[VIP-WEBHOOK] No user found for customer ${customerId}`);
          break;
        }

        // Payment succeeded = reactivate VIP if it was past_due
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const isActive = isSubscriptionActive(subscription);
        const expiresAt = new Date(subscription.current_period_end * 1000);

        await supabaseClient
          .from("vip_subscriptions")
          .update({
            is_active: isActive,
            expires_at: expiresAt.toISOString()
          })
          .eq("user_id", userId);

        console.log(`[VIP-WEBHOOK] Payment succeeded - user ${userId} VIP active=${isActive}`);
        break;
      }

      // ============================================
      // INVOICE PAYMENT FAILED
      // ============================================
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          console.log("[VIP-WEBHOOK] Invoice not tied to subscription, skipping");
          break;
        }

        const userId = await findUserByCustomerId(supabaseClient, customerId);
        if (!userId) {
          console.warn(`[VIP-WEBHOOK] No user found for customer ${customerId}`);
          break;
        }

        // Re-fetch subscription to get current status (Stripe may have updated it)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const isActive = isSubscriptionActive(subscription);

        // Update based on Stripe's actual subscription status
        // If status is "unpaid" or "canceled", Stripe has already made the decision
        await supabaseClient
          .from("vip_subscriptions")
          .update({
            is_active: isActive
          })
          .eq("user_id", userId);

        console.log(`[VIP-WEBHOOK] Payment failed - user ${userId}: subscription.status=${subscription.status}, VIP active=${isActive}`);
        break;
      }

      default:
        console.log(`[VIP-WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[VIP-WEBHOOK] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Webhook error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
