import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InquiryNotificationRequest {
  type: 'user_confirmation' | 'staff_notification' | 'lease_approved' | 'lease_denied';
  inquiry: {
    first_name: string;
    last_name?: string | null;
    email: string;
    phone?: string | null;
    company_name?: string | null;
    workspace_type?: string | null;
    move_in_timeframe?: string | null;
    seats_needed?: number | null;
    message?: string | null;
    inquiry_type: string;
    needs_meeting_rooms?: boolean;
    needs_business_address?: boolean;

    // Hive lease request fields (optional)
    office_code?: string | null;
    lease_term_months?: number | null;
    monthly_rate?: number | null;
    term_total?: number | null;
    deposit_amount?: number | null;
    denial_reason?: string | null;
  };
}

const STAFF_EMAIL = "info@az-enterprises.com";
const FROM_EMAIL = "The Hive by A-Z <onboarding@resend.dev>";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, inquiry }: InquiryNotificationRequest = await req.json();
    
    console.log(`Processing ${type} notification for ${inquiry.email}`);

    if (type === 'user_confirmation') {
      // Send confirmation email to the user
      const userEmailResponse = await resend.emails.send({
        from: FROM_EMAIL,
        to: [inquiry.email],
        subject: "We Received Your Workspace Inquiry – The Hive by A-Z",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0a0a0a; padding: 30px; text-align: center; }
              .header h1 { color: #d4af37; margin: 0; font-size: 24px; }
              .content { padding: 30px 20px; background: #ffffff; }
              .highlight-box { background: #f8f6f0; border-left: 4px solid #d4af37; padding: 15px; margin: 20px 0; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
              .cta-button { display: inline-block; background: #d4af37; color: #0a0a0a; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 4px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>The Hive by A-Z</h1>
              </div>
              <div class="content">
                <h2>Thank you, ${inquiry.first_name}!</h2>
                <p>We've received your workspace inquiry and a member of our team will be in touch within <strong>24 hours</strong>.</p>
                
                <div class="highlight-box">
                  <strong>What happens next:</strong>
                  <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>Our team reviews your requirements</li>
                    <li>We'll reach out to schedule a consultation or tour</li>
                    <li>You'll receive a personalized proposal – no obligation</li>
                  </ol>
                </div>
                
                <p><strong>Your Request Summary:</strong></p>
                <ul style="list-style: none; padding: 0;">
                  ${inquiry.workspace_type ? `<li>🏢 Workspace Type: ${inquiry.workspace_type}</li>` : ''}
                  ${inquiry.move_in_timeframe ? `<li>📅 Timeline: ${inquiry.move_in_timeframe}</li>` : ''}
                  ${inquiry.seats_needed ? `<li>👥 Seats Needed: ${inquiry.seats_needed}</li>` : ''}
                  ${inquiry.company_name ? `<li>🏛️ Company: ${inquiry.company_name}</li>` : ''}
                </ul>
                
                <p>Questions in the meantime? Reply to this email or call us at <strong>(567) 379-6340</strong>.</p>
                
                <p>We look forward to helping you find your perfect workspace!</p>
                
                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>The Hive Team</strong><br>
                  A-Z Enterprises
                </p>
              </div>
              <div class="footer">
                <p>The Hive by A-Z | Wapakoneta, Ohio</p>
                <p>Open 7 days a week, 6:00 AM – 10:00 PM</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log("User confirmation email sent:", userEmailResponse);

      return new Response(JSON.stringify({ success: true, emailId: userEmailResponse.data?.id }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (type === 'lease_approved' || type === 'lease_denied') {
      const isApproved = type === 'lease_approved';
      const subject = isApproved
        ? 'Your Office Request Was Approved – The Hive by A-Z'
        : 'Update on Your Office Request – The Hive by A-Z';

      const pricingLines = [
        inquiry.office_code ? `Office: ${inquiry.office_code}` : null,
        inquiry.lease_term_months ? `Lease term: ${inquiry.lease_term_months} months` : null,
        typeof inquiry.monthly_rate === 'number' ? `Monthly: $${inquiry.monthly_rate}` : null,
        typeof inquiry.term_total === 'number' ? `Term total: $${inquiry.term_total}` : null,
        typeof inquiry.deposit_amount === 'number' ? `Deposit/down: $${inquiry.deposit_amount}` : null,
      ].filter(Boolean);

      const decisionLine = isApproved
        ? 'Good news — your request has been approved. Next step is to confirm move-in details and finalize paperwork. No payment is required until confirmed.'
        : 'Your request was not approved at this time. If you have questions, reply to this email and we can review alternatives.';

      const reasonBlock = !isApproved && inquiry.denial_reason
        ? `<div class="highlight-box"><strong>Reason:</strong><br>${inquiry.denial_reason}</div>`
        : '';

      const userEmailResponse = await resend.emails.send({
        from: FROM_EMAIL,
        to: [inquiry.email],
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0a0a0a; padding: 30px; text-align: center; }
              .header h1 { color: #d4af37; margin: 0; font-size: 24px; }
              .content { padding: 30px 20px; background: #ffffff; }
              .highlight-box { background: #f8f6f0; border-left: 4px solid #d4af37; padding: 15px; margin: 20px 0; }
              .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>The Hive by A-Z</h1>
              </div>
              <div class="content">
                <h2>Hi ${inquiry.first_name}!</h2>
                <p>${decisionLine}</p>

                ${pricingLines.length ? `
                  <div class="highlight-box">
                    <strong>Request Summary:</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      ${pricingLines.map((l) => `<li>${l}</li>`).join('')}
                    </ul>
                    <p style="margin: 10px 0 0 0; font-size: 13px; color: #444;">Request-based — no payment collected now.</p>
                  </div>
                ` : ''}

                ${reasonBlock}

                <p>Questions? Reply to this email or call us at <strong>(567) 379-6340</strong>.</p>
                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>The Hive Team</strong><br>
                  A-Z Enterprises
                </p>
              </div>
              <div class="footer">
                <p>The Hive by A-Z | Wapakoneta, Ohio</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      return new Response(JSON.stringify({ success: true, emailId: userEmailResponse.data?.id }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (type === 'staff_notification') {
      // Send notification email to staff
      const inquiryTypeLabels: Record<string, string> = {
        request: '📋 Workspace Request',
        tour: '🏢 Tour Request',
        waitlist: '⏳ Waitlist Signup',
        question: '❓ General Question',
      };

      const staffEmailResponse = await resend.emails.send({
        from: FROM_EMAIL,
        to: [STAFF_EMAIL],
        subject: `[New Lead] ${inquiryTypeLabels[inquiry.inquiry_type] || 'Inquiry'} from ${inquiry.first_name} ${inquiry.last_name || ''}`.trim(),
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
                <span class="priority-badge">${inquiryTypeLabels[inquiry.inquiry_type] || 'NEW INQUIRY'}</span>
                <h1 style="margin-top: 10px;">New Lead Alert – The Hive</h1>
              </div>
              <div class="content">
                <p><strong>Response expected within 24 hours</strong></p>
                
                <table class="info-table">
                  <tr>
                    <td>Name</td>
                    <td>${inquiry.first_name} ${inquiry.last_name || ''}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td><a href="mailto:${inquiry.email}">${inquiry.email}</a></td>
                  </tr>
                  ${inquiry.phone ? `<tr><td>Phone</td><td><a href="tel:${inquiry.phone}">${inquiry.phone}</a></td></tr>` : ''}
                  ${inquiry.company_name ? `<tr><td>Company</td><td>${inquiry.company_name}</td></tr>` : ''}
                  ${inquiry.workspace_type ? `<tr><td>Workspace Type</td><td>${inquiry.workspace_type}</td></tr>` : ''}
                  ${inquiry.move_in_timeframe ? `<tr><td>Timeline</td><td>${inquiry.move_in_timeframe}</td></tr>` : ''}
                  ${inquiry.seats_needed ? `<tr><td>Seats Needed</td><td>${inquiry.seats_needed}</td></tr>` : ''}
                  <tr>
                    <td>Meeting Rooms</td>
                    <td>${inquiry.needs_meeting_rooms ? '✅ Yes' : '❌ No'}</td>
                  </tr>
                  <tr>
                    <td>Business Address</td>
                    <td>${inquiry.needs_business_address ? '✅ Yes' : '❌ No'}</td>
                  </tr>
                </table>
                
                ${inquiry.message ? `
                  <div class="message-box">
                    <strong>Message:</strong>
                    <p style="margin: 10px 0 0 0;">${inquiry.message}</p>
                  </div>
                ` : ''}
                
                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                  View and manage this lead in the <a href="https://summit-hive-booking-hub.lovable.app/#/admin/office-inquiries">Admin Dashboard</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log("Staff notification email sent:", staffEmailResponse);

      return new Response(JSON.stringify({ success: true, emailId: staffEmailResponse.data?.id }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid notification type" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-inquiry-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
