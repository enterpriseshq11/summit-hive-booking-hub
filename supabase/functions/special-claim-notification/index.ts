import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ClaimPayload {
  special_id: string;
  special_title: string;
  business_unit: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
}

// Route notifications to correct staff based on business unit
async function isSpaPaymentsEnabled(): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const res = await fetch(
      `${supabaseUrl}/rest/v1/app_config?key=eq.spa_payments_enabled&select=value`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const rows = await res.json();
    return rows?.[0]?.value === "true";
  } catch {
    return false;
  }
}

function getStaffEmail(businessUnit: string, spaPaymentsOn: boolean): string {
  // Spa/Restoration: Lindsey when payments ON, Victoria when OFF
  if (businessUnit === "restoration") {
    if (spaPaymentsOn) {
      return Deno.env.get("LINDSEY_NOTIFY_EMAIL") || Deno.env.get("VICTORIA_NOTIFY_EMAIL") || "";
    }
    return Deno.env.get("VICTORIA_NOTIFY_EMAIL") || Deno.env.get("DYLAN_NOTIFY_EMAIL") || "";
  }
  return Deno.env.get("VICTORIA_NOTIFY_EMAIL") || Deno.env.get("DYLAN_NOTIFY_EMAIL") || "";
}

function getStaffPhone(businessUnit: string, spaPaymentsOn: boolean): string {
  if (businessUnit === "restoration" && spaPaymentsOn) {
    return Deno.env.get("LINDSEY_NOTIFY_PHONE") || "";
  }
  return Deno.env.get("VICTORIA_NOTIFY_PHONE") || "";
}

const UNIT_LABELS: Record<string, string> = {
  summit: "The Summit",
  hive: "The Hive",
  restoration: "Restoration Lounge",
  photo_booth_360: "360 Photo Booth",
  voice_vault: "Voice Vault",
  fitness: "A-Z Total Fitness",
};

function getFromEmail() {
  const fromName = Deno.env.get("FROM_NAME") || "A-Z Enterprises";
  const fromEmail = Deno.env.get("FROM_EMAIL") || "no-reply@azenterpriseshq.com";
  return `${fromName} <${fromEmail}>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ClaimPayload = await req.json();
    const { special_id, special_title, business_unit, name, email, phone, message } = payload;

    // Check spa payment toggle for restoration routing
    const spaPaymentsOn = business_unit === "restoration" ? await isSpaPaymentsEnabled() : false;
    const staffEmail = getStaffEmail(business_unit, spaPaymentsOn);
    const unitLabel = UNIT_LABELS[business_unit] || business_unit;
    const FROM_EMAIL = getFromEmail();
    const replyTo = Deno.env.get("REPLY_TO_EMAIL") || "info@a-zenterpriseshq.com";

    const results: string[] = [];

    // 1. Staff notification
    if (staffEmail) {
      const staffRes = await resend.emails.send({
        from: FROM_EMAIL,
        to: [staffEmail],
        reply_to: replyTo,
        subject: `[${unitLabel}] Special Request — ${special_title} — ${name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0a0a0a; padding: 20px; }
              .header h1 { color: #d4af37; margin: 0; font-size: 20px; }
              .content { padding: 20px; background: #ffffff; }
              .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              .info-table td { padding: 10px; border-bottom: 1px solid #eee; }
              .info-table td:first-child { font-weight: bold; width: 140px; color: #666; }
              .priority-badge { display: inline-block; background: #d4af37; color: #0a0a0a; padding: 4px 12px; font-size: 12px; font-weight: bold; border-radius: 4px; }
              .message-box { background: #f8f6f0; padding: 15px; border-radius: 4px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <span class="priority-badge">SPECIAL REQUEST</span>
                <h1 style="margin-top: 10px;">New Special Claim — ${unitLabel}</h1>
              </div>
              <div class="content">
                <p><strong>Someone requested a special. Follow up within 24 hours.</strong></p>
                
                <table class="info-table">
                  <tr><td>Special</td><td><strong>${special_title}</strong></td></tr>
                  <tr><td>Business</td><td>${unitLabel}</td></tr>
                  <tr><td>Name</td><td>${name}</td></tr>
                  <tr><td>Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
                  <tr><td>Phone</td><td><a href="tel:${phone}">${phone}</a></td></tr>
                </table>
                
                ${message ? `<div class="message-box"><strong>Message:</strong><p style="margin: 10px 0 0 0;">${message}</p></div>` : ""}
              </div>
            </div>
          </body>
          </html>
        `,
      });
      results.push(`staff: ${staffRes.data?.id ?? "sent"}`);
      console.log(`Staff notification sent to ${staffEmail} for special "${special_title}"`);
    } else {
      console.warn("No staff email configured for business unit:", business_unit);
    }

    // 2. SMS to staff
    const staffPhone = getStaffPhone(business_unit, spaPaymentsOn);
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioMsgSvc = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

    if (staffPhone && twilioSid && twilioAuth && twilioMsgSvc) {
      try {
        const smsBody = `[${unitLabel}] Special Request: "${special_title}" from ${name} — ${phone}. Check email for details.`;
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const smsRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(`${twilioSid}:${twilioAuth}`),
          },
          body: new URLSearchParams({
            MessagingServiceSid: twilioMsgSvc,
            To: staffPhone,
            Body: smsBody,
          }),
        });
        const smsData = await smsRes.json();
        results.push(`sms: ${smsData.sid ?? "sent"}`);
        console.log(`SMS sent to ${staffPhone}`);
      } catch (smsErr) {
        console.error("SMS send failed:", smsErr);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in special-claim-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
