import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  workerId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { workerId }: InviteRequest = await req.json();

    if (!workerId) {
      return new Response(
        JSON.stringify({ error: "Worker ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch worker details
    const { data: worker, error: workerError } = await supabase
      .from("spa_workers")
      .select("*")
      .eq("id", workerId)
      .single();

    if (workerError || !worker) {
      return new Response(
        JSON.stringify({ error: "Worker not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new invite token and expiry (48 hours)
    const inviteToken = crypto.randomUUID();
    const inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    // Update worker with invite token
    const { error: updateError } = await supabase
      .from("spa_workers")
      .update({
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt,
        invited_at: new Date().toISOString(),
      })
      .eq("id", workerId);

    if (updateError) {
      throw updateError;
    }

    // Build signup URL - points to worker-signup page with hash router
    const baseUrl = Deno.env.get("SITE_URL") || "https://summit-hive-booking-hub.lovable.app";
    // Use hash routing: /#/worker-signup?token=...
    const signupUrl = `${baseUrl}/#/worker-signup?token=${inviteToken}`;

    // Send invite email - using inline styles for maximum email client compatibility
    const emailResult = await resend.emails.send({
      from: "A-Z Enterprises <noreply@azenterpriseshq.com>",
      to: [worker.email],
      subject: "You're Invited to Join Restoration Lounge",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Join Restoration Lounge</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #ffffff;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #d4af37;">Restoration Lounge</h1>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666666;">by A-Z Enterprises</p>
                    </td>
                  </tr>
                  
                  <!-- Content Box -->
                  <tr>
                    <td style="background-color: #f9f9f9; border-radius: 12px; padding: 30px;">
                      <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #333333;">Welcome to the Team, ${worker.first_name}!</h2>
                      
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333;">You've been invited to join Restoration Lounge as a massage therapist.</p>
                      
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #333333;">Click the button below to create your account and set up your password:</p>
                      
                      <!-- CTA Button - Using table for maximum compatibility -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${signupUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #d4af37; color: #1a1a1a; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; mso-padding-alt: 0; text-align: center;">
                              <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
                              <span style="mso-text-raise: 15pt;">Create Your Account</span>
                              <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0 0; font-size: 14px; color: #666666;">
                        This link will expire in 48 hours. If it expires, please contact your manager for a new invite.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top: 30px;">
                      <p style="margin: 0; font-size: 12px; color: #666666;">Restoration Lounge | A-Z Enterprises</p>
                      <p style="margin: 8px 0 0 0; font-size: 12px; color: #888888;">If you didn't expect this invitation, please ignore this email.</p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Invite email sent:", emailResult);

    // Log to audit
    await supabase.from("audit_log").insert({
      entity_type: "spa_worker",
      entity_id: workerId,
      action_type: "invite_sent",
      after_json: { email: worker.email, invite_expires_at: inviteExpiresAt },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invite sent to ${worker.email}`,
        expiresAt: inviteExpiresAt 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending worker invite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
