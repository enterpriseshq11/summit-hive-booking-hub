import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SignupRequest {
  token: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token, password }: SignupRequest = await req.json();

    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: "Token and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Find the worker by invite token
    const { data: worker, error: workerError } = await supabase
      .from("spa_workers")
      .select("id, first_name, last_name, email, invite_expires_at, invite_accepted_at, user_id")
      .eq("invite_token", token)
      .single();

    if (workerError || !worker) {
      return new Response(
        JSON.stringify({ error: "Invalid invite token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check if already accepted
    if (worker.invite_accepted_at || worker.user_id) {
      return new Response(
        JSON.stringify({ error: "This invite has already been used. Please sign in instead." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check if expired
    if (worker.invite_expires_at && new Date(worker.invite_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This invite has expired. Please contact your manager for a new invite." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Check if email already has an account
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === worker.email);
    
    if (existingUser) {
      // Link existing user to worker and assign role
      const { error: updateError } = await supabase
        .from("spa_workers")
        .update({
          user_id: existingUser.id,
          invite_accepted_at: new Date().toISOString(),
          invite_token: null,
        })
        .eq("id", worker.id);

      if (updateError) {
        console.error("Failed to link existing user:", updateError);
        throw updateError;
      }

      // Check if role already exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", existingUser.id)
        .eq("role", "spa_worker")
        .single();

      if (!existingRole) {
        await supabase.from("user_roles").insert({
          user_id: existingUser.id,
          role: "spa_worker",
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Account already exists. Please sign in with your existing password.",
          existingAccount: true
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Create new auth user with admin API (auto-confirms email)
    const { data: authData, error: createUserError } = await supabase.auth.admin.createUser({
      email: worker.email,
      password: password,
      email_confirm: true, // Auto-confirm email for invited workers
      user_metadata: {
        first_name: worker.first_name,
        last_name: worker.last_name,
      },
    });

    if (createUserError) {
      console.error("Failed to create user:", createUserError);
      return new Response(
        JSON.stringify({ error: createUserError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Update spa_worker record with user_id
    const { error: updateWorkerError } = await supabase
      .from("spa_workers")
      .update({
        user_id: authData.user.id,
        invite_accepted_at: new Date().toISOString(),
        invite_token: null,
      })
      .eq("id", worker.id);

    if (updateWorkerError) {
      console.error("Failed to update worker:", updateWorkerError);
      // Don't throw - user was created, worker link can be fixed manually
    }

    // 7. Assign spa_worker role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: "spa_worker",
      });

    if (roleError) {
      console.error("Failed to assign role:", roleError);
      // Don't throw - account was created, role can be assigned manually
    }

    // 8. Create/upsert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        first_name: worker.first_name,
        last_name: worker.last_name,
        email: worker.email,
      });

    if (profileError) {
      console.error("Failed to create profile:", profileError);
    }

    // 9. Log to audit
    await supabase.from("audit_log").insert({
      entity_type: "spa_worker",
      entity_id: worker.id,
      action_type: "invite_accepted",
      after_json: { 
        user_id: authData.user.id, 
        email: worker.email,
        worker_id: worker.id
      },
    });

    console.log("Worker signup complete:", {
      workerId: worker.id,
      userId: authData.user.id,
      email: worker.email
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account created successfully",
        email: worker.email
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in complete-worker-signup:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
