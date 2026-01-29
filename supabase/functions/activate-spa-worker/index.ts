import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ActivateWorkerRequest {
  invite_token: string;
  user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { invite_token, user_id }: ActivateWorkerRequest = await req.json();

    if (!invite_token || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing invite_token or user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Activating spa worker - token: ${invite_token.substring(0, 8)}..., user_id: ${user_id}`);

    // 1. Fetch spa_worker record by invite_token
    const { data: worker, error: fetchError } = await supabaseAdmin
      .from("spa_workers")
      .select("id, email, first_name, last_name, invite_expires_at, invite_accepted_at, user_id")
      .eq("invite_token", invite_token)
      .single();

    if (fetchError || !worker) {
      console.error("Worker not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Invalid invite token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verify invite is valid
    if (worker.invite_accepted_at || worker.user_id) {
      return new Response(
        JSON.stringify({ error: "Invite already used" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (worker.invite_expires_at && new Date(worker.invite_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Invite expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Update spa_workers: link user_id, mark invite accepted, clear token
    const { error: updateError } = await supabaseAdmin
      .from("spa_workers")
      .update({
        user_id: user_id,
        invite_accepted_at: new Date().toISOString(),
        invite_token: null,
      })
      .eq("id", worker.id);

    if (updateError) {
      console.error("Failed to update spa_worker:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to link worker account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Linked user ${user_id} to spa_worker ${worker.id}`);

    // 4. Insert spa_worker role into user_roles
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: user_id,
        role: "spa_worker",
      });

    if (roleError) {
      // Check if it's a duplicate key error (role already exists)
      if (roleError.code === "23505") {
        console.log("Role already exists, skipping insert");
      } else {
        console.error("Failed to insert role:", roleError);
        // Don't fail the whole operation, the trigger will catch this
      }
    } else {
      console.log(`Assigned spa_worker role to user ${user_id}`);
    }

    // 5. Upsert profile (may already exist from auth trigger)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user_id,
        first_name: worker.first_name,
        last_name: worker.last_name,
        email: worker.email,
      }, { onConflict: "id" });

    if (profileError) {
      console.error("Failed to upsert profile:", profileError);
      // Non-critical, continue
    }

    // 6. Log to audit_log
    await supabaseAdmin.from("audit_log").insert({
      action_type: "spa_worker_activated",
      entity_type: "spa_workers",
      entity_id: worker.id,
      actor_user_id: user_id,
      after_json: {
        worker_id: worker.id,
        user_id: user_id,
        email: worker.email,
      },
    });

    console.log(`Successfully activated spa worker ${worker.id} for user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        worker_id: worker.id,
        message: "Worker account activated successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
