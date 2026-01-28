import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[LINDSEY-NOTIFICATION] ${step}${detailsStr}`);
};

// Provider settings - Lindsey
// IMPORTANT: Staff inbox uses @a-zenterpriseshq.com (with hyphen)
// FROM/sender uses @azenterpriseshq.com (no hyphen, verified in Resend)
const LINDSEY_EMAIL = "lindsey@a-zenterpriseshq.com";
const LINDSEY_PHONE = "+15676441019";
const FROM_EMAIL = "A-Z Enterprises <no-reply@azenterpriseshq.com>";
const REPLY_TO_EMAIL = "info@azenterpriseshq.com";
const BUSINESS_ADDRESS = "123 Main St, Wapakoneta, OH 45895";

const formatMoney = (v?: number | null) => `$${Number(v ?? 0).toFixed(2)}`;

interface BookingNotificationRequest {
  booking_id: string;
  type: "confirmed" | "cancelled" | "reminder" | "free_consultation" | "pay_on_arrival";
  stripe_session_id?: string;
  stripe_payment_intent?: string;
}

// SMS via Twilio (only if env vars are set)
async function sendSMS(to: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  // Backwards compatible env var support
  const fromPhone = Deno.env.get("TWILIO_FROM_NUMBER") || Deno.env.get("TWILIO_PHONE_NUMBER");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

  // Skip SMS if Twilio not configured
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
        ...(messagingServiceSid ? { MessagingServiceSid: messagingServiceSid } : { From: fromPhone! }),
        Body: message,
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      logStep("SMS sent successfully", { sid: result.sid });
      return { success: true, sid: result.sid };
    } else {
      logStep("SMS send failed", { error: result.message });
      return { success: false, error: result.message };
    }
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
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend keys are not set");

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const resend = new Resend(resendKey);

    const { booking_id, type, stripe_session_id, stripe_payment_intent }: BookingNotificationRequest = await req.json();
    logStep("Request received", { booking_id, type, stripe_session_id });

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "booking_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch full booking details with resources
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        booking_resources(*, resources(*)),
        booking_addons(*, addons(*)),
        payments(*)
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

    logStep("Booking fetched", { 
      guest_name: booking.guest_name, 
      guest_email: booking.guest_email,
      guest_phone: booking.guest_phone,
      status: booking.status 
    });

    // Idempotency: if webhook retries, don't double-send.
    const alreadySentCustomer = !!booking.email_sent_customer_at;
    const alreadySentStaff = !!booking.email_sent_staff_at;

    // Parse service details from notes
    const notesMatch = booking.notes?.match(/Service: ([^,]+), Duration: (\d+)/);
    const serviceName = notesMatch ? notesMatch[1] : "Massage Therapy";
    const duration = notesMatch ? notesMatch[2] : "60";

    // Format date/time
    const startDate = new Date(booking.start_datetime);
    const endDate = new Date(booking.end_datetime);
    const dateStr = startDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const shortDateStr = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const startTimeStr = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endTimeStr = endDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Get room name if assigned
    const roomName = booking.booking_resources?.[0]?.resources?.name || "TBD";

    // Get add-ons if any
    const addons = booking.booking_addons?.map((ba: { addons: { name: string } }) => ba.addons?.name).filter(Boolean) || [];
    const addonsStr = addons.length > 0 ? addons.join(", ") : "None";

    // Get payment info
    const payment = booking.payments?.find((p: { status: string }) => p.status === "completed");
    const totalAmount = Number(booking.total_amount || 0);
    const depositAmount = Number(booking.deposit_amount || 0);
    const dueOnArrival = Number(booking.balance_due ?? Math.max(0, totalAmount - depositAmount));
    const amountPaid = Number(payment?.amount ?? depositAmount ?? 0);

    // Stripe reference
    const stripeRef = stripe_payment_intent || stripe_session_id || payment?.stripe_payment_intent_id || booking.booking_number || booking.id.slice(0, 8).toUpperCase();

    // ============= PAID BOOKING =============
    if (type === "confirmed") {
      // Only send after payment-confirmed statuses
      const allowedStatuses = new Set(["deposit_paid", "confirmed"]);
      if (!allowedStatuses.has(String(booking.status || ""))) {
        logStep("Skip send - booking not in confirmed status", { status: booking.status });
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "booking_not_confirmed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // If both already sent, return idempotent success.
      if (alreadySentCustomer && alreadySentStaff) {
        logStep("Skip send - already sent", { booking_id });
        return new Response(
          JSON.stringify({ success: true, email_sent: true, duplicate: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const customerSubject = `Your Massage is Confirmed — ${shortDateStr} at ${startTimeStr}`;
      const staffSubject = `New Lindsey Booking Confirmed — ${booking.guest_name} — ${shortDateStr} ${startTimeStr}`;

      const smsMessage = `NEW PAID BOOKING ✅
