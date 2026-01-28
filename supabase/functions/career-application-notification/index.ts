import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Centralized careers notification inbox
const CAREERS_NOTIFY_EMAIL = "info@a-zenterpriseshq.com";

interface NotificationRequest {
  applicationId: string;
  team: "spa" | "fitness" | "contracting";
  role: string;
  applicantEmail: string;
  applicantName: string;
  applicantPhone?: string;
  submittedAt?: string;
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
    const { applicationId, team, role, applicantEmail, applicantName, applicantPhone, submittedAt }: NotificationRequest = await req.json();

    const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@azenterpriseshq.com";
    const fromName = Deno.env.get("FROM_NAME") || "A-Z Enterprises";
    const shortId = applicationId.slice(0, 8).toUpperCase();
    const teamName = team === "spa" ? "Restoration Lounge (Spa)" : team === "fitness" ? "A-Z Total Fitness" : "A-Z Contracting";
    const submissionDate = submittedAt ? new Date(submittedAt).toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      timeZone: 'America/New_York'
    }) : new Date().toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short',
      timeZone: 'America/New_York'
    });

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

    // Send internal notification to centralized careers inbox
    try {
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [CAREERS_NOTIFY_EMAIL],
        subject: `New Careers Application: ${role} - ${applicantName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">New Job Application Received</h1>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;">Application ID:</td>
                  <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${shortId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Submitted:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${submissionDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Team:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${teamName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Position:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${role}</td>
                </tr>
              </table>
            </div>
            
            <h2 style="color: #333; font-size: 18px; margin-top: 24px;">Applicant Details</h2>
            <div style="background: #fff; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;">Full Name:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${applicantEmail}" style="color: #1a73e8;">${applicantEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Phone:</td>
                  <td style="padding: 8px 0;">${applicantPhone ? `<a href="tel:${applicantPhone}" style="color: #1a73e8;">${applicantPhone}</a>` : 'Not provided'}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-top: 24px; padding: 16px; background: #e8f4fd; border-radius: 8px;">
              <p style="margin: 0; color: #333;">
                <strong>View Full Application:</strong><br>
                <a href="https://summit-hive-booking-hub.lovable.app/admin/careers?search=${shortId}" style="color: #1a73e8;">
                  Open in Admin Dashboard →
                </a>
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              This is an automated notification from the A-Z Enterprises Careers system.
            </p>
          </div>
        `,
      });
      console.log("Internal notification sent to:", CAREERS_NOTIFY_EMAIL);
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
