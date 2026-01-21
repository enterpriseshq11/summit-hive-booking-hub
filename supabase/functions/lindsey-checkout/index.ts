import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[LINDSEY-CHECKOUT] ${step}${detailsStr}`);
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

function asNumber(n: unknown) {
  const v = typeof n === "number" ? n : Number(String(n ?? ""));
  return Number.isFinite(v) ? v : NaN;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return jsonResponse(500, { error: "Server misconfigured: STRIPE_SECRET_KEY is not set" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(500, { error: "Server misconfigured: backend keys are not set" });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const body = await req.json();
    const {
      // UUIDs
      business_id,
      bookable_type_id,
      resource_id,
      hold_id,

      // Slot
      start_datetime,
      end_datetime,

      // Customer
      guest_name,
      guest_email,
      guest_phone,

      // Pricing
      total_amount,

      // Misc
      notes,
    } = body || {};

    logStep("Request parsed", {
      business_id,
      bookable_type_id,
      resource_id,
      hold_id,
      start_datetime,
      end_datetime,
      total_amount,
    });

    if (!business_id || !bookable_type_id || !resource_id || !hold_id || !start_datetime || !end_datetime) {
      return jsonResponse(400, { error: "Missing required fields" });
    }

    if (!guest_name || !guest_email || !isValidEmail(guest_email)) {
      return jsonResponse(400, { error: "Please provide a name and a valid email" });
    }

    const total = asNumber(total_amount);
    if (!Number.isFinite(total) || total < 0) {
      return jsonResponse(400, { error: "Invalid total amount" });
    }

    // Validate hold exists and is active (prevents double booking during checkout)
    const nowIso = new Date().toISOString();
    const { data: hold, error: holdErr } = await supabase
      .from("slot_holds")
      .select("id, status, expires_at, start_datetime, end_datetime, resource_id")
      .eq("id", hold_id)
      .maybeSingle();

    if (holdErr) {
      logStep("Hold lookup failed", holdErr);
      return jsonResponse(500, { error: "Unable to verify slot hold" });
    }

    if (!hold || hold.status !== "active" || !hold.expires_at || hold.expires_at < nowIso) {
      return jsonResponse(409, { error: "That time slot is no longer available. Please pick another time." });
    }

    // Hard check: hold must match requested slot/resource
    if (
      String(hold.resource_id) !== String(resource_id) ||
      String(hold.start_datetime) !== String(start_datetime) ||
      String(hold.end_datetime) !== String(end_datetime)
    ) {
      return jsonResponse(400, { error: "Hold does not match requested time slot" });
    }

    // Generate booking number (best-effort)
    const { data: bookingNumber } = await supabase.rpc("generate_booking_number");

    // Create booking as pending. Stripe webhook will mark it confirmed on payment success.
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        business_id,
        bookable_type_id,
        package_id: null,
        start_datetime,
        end_datetime,
        status: total > 0 ? "pending" : "confirmed",
        subtotal: total,
        total_amount: total,
        booking_number: bookingNumber || "",
        guest_name: String(guest_name).trim(),
        guest_email: String(guest_email).trim(),
        guest_phone: guest_phone ? String(guest_phone).trim() : null,
        notes: notes ? String(notes).trim() : null,
        deposit_amount: total > 0 ? 0 : null,
        balance_due: 0,
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      logStep("Booking insert failed", bookingError);
      return jsonResponse(500, { error: bookingError?.message || "Failed to create booking" });
    }

    // Attach resource
    const { error: brError } = await supabase.from("booking_resources").insert({
      booking_id: booking.id,
      resource_id,
      start_datetime,
      end_datetime,
    });

    if (brError) {
      logStep("booking_resources insert failed", brError);
      return jsonResponse(500, { error: brError.message || "Failed to attach room" });
    }

    // Free consults: no payment required
    if (total <= 0) {
      logStep("Free booking confirmed", { booking_id: booking.id });
      return jsonResponse(200, { free: true, booking_id: booking.id });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout session (FULL payment)
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Lindsey Massage Booking",
              description: notes ? String(notes).slice(0, 300) : undefined,
              metadata: { booking_id: booking.id },
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/#/book-with-lindsey?booking=success&id=${booking.id}&hold_id=${hold_id}`,
      cancel_url: `${origin}/#/book-with-lindsey?booking=cancelled&id=${booking.id}&hold_id=${hold_id}`,
      metadata: {
        booking_id: booking.id,
        is_deposit: "false",
        hold_id: String(hold_id),
      },
    });

    // Create pending payment record (so webhook can flip it to completed)
    const { error: payError } = await supabase.from("payments").insert({
      booking_id: booking.id,
      amount: total,
      payment_type: "full",
      status: "pending",
      stripe_payment_intent_id: session.payment_intent as string,
      metadata: {
        checkout_session_id: session.id,
        hold_id: String(hold_id),
      },
    });
    if (payError) {
      // Best-effort: don't block checkout creation if logging fails
      logStep("Payment insert failed", payError);
    }

    logStep("Checkout session created", { booking_id: booking.id, session_id: session.id });
    return jsonResponse(200, { url: session.url, booking_id: booking.id, session_id: session.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { msg });
    return jsonResponse(500, { error: msg });
  }
});