${serviceName} — ${duration}min
${shortDateStr} at ${startTimeStr}–${endTimeStr}
Room: ${roomName}
Client: ${booking.guest_name} (${booking.guest_phone || "no phone"})
Add-ons: ${addonsStr}
Paid: $${amountPaid.toFixed(2)}
Ref: ${stripeRef}`;

      const smsResult = await sendSMS(LINDSEY_PHONE, smsMessage);

      const lindseyEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2d3748; padding: 20px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; font-size: 20px; }
    .badge { display: inline-block; background: #48bb78; color: white; padding: 4px 12px; font-size: 12px; font-weight: bold; border-radius: 4px; }
    .content { padding: 20px; background: #ffffff; }
    .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .info-table td { padding: 10px; border-bottom: 1px solid #eee; }
    .info-table td:first-child { font-weight: bold; width: 140px; color: #666; }
    .highlight { background: #f0fff4; border-left: 4px solid #48bb78; padding: 15px; margin: 15px 0; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">💳 PAID BOOKING</span>
      <h1 style="margin-top: 10px;">New Appointment Confirmed</h1>
    </div>
    <div class="content">
       <div class="highlight">
         <strong>💰 Payment Confirmed</strong><br>
         <span style="font-size: 12px; color: #666;">Status: ${String(booking.status || "confirmed").toUpperCase()} | Ref: ${stripeRef}</span>
       </div>
      
      <h2 style="margin-top: 0;">Appointment Details</h2>
      <table class="info-table">
        <tr><td>📅 Date</td><td><strong>${dateStr}</strong></td></tr>
        <tr><td>⏰ Time</td><td><strong>${startTimeStr} – ${endTimeStr}</strong></td></tr>
        <tr><td>🧘 Service</td><td>${serviceName}</td></tr>
        <tr><td>⏱️ Duration</td><td>${duration} minutes</td></tr>
        <tr><td>🚪 Room</td><td>${roomName}</td></tr>
        <tr><td>✨ Add-ons</td><td>${addonsStr}</td></tr>
      </table>

      <h2>Client Information</h2>
      <table class="info-table">
        <tr><td>👤 Name</td><td><strong>${booking.guest_name}</strong></td></tr>
        <tr><td>📧 Email</td><td><a href="mailto:${booking.guest_email}">${booking.guest_email}</a></td></tr>
        <tr><td>📱 Phone</td><td>${booking.guest_phone ? `<a href="tel:${booking.guest_phone}">${booking.guest_phone}</a>` : "Not provided"}</td></tr>
      </table>

      <h2>Payment</h2>
      <table class="info-table">
         <tr><td>💵 Total</td><td><strong>${formatMoney(totalAmount)}</strong></td></tr>
         <tr><td>💳 Deposit Paid</td><td><strong style="color: #48bb78;">${formatMoney(amountPaid)}</strong></td></tr>
         <tr><td>🏁 Due on Arrival</td><td><strong>${formatMoney(dueOnArrival)}</strong></td></tr>
         <tr><td>✅ Status</td><td>${String(booking.status || "confirmed").toUpperCase()}</td></tr>
        <tr><td>🔗 Stripe Ref</td><td><code style="background: #f0f0f0; padding: 2px 6px; font-size: 12px;">${stripeRef}</code></td></tr>
      </table>

      ${booking.internal_notes ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 4px; margin-top: 15px;">
          <strong>📝 Notes:</strong>
          <p style="margin: 5px 0 0 0;">${booking.internal_notes}</p>
        </div>
      ` : ""}

      <div style="background: #e6fffa; padding: 15px; border-radius: 4px; margin-top: 15px; text-align: center;">
        <strong>📅 This appointment has been added to your schedule.</strong><br>
        <span style="font-size: 13px; color: #666;">The time slot is now blocked and no longer bookable.</span>
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        Booking #${booking.booking_number || booking.id.slice(0, 8).toUpperCase()}<br>
        <a href="https://summit-hive-booking-hub.lovable.app/#/admin/schedule">View in Admin Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>Restoration Lounge | A-Z Enterprises</p>
    </div>
  </div>
