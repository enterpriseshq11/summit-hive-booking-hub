import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STAFF-BOOKING-NOTIFICATION] ${step}${detailsStr}`);
};

// 360 Photo Booth staff contact (Victoria)
const VICTORIA_PHONE = "+15673796340";

interface StaffBookingNotificationRequest {
  booking_id: string;
  type: "confirmed";
  business_type: "photo_booth";
  booking_status?: string;
  stripe_session_id?: string;
  stripe_payment_intent?: string;
}

async function sendSMS(
  to: string,
  message: string,
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromPhone = Deno.env.get("TWILIO_FROM_NUMBER") || Deno.env.get("TWILIO_PHONE_NUMBER");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

  if (!accountSid || !authToken || (!fromPhone && !messagingServiceSid)) {
    logStep("SMS skipped - Twilio not configured");
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        ...(messagingServiceSid
          ? { MessagingServiceSid: messagingServiceSid }
          : { From: fromPhone! }),
        Body: message,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      logStep("SMS sent successfully", { sid: result.sid });
      return { success: true, sid: result.sid };
    }

    logStep("SMS send failed", { error: result.message });
    return { success: false, error: result.message };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("SMS error", { error: msg });
    return { success: false, error: msg };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend keys are not set");

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const payload: StaffBookingNotificationRequest = await req.json();
    const { booking_id, business_type, booking_status, stripe_session_id, stripe_payment_intent } = payload;
    logStep("Request received", { booking_id, business_type, booking_status });

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "booking_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch booking + resources + completed payment (if any)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_number,
        status,
        start_datetime,
        end_datetime,
        total_amount,
        deposit_amount,
        guest_name,
        guest_phone,
        guest_email,
        notes,
        booking_resources(*, resources(name)),
        payments(id, status, amount, stripe_payment_intent_id)
      `)
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      logStep("Booking fetch error", { error: bookingError });
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startDate = new Date(booking.start_datetime);
    const endDate = new Date(booking.end_datetime);
    const dateStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const startTimeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const endTimeStr = endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const resourceName = booking.booking_resources?.[0]?.resources?.name || "(unassigned)";

    const completedPayment = booking.payments?.find((p: any) => p.status === "completed");
    const amountPaid = (completedPayment?.amount ?? booking.deposit_amount ?? 0) as number;
    const stripeRef =
      stripe_payment_intent ||
      stripe_session_id ||
      completedPayment?.stripe_payment_intent_id ||
      booking.booking_number ||
      booking.id.slice(0, 8).toUpperCase();

    // Derive duration in hours for readability
    const durationHours = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / (60 * 60 * 1000)));

    const sms = `360 PHOTO BOOTH BOOKED ✅
${dateStr} ${startTimeStr}–${endTimeStr} (${durationHours}h)
Resource: ${resourceName}
Client: ${booking.guest_name} (${booking.guest_phone || "no phone"})
Paid: $${Number(amountPaid).toFixed(2)} (${booking_status || booking.status || "paid"})
Ref: ${stripeRef}`;

    const smsResult = await sendSMS(VICTORIA_PHONE, sms);

    return new Response(JSON.stringify({
      success: true,
      sms_sent: smsResult.success,
      sms_sid: smsResult.sid,
      sms_error: smsResult.error,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});