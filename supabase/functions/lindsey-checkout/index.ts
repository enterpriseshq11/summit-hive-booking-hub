import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[LINDSEY-CHECKOUT] ${step}${detailsStr}`);
};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
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
      service_id,
      service_name,
      duration,
      price,
      room_id,
      start_datetime,
      end_datetime,
      customer_name,
      customer_email,
      customer_phone,
      consent_no_show_fee,
      consent_timestamp,
      skip_payment, // New: frontend signals to skip payment when spa_payments_enabled = false
    } = body || {};

    logStep("Request parsed", { service_id, service_name, duration, price, room_id, start_datetime, end_datetime, consent_no_show_fee, skip_payment });

    // Validate required fields
    if (!service_name || !duration || price === undefined || !start_datetime || !end_datetime) {
      return jsonResponse(400, { error: "Missing required booking fields" });
    }
    if (!customer_name || !customer_email) {
      return jsonResponse(400, { error: "Missing customer name or email" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email.trim())) {
      return jsonResponse(400, { error: "Invalid email format" });
    }

    // Check if spa payments are enabled (fetch from app_config)
    const { data: configData } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "spa_payments_enabled")
      .maybeSingle();
    
    const spaPaymentsEnabled = configData?.value === "true";
    logStep("Spa payments config", { spaPaymentsEnabled });

    // Get spa business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("type", "spa")
      .single();
    if (bizError || !business) throw new Error(bizError?.message || "Spa business not found");

    // Get massage-therapy bookable type
    const { data: bookableType, error: btError } = await supabase
      .from("bookable_types")
      .select("id, deposit_percentage, deposit_fixed_amount")
      .eq("business_id", business.id)
      .eq("slug", "massage-therapy")
      .single();
    if (btError || !bookableType) throw new Error(btError?.message || "Massage bookable type not found");

    const total = Number(price);
    
    // For free consultations, just create the booking without payment
    if (total <= 0) {
      const { data: bookingNumber } = await supabase.rpc("generate_booking_number");
      
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          business_id: business.id,
          bookable_type_id: bookableType.id,
          start_datetime,
          end_datetime,
          status: "confirmed",
          subtotal: 0,
          total_amount: 0,
          booking_number: bookingNumber || `SPA-${Date.now()}`,
          guest_name: customer_name.trim(),
          guest_email: customer_email.trim(),
          guest_phone: customer_phone?.trim() || null,
          notes: `Service: ${service_name}, Duration: ${duration} min (Free Consultation)`,
        })
        .select("id")
        .single();
      
      if (bookingError) throw new Error(bookingError.message);

      // Attach room if provided
      if (room_id && booking) {
        await supabase.from("booking_resources").insert({
          booking_id: booking.id,
          resource_id: room_id,
          start_datetime,
          end_datetime,
        });
      }

      logStep("Free booking created", { bookingId: booking?.id });

      // Send confirmation email for free consultation
      let emailSent = false;
      let emailError = null;
      try {
        const notificationResponse = await fetch(
          `${supabaseUrl}/functions/v1/lindsey-booking-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              booking_id: booking?.id,
              type: "free_consultation",
            }),
          }
        );
        const notifResult = await notificationResponse.json();
        emailSent = notifResult.email_sent === true;
        emailError = notifResult.lindsey_email_error || notifResult.customer_email_error || null;
        logStep("Free consultation notification result", { 
          emailSent, 
          emailError,
          fullResult: notifResult 
        });
      } catch (notifError) {
        // Log but don't fail the booking
        logStep("Notification error (non-fatal)", { error: String(notifError) });
        emailError = String(notifError);
      }

      return jsonResponse(200, { 
        success: true, 
        booking_id: booking?.id, 
        is_free: true,
        email_sent: emailSent,
        email_error: emailError,
      });
    }

    // ============================================================
    // PAY ON ARRIVAL: Skip payment when spa_payments_enabled = false
    // ============================================================
    if (!spaPaymentsEnabled || skip_payment === true) {
      logStep("Processing as pay-on-arrival (spa payments disabled)");
      
      const { data: bookingNumber } = await supabase.rpc("generate_booking_number");
      const servicePrice = Number(price);

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          business_id: business.id,
          bookable_type_id: bookableType.id,
          start_datetime,
          end_datetime,
          status: "confirmed", // Immediately confirmed
          subtotal: servicePrice,
          total_amount: servicePrice,
          booking_number: bookingNumber || `SPA-${Date.now()}`,
          guest_name: customer_name.trim(),
          guest_email: customer_email.trim(),
          guest_phone: customer_phone?.trim() || null,
          deposit_amount: 0, // No deposit collected
          balance_due: servicePrice, // Full amount due on arrival
          balance_due_date: start_datetime.split("T")[0],
          notes: `Service: ${service_name}, Duration: ${duration} min | Total: $${servicePrice} | Payment: Due on arrival (payments disabled at booking time)`,
        })
        .select("id")
        .single();

      if (bookingError) throw new Error(bookingError.message);

      // Attach room if provided
      if (room_id && booking) {
        await supabase.from("booking_resources").insert({
          booking_id: booking.id,
          resource_id: room_id,
          start_datetime,
          end_datetime,
        });
      }

      // Create payment record with pay_on_arrival status
      await supabase.from("payments").insert({
        booking_id: booking.id,
        amount: servicePrice,
        payment_type: "full",
        status: "pending", // Will be marked paid when customer arrives
        metadata: {
          payment_method: "pay_on_arrival",
          payments_enabled_at_booking: false,
          service_name,
          duration,
        },
      });

      logStep("Pay-on-arrival booking created", { bookingId: booking?.id, servicePrice });

      // Send confirmation email
      let emailSent = false;
      let emailError = null;
      try {
        const notificationResponse = await fetch(
          `${supabaseUrl}/functions/v1/lindsey-booking-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              booking_id: booking?.id,
              type: "pay_on_arrival",
            }),
          }
        );
        const notifResult = await notificationResponse.json();
        emailSent = notifResult.email_sent === true;
        emailError = notifResult.lindsey_email_error || notifResult.customer_email_error || null;
        logStep("Pay-on-arrival notification result", { emailSent, emailError });
      } catch (notifError) {
        logStep("Notification error (non-fatal)", { error: String(notifError) });
        emailError = String(notifError);
      }

      return jsonResponse(200, { 
        success: true, 
        booking_id: booking?.id,
        is_pay_on_arrival: true,
        service_price: servicePrice,
        balance_due: servicePrice,
        email_sent: emailSent,
        email_error: emailError,
      });
    }

    // ============================================================
    // NORMAL PAYMENT FLOW: $20 booking fee when payments enabled
    // ============================================================
    
    // Validate consent for paid bookings
    if (!consent_no_show_fee) {
      return jsonResponse(400, { error: "Consent to booking fee policy is required" });
    }

    // BOOKING FEE: Always charge $20 flat deposit
    const BOOKING_FEE = 20;
    const servicePrice = Number(price);
    const depositAmount = BOOKING_FEE;
    const balanceDue = Math.max(0, servicePrice - depositAmount);

    // Generate booking number
    const { data: bookingNumber, error: bnError } = await supabase.rpc("generate_booking_number");
    if (bnError) logStep("Booking number generation warning", { error: bnError });

    // Create pending booking with booking fee breakdown
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        business_id: business.id,
        bookable_type_id: bookableType.id,
        start_datetime,
        end_datetime,
        status: "pending",
        subtotal: servicePrice,
        total_amount: servicePrice,
        booking_number: bookingNumber || `SPA-${Date.now()}`,
        guest_name: customer_name.trim(),
        guest_email: customer_email.trim(),
        guest_phone: customer_phone?.trim() || null,
        deposit_amount: depositAmount,
        balance_due: balanceDue,
        balance_due_date: start_datetime.split("T")[0], // Due on appointment date
        notes: `Service: ${service_name}, Duration: ${duration} min | Service Price: $${servicePrice} | Booking Fee Paid: $${depositAmount} | Balance Due: $${balanceDue} | No-Show Fee Consent: ${consent_timestamp}`,
      })
      .select("id")
      .single();

    if (bookingError || !booking) throw new Error(bookingError?.message || "Failed to create booking");

    // Attach room if provided
    if (room_id) {
      const { error: brError } = await supabase.from("booking_resources").insert({
        booking_id: booking.id,
        resource_id: room_id,
        start_datetime,
        end_datetime,
      });
      if (brError) logStep("Room attachment warning", { error: brError });
    }

    // Create Stripe checkout for $20 booking fee only
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking Fee - ${service_name} (${duration} min)`,
              description: `$20 booking fee to hold your appointment. Applied toward your $${servicePrice} service. Remaining $${balanceDue} due at appointment.`,
              metadata: {
                booking_id: booking.id,
                service_id: service_id || "",
                duration: String(duration),
              },
            },
            unit_amount: depositAmount * 100, // $20 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customer_email.trim(),
      success_url: `${origin}/#/book-with-lindsey?booking=success&id=${booking.id}`,
      cancel_url: `${origin}/#/book-with-lindsey?booking=cancelled&id=${booking.id}`,
      metadata: {
        booking_id: booking.id,
        business_type: "spa",
        service_name,
        service_price: String(servicePrice),
        deposit_paid: String(depositAmount),
        balance_due: String(balanceDue),
        duration: String(duration),
        customer_phone: customer_phone?.trim() || "",
        appointment_datetime: start_datetime,
        consent_no_show_fee: "true",
        consent_timestamp: consent_timestamp || new Date().toISOString(),
      },
    });

    // Create pending payment record for booking fee
    const { error: payError } = await supabase.from("payments").insert({
      booking_id: booking.id,
      amount: depositAmount,
      payment_type: "deposit",
      status: "pending",
      stripe_payment_intent_id: session.payment_intent as string,
      metadata: {
        checkout_session_id: session.id,
        service_name,
        service_price: servicePrice,
        deposit_paid: depositAmount,
        balance_due: balanceDue,
        duration,
        consent_no_show_fee: true,
        consent_timestamp: consent_timestamp || new Date().toISOString(),
      },
    });
    if (payError) logStep("Payment insert warning", { error: payError });

    logStep("Checkout session created", { 
      bookingId: booking.id, 
      sessionId: session.id,
      servicePrice,
      depositAmount,
      balanceDue,
    });
    
    return jsonResponse(200, { 
      url: session.url, 
      booking_id: booking.id, 
      session_id: session.id,
      service_price: servicePrice,
      deposit_paid: depositAmount,
      balance_due: balanceDue,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { msg });
    return jsonResponse(500, { error: msg });
  }
});
