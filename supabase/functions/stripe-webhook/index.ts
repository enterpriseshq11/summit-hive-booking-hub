import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // For testing without webhook secret verification
    let event: Stripe.Event;
    try {
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } else {
        event = JSON.parse(body);
      }
    } catch (err) {
      logStep("Webhook signature verification failed", { error: String(err) });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Idempotency check
    const { data: existingEvent } = await supabase
      .from("audit_log")
      .select("id")
      .eq("entity_id", event.id)
      .eq("entity_type", "stripe_event")
      .maybeSingle();

    if (existingEvent) {
      logStep("Event already processed", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: corsHeaders,
        status: 200,
      });
    }

    // Process event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const bookingId = metadata.booking_id;
        const membershipTierId = metadata.membership_tier_id;
        const userId = metadata.user_id;
        const isDeposit = metadata.is_deposit === "true";

        const businessType = metadata.business_type;
        logStep("Checkout completed", { bookingId, membershipTierId, isDeposit, businessType });

        if (bookingId) {
          // Update payment status
          await supabase
            .from("payments")
            .update({
              status: "completed",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("booking_id", bookingId)
            .eq("status", "pending");

          // Update booking status
          const newStatus = isDeposit ? "deposit_paid" : "confirmed";
          await supabase
            .from("bookings")
            .update({ 
              status: newStatus,
              deposit_amount: isDeposit ? (session.amount_total || 0) / 100 : undefined,
            })
            .eq("id", bookingId);

          // Update balance due if deposit paid
          if (isDeposit) {
            const { data: booking } = await supabase
              .from("bookings")
              .select("total_amount, balance_due_date")
              .eq("id", bookingId)
              .single();

            if (booking) {
              await supabase
                .from("bookings")
                .update({
                  balance_due: booking.total_amount - (session.amount_total || 0) / 100,
                })
                .eq("id", bookingId);
            }
          }

          logStep("Booking updated", { bookingId, newStatus });

          // Send notification for spa/Lindsey bookings
          if (businessType === "spa") {
            try {
              const notificationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/lindsey-booking-notification`;
              const notificationResponse = await fetch(notificationUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify({
                  booking_id: bookingId,
                  type: "confirmed",
                  stripe_session_id: session.id,
                  stripe_payment_intent: session.payment_intent as string,
                }),
              });
              
              if (notificationResponse.ok) {
                logStep("Lindsey notification sent", { bookingId });
              } else {
                const errText = await notificationResponse.text();
                logStep("Lindsey notification failed", { status: notificationResponse.status, error: errText });
              }
            } catch (notifError) {
              logStep("Lindsey notification error", { error: String(notifError) });
            }
          }

          // Send staff notification for 360 Photo Booth bookings (Victoria)
          if (businessType === "photo_booth") {
            try {
              const notificationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/staff-booking-notification`;
              const notificationResponse = await fetch(notificationUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify({
                  booking_id: bookingId,
                  type: "confirmed",
                  business_type: "photo_booth",
                  booking_status: newStatus,
                  stripe_session_id: session.id,
                  stripe_payment_intent: session.payment_intent as string,
                }),
              });

              if (notificationResponse.ok) {
                logStep("Victoria notification sent", { bookingId });
              } else {
                const errText = await notificationResponse.text();
                logStep("Victoria notification failed", { status: notificationResponse.status, error: errText });
              }
            } catch (notifError) {
              logStep("Victoria notification error", { error: String(notifError) });
            }
          }
        }

        if (membershipTierId && userId) {
          // Create or update membership
          await supabase.from("memberships").upsert({
            user_id: userId,
            tier_id: membershipTierId,
            status: "active",
            stripe_subscription_id: session.subscription as string,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            billing_cycle: "monthly",
          }, { onConflict: "user_id,tier_id" });

          logStep("Membership created/updated", { userId, membershipTierId });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Update membership period
          await supabase
            .from("memberships")
            .update({
              current_period_start: new Date((invoice.period_start || 0) * 1000).toISOString(),
              current_period_end: new Date((invoice.period_end || 0) * 1000).toISOString(),
              status: "active",
            })
            .eq("stripe_subscription_id", subscriptionId);

          logStep("Membership renewed", { subscriptionId });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Mark membership as past due
          await supabase
            .from("memberships")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);

          logStep("Membership payment failed", { subscriptionId });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("memberships")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        logStep("Subscription cancelled", { subscriptionId: subscription.id });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = charge.payment_intent as string;

        await supabase
          .from("payments")
          .update({
            status: "refunded",
            refund_amount: (charge.amount_refunded || 0) / 100,
          })
          .eq("stripe_payment_intent_id", paymentIntent);

        logStep("Payment refunded", { paymentIntent });
        break;
      }
    }

    // Log event for idempotency
    await supabase.from("audit_log").insert([{
      entity_type: "stripe_event",
      entity_id: event.id,
      action_type: event.type,
      after_json: { event_type: event.type, processed_at: new Date().toISOString() } as any,
    }]);

    return new Response(JSON.stringify({ received: true }), {
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
