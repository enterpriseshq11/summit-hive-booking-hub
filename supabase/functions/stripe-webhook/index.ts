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

const SPA_BOOKABLE_TYPE_ID = "f7c9e18f-3b4c-4c2a-9d85-4a2c067fd8fb";

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

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      logStep("Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        headers: corsHeaders, status: 400,
      });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      logStep("Signature verification failed", { error: String(err) });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: corsHeaders, status: 400,
      });
    }

    logStep("Event verified", { type: event.type, id: event.id });

    // Log every event to stripe_webhook_events
    await supabase.from("stripe_webhook_events").insert({
      event_type: event.type,
      stripe_event_id: event.id,
      payload: event as any,
      received_at: new Date().toISOString(),
      processed: false,
    });

    // Idempotency check via audit_log
    const { data: existingEvent } = await supabase
      .from("audit_log")
      .select("id")
      .eq("entity_id", event.id)
      .eq("entity_type", "stripe_event")
      .maybeSingle();

    if (existingEvent) {
      logStep("Duplicate event, skipping", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    // Helper: read admin setting
    async function getAdminSetting(key: string): Promise<string | null> {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      return (data as any)?.value ?? null;
    }

    // Helper: resolve business unit from metadata
    async function resolveBusinessUnit(metadata: Record<string, string>): Promise<string> {
      const { data: mappings } = await supabase
        .from("stripe_business_unit_mappings")
        .select("metadata_key, metadata_value, business_unit")
        .eq("active", true);

      if (mappings) {
        for (const mapping of mappings) {
          if (metadata[mapping.metadata_key] === mapping.metadata_value) {
            return mapping.business_unit;
          }
        }
      }

      const fallback = await getAdminSetting("stripe_fallback_business_unit");
      return fallback || "spa";
    }

    // Helper: auto-create revenue event
    async function autoCreateRevenue(
      amountCents: number, businessUnit: string, description: string, paymentMethod: string | null, revenueDate: string
    ): Promise<string | null> {
      const autoEnabled = await getAdminSetting("stripe_auto_revenue_enabled");
      if (autoEnabled !== "true") return null;

      const { data, error } = await supabase.from("crm_revenue_events").insert({
        amount: amountCents / 100,
        business_unit: businessUnit,
        description,
        is_manual: false,
        payment_method: paymentMethod,
        recorded_by: "00000000-0000-0000-0000-000000000000",
        revenue_date: revenueDate,
      }).select("id").single();

      if (error) {
        logStep("Failed to create revenue event", { error: error.message });
        return null;
      }
      return data.id;
    }

    // Helper: auto-calculate commission
    async function autoCalculateCommission(businessUnit: string, revenueAmount: number, paymentIntentId: string) {
      const autoEnabled = await getAdminSetting("commission_auto_calculate_enabled");
      if (autoEnabled !== "true") return;

      const { data: rules } = await supabase
        .from("commission_rules")
        .select("*")
        .eq("is_active", true)
        .or(`business_unit.eq.${businessUnit},business_unit.is.null`);

      if (!rules || rules.length === 0) return;

      for (const rule of rules) {
        if (!rule.employee_id) continue;
        const commissionAmount = rule.commission_percent
          ? (revenueAmount * rule.commission_percent) / 100
          : 0;

        if (commissionAmount <= 0) continue;

        // Find revenue event for linking
        const { data: revEvent } = await supabase
          .from("crm_revenue_events")
          .select("id")
          .ilike("description", `%${paymentIntentId.slice(-6)}%`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (revEvent) {
          await supabase.from("crm_commissions").insert({
            employee_id: rule.employee_id,
            revenue_event_id: revEvent.id,
            amount: commissionAmount,
            status: "pending",
            rule_id: rule.id,
          });
          logStep("Commission created", { employee: rule.employee_id, amount: commissionAmount });
        }
      }
    }

    // Helper: create alert
    async function createAlert(alertType: string, title: string, description: string, entityType?: string, entityId?: string, sourceFilter?: string) {
      await supabase.from("crm_alerts").insert({
        alert_type: alertType,
        title,
        description,
        entity_type: entityType || null,
        entity_id: entityId || null,
        severity: "info",
        source_filter: sourceFilter || null,
        target_roles: ["owner", "manager"],
      });
    }

    // Process event
    switch (event.type) {
      // ═══════════════ PAYMENT INTENT SUCCEEDED ═══════════════
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const metadata = (pi.metadata || {}) as Record<string, string>;
        const amountCents = pi.amount;
        const customerEmail = pi.receipt_email || (pi as any).customer_email || null;
        const customerName = (pi as any).customer_name || metadata.customer_name || null;
        const paymentMethodType = (pi.payment_method_types || [])[0] || "card";
        const piId = pi.id;

        logStep("payment_intent.succeeded", { piId, amount: amountCents });

        // Duplicate check in stripe_transactions
        const { data: existingTxn } = await supabase
          .from("stripe_transactions")
          .select("id")
          .eq("stripe_payment_intent_id", piId)
          .maybeSingle();

        if (existingTxn) {
          await supabase.from("stripe_transactions")
            .update({ is_duplicate: true })
            .eq("id", existingTxn.id);

          await supabase.from("crm_activity_events").insert({
            event_type: "status_change" as any,
            entity_type: "stripe_transaction",
            entity_id: existingTxn.id,
            event_category: "stripe_payment_received",
            entity_name: "Stripe Payment",
            metadata: { action: "duplicate_payment_received", payment_intent_id: piId },
          });

          logStep("Duplicate transaction, skipped revenue", { piId });
          break;
        }

        // Resolve business unit
        const businessUnit = await resolveBusinessUnit(metadata);

        // Insert transaction
        const { data: txn } = await supabase.from("stripe_transactions").insert({
          stripe_payment_intent_id: piId,
          stripe_charge_id: (pi.latest_charge as string) || null,
          amount: amountCents,
          currency: pi.currency || "usd",
          status: "succeeded",
          business_unit: businessUnit,
          customer_email: customerEmail,
          customer_name: customerName,
          payment_method_type: paymentMethodType,
          stripe_created_at: new Date(pi.created * 1000).toISOString(),
          synced_at: new Date().toISOString(),
          metadata: metadata as any,
        }).select("id").single();

        // Auto-create revenue event
        const last6 = piId.slice(-6);
        const revenueId = await autoCreateRevenue(
          amountCents, businessUnit,
          `Stripe Payment ending ${last6}`,
          paymentMethodType,
          new Date(pi.created * 1000).toISOString().split("T")[0]
        );

        if (revenueId && txn) {
          await supabase.from("stripe_transactions")
            .update({ revenue_event_id: revenueId })
            .eq("id", txn.id);
        }

        // Auto-calculate commission
        if (revenueId) {
          await autoCalculateCommission(businessUnit, amountCents / 100, piId);
        }

        // Log activity
        await supabase.from("crm_activity_events").insert({
          event_type: "status_change" as any,
          entity_type: "stripe_transaction",
          entity_id: txn?.id || piId,
          event_category: "stripe_payment_received",
          entity_name: "Stripe Payment",
          metadata: {
            action: "payment_succeeded",
            amount_cents: amountCents,
            business_unit: businessUnit,
            revenue_event_id: revenueId,
          },
        });

        // Create alert
        await createAlert(
          "stripe_payment",
          `Stripe Payment: $${(amountCents / 100).toFixed(2)}`,
          `Payment received for ${businessUnit} — ${customerEmail || "unknown customer"}`,
          "stripe_transaction", txn?.id || piId
        );

        // === LEGACY: Also handle checkout-linked bookings ===
        if (metadata.booking_id) {
          const bookingId = metadata.booking_id;
          const isDeposit = metadata.is_deposit === "true";
          await supabase.from("payments").update({
            status: "completed",
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: piId,
          }).eq("booking_id", bookingId).eq("status", "pending");

          const newStatus = isDeposit ? "deposit_paid" : "confirmed";
          await supabase.from("bookings").update({
            status: newStatus,
            deposit_amount: isDeposit ? amountCents / 100 : undefined,
          }).eq("id", bookingId);

          if (isDeposit) {
            const { data: booking } = await supabase.from("bookings")
              .select("total_amount").eq("id", bookingId).single();
            if (booking) {
              await supabase.from("bookings").update({
                balance_due: booking.total_amount - amountCents / 100,
              }).eq("id", bookingId);
            }
          }

          // Send notifications
          try {
            const notificationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-booking-notification`;
            await fetch(notificationUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                booking_id: bookingId,
                notification_type: "confirmation",
                channels: ["email", "sms"],
                recipients: ["customer", "staff"],
                stripe_payment_intent: piId,
              }),
            });
          } catch (notifError) {
            logStep("Notification error", { error: String(notifError) });
          }
        }
        break;
      }

      // ═══════════════ CHARGE REFUNDED ═══════════════
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        const refundAmountCents = charge.amount_refunded || 0;

        logStep("charge.refunded", { paymentIntentId, refundAmountCents });

        // Find original transaction
        const { data: originalTxn } = await supabase
          .from("stripe_transactions")
          .select("id, business_unit")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .maybeSingle();

        const businessUnit = originalTxn?.business_unit || "spa";

        // Get refund details from charge.refunds
        const refunds = (charge as any).refunds?.data || [];
        for (const refund of refunds) {
          const { data: existingRefund } = await supabase
            .from("stripe_refunds")
            .select("id")
            .eq("stripe_refund_id", refund.id)
            .maybeSingle();

          if (existingRefund) continue;

          const refundAmount = refund.amount || refundAmountCents;

          // Insert refund record
          const { data: refundRecord } = await supabase.from("stripe_refunds").insert({
            stripe_refund_id: refund.id,
            stripe_payment_intent_id: paymentIntentId,
            amount: refundAmount,
            reason: refund.reason || null,
            status: refund.status || "succeeded",
            business_unit: businessUnit,
          }).select("id").single();

          // Create negative revenue event
          const { data: negRevenue } = await supabase.from("crm_revenue_events").insert({
            amount: -(refundAmount / 100),
            business_unit: businessUnit,
            description: `Stripe Refund for payment ${paymentIntentId.slice(-6)}`,
            is_manual: false,
            recorded_by: "00000000-0000-0000-0000-000000000000",
            revenue_date: new Date().toISOString().split("T")[0],
          }).select("id").single();

          if (negRevenue && refundRecord) {
            await supabase.from("stripe_refunds")
              .update({ revenue_event_id: negRevenue.id })
              .eq("id", refundRecord.id);
          }
        }

        // Update legacy payments table
        await supabase.from("payments").update({
          status: "refunded",
          refund_amount: refundAmountCents / 100,
        }).eq("stripe_payment_intent_id", paymentIntentId);

        // Log activity
        await supabase.from("crm_activity_events").insert({
          event_type: "status_change" as any,
          entity_type: "stripe_transaction",
          entity_id: originalTxn?.id || paymentIntentId,
          event_category: "stripe_payment_received",
          entity_name: "Stripe Refund",
          metadata: {
            action: "charge_refunded",
            refund_amount_cents: refundAmountCents,
            business_unit: businessUnit,
          },
        });
        break;
      }

      // ═══════════════ INVOICE PAYMENT SUCCEEDED ═══════════════
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const amountCents = invoice.amount_paid || 0;
        const customerEmail = invoice.customer_email || null;
        const metadata = (invoice.metadata || {}) as Record<string, string>;

        logStep("invoice.payment_succeeded", { subscriptionId, amountCents });

        // Resolve business unit
        const businessUnit = await resolveBusinessUnit(metadata);

        // Check for duplicate
        const invoicePI = (invoice.payment_intent as string) || `inv_${invoice.id}`;
        const { data: existingInv } = await supabase
          .from("stripe_transactions")
          .select("id")
          .eq("stripe_payment_intent_id", invoicePI)
          .maybeSingle();

        if (!existingInv) {
          const { data: txn } = await supabase.from("stripe_transactions").insert({
            stripe_payment_intent_id: invoicePI,
            amount: amountCents,
            currency: invoice.currency || "usd",
            status: "succeeded",
            business_unit: businessUnit,
            customer_email: customerEmail,
            payment_method_type: "invoice",
            stripe_created_at: new Date((invoice.created || 0) * 1000).toISOString(),
            synced_at: new Date().toISOString(),
            metadata: { invoice_id: invoice.id, subscription_id: subscriptionId, ...metadata } as any,
          }).select("id").single();

          // Auto-create revenue
          const revenueId = await autoCreateRevenue(
            amountCents, businessUnit,
            `Stripe Invoice ${invoice.id?.slice(-6) || ""}`,
            "invoice",
            new Date((invoice.created || 0) * 1000).toISOString().split("T")[0]
          );

          if (revenueId && txn) {
            await supabase.from("stripe_transactions")
              .update({ revenue_event_id: revenueId })
              .eq("id", txn.id);
          }

          if (revenueId) {
            await autoCalculateCommission(businessUnit, amountCents / 100, invoicePI);
          }
        }

        // Update membership period (legacy)
        if (subscriptionId) {
          await supabase.from("memberships").update({
            current_period_start: new Date((invoice.period_start || 0) * 1000).toISOString(),
            current_period_end: new Date((invoice.period_end || 0) * 1000).toISOString(),
            status: "active",
          }).eq("stripe_subscription_id", subscriptionId);

          // Update fitness_memberships if matched
          const nextBilling = new Date((invoice.period_end || 0) * 1000).toISOString().split("T")[0];
          await supabase.from("fitness_memberships").update({
            next_billing_date: nextBilling,
            status: "active",
          }).eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }

      // ═══════════════ INVOICE PAYMENT FAILED ═══════════════
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const customerEmail = invoice.customer_email || "unknown";

        logStep("invoice.payment_failed", { subscriptionId, customerEmail });

        // Create alert
        await createAlert(
          "membership_payment_failed",
          `Membership Payment Failed`,
          `Payment failed for ${customerEmail} — subscription ${subscriptionId?.slice(-8) || "N/A"}`,
          "membership", subscriptionId
        );

        // Log activity
        await supabase.from("crm_activity_events").insert({
          event_type: "status_change" as any,
          entity_type: "membership",
          entity_id: subscriptionId || "unknown",
          event_category: "stripe_payment_received",
          entity_name: "Invoice Payment Failed",
          metadata: { action: "invoice_payment_failed", customer_email: customerEmail },
        });

        // Update membership status (legacy)
        if (subscriptionId) {
          await supabase.from("memberships").update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);

          // Update fitness_memberships
          await supabase.from("fitness_memberships").update({ status: "payment_failed" })
            .eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }

      // ═══════════════ CHECKOUT SESSION COMPLETED (Legacy) ═══════════════
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const bookingId = metadata.booking_id;
        const membershipTierId = metadata.membership_tier_id;
        const userId = metadata.user_id;
        const isDeposit = metadata.is_deposit === "true";

        logStep("Checkout completed", { bookingId, membershipTierId, isDeposit });

        if (bookingId) {
          await supabase.from("payments").update({
            status: "completed",
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent as string,
          }).eq("booking_id", bookingId).eq("status", "pending");

          const newStatus = isDeposit ? "deposit_paid" : "confirmed";
          await supabase.from("bookings").update({
            status: newStatus,
            deposit_amount: isDeposit ? (session.amount_total || 0) / 100 : undefined,
          }).eq("id", bookingId);

          try {
            const notificationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-booking-notification`;
            await fetch(notificationUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                booking_id: bookingId,
                notification_type: "confirmation",
                channels: ["email", "sms"],
                recipients: ["customer", "staff"],
                stripe_session_id: session.id,
                stripe_payment_intent: session.payment_intent as string,
              }),
            });
          } catch (notifError) {
            logStep("Notification error", { error: String(notifError) });
          }
        }

        if (membershipTierId && userId) {
          await supabase.from("memberships").upsert({
            user_id: userId,
            tier_id: membershipTierId,
            status: "active",
            stripe_subscription_id: session.subscription as string,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            billing_cycle: "monthly",
          }, { onConflict: "user_id,tier_id" });
        }
        break;
      }

      // ═══════════════ SUBSCRIPTION DELETED ═══════════════
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase.from("memberships").update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        }).eq("stripe_subscription_id", subscription.id);
        logStep("Subscription cancelled", { subscriptionId: subscription.id });
        break;
      }

      default:
        logStep("Unhandled event type, logged only", { type: event.type });
    }

    // Mark webhook event as processed
    await supabase.from("stripe_webhook_events")
      .update({ processed: true })
      .eq("stripe_event_id", event.id);

    // Log event for idempotency
    await supabase.from("audit_log").insert([{
      entity_type: "stripe_event",
      entity_id: event.id,
      action_type: event.type,
      after_json: { event_type: event.type, processed_at: new Date().toISOString() } as any,
    }]);

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
