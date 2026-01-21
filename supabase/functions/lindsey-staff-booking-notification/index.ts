import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[LINDSEY-STAFF-SMS] ${step}${detailsStr}`);
};

interface LindseyStaffBookingNotificationRequest {
  booking_id: string;
  type: "confirmed";
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

const formatMoney = (v?: number | null) => `$${Number(v ?? 0).toFixed(2)}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend keys are not set");

    const payload: LindseyStaffBookingNotificationRequest = await req.json();
    const { booking_id } = payload;
    logStep("Request received", { booking_id });

    // Load Lindsey's phone from secrets (NO hardcoded values)
    const lindseyPhone = Deno.env.get("LINDSEY_NOTIFY_PHONE");
    if (!lindseyPhone) {
      logStep("LINDSEY_NOTIFY_PHONE not configured - skipping SMS");
      return new Response(
        JSON.stringify({ success: true, sms_sent: false, sms_error: "Phone number not configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "booking_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Using REST directly is forbidden; we call the database via the platform client.
    // NOTE: We avoid importing any shared project files into functions.
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.2");
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        "id, status, start_datetime, end_datetime, guest_name, guest_phone, notes, deposit_amount, balance_due, total_amount",
      )
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      logStep("Booking fetch error", { error: bookingError });
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Duration: prefer parsed value from notes, fallback to datetime delta.
    const notesMatch = booking.notes?.match(/Duration: (\d+)/);
    const durationMins = notesMatch
      ? Number(notesMatch[1])
      : Math.max(0, Math.round((new Date(booking.end_datetime).getTime() - new Date(booking.start_datetime).getTime()) / 60000));

    const startDate = new Date(booking.start_datetime);
    const dateStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const deposit = booking.deposit_amount ?? 0;
    const dueOnArrival = booking.balance_due ?? Math.max(0, Number(booking.total_amount ?? 0) - Number(deposit));

    const sms = `NEW LINDSEY BOOKING\n${dateStr} @ ${timeStr} • ${durationMins} min\nName: ${booking.guest_name || "(no name)"} • Phone: ${booking.guest_phone || "(no phone)"}\nDeposit: ${formatMoney(deposit)} • Due on arrival: ${formatMoney(dueOnArrival)}`;

    const smsResult = await sendSMS(lindseyPhone, sms);

    return new Response(
      JSON.stringify({
        success: true,
        sms_sent: smsResult.success,
        sms_sid: smsResult.sid,
        sms_error: smsResult.error,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
