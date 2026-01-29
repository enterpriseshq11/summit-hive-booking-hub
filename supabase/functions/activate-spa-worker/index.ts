import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ActivateRequest {
  invite_token: string;
  user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { invite_token, user_id }: ActivateRequest = await req.json();

    if (!invite_token || !user_id) {
      return new Response(
        JSON.stringify({ error: "invite_token and user_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Activating spa worker:", { invite_token: invite_token.substring(0, 8) + "...", user_id });

    // 1. Fetch spa_worker record by invite_token
    const { data: worker, error: workerError } = await supabase
      .from("spa_workers")
      .select("*")
      .eq("invite_token", invite_token)
      .single();

    if (workerError || !worker) {
      console.error("Worker not found:", workerError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired invite token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verify invite is valid
    if (worker.invite_accepted_at || worker.user_id) {
      return new Response(
        JSON.stringify({ error: "Invite has already been used" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (worker.invite_expires_at && new Date(worker.invite_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Invite has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Update spa_workers: link user_id, mark invite as accepted, clear token
    const { error: updateError } = await supabase
      .from("spa_workers")
      .update({
        user_id: user_id,
        invite_accepted_at: new Date().toISOString(),
        invite_token: null, // Clear the token so it can't be reused
      })
      .eq("id", worker.id);

    if (updateError) {
      console.error("Failed to update worker:", updateError);
      throw updateError;
    }

    console.log("Worker updated, now assigning role...");

    // 4. Insert spa_worker role into user_roles (include department to match 3-column constraint)
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: user_id,
        role: "spa_worker",
        department: null,
      });

    if (roleError) {
      // Check if it's a duplicate key error (role already exists)
      if (roleError.code === "23505") {
        console.log("Role already exists, continuing...");
      } else {
        console.error("Failed to assign role:", roleError);
        // Don't throw - worker is linked, role can be assigned via trigger fallback
      }
    } else {
      console.log("spa_worker role assigned successfully");
    }

    // 5. Upsert profile with worker info
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user_id,
        first_name: worker.first_name,
        last_name: worker.last_name,
        email: worker.email,
      }, { onConflict: "id" });

    if (profileError) {
      console.error("Failed to upsert profile:", profileError);
      // Non-fatal - profile may already exist from auth trigger
    }

    // 6. Log to audit
    await supabase.from("audit_log").insert({
      entity_type: "spa_worker",
      entity_id: worker.id,
      action_type: "worker_activated",
      actor_user_id: user_id,
      after_json: {
        worker_id: worker.id,
        user_id: user_id,
        email: worker.email,
        role_assigned: "spa_worker",
      },
    });

    console.log("Worker activation complete:", worker.id);

    return new Response(
      JSON.stringify({
        success: true,
        worker_id: worker.id,
        message: "Worker account activated successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error activating spa worker:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to activate worker account" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
