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
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Helper to log webhook events to DB for debugging
  const logWebhookEvent = async (
    eventType: string,
    stripeEventId: string | null,
    recordId: string | null,
    recordType: string | null,
    payload: unknown,
    result: "success" | "error",
    resultDetails: string
  ) => {
    try {
      // Direct insert via REST API to avoid type checking issues with new table
      await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/voice_vault_webhook_events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '',
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          event_type: eventType,
          stripe_event_id: stripeEventId,
          record_id: recordId,
          record_type: recordType,
          payload: payload,
          result: result,
          result_details: resultDetails,
        }),
      });
      
      logStep("Webhook event logged to DB", { eventType, result, resultDetails });
    } catch (err) {
      logStep("Failed to log webhook event to DB", { error: String(err) });
    }
  };

  // Helper to create revenue event for Voice Vault transactions
  const createRevenueEvent = async (
    amount: number,
    description: string,
    recordId: string
  ) => {
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/crm_revenue_events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '',
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          business_unit: 'voice_vault',
          amount: amount,
          description: description,
          revenue_date: new Date().toISOString().split('T')[0],
          recorded_by: '00000000-0000-0000-0000-000000000000', // System user placeholder
        }),
      });
      
      logStep("Revenue event created", { amount, description, recordId });
    } catch (err) {
      logStep("Failed to create revenue event", { error: String(err) });
    }
  };

  let eventType = "unknown";
  let stripeEventId: string | null = null;
  let recordId: string | null = null;
  let recordType: string | null = null;

  try {
    logStep("==========================================");
    logStep("WEBHOOK RECEIVED - Starting processing");
    logStep("==========================================");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.text();
    const event = JSON.parse(body) as Stripe.Event;

    eventType = event.type;
    stripeEventId = event.id;

    logStep("Event Details", { 
      type: eventType, 
      id: stripeEventId,
      livemode: event.livemode 
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;
        
        logStep("checkout.session.completed - Session", {
          sessionId: session.id,
          metadata: metadata,
          paymentStatus: session.payment_status,
          mode: session.mode,
        });

        if (!metadata?.record_id) {
          logStep("No record_id in metadata, skipping");
          await logWebhookEvent(eventType, stripeEventId, null, null, metadata, "success", "No record_id - skipped");
          break;
        }

        recordId = metadata.record_id;
        const productType = metadata.product_type;
        const planType = metadata.plan_type;
        recordType = productType === "hourly" ? "booking" : "package";

        logStep("Processing checkout", { recordId, productType, planType, recordType });

        if (productType === "hourly") {
          const { error } = await supabaseClient
            .from("voice_vault_bookings")
            .update({
              payment_status: "paid_in_full",
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("id", recordId);

          if (error) {
            logStep("ERROR updating booking", { error: error.message });
            await logWebhookEvent(eventType, stripeEventId, recordId, recordType, metadata, "error", error.message);
            throw error;
          }

          logStep("SUCCESS - Hourly booking marked as paid_in_full", { recordId });
          
          // Create revenue event for hourly booking
          const bookingAmount = (session.amount_total || 0) / 100;
          await createRevenueEvent(
            bookingAmount,
            `Voice Vault Hourly Booking`,
            recordId || 'unknown'
          );
          
          await logWebhookEvent(eventType, stripeEventId, recordId, recordType, metadata, "success", "Booking updated to paid_in_full");

        } else if (productType === "core_series" || productType === "white_glove") {
          const packagePrice = PACKAGE_PRICES[productType as keyof typeof PACKAGE_PRICES];
          
          if (planType === "full" || planType === "one_time") {
            const { error } = await supabaseClient
              .from("voice_vault_packages")
              .update({
                payment_status: "paid_in_full",
                paid_amount: packagePrice,
                balance_remaining: 0,
                content_status: "paid_in_full",
                stripe_customer_id: session.customer as string,
              })
              .eq("id", recordId);

            if (error) {
              logStep("ERROR updating package (full payment)", { error: error.message });
              await logWebhookEvent(eventType, stripeEventId, recordId, recordType, metadata, "error", error.message);
              throw error;
            }

            logStep("SUCCESS - Package marked as paid_in_full", { recordId, packagePrice });
            
            // Create revenue event for package full payment
            await createRevenueEvent(
              packagePrice,
              `Voice Vault ${productType === 'core_series' ? 'Core Series' : 'White Glove'} Package (Full)`,
              recordId || 'unknown'
            );
            
            await logWebhookEvent(eventType, stripeEventId, recordId, recordType, {
              ...metadata,
              newPaymentStatus: "paid_in_full",
              newContentStatus: "paid_in_full",
              paidAmount: packagePrice,
            }, "success", "Package updated to paid_in_full");

          } else {
            // Weekly subscription - mark as active_payment
            const nextPaymentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
            
            const { error } = await supabaseClient
              .from("voice_vault_packages")
              .update({
                payment_status: "active_payment",
                content_status: "payment_active",
                stripe_subscription_id: session.subscription as string,
                stripe_customer_id: session.customer as string,
                next_payment_date: nextPaymentDate,
              })
              .eq("id", recordId);

            if (error) {
              logStep("ERROR updating package (subscription)", { error: error.message });
              await logWebhookEvent(eventType, stripeEventId, recordId, recordType, metadata, "error", error.message);
              throw error;
            }

            logStep("SUCCESS - Package subscription started", { 
              recordId, 
              subscriptionId: session.subscription,
              nextPaymentDate 
            });
            await logWebhookEvent(eventType, stripeEventId, recordId, recordType, {
              ...metadata,
              newPaymentStatus: "active_payment",
              newContentStatus: "payment_active",
              subscriptionId: session.subscription,
              nextPaymentDate,
            }, "success", "Package subscription started - active_payment");
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        logStep("invoice.payment_succeeded - Invoice", {
          invoiceId: invoice.id,
          subscriptionId: subscriptionId,
          amountPaid: invoice.amount_paid,
          billingReason: invoice.billing_reason,
        });

        if (!subscriptionId) {
          logStep("No subscription ID, skipping");
          await logWebhookEvent(eventType, stripeEventId, null, null, { invoiceId: invoice.id }, "success", "No subscription ID - skipped");
          break;
        }

        // Find package by subscription ID
        const { data: packages, error: fetchError } = await supabaseClient
          .from("voice_vault_packages")
          .select("*")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (fetchError || !packages) {
          logStep("Package not found for subscription", { subscriptionId, error: fetchError?.message });
          await logWebhookEvent(eventType, stripeEventId, null, "package", { subscriptionId }, "error", `Package not found: ${fetchError?.message || "no data"}`);
          break;
        }

        recordId = packages.id;
        recordType = "package";

        const amountPaid = (invoice.amount_paid || 0) / 100;
        const newPaidAmount = packages.paid_amount + amountPaid;
        const packagePrice = PACKAGE_PRICES[packages.product_type as keyof typeof PACKAGE_PRICES] || packages.package_price;
        const newBalance = packagePrice - newPaidAmount;

        logStep("Payment calculation", {
          previousPaidAmount: packages.paid_amount,
          thisPayment: amountPaid,
          newPaidAmount,
          packagePrice,
          newBalance,
        });

        const updateData: Record<string, unknown> = {
          paid_amount: newPaidAmount,
          balance_remaining: Math.max(0, newBalance),
          next_payment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        };

        let resultDetails = `Payment recorded: $${amountPaid}, total paid: $${newPaidAmount}, balance: $${Math.max(0, newBalance)}`;

        // Check if fully paid
        if (newBalance <= 0) {
          updateData.payment_status = "paid_in_full";
          updateData.content_status = "paid_in_full";
          updateData.balance_remaining = 0;
          
          logStep("Package fully paid - cancelling subscription", { subscriptionId });
          
          // Cancel the subscription since it's paid off
          await stripe.subscriptions.cancel(subscriptionId);
          logStep("Subscription cancelled successfully");
          
          resultDetails = `FULLY PAID - Payment: $${amountPaid}, total: $${newPaidAmount}. Subscription cancelled.`;
        }

        const { error: updateError } = await supabaseClient
          .from("voice_vault_packages")
          .update(updateData)
          .eq("id", packages.id);

        if (updateError) {
          logStep("ERROR updating package payment", { error: updateError.message });
          await logWebhookEvent(eventType, stripeEventId, recordId, recordType, updateData, "error", updateError.message);
          throw updateError;
        }

        logStep("SUCCESS - Payment recorded", { 
          recordId: packages.id, 
          amountPaid, 
          newPaidAmount, 
          newBalance,
          packagePrice,
          isFullyPaid: newBalance <= 0,
        });
        
        await logWebhookEvent(eventType, stripeEventId, recordId, recordType, {
          amountPaid,
          newPaidAmount,
          newBalance,
          updateData,
        }, "success", resultDetails);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const attemptCount = invoice.attempt_count || 1;

        logStep("invoice.payment_failed - Invoice", {
          invoiceId: invoice.id,
          subscriptionId: subscriptionId,
          attemptCount: attemptCount,
        });

        if (!subscriptionId) {
          await logWebhookEvent(eventType, stripeEventId, null, null, { invoiceId: invoice.id }, "success", "No subscription ID - skipped");
          break;
        }

        // Find the package
        const { data: failedPkg, error: fetchFailedError } = await supabaseClient
          .from("voice_vault_packages")
          .select("id, payment_status, paid_amount, balance_remaining")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (fetchFailedError || !failedPkg) {
          logStep("Package not found for failed payment", { subscriptionId });
          await logWebhookEvent(eventType, stripeEventId, null, "package", { subscriptionId }, "error", "Package not found");
          break;
        }

        recordId = failedPkg.id;
        recordType = "package";
        const previousStatus = failedPkg.payment_status;

        // Set to paused_payment - rights remain GATED (not released)
        // next_payment_date is cleared to indicate payment is stalled
        const { error } = await supabaseClient
          .from("voice_vault_packages")
          .update({
            payment_status: "paused_payment",
            // Rights gating: content_status stays as-is (payment_active or editing_in_progress)
            // Do NOT change to paid_in_full or rights_released
          })
          .eq("id", failedPkg.id);

        if (error) {
          logStep("ERROR updating package (payment failed)", { error: error.message });
          await logWebhookEvent(eventType, stripeEventId, recordId, recordType, { subscriptionId }, "error", error.message);
          throw error;
        }

        logStep("SUCCESS - Payment failed, status set to paused_payment", { 
          subscriptionId, 
          attemptCount,
          previousStatus,
          newStatus: "paused_payment",
          paidAmount: failedPkg.paid_amount,
          balanceRemaining: failedPkg.balance_remaining,
        });
        await logWebhookEvent(eventType, stripeEventId, recordId, recordType, { 
          subscriptionId, 
          attemptCount,
          transition: `${previousStatus} → paused_payment`,
          paidAmount: failedPkg.paid_amount,
          balanceRemaining: failedPkg.balance_remaining,
        }, "success", `${previousStatus} → paused_payment (attempt ${attemptCount})`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const cancelReason = subscription.cancellation_details?.reason;
        
        logStep("customer.subscription.deleted - Subscription", {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelReason: cancelReason,
        });

        // Find the package
        const { data: packageData, error: fetchError } = await supabaseClient
          .from("voice_vault_packages")
          .select("*")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (fetchError || !packageData) {
          logStep("Package not found for deleted subscription", { subscriptionId: subscription.id });
          await logWebhookEvent(eventType, stripeEventId, null, "package", { subscriptionId: subscription.id }, "success", "Package not found - likely already processed");
          break;
        }

        recordId = packageData.id;
        recordType = "package";
        const previousStatus = packageData.payment_status;

        // Skip if already paid_in_full (subscription was canceled programmatically after final payment)
        if (previousStatus === "paid_in_full") {
          logStep("Subscription deleted but package was already paid_in_full - no action needed", { recordId: packageData.id });
          await logWebhookEvent(eventType, stripeEventId, recordId, recordType, { 
            previousStatus,
            transition: "none (already paid_in_full)",
          }, "success", "Already paid_in_full - subscription cleanup, no status change");
          break;
        }

        // Distinguish: canceled (voluntary) vs defaulted (payment failure)
        // If previous status was paused_payment, treat as defaulted (payment failure led to cancellation)
        // Otherwise, treat as canceled (voluntary cancellation)
        const newStatus = previousStatus === "paused_payment" ? "defaulted" : "canceled";

        const { error } = await supabaseClient
          .from("voice_vault_packages")
          .update({
            payment_status: newStatus,
          })
          .eq("id", packageData.id);

        if (error) {
          logStep("ERROR updating package (subscription deleted)", { error: error.message });
          await logWebhookEvent(eventType, stripeEventId, recordId, recordType, { previousStatus }, "error", error.message);
          throw error;
        }

        logStep(`SUCCESS - Subscription deleted - marked as ${newStatus}`, { 
          recordId: packageData.id,
          previousStatus,
          newStatus,
          cancelReason,
        });
        await logWebhookEvent(eventType, stripeEventId, recordId, recordType, { 
          previousStatus,
          transition: `${previousStatus} → ${newStatus}`,
          cancelReason,
        }, "success", `${previousStatus} → ${newStatus} (${cancelReason || "voluntary"})`);
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
        await logWebhookEvent(eventType, stripeEventId, null, null, null, "success", `Unhandled event type: ${event.type}`);
    }

    logStep("==========================================");
    logStep("WEBHOOK PROCESSING COMPLETE");
    logStep("==========================================");

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("==========================================");
    logStep("WEBHOOK ERROR", { message: errorMessage });
    logStep("==========================================");
    
    await logWebhookEvent(eventType, stripeEventId, recordId, recordType, null, "error", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});