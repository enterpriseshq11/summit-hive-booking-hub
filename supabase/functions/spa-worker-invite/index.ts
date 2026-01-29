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

    // Build signup URL - points to a special worker signup page
    const baseUrl = Deno.env.get("SITE_URL") || "https://summit-hive-booking-hub.lovable.app";
    const signupUrl = `${baseUrl}/worker-signup?token=${inviteToken}`;

    // Send invite email
    const emailResult = await resend.emails.send({
      from: "A-Z Enterprises <noreply@azenterpriseshq.com>",
      to: [worker.email],
      subject: "You're Invited to Join Restoration Lounge",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #d4af37; }
            .content { background: #f9f9f9; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
            .btn { display: inline-block; background: #d4af37; color: #1a1a1a !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Restoration Lounge</div>
              <p style="color: #666; margin: 0;">by A-Z Enterprises</p>
            </div>
            
            <div class="content">
              <h2 style="margin-top: 0;">Welcome to the Team, ${worker.first_name}!</h2>
              
              <p>You've been invited to join Restoration Lounge as a massage therapist.</p>
              
              <p>Click the button below to create your account and set up your password:</p>
              
              <div style="text-align: center;">
                <a href="${signupUrl}" class="btn">Create Your Account</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                This link will expire in 48 hours. If it expires, please contact your manager for a new invite.
              </p>
            </div>
            
            <div class="footer">
              <p>Restoration Lounge | A-Z Enterprises</p>
              <p>If you didn't expect this invitation, please ignore this email.</p>
            </div>
          </div>
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
