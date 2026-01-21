import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[BOOKING-NOTIFICATION] ${step}${detailsStr}`);
};

// ============= CONFIGURATION (ENV-DRIVEN) =============
const BUSINESS_ADDRESS = "123 Main St, Wapakoneta, OH 45895";
const BUSINESS_PHONE = "(567) 644-1090";

// Staff contacts by business type (using verified domain: azenterpriseshq.com)
const STAFF_CONTACTS: Record<string, { email: string; phone: string; name: string }> = {
  spa: { email: "lindsey@azenterpriseshq.com", phone: "+15676441019", name: "Lindsey" },
  photo_booth: { email: "victoria@azenterpriseshq.com", phone: "+15673796340", name: "Victoria" },
  coworking: { email: "victoria@azenterpriseshq.com", phone: "+15673796340", name: "Victoria" },
  event_center: { email: "victoria@azenterpriseshq.com", phone: "+15673796340", name: "Victoria" },
  fitness: { email: "info@azenterpriseshq.com", phone: "+15673796340", name: "A-Z Team" },
  default: { email: "info@azenterpriseshq.com", phone: "+15673796340", name: "A-Z Team" },
};

const formatMoney = (v?: number | null) => `$${Number(v ?? 0).toFixed(2)}`;

function safeJson(value: unknown, maxLen = 2000): string {
  try {
    const str = JSON.stringify(value);
    if (str.length <= maxLen) return str;
    return `${str.slice(0, maxLen)}…(truncated)`;
  } catch {
    return "<unserializable>";
  }
}

interface NotificationRequest {
  booking_id: string;
  notification_type: "request" | "confirmation" | "reminder" | "cancellation" | "reschedule";
  reminder_type?: string;
  channels?: ("email" | "sms")[];
  recipients?: ("customer" | "staff")[];
  stripe_session_id?: string;
  stripe_payment_intent?: string;

  // Admin-only overrides for manual testing
  test_customer_email?: string;
  test_staff_email?: string;
}

// ============= SMS VIA TWILIO =============
async function sendSMS(to: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
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
        ...(messagingServiceSid ? { MessagingServiceSid: messagingServiceSid } : { From: fromPhone! }),
        Body: message,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      logStep("SMS sent", { sid: result.sid, to });
      return { success: true, sid: result.sid };
    }

    logStep("SMS failed", { error: result.message });
    return { success: false, error: result.message };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("SMS error", { error: msg });
    return { success: false, error: msg };
  }
}

// ============= LOG NOTIFICATION =============
async function logNotification(
  supabase: any,
  data: {
    booking_id: string;
    notification_type: string;
    channel: string;
    recipient_type: string;
    recipient_email?: string;
    recipient_phone?: string;
    subject?: string;
    status: string;
    provider?: string;
    provider_message_id?: string;
    error_message?: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await supabase.from("notification_logs").insert({
      ...data,
      sent_at: data.status === "sent" ? new Date().toISOString() : null,
    });
  } catch (e) {
    logStep("Failed to log notification", { error: String(e) });
  }
}

// ============= SCHEDULE REMINDERS =============
async function scheduleReminders(
  supabase: any,
  bookingId: string,
  startDatetime: string,
  opts: {
    recipientTypes: Array<"customer" | "staff">;
    reminderTypes: Array<"24h" | "2h" | "day_of_morning" | "1h">;
    timezone: string;
  }
) {
  const start = new Date(startDatetime);
  const now = new Date();

  // Helpers: timezone-aware date creation (no external deps)
  const getTzOffsetMs = (date: Date, timeZone: string) => {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(date);
    const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
    const asUTC = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second)
    );
    return asUTC - date.getTime();
  };

  const makeZonedTime = (
    y: number,
    m: number,
    d: number,
    hh: number,
    mm: number,
    ss: number,
    timeZone: string
  ) => {
    // Start with an approximate UTC time, then correct once using tz offset.
    const approx = new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
    const offset = getTzOffsetMs(approx, timeZone);
    return new Date(approx.getTime() - offset);
  };

  const startParts = new Intl.DateTimeFormat("en-US", {
    timeZone: opts.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(start);
  const partsMap = Object.fromEntries(startParts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  const y = Number(partsMap.year);
  const m = Number(partsMap.month);
  const d = Number(partsMap.day);

  const scheduleForType = (type: "24h" | "2h" | "day_of_morning" | "1h") => {
    if (type === "24h") return new Date(start.getTime() - 24 * 60 * 60 * 1000);
    if (type === "2h") return new Date(start.getTime() - 2 * 60 * 60 * 1000);
    if (type === "1h") return new Date(start.getTime() - 1 * 60 * 60 * 1000);
    // Morning-of at 9:00 AM local
    return makeZonedTime(y, m, d, 9, 0, 0, opts.timezone);
  };

  let scheduledCount = 0;
  for (const reminderType of opts.reminderTypes) {
    const scheduledFor = scheduleForType(reminderType);
    if (scheduledFor <= now) continue;

    for (const recipientType of opts.recipientTypes) {
      await supabase
        .from("scheduled_reminders")
        .upsert(
          {
            booking_id: bookingId,
            reminder_type: reminderType,
            recipient_type: recipientType,
            scheduled_for: scheduledFor.toISOString(),
            status: "pending",
          },
          { onConflict: "booking_id,reminder_type,recipient_type" }
        );
      scheduledCount++;
    }
  }

  logStep("Reminders scheduled", { bookingId, scheduledCount, reminderTypes: opts.reminderTypes, recipientTypes: opts.recipientTypes, timezone: opts.timezone });
}

// ============= EMAIL TEMPLATES =============
function getBusinessLabel(businessType: string): string {
  const labels: Record<string, string> = {
    spa: "Restoration Lounge",
    photo_booth: "360 Photo Booth",
    coworking: "The Hive by A-Z",
    summit: "The Summit",
    event_center: "Memory Maker Event Center",
    fitness: "A-Z Total Fitness",
    voice_vault: "Voice Vault",
  };
  return labels[businessType] || "A-Z Enterprises";
}

function normalizeSourceBrand(value: string | null | undefined, businessType: string): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  const map: Record<string, string> = {
    coworking: "hive",
    summit: "summit",
    event_center: "summit",
    photo_booth: "photo_booth_360",
    voice_vault: "voice_vault",
  };
  return map[businessType];
}

function sourceBrandLabel(sourceBrand: string | undefined, businessType: string): string {
  const map: Record<string, string> = {
    hive: "The Hive",
    summit: "The Summit",
    photo_booth_360: "360 Photo Booth",
    voice_vault: "Voice Vault",
  };
  return (sourceBrand && map[sourceBrand]) || getBusinessLabel(businessType);
}

function isVictoriaBrand(sourceBrand: string | undefined) {
  return sourceBrand === "hive" || sourceBrand === "summit" || sourceBrand === "photo_booth_360" || sourceBrand === "voice_vault";
}

function computeDurationMins(booking: Record<string, unknown>): number {
  try {
    const s = new Date(booking.start_datetime as string).getTime();
    const e = new Date(booking.end_datetime as string).getTime();
    if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return 0;
    return Math.round((e - s) / 60000);
  } catch {
    return 0;
  }
}

function describePayment(booking: Record<string, unknown>): string {
  const total = Number(booking.total_amount || 0);
  const deposit = Number(booking.deposit_amount || 0);
  const status = String(booking.status || "");

  if (total <= 0) return "Unpaid / request only";
  if (status === "confirmed") return "Paid";
  if (status === "deposit_paid" || deposit > 0) return "Deposit paid";
  return "Unpaid / request only";
}

function buildCustomerConfirmationEmail(booking: Record<string, unknown>, businessType: string): string {
  const businessLabel = getBusinessLabel(businessType);
  const staffContact = STAFF_CONTACTS[businessType] || STAFF_CONTACTS.default;
  
  const startDate = new Date(booking.start_datetime as string);
  const endDate = new Date(booking.end_datetime as string);
  const dateStr = startDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const startTimeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const endTimeStr = endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  
  const totalAmount = Number(booking.total_amount || 0);
  const depositAmount = Number(booking.deposit_amount || 0);
  const balanceDue = Number(booking.balance_due ?? Math.max(0, totalAmount - depositAmount));
  
  // Extract service info from notes or bookable_type
  const serviceName = (booking.bookable_types as Record<string, unknown>)?.name || "Your Booking";
  const roomName = ((booking.booking_resources as Array<{ resources?: { name?: string } }>)?.[0]?.resources?.name) || "TBD";

  return `
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
    .location-box { background: #edf2f7; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${businessLabel}</h1>
      <p style="color: #a0aec0; margin: 5px 0 0 0;">by A-Z Enterprises</p>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="success-badge">✓ Booking Confirmed</span>
        <h2 style="margin: 10px 0;">Your Appointment is Booked!</h2>
      </div>
      
      <p>Hi ${(booking.guest_name as string)?.split(" ")[0] || "there"},</p>
      <p>Great news! Your appointment has been confirmed. Here are your details:</p>

      <div class="appointment-box">
        <h3 style="margin-top: 0;">📅 Appointment Details</h3>
        <table style="width: 100%;">
          <tr><td style="padding: 8px 0; color: #666;">Service:</td><td style="padding: 8px 0; font-weight: bold;">${serviceName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; font-weight: bold;">${dateStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Time:</td><td style="padding: 8px 0; font-weight: bold;">${startTimeStr} – ${endTimeStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Location:</td><td style="padding: 8px 0; font-weight: bold;">${roomName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Total:</td><td style="padding: 8px 0; font-weight: bold;">${formatMoney(totalAmount)}</td></tr>
          ${depositAmount > 0 ? `<tr><td style="padding: 8px 0; color: #666;">Deposit Paid:</td><td style="padding: 8px 0; font-weight: bold; color: #48bb78;">${formatMoney(depositAmount)}</td></tr>` : ""}
          ${balanceDue > 0 ? `<tr><td style="padding: 8px 0; color: #666;">Due on Arrival:</td><td style="padding: 8px 0; font-weight: bold;">${formatMoney(balanceDue)}</td></tr>` : ""}
        </table>
      </div>

      <div class="location-box">
        <strong>📍 Location</strong>
        <p style="margin: 10px 0 0 0;">
          ${businessLabel}<br>
          ${BUSINESS_ADDRESS}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          Please arrive 5-10 minutes early. Free parking is available on-site.
        </p>
      </div>

      <h3>Need to Make Changes?</h3>
      <p style="font-size: 14px; color: #666;">
        To reschedule or cancel, please contact us at least 24 hours in advance at <a href="tel:${BUSINESS_PHONE}">${BUSINESS_PHONE}</a>.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <p>Questions? Contact us:</p>
        <p style="font-size: 18px;"><a href="tel:${BUSINESS_PHONE}">${BUSINESS_PHONE}</a></p>
      </div>

      <p style="margin-top: 30px;">
        We look forward to seeing you!<br><br>
        <strong>${staffContact.name}</strong><br>
        ${businessLabel}
      </p>
    </div>
    <div class="footer">
      <p>Booking Confirmation #${booking.booking_number || (booking.id as string).slice(0, 8).toUpperCase()}</p>
      <p>${businessLabel} | A-Z Enterprises | Wapakoneta, Ohio</p>
    </div>
  </div>
</body>
</html>`;
}

function buildStaffConfirmationEmail(booking: Record<string, unknown>, businessType: string): string {
  const businessLabel = getBusinessLabel(businessType);
  
  const startDate = new Date(booking.start_datetime as string);
  const endDate = new Date(booking.end_datetime as string);
  const dateStr = startDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const startTimeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const endTimeStr = endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  
  const totalAmount = Number(booking.total_amount || 0);
  const depositAmount = Number(booking.deposit_amount || 0);
  const balanceDue = Number(booking.balance_due ?? Math.max(0, totalAmount - depositAmount));
  
  const serviceName = (booking.bookable_types as Record<string, unknown>)?.name || "Booking";
  const roomName = ((booking.booking_resources as Array<{ resources?: { name?: string } }>)?.[0]?.resources?.name) || "TBD";

  return `
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
      <span class="badge">💳 NEW BOOKING</span>
      <h1 style="margin-top: 10px;">${businessLabel}</h1>
    </div>
    <div class="content">
      <div class="highlight">
        <strong>💰 Payment Confirmed</strong><br>
        <span style="font-size: 12px; color: #666;">Status: ${String(booking.status || "confirmed").toUpperCase()}</span>
      </div>
      
      <h2 style="margin-top: 0;">Appointment Details</h2>
      <table class="info-table">
        <tr><td>📅 Date</td><td><strong>${dateStr}</strong></td></tr>
        <tr><td>⏰ Time</td><td><strong>${startTimeStr} – ${endTimeStr}</strong></td></tr>
        <tr><td>🧘 Service</td><td>${serviceName}</td></tr>
        <tr><td>🚪 Room/Resource</td><td>${roomName}</td></tr>
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
        <tr><td>💳 Deposit Paid</td><td><strong style="color: #48bb78;">${formatMoney(depositAmount)}</strong></td></tr>
        <tr><td>🏁 Due on Arrival</td><td><strong>${formatMoney(balanceDue)}</strong></td></tr>
      </table>

      ${booking.notes ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 4px; margin-top: 15px;">
          <strong>📝 Notes:</strong>
          <p style="margin: 5px 0 0 0;">${booking.notes}</p>
        </div>
      ` : ""}

      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        Booking #${booking.booking_number || (booking.id as string).slice(0, 8).toUpperCase()}<br>
        <a href="https://summit-hive-booking-hub.lovable.app/#/admin/schedule">View in Admin Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>${businessLabel} | A-Z Enterprises</p>
    </div>
  </div>
</body>
</html>`;
}

function buildReminderEmail(booking: Record<string, unknown>, businessType: string, reminderType: string): string {
  const businessLabel = getBusinessLabel(businessType);
  const staffContact = STAFF_CONTACTS[businessType] || STAFF_CONTACTS.default;
  
  const startDate = new Date(booking.start_datetime as string);
  const dateStr = startDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const startTimeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  
  const reminderText = reminderType === "24h" ? "tomorrow" : "in 2 hours";
  
  const roomName = ((booking.booking_resources as Array<{ resources?: { name?: string } }>)?.[0]?.resources?.name) || "TBD";
  const serviceName = (booking.bookable_types as Record<string, unknown>)?.name || "Your Appointment";

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2d3748; padding: 30px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; background: #ffffff; }
    .reminder-badge { display: inline-block; background: #4299e1; color: white; padding: 8px 20px; font-size: 14px; font-weight: bold; border-radius: 20px; margin-bottom: 20px; }
    .appointment-box { background: #f8f6f0; border: 2px solid #d4af37; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .location-box { background: #edf2f7; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${businessLabel}</h1>
      <p style="color: #a0aec0; margin: 5px 0 0 0;">by A-Z Enterprises</p>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="reminder-badge">⏰ Reminder</span>
        <h2 style="margin: 10px 0;">Your appointment is ${reminderText}!</h2>
      </div>
      
      <p>Hi ${(booking.guest_name as string)?.split(" ")[0] || "there"},</p>
      <p>Just a friendly reminder about your upcoming appointment:</p>

      <div class="appointment-box">
        <h3 style="margin-top: 0;">📅 Appointment Details</h3>
        <table style="width: 100%;">
          <tr><td style="padding: 8px 0; color: #666;">Service:</td><td style="padding: 8px 0; font-weight: bold;">${serviceName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0; font-weight: bold;">${dateStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Time:</td><td style="padding: 8px 0; font-weight: bold;">${startTimeStr}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Location:</td><td style="padding: 8px 0; font-weight: bold;">${roomName}</td></tr>
        </table>
      </div>

      <div class="location-box">
        <strong>📍 Location</strong>
        <p style="margin: 10px 0 0 0;">
          ${businessLabel}<br>
          ${BUSINESS_ADDRESS}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          Please arrive 5-10 minutes early. Free parking is available on-site.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p>Need to reschedule? Call us:</p>
        <p style="font-size: 18px;"><a href="tel:${BUSINESS_PHONE}">${BUSINESS_PHONE}</a></p>
      </div>

      <p style="margin-top: 30px;">
        See you soon!<br><br>
        <strong>${staffContact.name}</strong><br>
        ${businessLabel}
      </p>
    </div>
    <div class="footer">
      <p>Booking #${booking.booking_number || (booking.id as string).slice(0, 8).toUpperCase()}</p>
      <p>${businessLabel} | A-Z Enterprises | Wapakoneta, Ohio</p>
    </div>
  </div>
</body>
</html>`;
}

// ============= SMS TEMPLATES =============
function buildCustomerConfirmationSMS(booking: Record<string, unknown>, businessType: string): string {
  const businessLabel = getBusinessLabel(businessType);
  const startDate = new Date(booking.start_datetime as string);
  const shortDate = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  
  return `✅ BOOKING CONFIRMED
${businessLabel}
${shortDate} at ${timeStr}
${BUSINESS_ADDRESS}
Questions? ${BUSINESS_PHONE}`;
}

function buildStaffConfirmationSMS(booking: Record<string, unknown>, businessType: string): string {
  const businessLabel = getBusinessLabel(businessType);
  const startDate = new Date(booking.start_datetime as string);
  const endDate = new Date(booking.end_datetime as string);
  const shortDate = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const startTimeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const endTimeStr = endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  
  const totalAmount = Number(booking.total_amount || 0);
  const depositAmount = Number(booking.deposit_amount || 0);
  const roomName = ((booking.booking_resources as Array<{ resources?: { name?: string } }>)?.[0]?.resources?.name) || "TBD";
  
  return `NEW ${businessLabel.toUpperCase()} BOOKING ✅
${shortDate} ${startTimeStr}–${endTimeStr}
${roomName}
Client: ${booking.guest_name} (${booking.guest_phone || "no phone"})
Paid: ${formatMoney(depositAmount)} / Total: ${formatMoney(totalAmount)}`;
}

function buildReminderSMS(booking: Record<string, unknown>, businessType: string, reminderType: string): string {
  const businessLabel = getBusinessLabel(businessType);
  const startDate = new Date(booking.start_datetime as string);
  const shortDate = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  
  const reminderText = reminderType === "24h" ? "tomorrow" : "in 2 hours";
  
  return `⏰ REMINDER: Your ${businessLabel} appointment is ${reminderText}!
${shortDate} at ${timeStr}
${BUSINESS_ADDRESS}
Questions? ${BUSINESS_PHONE}`;
}

// ============= MAIN HANDLER =============
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
    const FROM_NAME = Deno.env.get("FROM_NAME");
    const REPLY_TO_EMAIL = Deno.env.get("REPLY_TO_EMAIL");
    if (!FROM_EMAIL || !FROM_NAME || !REPLY_TO_EMAIL) {
      throw new Error("Sender env vars are not set: FROM_EMAIL, FROM_NAME, REPLY_TO_EMAIL");
    }
    const FROM_HEADER = `${FROM_NAME} <${FROM_EMAIL}>`;

    const VICTORIA_NOTIFY_EMAIL = Deno.env.get("VICTORIA_NOTIFY_EMAIL");
    const VICTORIA_NOTIFY_PHONE = Deno.env.get("VICTORIA_NOTIFY_PHONE");
    if (!VICTORIA_NOTIFY_EMAIL || !VICTORIA_NOTIFY_PHONE) {
      throw new Error("Victoria recipient env vars are not set: VICTORIA_NOTIFY_EMAIL, VICTORIA_NOTIFY_PHONE");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend keys are not set");

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const resend = new Resend(resendKey);

    const {
      booking_id,
      notification_type,
      reminder_type,
      channels = ["email", "sms"],
      recipients = ["customer", "staff"],
      stripe_session_id,
      stripe_payment_intent,
      test_customer_email,
      test_staff_email,
    }: NotificationRequest = await req.json();

    logStep("Request received", { booking_id, notification_type, reminder_type, channels, recipients });

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "booking_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch booking with all related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        bookable_types(*),
        businesses(*),
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

    const businessType = booking.businesses?.type || "default";
    const sourceBrand = normalizeSourceBrand((booking as any).source_brand, businessType);
    const brandLabel = sourceBrandLabel(sourceBrand, businessType);
    const timezone = booking.businesses?.timezone || "America/New_York";

    // Resolve staff contact from assigned provider (preferred), else fallback mapping.
    // For Victoria brands, ALWAYS route to Victoria.
    let resolvedStaffEmail: string | undefined;
    let resolvedStaffPhone: string | undefined;
    let resolvedStaffName: string | undefined;

    if (isVictoriaBrand(sourceBrand)) {
      resolvedStaffEmail = VICTORIA_NOTIFY_EMAIL;
      resolvedStaffPhone = VICTORIA_NOTIFY_PHONE;
      resolvedStaffName = "Victoria";
    }

    if (!isVictoriaBrand(sourceBrand) && booking.assigned_provider_id) {
      const { data: providerRow, error: providerErr } = await supabase
        .from("providers")
        .select("id,user_id,name")
        .eq("id", booking.assigned_provider_id)
        .maybeSingle();

      if (providerErr) {
        logStep("Provider lookup error", { error: providerErr, provider_id: booking.assigned_provider_id });
      }

      if (providerRow?.user_id) {
        const { data: profileRow, error: profileErr } = await supabase
          .from("profiles")
          .select("email,phone,first_name,last_name")
          .eq("id", providerRow.user_id)
          .maybeSingle();

        if (profileErr) {
          logStep("Profile lookup error", { error: profileErr, user_id: providerRow.user_id });
        }

        resolvedStaffEmail = profileRow?.email ?? undefined;
        resolvedStaffPhone = profileRow?.phone ?? undefined;
        resolvedStaffName = `${profileRow?.first_name ?? ""} ${profileRow?.last_name ?? ""}`.trim() || providerRow.name;
      }
    }

    const fallbackStaff = STAFF_CONTACTS[businessType] || STAFF_CONTACTS.default;
    const staffContact = {
      email: resolvedStaffEmail || fallbackStaff.email,
      phone: resolvedStaffPhone || fallbackStaff.phone,
      name: resolvedStaffName || fallbackStaff.name,
    };

    // Ensure we can resolve a customer email (guest_email preferred)
    let resolvedCustomerEmail: string | undefined = booking.guest_email || undefined;
    if (!resolvedCustomerEmail && booking.customer_id) {
      const { data: profileRow, error: profileErr } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", booking.customer_id)
        .maybeSingle();
      if (profileErr) logStep("Customer profile lookup error", { error: profileErr, customer_id: booking.customer_id });
      resolvedCustomerEmail = profileRow?.email ?? undefined;
    }

    // Admin-only manual test overrides
    if (test_customer_email || test_staff_email) {
      const authHeader = req.headers.get("authorization") || "";
      const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : "";

      // Block overrides for internal service-role calls (webhook/schedulers)
      if (!token || token === serviceRoleKey) {
        return new Response(JSON.stringify({ error: "Test overrides require an authenticated admin user" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: userData, error: userErr } = await supabase.auth.getUser(token);
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: isAdmin, error: adminErr } = await supabase.rpc("is_admin", { _user_id: userData.user.id });
      if (adminErr || !isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      logStep("Admin test overrides enabled", { booking_id, test_customer_email, test_staff_email });
    }

    logStep("Booking fetched", { 
      guest_name: booking.guest_name, 
      guest_email: booking.guest_email,
      business_type: businessType,
      status: booking.status 
    });

    // Check idempotency for confirmations ONLY
    if (notification_type === "confirmation") {
      const alreadySentCustomer = !!booking.email_sent_customer_at;
      const alreadySentStaff = !!booking.email_sent_staff_at;
      
      if (alreadySentCustomer && alreadySentStaff) {
        logStep("Skip send - already sent", { booking_id });
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "already_sent" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const results: Record<string, unknown> = {};
    const failures: Array<{ key: string; reason: string; details?: unknown }> = [];

    // ============= SEND EMAILS =============
    if (channels.includes("email")) {
      // Customer email
      if (recipients.includes("customer")) {
        const customerEmail = test_customer_email || resolvedCustomerEmail;
        if (!customerEmail) {
          const reason = "missing_customer_email";
          logStep("Customer email skipped", { booking_id, reason });
          failures.push({ key: "customer_email", reason });
          await logNotification(supabase, {
            booking_id,
            notification_type,
            channel: "email",
            recipient_type: "customer",
            status: "failed",
            provider: "resend",
            error_message: reason,
          });
        }
      }

      const customerEmail = test_customer_email || resolvedCustomerEmail;
      if (recipients.includes("customer") && customerEmail) {
        try {
          const durationMins = computeDurationMins(booking);
          const paymentLabel = describePayment(booking);
          const startDate = new Date(booking.start_datetime);
          const shortDate = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const timeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

          let subject: string;
          let html: string;

          if (notification_type === "request") {
            subject = `Request received from ${brandLabel} — ${shortDate} at ${timeStr}`;
            html = buildCustomerConfirmationEmail(
              {
                ...booking,
                notes: [
                  booking.notes,
                  `Type: Request`,
                  `Duration: ${durationMins} minutes`,
                  `Payment: ${paymentLabel}`,
                ].filter(Boolean).join("\n"),
              },
              businessType
            );
          } else if (notification_type === "confirmation") {
            subject = `Your ${brandLabel} booking is confirmed — ${shortDate} at ${timeStr}`;
            html = buildCustomerConfirmationEmail(booking, businessType);
          } else {
            const reminderType = reminder_type || "24h";
            const prefix = reminderType === "day_of_morning" ? "Today" : reminderType === "1h" ? "In 1 hour" : reminderType === "2h" ? "In 2 hours" : "Reminder";
            subject = `${prefix}: ${brandLabel} — ${shortDate} at ${timeStr}`;
            html = buildReminderEmail(booking, businessType, reminderType);
          }

          logStep("EMAIL: customer send starting", {
            booking_id,
            to: customerEmail,
            from: FROM_HEADER,
            subject,
            payload: {
              notification_type,
              reminder_type,
              source_brand: sourceBrand,
              business_type: businessType,
              booking_number: booking.booking_number,
              start_datetime: booking.start_datetime,
            },
          });

          const emailResult = await resend.emails.send({
            from: FROM_HEADER,
            reply_to: REPLY_TO_EMAIL,
            to: [customerEmail],
            subject,
            html,
          });

          logStep("EMAIL: customer send finished", {
            booking_id,
            to: customerEmail,
            subject,
            resend: safeJson(emailResult),
          });

          results.customer_email = { success: !!emailResult.data?.id, id: emailResult.data?.id, error: emailResult.error };

          await logNotification(supabase, {
            booking_id,
            notification_type,
            channel: "email",
            recipient_type: "customer",
            recipient_email: customerEmail,
            subject,
            status: emailResult.data?.id ? "sent" : "failed",
            provider: "resend",
            provider_message_id: emailResult.data?.id,
            error_message: emailResult.error?.message,
            metadata: { source_brand: sourceBrand, reminder_type },
          });

          // Update idempotency timestamp
          if (notification_type === "confirmation" && emailResult.data?.id) {
            await supabase.from("bookings").update({ email_sent_customer_at: new Date().toISOString() }).eq("id", booking_id);
          }

          logStep("Customer email sent", { email: booking.guest_email, id: emailResult.data?.id });

          if (!emailResult.data?.id) {
            const reason = emailResult.error?.message || "resend_failed";
            failures.push({ key: "customer_email", reason, details: emailResult.error });
            throw new Error(`Customer email failed: ${reason}`);
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          logStep("Customer email error", { error: msg, stack: e instanceof Error ? e.stack : undefined });
          results.customer_email = { success: false, error: msg };
          failures.push({ key: "customer_email", reason: msg });
          await logNotification(supabase, {
            booking_id,
            notification_type,
            channel: "email",
            recipient_type: "customer",
            recipient_email: customerEmail,
            status: "failed",
            provider: "resend",
            error_message: msg,
            metadata: {
              stripe_session_id,
              stripe_payment_intent,
            },
          });
        }
      }

      // Staff email
      if (recipients.includes("staff")) {
        const staffEmail = test_staff_email || staffContact.email;
        if (!staffEmail) {
          const reason = "missing_staff_email";
          logStep("Staff email skipped", { booking_id, reason, assigned_provider_id: booking.assigned_provider_id });
          failures.push({ key: "staff_email", reason });
          await logNotification(supabase, {
            booking_id,
            notification_type,
            channel: "email",
            recipient_type: "staff",
            status: "failed",
            provider: "resend",
            error_message: reason,
            metadata: { assigned_provider_id: booking.assigned_provider_id },
          });
        }

        try {
          const durationMins = computeDurationMins(booking);
          const paymentLabel = describePayment(booking);
          const startDate = new Date(booking.start_datetime);
          const shortDate = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const timeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

          const kind = notification_type === "request" ? "Request" : notification_type === "confirmation" ? "Booking" : "Reminder";
          const subject = `${kind}: ${brandLabel} — ${booking.guest_name || "Guest"} — ${shortDate} ${timeStr}`;
          const html = buildStaffConfirmationEmail(
            {
              ...booking,
              notes: [
                booking.notes,
                `Source: ${brandLabel}`,
                `Type: ${kind}`,
                `Duration: ${durationMins} minutes`,
                `Payment: ${paymentLabel}`,
              ].filter(Boolean).join("\n"),
            },
            businessType
          );

          logStep("EMAIL: staff send starting", {
            booking_id,
            to: staffEmail,
            from: FROM_HEADER,
            subject,
            resolved_staff: { name: staffContact.name, email: staffContact.email, phone: staffContact.phone },
          });

          const emailResult = await resend.emails.send({
            from: FROM_HEADER,
            reply_to: REPLY_TO_EMAIL,
            to: [staffEmail],
            subject,
            html,
          });

          logStep("EMAIL: staff send finished", {
            booking_id,
            to: staffEmail,
            subject,
            resend: safeJson(emailResult),
          });

          results.staff_email = { success: !!emailResult.data?.id, id: emailResult.data?.id, error: emailResult.error };

          await logNotification(supabase, {
            booking_id,
            notification_type,
            channel: "email",
            recipient_type: "staff",
            recipient_email: staffEmail,
            subject,
            status: emailResult.data?.id ? "sent" : "failed",
            provider: "resend",
            provider_message_id: emailResult.data?.id,
            error_message: emailResult.error?.message,
            metadata: { source_brand: sourceBrand, reminder_type },
          });

          // Update idempotency timestamp
          if (notification_type === "confirmation" && emailResult.data?.id) {
            await supabase.from("bookings").update({ email_sent_staff_at: new Date().toISOString() }).eq("id", booking_id);
          }

          logStep("Staff email sent", { email: staffContact.email, id: emailResult.data?.id });

          if (!emailResult.data?.id) {
            const reason = emailResult.error?.message || "resend_failed";
            failures.push({ key: "staff_email", reason, details: emailResult.error });
            throw new Error(`Staff email failed: ${reason}`);
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          logStep("Staff email error", { error: msg, stack: e instanceof Error ? e.stack : undefined });
          results.staff_email = { success: false, error: msg };
          failures.push({ key: "staff_email", reason: msg });
          await logNotification(supabase, {
            booking_id,
            notification_type,
            channel: "email",
            recipient_type: "staff",
            recipient_email: staffEmail,
            status: "failed",
            provider: "resend",
            error_message: msg,
            metadata: {
              stripe_session_id,
              stripe_payment_intent,
              assigned_provider_id: booking.assigned_provider_id,
            },
          });
        }
      }
    }

    // ============= SEND SMS =============
    if (channels.includes("sms")) {
      // Customer SMS (disabled for Victoria brands per current requirements)
      const allowCustomerSms = !isVictoriaBrand(sourceBrand);
      if (allowCustomerSms && recipients.includes("customer") && booking.guest_phone) {
        let smsMessage: string;
        if (notification_type === "confirmation") {
          smsMessage = buildCustomerConfirmationSMS(booking, businessType);
        } else {
          smsMessage = buildReminderSMS(booking, businessType, reminder_type || notification_type);
        }

        const smsResult = await sendSMS(booking.guest_phone, smsMessage);
        results.customer_sms = smsResult;

        await logNotification(supabase, {
          booking_id,
          notification_type,
          channel: "sms",
          recipient_type: "customer",
          recipient_phone: booking.guest_phone,
          status: smsResult.success ? "sent" : "failed",
          provider: "twilio",
          provider_message_id: smsResult.sid,
          error_message: smsResult.error,
        });
      }

      // Staff SMS
      if (recipients.includes("staff")) {
        const smsMessage = notification_type === "reminder"
          ? buildReminderSMS(booking, businessType, reminder_type || "1h")
          : buildStaffConfirmationSMS(
              {
                ...booking,
                notes: [booking.notes, `Source: ${brandLabel}`].filter(Boolean).join("\n"),
              },
              businessType
            );
        const smsResult = await sendSMS(staffContact.phone, smsMessage);
        results.staff_sms = smsResult;

        await logNotification(supabase, {
          booking_id,
          notification_type,
          channel: "sms",
          recipient_type: "staff",
          recipient_phone: staffContact.phone,
          status: smsResult.success ? "sent" : "failed",
          provider: "twilio",
          provider_message_id: smsResult.sid,
          error_message: smsResult.error,
          metadata: { source_brand: sourceBrand, reminder_type },
        });
      }
    }

    // Schedule reminders for requests + confirmations
    if (notification_type === "request" || notification_type === "confirmation") {
      const victoria = isVictoriaBrand(sourceBrand);
      await scheduleReminders(supabase, booking_id, booking.start_datetime, {
        timezone,
        reminderTypes: victoria ? ["day_of_morning", "1h"] : ["24h", "2h"],
        recipientTypes: victoria ? ["customer", "staff"] : ["customer"],
      });
    }

    logStep("Notification complete", results);

    if (failures.length > 0) {
      // Hard-fail so upstream (webhook / scheduler) can surface errors & retry.
      return new Response(JSON.stringify({ success: false, results, failures }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, results }), {
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
