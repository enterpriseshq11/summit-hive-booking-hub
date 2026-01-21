import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[EXPERIENCE-CHECKOUT] ${step}${detailsStr}`);
};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function roundCurrency(n: number) {
  return Math.round(n * 100) / 100;
}

function computeDeposit(total: number, depositPercentage?: number | null, depositFixed?: number | null) {
  if (total <= 0) return { deposit: 0, remaining: 0 };

  const pct = depositPercentage ? roundCurrency((total * depositPercentage) / 100) : 0;
  const fixed = depositFixed ? roundCurrency(depositFixed) : 0;
  const deposit = Math.min(total, Math.max(pct, fixed));
  return {
    deposit,
    remaining: roundCurrency(Math.max(0, total - deposit)),
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend keys are not set");

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const body = await req.json();
    const {
      business_type,
      package_id,
      bookable_type_id,
      resource_id,
      start_datetime,
      end_datetime,
      customer_name,
      customer_email,
      customer_phone,
      hold_id,
      // New hourly pricing fields
      duration_hours,
      hourly_rate,
      total_amount: passedTotalAmount,
    } = body || {};

    logStep("Request parsed", { business_type, package_id, bookable_type_id, resource_id, start_datetime, end_datetime, duration_hours, hourly_rate });

    if (!business_type || !resource_id || !start_datetime || !end_datetime) {
      return jsonResponse(400, { error: "Missing required fields" });
    }
    if (!customer_name || !customer_email || !customer_phone) {
      return jsonResponse(400, { error: "Missing customer details" });
    }

    let pkg: { id: string; name: string; base_price: number; duration_mins: number; bookable_type_id: string } | null = null;
    let bt: { id: string; name: string; business_id: string; deposit_percentage: number | null; deposit_fixed_amount: number | null } | null = null;
    let biz: { id: string; type: string; name: string } | null = null;
    let total = 0;
    let productName = "";

    // Check if using hourly pricing (no package_id, but has duration_hours and total_amount)
    const isHourlyPricing = !package_id && duration_hours && passedTotalAmount !== undefined;

    if (isHourlyPricing) {
      // Hourly pricing mode - look up bookable_type directly
      logStep("Using hourly pricing mode", { duration_hours, hourly_rate, passedTotalAmount });

      if (!bookable_type_id) {
        return jsonResponse(400, { error: "Missing bookable_type_id for hourly pricing" });
      }

      const { data: btData, error: btError } = await supabase
        .from("bookable_types")
        .select("id, name, business_id, deposit_percentage, deposit_fixed_amount")
        .eq("id", bookable_type_id)
        .single();
      if (btError || !btData) throw new Error(btError?.message || "Bookable type not found");
      bt = btData;

      const { data: bizData, error: bizError } = await supabase
        .from("businesses")
        .select("id, type, name")
        .eq("id", bt.business_id)
        .single();
      if (bizError || !bizData) throw new Error(bizError?.message || "Business not found");
      biz = bizData;

      if (biz.type !== business_type) {
        return jsonResponse(400, { error: "Bookable type does not belong to requested business" });
      }

      total = Number(passedTotalAmount);
      productName = `${biz.name} - ${duration_hours} Hour${duration_hours > 1 ? "s" : ""} @ $${hourly_rate}/hr`;
    } else {
      // Package-based pricing mode (legacy)
      if (!package_id) {
        return jsonResponse(400, { error: "Missing package_id" });
      }

      const { data: pkgData, error: pkgError } = await supabase
        .from("packages")
        .select("id, name, base_price, duration_mins, bookable_type_id")
        .eq("id", package_id)
        .single();
      if (pkgError || !pkgData) throw new Error(pkgError?.message || "Package not found");
      pkg = pkgData;

      const { data: btData, error: btError } = await supabase
        .from("bookable_types")
        .select("id, name, business_id, deposit_percentage, deposit_fixed_amount")
        .eq("id", pkg.bookable_type_id)
        .single();
      if (btError || !btData) throw new Error(btError?.message || "Bookable type not found");
      bt = btData;

      const { data: bizData, error: bizError } = await supabase
        .from("businesses")
        .select("id, type, name")
        .eq("id", bt.business_id)
        .single();
      if (bizError || !bizData) throw new Error(bizError?.message || "Business not found");
      biz = bizData;

      if (biz.type !== business_type) {
        return jsonResponse(400, { error: "Package does not belong to requested business" });
      }

      total = Number(pkg.base_price || 0);
      productName = `${biz.name} - ${pkg.name}`;
    }

    const { deposit, remaining } = computeDeposit(total, bt!.deposit_percentage, bt!.deposit_fixed_amount);

    // Generate booking number
    const { data: bookingNumber, error: bnError } = await supabase.rpc("generate_booking_number");
    if (bnError) logStep("Booking number generation failed", { error: bnError });

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        business_id: bt!.business_id,
        bookable_type_id: bt!.id,
        package_id: pkg?.id || null,
        start_datetime,
        end_datetime,
        status: "pending",
        subtotal: total,
        total_amount: total,
        booking_number: bookingNumber || "",
        guest_name: customer_name,
        guest_email: customer_email,
        guest_phone: customer_phone,
        deposit_amount: deposit,
        balance_due: remaining,
      })
      .select("id")
      .single();
    if (bookingError || !booking) throw new Error(bookingError?.message || "Failed to create booking");

    // Attach resource
    const { error: brError } = await supabase.from("booking_resources").insert({
      booking_id: booking.id,
      resource_id,
      start_datetime,
      end_datetime,
    });
    if (brError) throw new Error(brError.message);

    // Create slot hold server-side (using service role bypasses RLS)
    // This prevents double-booking while customer completes payment
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min hold
    const { data: holdData, error: holdCreateError } = await supabase
      .from("slot_holds")
      .insert({
        bookable_type_id: bt!.id,
        resource_id,
        start_datetime,
        end_datetime,
        user_id: null,
        session_id: `checkout-${booking.id}`,
        expires_at: expiresAt,
        status: "active",
      })
      .select("id")
      .single();
    if (holdCreateError) {
      logStep("Hold creation failed (non-fatal)", { error: holdCreateError });
    } else {
      logStep("Slot hold created", { holdId: holdData?.id });
    }

    // If a client-side hold was provided, mark it consumed (legacy support)
    if (hold_id) {
      const { error: holdError } = await supabase
        .from("slot_holds")
        .update({ status: "consumed" })
        .eq("id", hold_id);
      if (holdError) logStep("Hold consume failed", { error: holdError });
    }

    // Create Stripe checkout for DEPOSIT only
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Build success/cancel URLs based on business type
    const successPath = business_type === "photo_booth" ? "360-photo-booth" : business_type;
    const successUrl = `${origin}/#/${successPath}?booking=success&id=${booking.id}`;
    const cancelUrl = `${origin}/#/${successPath}?booking=cancelled&id=${booking.id}`;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${productName} (Deposit)`,
              metadata: {
                booking_id: booking.id,
                business_type: String(business_type),
                ...(pkg?.id ? { package_id: String(pkg.id) } : {}),
              },
            },
            unit_amount: Math.round(deposit * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        booking_id: booking.id,
        business_type: String(business_type),
        ...(pkg?.id ? { package_id: String(pkg.id) } : {}),
        is_deposit: "true",
        total_amount: String(total),
        deposit_amount: String(deposit),
        remaining_amount: String(remaining),
      },
    });

    // Create pending payment record (best-effort)
    const { error: payError } = await supabase.from("payments").insert({
      booking_id: booking.id,
      amount: deposit,
      payment_type: "deposit",
      status: "pending",
      stripe_payment_intent_id: session.payment_intent as string,
      metadata: {
        checkout_session_id: session.id,
        total_amount: total,
        remaining_amount: remaining,
      },
    });
    if (payError) logStep("Payment insert failed", { error: payError });

    logStep("Checkout session created", { bookingId: booking.id, sessionId: session.id });
    return jsonResponse(200, { url: session.url, booking_id: booking.id, session_id: session.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { msg });
    return jsonResponse(500, { error: msg });
  }
});