</body>
</html>`;

      const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2d3748; padding: 30px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; background: #ffffff; }
    .success-badge { display: inline-block; background: #48bb78; color: white; padding: 8px 20px; font-size: 14px; font-weight: bold; border-radius: 20px; margin-bottom: 20px; }
    .appointment-box { background: #f8f6f0; border: 2px solid #d4af37; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-box h3 { margin: 0 0 15px 0; color: #2d3748; }
    .location-box { background: #edf2f7; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Restoration Lounge</h1>
      <p style="color: #a0aec0; margin: 5px 0 0 0;">by A-Z Enterprises</p>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="success-badge">✓ Payment Confirmed</span>
        <h2 style="margin: 10px 0;">Your Appointment is Booked!</h2>
      </div>
      
      <p>Hi ${booking.guest_name?.split(" ")[0] || "there"},</p>
      <p>Great news! Your massage appointment with Lindsey has been confirmed. Here are your details:</p>

      <div class="appointment-box">
        <h3>📅 Appointment Details</h3>
        <table style="width: 100%;">
          <tr><td style="padding: 8px 0; color: #666;">Service:</td><td style="padding: 8px 0; font-weight: bold;">${serviceName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; font-weight: bold;">${dateStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Time:</td><td style="padding: 8px 0; font-weight: bold;">${startTimeStr} – ${endTimeStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Duration:</td><td style="padding: 8px 0; font-weight: bold;">${duration} minutes</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Room:</td><td style="padding: 8px 0; font-weight: bold;">${roomName}</td></tr>
          ${addons.length > 0 ? `<tr><td style="padding: 8px 0; color: #666;">Add-ons:</td><td style="padding: 8px 0;">${addons.join(", ")}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #666;">Total:</td><td style="padding: 8px 0; font-weight: bold;">${formatMoney(totalAmount)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Deposit Paid:</td><td style="padding: 8px 0; font-weight: bold; color: #48bb78;">${formatMoney(amountPaid)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Due on Arrival:</td><td style="padding: 8px 0; font-weight: bold;">${formatMoney(dueOnArrival)}</td></tr>
        </table>
      </div>

      <div class="location-box">
        <strong>📍 Location</strong>
        <p style="margin: 10px 0 0 0;">
          Restoration Lounge at The Hive<br>
          ${BUSINESS_ADDRESS}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          Please arrive 5-10 minutes early. Free parking is available on-site.
        </p>
      </div>

      <h3>Before Your Appointment</h3>
      <ul style="padding-left: 20px;">
        <li>Drink plenty of water</li>
        <li>Avoid heavy meals 1-2 hours before</li>
        <li>Wear comfortable, loose-fitting clothing</li>
        <li>Communicate any health conditions or preferences to Lindsey</li>
      </ul>

      <h3>Cancellation Policy</h3>
      <p style="font-size: 14px; color: #666;">
        We kindly request 24 hours notice for cancellations. Late cancellations or no-shows may forfeit the deposit.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <p>Questions? Contact us:</p>
        <p style="font-size: 18px;"><a href="tel:+15676441090">(567) 644-1090</a></p>
      </div>

      <p style="margin-top: 30px;">
        We look forward to seeing you!<br><br>
        <strong>Lindsey</strong><br>
        Restoration Lounge
      </p>
    </div>
    <div class="footer">
      <p>Booking Confirmation #${booking.booking_number || booking.id.slice(0, 8).toUpperCase()}</p>
      <p>Restoration Lounge | A-Z Enterprises | Wapakoneta, Ohio</p>
    </div>
  </div>
