import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VOICE-VAULT-WEBHOOK] ${step}${detailsStr}`);
};

/**
 * Pricing reference for payment tracking
 * Core Series: $1,000 total ($100/week × 10 weeks)
 * White Glove: $2,000 total ($100/week × 20 weeks OR $200/week × 10 weeks)
 */
const PACKAGE_PRICES = {
  core_series: 1000,
  white_glove: 2000,
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.text();
    const event = JSON.parse(body) as Stripe.Event;

    logStep("Event type", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;
        
        if (!metadata?.record_id) {
          logStep("No record_id in metadata, skipping");
          break;
        }

        const recordId = metadata.record_id;
        const productType = metadata.product_type;
        const planType = metadata.plan_type;

        logStep("Processing checkout.session.completed", { recordId, productType, planType });

        if (productType === "hourly") {
          // Update hourly booking to paid
          await supabaseClient
            .from("voice_vault_bookings")
            .update({
              payment_status: "paid_in_full",
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("id", recordId);

          logStep("Hourly booking marked as paid", { recordId });

        } else if (productType === "core_series" || productType === "white_glove") {
          const packagePrice = PACKAGE_PRICES[productType as keyof typeof PACKAGE_PRICES];
          
          if (planType === "full" || planType === "one_time") {
            // Full payment - mark as paid_in_full
            await supabaseClient
              .from("voice_vault_packages")
              .update({
                payment_status: "paid_in_full",
                paid_amount: packagePrice,
                balance_remaining: 0,
                content_status: "paid_in_full",
                stripe_customer_id: session.customer as string,
              })
              .eq("id", recordId);

            logStep("Package marked as paid_in_full", { recordId, packagePrice });

          } else {
            // Weekly subscription - mark as active_payment
            await supabaseClient
              .from("voice_vault_packages")
              .update({
                payment_status: "active_payment",
                content_status: "payment_active",
                stripe_subscription_id: session.subscription as string,
                stripe_customer_id: session.customer as string,
                next_payment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              })
              .eq("id", recordId);

            logStep("Package subscription started", { recordId });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Find package by subscription ID
        const { data: packages } = await supabaseClient
          .from("voice_vault_packages")
          .select("*")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (packages) {
          const amountPaid = (invoice.amount_paid || 0) / 100;
          const newPaidAmount = packages.paid_amount + amountPaid;
          const packagePrice = PACKAGE_PRICES[packages.product_type as keyof typeof PACKAGE_PRICES] || packages.package_price;
          const newBalance = packagePrice - newPaidAmount;

          const updateData: Record<string, unknown> = {
            paid_amount: newPaidAmount,
            balance_remaining: Math.max(0, newBalance),
            next_payment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          };

          // Check if fully paid
          if (newBalance <= 0) {
            updateData.payment_status = "paid_in_full";
            updateData.content_status = "paid_in_full";
            updateData.balance_remaining = 0;
            
            // Cancel the subscription since it's paid off
            await stripe.subscriptions.cancel(subscriptionId);
            logStep("Subscription cancelled - fully paid", { subscriptionId });
          }

          await supabaseClient
            .from("voice_vault_packages")
            .update(updateData)
            .eq("id", packages.id);

          logStep("Payment recorded", { 
            recordId: packages.id, 
            amountPaid, 
            newPaidAmount, 
            newBalance,
            packagePrice,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        await supabaseClient
          .from("voice_vault_packages")
          .update({
            payment_status: "paused_payment",
            content_status: "payment_active", // Don't release rights
          })
          .eq("stripe_subscription_id", subscriptionId);

        logStep("Payment failed, status set to paused", { subscriptionId });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the package
        const { data: packageData } = await supabaseClient
          .from("voice_vault_packages")
          .select("*")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (packageData && packageData.payment_status !== "paid_in_full") {
          // If cancelled before fully paid, mark as defaulted
          await supabaseClient
            .from("voice_vault_packages")
            .update({
              payment_status: "defaulted",
            })
            .eq("id", packageData.id);

          logStep("Subscription cancelled before full payment", { recordId: packageData.id });
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
