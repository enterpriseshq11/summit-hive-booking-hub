import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PROCESS-REFUND] ${step}${detailsStr}`);
};

interface RefundRequest {
  payment_id: string;
  amount?: number; // Partial refund amount, if not provided, full refund
  reason: string;
}

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
    logStep("Function started");

    // Verify admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["owner", "manager"]);

    if (!roles || roles.length === 0) {
      throw new Error("Unauthorized: Admin access required");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const body: RefundRequest = await req.json();
    const { payment_id, amount, reason } = body;

    logStep("Processing refund", { payment_id, amount, reason });

    // Get payment record
    const { data: payment, error: pError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", payment_id)
      .single();

    if (pError || !payment) throw new Error("Payment not found");
    if (!payment.stripe_payment_intent_id) throw new Error("No Stripe payment intent found");
    if (payment.status === "refunded") throw new Error("Payment already refunded");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Calculate refund amount
    const refundAmount = amount || payment.amount;
    const refundAmountCents = Math.round(refundAmount * 100);

    // Get the charge from payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
    const chargeId = paymentIntent.latest_charge as string;

    if (!chargeId) throw new Error("No charge found for this payment");

    // Create refund
    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: refundAmountCents,
      reason: "requested_by_customer",
    });

    logStep("Stripe refund created", { refundId: refund.id, amount: refundAmount });

    // Update payment record
    const isFullRefund = refundAmount >= payment.amount;
    await supabase
      .from("payments")
      .update({
        status: isFullRefund ? "refunded" : "partially_refunded",
        refund_amount: refundAmount,
        refund_reason: reason,
      })
      .eq("id", payment_id);

    // If booking, update status
    if (payment.booking_id) {
      await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: `Refunded: ${reason}`,
          cancelled_at: new Date().toISOString(),
          cancelled_by: userId,
        })
        .eq("id", payment.booking_id);
    }

    // Audit log
    await supabase.from("audit_log").insert([{
      entity_type: "payment",
      entity_id: payment_id,
      action_type: "refunded",
      actor_user_id: userId,
      before_json: payment as any,
      after_json: { refund_id: refund.id, refund_amount: refundAmount, reason } as any,
    }]);

    return new Response(
      JSON.stringify({
        success: true,
        refund_id: refund.id,
        amount: refundAmount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