</body>
</html>`;

      // Detailed logging before email send
      logStep("Sending paid booking emails", {
        provider: "Resend",
        from: FROM_EMAIL,
        lindseyRecipient: LINDSEY_EMAIL,
        customerRecipient: booking.guest_email,
      });

      const [lindseyResult, customerResult] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          reply_to: REPLY_TO_EMAIL,
          to: [LINDSEY_EMAIL],
          subject: staffSubject,
          html: lindseyEmailHtml,
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          reply_to: REPLY_TO_EMAIL,
          to: [booking.guest_email],
          subject: customerSubject,
          html: customerEmailHtml,
        }),
      ]);

      const emailSuccess = !!(lindseyResult.data?.id || customerResult.data?.id);

      logStep("Paid booking emails result", {
        lindseyEmailId: lindseyResult.data?.id,
        lindseyError: lindseyResult.error,
        customerEmailId: customerResult.data?.id,
        customerError: customerResult.error,
        success: emailSuccess,
      });

      // Persist idempotency markers (best-effort, prevents duplicates on webhook retry)
      const now = new Date().toISOString();
      if (customerResult.data?.id && !alreadySentCustomer) {
        await supabase
          .from("bookings")
          .update({ email_sent_customer_at: now })
          .eq("id", booking_id)
          .is("email_sent_customer_at", null);
      }
      if (lindseyResult.data?.id && !alreadySentStaff) {
        await supabase
          .from("bookings")
          .update({ email_sent_staff_at: now })
          .eq("id", booking_id)
          .is("email_sent_staff_at", null);
      }

      return new Response(
        JSON.stringify({
          success: true,
          email_sent: emailSuccess,
          lindsey_email_id: lindseyResult.data?.id,
          lindsey_email_error: lindseyResult.error,
          customer_email_id: customerResult.data?.id,
          customer_email_error: customerResult.error,
          sms_sent: smsResult.success,
          sms_sid: smsResult.sid,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============= FREE CONSULTATION =============
    if (type === "free_consultation") {
      logStep("Processing free consultation notification");

      const smsMessage = `NEW FREE CONSULTATION 📋
