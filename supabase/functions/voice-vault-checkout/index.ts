import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Voice Vault Pricing Configuration
 * Core Series: $1,000 total ($100/week × 10 weeks)
 * White Glove: $2,000 total ($100/week × 20 weeks OR $200/week × 10 weeks accelerated)
 */
const PRICING = {
  hourly: {
    ratePerHour: 45,
    minimumHours: 2,
  },
  coreSeries: {
    totalPrice: 1000,
    weeklyPayment: 100,
    termWeeks: 10,
    stripePrices: {
      full: "price_1SlvrPPFNT8K72RIFp9bHYT3",
      weekly: "price_1SlvrRPFNT8K72RITmDjwzVR",
    },
  },
  whiteGlove: {
    totalPrice: 2000,
    stripePrices: {
      full: "price_1SlvrSPFNT8K72RI5xFYHvwY",
    },
    paymentOptions: {
      standard: {
        weeklyPayment: 100,
        termWeeks: 20,
        stripePriceId: "price_1SlvrUPFNT8K72RImNuQQ3R3",
      },
      accelerated: {
        weeklyPayment: 200,
        termWeeks: 10,
        stripePriceId: "price_1SlvrWPFNT8K72RIpNAdCFHP",
      },
    },
  },
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VOICE-VAULT-CHECKOUT] ${step}${detailsStr}`);
};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { 
      type, // 'hourly' | 'core_series' | 'white_glove'
      payment_plan, // 'full' | 'weekly'
      white_glove_option, // 'standard' | 'accelerated' (only for white_glove weekly)
      customer_name,
      customer_email,
      customer_phone,
      // For hourly bookings
      booking_date,
      start_time,
      end_time,
      duration_hours,
      skip_payment, // Optional: if true, skip payment collection
    } = await req.json();

    logStep("Request parsed", { type, payment_plan, white_glove_option, customer_email, skip_payment });

    if (!type || !customer_name || !customer_email) {
      return jsonResponse(400, {
        error: "Missing required fields: type, customer_name, customer_email",
      });
    }

    if (!isValidEmail(customer_email)) {
      return jsonResponse(400, { error: `Invalid email address: ${customer_email}` });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(500, {
        error: "Server misconfigured: backend keys are not set",
      });
    }

    const supabaseClient = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    // Check if payments are enabled for Voice Vault
    const { data: configData } = await supabaseClient
      .from("app_config")
      .select("value")
      .eq("key", "voice_vault_payments_enabled")
      .maybeSingle();
    
    const paymentsEnabled = configData?.value === "true";
    const shouldSkipPayment = skip_payment === true || !paymentsEnabled;
    
    logStep("Payment config check", { paymentsEnabled, shouldSkipPayment });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey && !shouldSkipPayment) {
      // Misconfiguration: return explicit message for faster debugging.
      return jsonResponse(500, { error: "Server misconfigured: STRIPE_SECRET_KEY is not set" });
    }

    const stripe = shouldSkipPayment ? null : new Stripe(stripeKey!, {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists in Stripe (only if we need Stripe)
    let customerId: string | undefined;
    if (!shouldSkipPayment && stripe) {
      const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://560e7915-0309-4073-b876-712415397260.lovableproject.com";
    let session: Stripe.Checkout.Session | null = null;
    let recordId: string;

    if (type === "hourly") {
      // Hourly studio booking
      if (!booking_date || !start_time || !end_time || !duration_hours) {
        throw new Error("Missing booking details for hourly rental");
      }

      if (duration_hours < PRICING.hourly.minimumHours) {
        throw new Error(`Minimum booking is ${PRICING.hourly.minimumHours} hours`);
      }

      // Check for overlapping bookings
      const { data: hasOverlap } = await supabaseClient.rpc(
        "check_voice_vault_booking_overlap",
        {
          p_booking_date: booking_date,
          p_start_time: start_time,
          p_end_time: end_time,
        }
      );

      if (hasOverlap) {
        throw new Error("This time slot is already booked. Please choose a different time.");
      }

      const totalAmount = duration_hours * PRICING.hourly.ratePerHour;
      
      // Calculate 1/3 deposit (rounded to cents) - used for display even when payments disabled
      const depositAmount = shouldSkipPayment ? 0 : Math.round((totalAmount / 3) * 100) / 100;
      const remainingBalance = shouldSkipPayment ? totalAmount : Math.round((totalAmount - depositAmount) * 100) / 100;
      
      logStep("Creating hourly booking", { 
        duration_hours, 
        totalAmount, 
        depositAmount, 
        remainingBalance,
        shouldSkipPayment 
      });

      // Create booking record - set status based on whether payment is required
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
          hourly_rate: PRICING.hourly.ratePerHour,
          total_amount: totalAmount,
          deposit_amount: depositAmount,
          remaining_balance: remainingBalance,
          payment_status: shouldSkipPayment ? "pay_on_arrival" : "pending",
        })
        .select()
        .single();

      if (bookingError) {
        logStep("Error creating booking", { error: bookingError });
        throw new Error(`Failed to create booking: ${bookingError.message}`);
      }

      recordId = booking.id;
      logStep("Booking created", { recordId, paymentStatus: shouldSkipPayment ? "pay_on_arrival" : "pending" });

      // If skipping payment, return success immediately
      if (shouldSkipPayment) {
        logStep("Pay on arrival - skipping Stripe checkout");
        return jsonResponse(200, { 
          success: true, 
          is_pay_on_arrival: true,
          record_id: recordId,
          total_amount: totalAmount,
          message: "Booking confirmed. Payment due on arrival."
        });
      }

      // Create Stripe checkout session for DEPOSIT ONLY (1/3 of total)
      session = await stripe!.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : customer_email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Voice Vault Studio Deposit - ${duration_hours} hours`,
                description: `Deposit for ${booking_date} from ${start_time} to ${end_time}. Remaining $${remainingBalance.toFixed(2)} due on arrival.`,
              },
              unit_amount: Math.round(depositAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/#/voice-vault?booking=success&id=${recordId}`,
        cancel_url: `${origin}/#/voice-vault?booking=cancelled`,
        metadata: {
          product_type: "hourly",
          plan_type: "deposit",
          record_id: recordId,
          customer_email,
          booking_date,
          duration_hours: String(duration_hours),
          total_amount: String(totalAmount),
          deposit_amount: String(depositAmount),
          remaining_balance: String(remainingBalance),
        },
      });

    } else {
      // Package purchase (core_series or white_glove)
      const plan = payment_plan || "full";
      let packagePrice: number;
      let termWeeks: number;
      let weeklyPayment: number | null = null;
      let priceId: string;

      if (type === "core_series") {
        packagePrice = PRICING.coreSeries.totalPrice;
        termWeeks = PRICING.coreSeries.termWeeks;
        weeklyPayment = PRICING.coreSeries.weeklyPayment;
        priceId = plan === "full" 
          ? PRICING.coreSeries.stripePrices.full 
          : PRICING.coreSeries.stripePrices.weekly;
      } else if (type === "white_glove") {
        packagePrice = PRICING.whiteGlove.totalPrice;
        if (plan === "full") {
          priceId = PRICING.whiteGlove.stripePrices.full;
          termWeeks = 0;
        } else {
          const option = white_glove_option === "accelerated" ? "accelerated" : "standard";
          const optionConfig = PRICING.whiteGlove.paymentOptions[option];
          priceId = optionConfig.stripePriceId;
          termWeeks = optionConfig.termWeeks;
          weeklyPayment = optionConfig.weeklyPayment;
        }
      } else {
        throw new Error(`Invalid package type: ${type}`);
      }

      logStep("Creating package order", { type, plan, packagePrice, termWeeks, weeklyPayment });

      // Create package record
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

      const stripeMetadata: Record<string, string> = {
        product_type: type,
        plan_type: plan,
        record_id: recordId,
        customer_email,
        package_price: String(packagePrice),
        term_weeks: String(termWeeks),
        package_name: type === "core_series" ? "Core Series" : "White Glove",
      };

      if (plan === "weekly") {
        stripeMetadata.weekly_payment = String(weeklyPayment);
        if (type === "white_glove") {
          stripeMetadata.white_glove_option = white_glove_option || "standard";
        }
      }

      // Package purchases always require payment (no pay-on-arrival for packages)
      if (!stripe) {
        throw new Error("Payment is required for package purchases");
      }

      if (plan === "weekly") {
        // Weekly subscription
        session = await stripe.checkout.sessions.create({
          customer: customerId,
          customer_email: customerId ? undefined : customer_email,
          line_items: [{ price: priceId, quantity: 1 }],
          mode: "subscription",
          success_url: `${origin}/#/voice-vault?package=success&id=${recordId}`,
          cancel_url: `${origin}/#/voice-vault?package=cancelled`,
          metadata: stripeMetadata,
        });
      } else {
        // Full payment
        session = await stripe.checkout.sessions.create({
          customer: customerId,
          customer_email: customerId ? undefined : customer_email,
          line_items: [{ price: priceId, quantity: 1 }],
          mode: "payment",
          success_url: `${origin}/#/voice-vault?package=success&id=${recordId}`,
          cancel_url: `${origin}/#/voice-vault?package=cancelled`,
          metadata: stripeMetadata,
        });
      }
    }

    // Update record with checkout session ID (only if we have a session)
    if (session) {
      if (type === "hourly") {
        const { error: updateError } = await supabaseClient
          .from("voice_vault_bookings")
          .update({ stripe_checkout_session_id: session.id })
          .eq("id", recordId);

        if (updateError) {
          logStep("Error updating booking with session id", { error: updateError, recordId });
        }
      } else {
        const { error: updateError } = await supabaseClient
          .from("voice_vault_packages")
          .update({ stripe_checkout_session_id: session.id })
          .eq("id", recordId);

        if (updateError) {
          logStep("Error updating package with session id", { error: updateError, recordId });
        }
      }

      logStep("Checkout session created", { sessionId: session.id, url: session.url });

      return jsonResponse(200, { url: session.url, record_id: recordId });
    }

    // Fallback (shouldn't reach here for normal flow)
    return jsonResponse(200, { record_id: recordId });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return jsonResponse(500, { error: errorMessage });
  }
});
