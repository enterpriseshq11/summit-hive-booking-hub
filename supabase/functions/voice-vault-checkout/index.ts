import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe Price IDs
const PRICE_IDS = {
  hourly: "price_1SlvgcPFNT8K72RI8QHbSSzo", // $45/hour
  core_series_full: "price_1SlvgdPFNT8K72RI8kAOuBeB", // $5000 one-time
  white_glove_full: "price_1SlvgfPFNT8K72RI5wfXmIns", // $8000 one-time
  core_series_weekly: "price_1SlvgiPFNT8K72RIv4dyS1ls", // $100/week recurring
  white_glove_weekly: "price_1SlvgjPFNT8K72RIkabNdRx0", // $160/week recurring
};

const PACKAGE_PRICES = {
  core_series: 5000,
  white_glove: 8000,
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VOICE-VAULT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { 
      type, // 'hourly' | 'core_series' | 'white_glove'
      payment_plan, // 'full' | 'weekly'
      customer_name,
      customer_email,
      customer_phone,
      // For hourly bookings
      booking_date,
      start_time,
      end_time,
      duration_hours,
    } = await req.json();

    logStep("Request parsed", { type, payment_plan, customer_email });

    if (!type || !customer_name || !customer_email) {
      throw new Error("Missing required fields: type, customer_name, customer_email");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://560e7915-0309-4073-b876-712415397260.lovableproject.com";
    let session: Stripe.Checkout.Session;
    let recordId: string;

    if (type === "hourly") {
      // Hourly studio booking
      if (!booking_date || !start_time || !end_time || !duration_hours) {
        throw new Error("Missing booking details for hourly rental");
      }

      if (duration_hours < 2) {
        throw new Error("Minimum booking is 2 hours");
      }

      const totalAmount = duration_hours * 45;
      logStep("Creating hourly booking", { duration_hours, totalAmount });

      // Create booking record first
      const { data: booking, error: bookingError } = await supabaseClient
        .from("voice_vault_bookings")
        .insert({
          customer_name,
          customer_email,
          customer_phone,
          booking_date,
          start_time,
          end_time,
          duration_hours,
          hourly_rate: 45,
          total_amount: totalAmount,
          payment_status: "pending",
        })
        .select()
        .single();

      if (bookingError) {
        logStep("Error creating booking", { error: bookingError });
        throw new Error(`Failed to create booking: ${bookingError.message}`);
      }

      recordId = booking.id;
      logStep("Booking created", { recordId });

      // Create Stripe checkout session
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : customer_email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Voice Vault Studio Rental - ${duration_hours} hours`,
                description: `${booking_date} from ${start_time} to ${end_time}`,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/#/voice-vault?booking=success&id=${recordId}`,
        cancel_url: `${origin}/#/voice-vault?booking=cancelled`,
        metadata: {
          type: "hourly",
          record_id: recordId,
          customer_email,
          booking_date,
          duration_hours: String(duration_hours),
        },
      });

    } else {
      // Package purchase (core_series or white_glove)
      const plan = payment_plan || "full";
      const packagePrice = PACKAGE_PRICES[type as keyof typeof PACKAGE_PRICES];
      
      if (!packagePrice) {
        throw new Error(`Invalid package type: ${type}`);
      }

      logStep("Creating package order", { type, plan, packagePrice });

      // Create package record first
      const { data: packageOrder, error: packageError } = await supabaseClient
        .from("voice_vault_packages")
        .insert({
          customer_name,
          customer_email,
          customer_phone,
          product_type: type,
          payment_plan: plan,
          package_price: packagePrice,
          paid_amount: 0,
          balance_remaining: packagePrice,
          payment_status: "pending",
          content_status: "not_applicable",
        })
        .select()
        .single();

      if (packageError) {
        logStep("Error creating package order", { error: packageError });
        throw new Error(`Failed to create package order: ${packageError.message}`);
      }

      recordId = packageOrder.id;
      logStep("Package order created", { recordId });

      if (plan === "weekly") {
        // Weekly subscription
        const priceId = type === "core_series" 
          ? PRICE_IDS.core_series_weekly 
          : PRICE_IDS.white_glove_weekly;

        session = await stripe.checkout.sessions.create({
          customer: customerId,
          customer_email: customerId ? undefined : customer_email,
          line_items: [{ price: priceId, quantity: 1 }],
          mode: "subscription",
          success_url: `${origin}/#/voice-vault?package=success&id=${recordId}`,
          cancel_url: `${origin}/#/voice-vault?package=cancelled`,
          metadata: {
            type,
            payment_plan: "weekly",
            record_id: recordId,
            customer_email,
            package_price: String(packagePrice),
          },
        });
      } else {
        // Full payment
        const priceId = type === "core_series" 
          ? PRICE_IDS.core_series_full 
          : PRICE_IDS.white_glove_full;

        session = await stripe.checkout.sessions.create({
          customer: customerId,
          customer_email: customerId ? undefined : customer_email,
          line_items: [{ price: priceId, quantity: 1 }],
          mode: "payment",
          success_url: `${origin}/#/voice-vault?package=success&id=${recordId}`,
          cancel_url: `${origin}/#/voice-vault?package=cancelled`,
          metadata: {
            type,
            payment_plan: "full",
            record_id: recordId,
            customer_email,
            package_price: String(packagePrice),
          },
        });
      }
    }

    // Update record with checkout session ID
    if (type === "hourly") {
      await supabaseClient
        .from("voice_vault_bookings")
        .update({ stripe_checkout_session_id: session.id })
        .eq("id", recordId);
    } else {
      await supabaseClient
        .from("voice_vault_packages")
        .update({ stripe_checkout_session_id: session.id })
        .eq("id", recordId);
    }

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url, record_id: recordId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