${serviceName} — ${duration}min
${shortDateStr} at ${startTimeStr}–${endTimeStr}
Room: ${roomName}
Client: ${booking.guest_name} (${booking.guest_phone || "no phone"})
Ref: ${booking.booking_number || booking.id.slice(0, 8).toUpperCase()}`;

      const smsResult = await sendSMS(LINDSEY_PHONE, smsMessage);

      // Email to Lindsey for free consultation
      const lindseyEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2d3748; padding: 20px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; font-size: 20px; }
    .badge { display: inline-block; background: #3182ce; color: white; padding: 4px 12px; font-size: 12px; font-weight: bold; border-radius: 4px; }
    .content { padding: 20px; background: #ffffff; }
    .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .info-table td { padding: 10px; border-bottom: 1px solid #eee; }
    .info-table td:first-child { font-weight: bold; width: 140px; color: #666; }
    .highlight { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 15px 0; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">📋 FREE CONSULTATION</span>
      <h1 style="margin-top: 10px;">New Consultation Scheduled</h1>
    </div>
    <div class="content">
      <div class="highlight">
        <strong>Complimentary Consultation</strong><br>
        <span style="font-size: 12px; color: #666;">No payment required</span>
      </div>
      
      <h2 style="margin-top: 0;">Appointment Details</h2>
      <table class="info-table">
        <tr><td>📅 Date</td><td><strong>${dateStr}</strong></td></tr>
        <tr><td>⏰ Time</td><td><strong>${startTimeStr} – ${endTimeStr}</strong></td></tr>
        <tr><td>🧘 Service</td><td>${serviceName}</td></tr>
        <tr><td>⏱️ Duration</td><td>${duration} minutes</td></tr>
        <tr><td>🚪 Room</td><td>${roomName}</td></tr>
      </table>

      <h2>Client Information</h2>
      <table class="info-table">
        <tr><td>👤 Name</td><td><strong>${booking.guest_name}</strong></td></tr>
        <tr><td>📧 Email</td><td><a href="mailto:${booking.guest_email}">${booking.guest_email}</a></td></tr>
        <tr><td>📱 Phone</td><td>${booking.guest_phone ? `<a href="tel:${booking.guest_phone}">${booking.guest_phone}</a>` : "Not provided"}</td></tr>
      </table>

      <div style="background: #e6fffa; padding: 15px; border-radius: 4px; margin-top: 15px; text-align: center;">
        <strong>📅 This consultation has been added to your schedule.</strong><br>
        <span style="font-size: 13px; color: #666;">The time slot is now blocked and no longer bookable.</span>
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        Booking #${booking.booking_number || booking.id.slice(0, 8).toUpperCase()}<br>
        <a href="https://summit-hive-booking-hub.lovable.app/#/admin/schedule">View in Admin Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>Restoration Lounge | A-Z Enterprises</p>
    </div>
  </div>
</body>
</html>`;

      // Email to customer for free consultation
      const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2d3748; padding: 30px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; background: #ffffff; }
    .success-badge { display: inline-block; background: #3182ce; color: white; padding: 8px 20px; font-size: 14px; font-weight: bold; border-radius: 20px; margin-bottom: 20px; }
    .appointment-box { background: #f8f6f0; border: 2px solid #d4af37; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-box h3 { margin: 0 0 15px 0; color: #2d3748; }
    .location-box { background: #edf2f7; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Restoration Lounge</h1>
      <p style="color: #a0aec0; margin: 5px 0 0 0;">by A-Z Enterprises</p>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="success-badge">✓ Consultation Confirmed</span>
        <h2 style="margin: 10px 0;">Your Consultation is Scheduled!</h2>
      </div>
      
      <p>Hi ${booking.guest_name?.split(" ")[0] || "there"},</p>
      <p>Thank you for scheduling a consultation with Lindsey! Here are your details:</p>

      <div class="appointment-box">
        <h3>📅 Consultation Details</h3>
        <table style="width: 100%;">
          <tr><td style="padding: 8px 0; color: #666;">Service:</td><td style="padding: 8px 0; font-weight: bold;">${serviceName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; font-weight: bold;">${dateStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Time:</td><td style="padding: 8px 0; font-weight: bold;">${startTimeStr} – ${endTimeStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Duration:</td><td style="padding: 8px 0; font-weight: bold;">${duration} minutes</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Room:</td><td style="padding: 8px 0; font-weight: bold;">${roomName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Cost:</td><td style="padding: 8px 0; font-weight: bold; color: #3182ce;">Complimentary</td></tr>
        </table>
      </div>

      <div class="location-box">
        <strong>📍 Location</strong>
        <p style="margin: 10px 0 0 0;">
          Restoration Lounge at The Hive<br>
          ${BUSINESS_ADDRESS}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          Please arrive 5 minutes early. Free parking is available on-site.
        </p>
      </div>

      <h3>What to Expect</h3>
      <p style="font-size: 14px;">
        During your consultation, Lindsey will discuss your needs, answer any questions, 
        and help determine the best treatment plan for you. This is a great opportunity to 
        share any health concerns or preferences before your first massage session.
      </p>

      <h3>Need to Reschedule?</h3>
      <p style="font-size: 14px; color: #666;">
        Please give us at least 24 hours notice if you need to change your appointment time.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <p>Questions? Contact us:</p>
        <p style="font-size: 18px;"><a href="tel:+15676441090">(567) 644-1090</a></p>
      </div>

      <p style="margin-top: 30px;">
        Looking forward to meeting you!<br><br>
        <strong>Lindsey</strong><br>
        Restoration Lounge
      </p>
    </div>
    <div class="footer">
      <p>Booking Confirmation #${booking.booking_number || booking.id.slice(0, 8).toUpperCase()}</p>
      <p>Restoration Lounge | A-Z Enterprises | Wapakoneta, Ohio</p>
    </div>
  </div>
</body>
</html>`;

      // Detailed logging before email send
      logStep("Sending free consultation emails", {
        provider: "Resend",
        from: FROM_EMAIL,
        lindseyRecipient: LINDSEY_EMAIL,
        customerRecipient: booking.guest_email,
        bookingId: booking_id,
      });

      const [lindseyResult, customerResult] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          reply_to: REPLY_TO_EMAIL,
          to: [LINDSEY_EMAIL],
          subject: `📋 New Free Consultation – ${serviceName} – ${dateStr} at ${startTimeStr}`,
          html: lindseyEmailHtml,
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          reply_to: REPLY_TO_EMAIL,
          to: [booking.guest_email],
          subject: `Your Consultation is Confirmed – ${dateStr}`,
          html: customerEmailHtml,
        }),
      ]);

      const emailSuccess = !!(lindseyResult.data?.id || customerResult.data?.id);

      logStep("Free consultation emails result", {
        lindseyEmailId: lindseyResult.data?.id,
        lindseyError: lindseyResult.error,
        customerEmailId: customerResult.data?.id,
        customerError: customerResult.error,
        success: emailSuccess,
      });

      return new Response(
        JSON.stringify({
          success: true,
          email_sent: emailSuccess,
          lindsey_email_id: lindseyResult.data?.id,
          lindsey_email_error: lindseyResult.error,
          customer_email_id: customerResult.data?.id,
          customer_email_error: customerResult.error,
          sms_sent: smsResult.success,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============= PAY ON ARRIVAL BOOKING =============
    if (type === "pay_on_arrival") {
      logStep("Processing pay-on-arrival notification");

      const smsMessage = `NEW PAY ON ARRIVAL 💳
${serviceName} — ${duration}min
${shortDateStr} at ${startTimeStr}–${endTimeStr}
Room: ${roomName}
Client: ${booking.guest_name} (${booking.guest_phone || "no phone"})
Add-ons: ${addonsStr}
Amount Due: $${totalAmount.toFixed(2)}
Ref: ${booking.booking_number || booking.id.slice(0, 8).toUpperCase()}`;

      const smsResult = await sendSMS(LINDSEY_PHONE, smsMessage);

      // Email to Lindsey for pay-on-arrival booking
      const lindseyEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2d3748; padding: 20px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; font-size: 20px; }
    .badge { display: inline-block; background: #ed8936; color: white; padding: 4px 12px; font-size: 12px; font-weight: bold; border-radius: 4px; }
    .content { padding: 20px; background: #ffffff; }
    .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .info-table td { padding: 10px; border-bottom: 1px solid #eee; }
    .info-table td:first-child { font-weight: bold; width: 140px; color: #666; }
    .highlight { background: #fffaf0; border-left: 4px solid #ed8936; padding: 15px; margin: 15px 0; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">💳 PAY ON ARRIVAL</span>
      <h1 style="margin-top: 10px;">New Appointment Booked</h1>
    </div>
    <div class="content">
      <div class="highlight">
        <strong>⚠️ Payment Due on Arrival</strong><br>
        <span style="font-size: 12px; color: #666;">No deposit collected — full payment: ${formatMoney(totalAmount)}</span>
      </div>
      
      <h2 style="margin-top: 0;">Appointment Details</h2>
      <table class="info-table">
        <tr><td>📅 Date</td><td><strong>${dateStr}</strong></td></tr>
        <tr><td>⏰ Time</td><td><strong>${startTimeStr} – ${endTimeStr}</strong></td></tr>
        <tr><td>🧘 Service</td><td>${serviceName}</td></tr>
        <tr><td>⏱️ Duration</td><td>${duration} minutes</td></tr>
        <tr><td>🚪 Room</td><td>${roomName}</td></tr>
        <tr><td>✨ Add-ons</td><td>${addonsStr}</td></tr>
      </table>

      <h2>Client Information</h2>
      <table class="info-table">
        <tr><td>👤 Name</td><td><strong>${booking.guest_name}</strong></td></tr>
        <tr><td>📧 Email</td><td><a href="mailto:${booking.guest_email}">${booking.guest_email}</a></td></tr>
        <tr><td>📱 Phone</td><td>${booking.guest_phone ? `<a href="tel:${booking.guest_phone}">${booking.guest_phone}</a>` : "Not provided"}</td></tr>
      </table>

      <h2>Payment</h2>
      <table class="info-table">
        <tr><td>💵 Total Due</td><td><strong style="color: #ed8936;">${formatMoney(totalAmount)}</strong></td></tr>
        <tr><td>✅ Status</td><td>PAY ON ARRIVAL</td></tr>
      </table>

      ${booking.internal_notes ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 4px; margin-top: 15px;">
          <strong>📝 Notes:</strong>
          <p style="margin: 5px 0 0 0;">${booking.internal_notes}</p>
        </div>
      ` : ""}

      <div style="background: #e6fffa; padding: 15px; border-radius: 4px; margin-top: 15px; text-align: center;">
        <strong>📅 This appointment has been added to your schedule.</strong><br>
        <span style="font-size: 13px; color: #666;">The time slot is now blocked and no longer bookable.</span>
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        Booking #${booking.booking_number || booking.id.slice(0, 8).toUpperCase()}<br>
        <a href="https://summit-hive-booking-hub.lovable.app/#/admin/schedule">View in Admin Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>Restoration Lounge | A-Z Enterprises</p>
    </div>
  </div>
</body>
</html>`;

      // Email to customer for pay-on-arrival booking
      const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2d3748; padding: 30px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; background: #ffffff; }
    .success-badge { display: inline-block; background: #48bb78; color: white; padding: 8px 20px; font-size: 14px; font-weight: bold; border-radius: 20px; margin-bottom: 20px; }
    .appointment-box { background: #f8f6f0; border: 2px solid #d4af37; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-box h3 { margin: 0 0 15px 0; color: #2d3748; }
    .payment-box { background: #fffaf0; border: 2px solid #ed8936; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .location-box { background: #edf2f7; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Restoration Lounge</h1>
      <p style="color: #a0aec0; margin: 5px 0 0 0;">by A-Z Enterprises</p>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="success-badge">✓ Appointment Confirmed</span>
        <h2 style="margin: 10px 0;">Your Appointment is Booked!</h2>
      </div>
      
      <p>Hi ${booking.guest_name?.split(" ")[0] || "there"},</p>
      <p>Great news! Your massage appointment with Lindsey has been confirmed. Here are your details:</p>

      <div class="appointment-box">
        <h3>📅 Appointment Details</h3>
        <table style="width: 100%;">
          <tr><td style="padding: 8px 0; color: #666;">Service:</td><td style="padding: 8px 0; font-weight: bold;">${serviceName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; font-weight: bold;">${dateStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Time:</td><td style="padding: 8px 0; font-weight: bold;">${startTimeStr} – ${endTimeStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Duration:</td><td style="padding: 8px 0; font-weight: bold;">${duration} minutes</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Room:</td><td style="padding: 8px 0; font-weight: bold;">${roomName}</td></tr>
          ${addons.length > 0 ? `<tr><td style="padding: 8px 0; color: #666;">Add-ons:</td><td style="padding: 8px 0;">${addons.join(", ")}</td></tr>` : ""}
        </table>
      </div>

      <div class="payment-box">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Amount Due on Arrival</p>
        <p style="margin: 0; font-size: 32px; font-weight: bold; color: #ed8936;">${formatMoney(totalAmount)}</p>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">We accept cash, credit, and debit cards</p>
      </div>

      <div class="location-box">
        <strong>📍 Location</strong>
        <p style="margin: 10px 0 0 0;">
          Restoration Lounge at The Hive<br>
          ${BUSINESS_ADDRESS}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          Please arrive 5-10 minutes early. Free parking is available on-site.
        </p>
      </div>

      <h3>Before Your Appointment</h3>
      <ul style="padding-left: 20px;">
        <li>Drink plenty of water</li>
        <li>Avoid heavy meals 1-2 hours before</li>
        <li>Wear comfortable, loose-fitting clothing</li>
        <li>Communicate any health conditions or preferences to Lindsey</li>
      </ul>

      <h3>Cancellation Policy</h3>
      <p style="font-size: 14px; color: #666;">
        We kindly request 24 hours notice for cancellations. Late cancellations or no-shows may be subject to a cancellation fee.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <p>Questions? Contact us:</p>
        <p style="font-size: 18px;"><a href="tel:+15676441090">(567) 644-1090</a></p>
      </div>

      <p style="margin-top: 30px;">
        We look forward to seeing you!<br><br>
        <strong>Lindsey</strong><br>
        Restoration Lounge
      </p>
    </div>
    <div class="footer">
      <p>Booking Confirmation #${booking.booking_number || booking.id.slice(0, 8).toUpperCase()}</p>
      <p>Restoration Lounge | A-Z Enterprises | Wapakoneta, Ohio</p>
    </div>
  </div>
</body>
</html>`;

      // Detailed logging before email send
      logStep("Sending pay-on-arrival emails", {
        provider: "Resend",
        from: FROM_EMAIL,
        lindseyRecipient: LINDSEY_EMAIL,
        customerRecipient: booking.guest_email,
        bookingId: booking_id,
        totalDue: totalAmount,
      });

      const [lindseyResult, customerResult] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          reply_to: REPLY_TO_EMAIL,
          to: [LINDSEY_EMAIL],
          subject: `💳 New Pay-on-Arrival Booking – ${booking.guest_name} – ${shortDateStr} ${startTimeStr}`,
          html: lindseyEmailHtml,
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          reply_to: REPLY_TO_EMAIL,
          to: [booking.guest_email],
          subject: `Your Appointment is Confirmed – ${shortDateStr} at ${startTimeStr}`,
          html: customerEmailHtml,
        }),
      ]);

      const emailSuccess = !!(lindseyResult.data?.id || customerResult.data?.id);

      logStep("Pay-on-arrival emails result", {
        lindseyEmailId: lindseyResult.data?.id,
        lindseyError: lindseyResult.error,
        customerEmailId: customerResult.data?.id,
        customerError: customerResult.error,
        success: emailSuccess,
      });

      // Persist idempotency markers
      const now = new Date().toISOString();
      if (customerResult.data?.id) {
        await supabase
          .from("bookings")
          .update({ email_sent_customer_at: now })
          .eq("id", booking_id)
          .is("email_sent_customer_at", null);
      }
      if (lindseyResult.data?.id) {
        await supabase
          .from("bookings")
          .update({ email_sent_staff_at: now })
          .eq("id", booking_id)
          .is("email_sent_staff_at", null);
      }

      return new Response(
        JSON.stringify({
          success: true,
          email_sent: emailSuccess,
          lindsey_email_id: lindseyResult.data?.id,
          lindsey_email_error: lindseyResult.error,
          customer_email_id: customerResult.data?.id,
          customer_email_error: customerResult.error,
          sms_sent: smsResult.success,
          sms_sid: smsResult.sid,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle other notification types (cancelled, reminder) in future
    return new Response(JSON.stringify({ success: true, message: "No action for this type" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
