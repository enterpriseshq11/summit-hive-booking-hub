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

const LINDSEY_EMAIL = "lindsey@restoration-lounge.com";
const LINDSEY_PHONE = "+15673796340"; // For future SMS
const FROM_EMAIL = "Restoration Lounge by A-Z <onboarding@resend.dev>";
const BUSINESS_ADDRESS = "123 Main St, Wapakoneta, OH 45895";
const BUSINESS_HOURS = "By Appointment Only";

interface BookingNotificationRequest {
  booking_id: string;
  type: "confirmed" | "cancelled" | "reminder";
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

    const { booking_id, type }: BookingNotificationRequest = await req.json();
    logStep("Request received", { booking_id, type });

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
      status: booking.status 
    });

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
    const roomName = booking.booking_resources?.[0]?.resources?.name || "To be assigned";

    // Get add-ons if any
    const addons = booking.booking_addons?.map((ba: { addons: { name: string } }) => ba.addons?.name).filter(Boolean) || [];

    // Get payment info
    const payment = booking.payments?.find((p: { status: string }) => p.status === "completed");
    const amountPaid = payment?.amount || booking.total_amount || 0;

    if (type === "confirmed") {
      // ============= EMAIL TO LINDSEY =============
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
        <strong>💰 Payment Received: $${amountPaid.toFixed(2)}</strong>
      </div>
      
      <h2 style="margin-top: 0;">Appointment Details</h2>
      <table class="info-table">
        <tr><td>📅 Date</td><td><strong>${dateStr}</strong></td></tr>
        <tr><td>⏰ Time</td><td><strong>${startTimeStr} - ${endTimeStr}</strong></td></tr>
        <tr><td>🧘 Service</td><td>${serviceName}</td></tr>
        <tr><td>⏱️ Duration</td><td>${duration} minutes</td></tr>
        <tr><td>🚪 Room</td><td>${roomName}</td></tr>
        ${addons.length > 0 ? `<tr><td>✨ Add-ons</td><td>${addons.join(", ")}</td></tr>` : ""}
      </table>

      <h2>Client Information</h2>
      <table class="info-table">
        <tr><td>👤 Name</td><td><strong>${booking.guest_name}</strong></td></tr>
        <tr><td>📧 Email</td><td><a href="mailto:${booking.guest_email}">${booking.guest_email}</a></td></tr>
        ${booking.guest_phone ? `<tr><td>📱 Phone</td><td><a href="tel:${booking.guest_phone}">${booking.guest_phone}</a></td></tr>` : ""}
      </table>

      ${booking.internal_notes ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 4px; margin-top: 15px;">
          <strong>📝 Notes:</strong>
          <p style="margin: 5px 0 0 0;">${booking.internal_notes}</p>
        </div>
      ` : ""}

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

      // ============= EMAIL TO CUSTOMER =============
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
    .detail-row { display: flex; margin: 10px 0; }
    .detail-label { width: 100px; color: #666; }
    .detail-value { font-weight: bold; }
    .location-box { background: #edf2f7; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    .cta-button { display: inline-block; background: #d4af37; color: #0a0a0a; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 4px; }
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
          <tr><td style="padding: 8px 0; color: #666;">Time:</td><td style="padding: 8px 0; font-weight: bold;">${startTimeStr} - ${endTimeStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Duration:</td><td style="padding: 8px 0; font-weight: bold;">${duration} minutes</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Room:</td><td style="padding: 8px 0; font-weight: bold;">${roomName}</td></tr>
          ${addons.length > 0 ? `<tr><td style="padding: 8px 0; color: #666;">Add-ons:</td><td style="padding: 8px 0;">${addons.join(", ")}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #666;">Amount Paid:</td><td style="padding: 8px 0; font-weight: bold; color: #48bb78;">$${amountPaid.toFixed(2)}</td></tr>
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
        <p style="font-size: 18px;"><a href="tel:+15673796340">(567) 379-6340</a></p>
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

      // Send both emails
      const [lindseyResult, customerResult] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: [LINDSEY_EMAIL],
          subject: `✅ New PAID Booking – ${serviceName} – ${dateStr} at ${startTimeStr}`,
          html: lindseyEmailHtml,
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: [booking.guest_email],
          subject: `Your Appointment is Confirmed – ${dateStr}`,
          html: customerEmailHtml,
        }),
      ]);

      logStep("Emails sent", {
        lindseyEmailId: lindseyResult.data?.id,
        customerEmailId: customerResult.data?.id,
      });

      return new Response(
        JSON.stringify({
          success: true,
          lindsey_email_id: lindseyResult.data?.id,
          customer_email_id: customerResult.data?.id,
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
