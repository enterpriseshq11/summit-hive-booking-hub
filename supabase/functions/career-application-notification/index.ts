import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// All careers notifications go to Dylan Legg
const CAREERS_NOTIFY_EMAIL = Deno.env.get("DYLAN_NOTIFY_EMAIL") || "Dylan@a-zenterpriseshq.com";

interface NotificationRequest {
  applicationId: string;
  team: "spa" | "fitness" | "contracting";
  role: string;
  applicantEmail: string;
  applicantName: string;
  applicantPhone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - skipping email notifications");
      return new Response(
        JSON.stringify({ success: true, message: "Email provider not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const { applicationId, team, role, applicantEmail, applicantName, applicantPhone }: NotificationRequest = await req.json();

    const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@azenterpriseshq.com";
    const fromName = Deno.env.get("FROM_NAME") || "A-Z Enterprises";
    const shortId = applicationId.slice(0, 8).toUpperCase();
    const teamName = team === "spa" ? "Restoration Lounge (Spa)" : team === "fitness" ? "A-Z Total Fitness" : "A-Z Contracting";
    const submittedAt = new Date().toLocaleString("en-US", { 
      timeZone: "America/New_York", 
      dateStyle: "full", 
      timeStyle: "short" 
    });
    const adminUrl = `https://summit-hive-booking-hub.lovable.app/admin/careers`;

    // Send confirmation to applicant
    try {
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [applicantEmail],
        subject: `Application Received - ${role} at ${teamName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Thank You for Applying!</h1>
            <p>Hi ${applicantName},</p>
            <p>We've received your application for the <strong>${role}</strong> position at <strong>${teamName}</strong>.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">Your confirmation number:</p>
              <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; font-family: monospace;">${shortId}</p>
            </div>
            
            <h2 style="color: #333; font-size: 18px;">What's Next?</h2>
            <ul style="color: #666; line-height: 1.8;">
              <li>Our team will review your application within 5-7 business days</li>
              <li>If your qualifications match our needs, we'll reach out to schedule an interview</li>
              <li>Please save your confirmation number for your records</li>
            </ul>
            
            <p style="color: #666;">If you have any questions, feel free to reply to this email or call us at <strong>567-379-6340</strong>.</p>
            
            <p style="color: #666; margin-top: 30px;">Best regards,<br>The ${teamName} Team<br>A-Z Enterprises</p>
          </div>
        `,
      });
      console.log("Applicant confirmation sent to:", applicantEmail);
    } catch (emailErr) {
      console.error("Failed to send applicant confirmation:", emailErr);
    }

    // Send internal notification to Dylan
    try {
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [CAREERS_NOTIFY_EMAIL],
        subject: `New Application: ${role} - ${applicantName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">New Job Application</h1>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;">Application ID:</td>
                  <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${shortId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Team:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${teamName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Position:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${role}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Applicant:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${applicantEmail}">${applicantEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Phone:</td>
                  <td style="padding: 8px 0;">${applicantPhone || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Submitted:</td>
                  <td style="padding: 8px 0;">${submittedAt}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${adminUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">View in Admin Dashboard</a>
            </div>
            
            <p style="color: #666; font-size: 12px;">Full Application ID: ${applicationId}</p>
          </div>
        `,
      });
      console.log("Internal notification sent to Dylan:", CAREERS_NOTIFY_EMAIL);
    } catch (emailErr) {
      console.error("Failed to send internal notification:", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in career-application-notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
