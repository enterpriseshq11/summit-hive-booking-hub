import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("spa-worker-complete-onboarding: Starting...");

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - no token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create supabase client with user's token for auth check
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Use service role client for database operations (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Find the worker linked to this user
    const { data: worker, error: workerError } = await adminClient
      .from("spa_workers")
      .select("id, display_name, slug, is_active, deleted_at, onboarding_complete, first_name, last_name")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (workerError || !worker) {
      console.error("Worker lookup error:", workerError);
      return new Response(
        JSON.stringify({ error: "No worker profile found for this user" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Found worker:", worker.id, worker.display_name);

    if (!worker.is_active) {
      return new Response(
        JSON.stringify({ error: "Your worker account is not active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if worker has at least 1 availability window
    const { count: availabilityCount, error: availError } = await adminClient
      .from("spa_worker_availability")
      .select("*", { count: "exact", head: true })
      .eq("worker_id", worker.id);

    if (availError) {
      console.error("Availability check error:", availError);
      throw availError;
    }

    if (!availabilityCount || availabilityCount === 0) {
      return new Response(
        JSON.stringify({ error: "Please set your availability schedule first" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Worker has", availabilityCount, "availability windows");

    // Check if worker has at least 1 active service
    const { count: serviceCount, error: serviceError } = await adminClient
      .from("spa_worker_services")
      .select("*", { count: "exact", head: true })
      .eq("worker_id", worker.id)
      .eq("is_active", true);

    if (serviceError) {
      console.error("Service check error:", serviceError);
      throw serviceError;
    }

    if (!serviceCount || serviceCount === 0) {
      return new Response(
        JSON.stringify({ error: "Please add at least one service first" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Worker has", serviceCount, "active services");

    // Generate slug if missing
    let finalSlug = worker.slug;
    if (!finalSlug) {
      const baseName = worker.display_name || `${worker.first_name} ${worker.last_name}`;
      const baseSlug = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Check for collision and add suffix if needed
      let slugCandidate = baseSlug;
      let suffix = 2;

      while (true) {
        const { data: existing } = await adminClient
          .from("spa_workers")
          .select("id")
          .eq("slug", slugCandidate)
          .neq("id", worker.id)
          .maybeSingle();

        if (!existing) {
          finalSlug = slugCandidate;
          break;
        }

        slugCandidate = `${baseSlug}-${suffix}`;
        suffix++;

        if (suffix > 100) {
          // Safety limit
          finalSlug = `${baseSlug}-${Date.now()}`;
          break;
        }
      }

      console.log("Generated slug:", finalSlug);
    }

    // Update spa_workers to mark onboarding complete
    const { error: updateError } = await adminClient
      .from("spa_workers")
      .update({
        onboarding_complete: true,
        slug: finalSlug,
      })
      .eq("id", worker.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    console.log("Successfully marked worker as onboarding_complete");

    // Log the completion
    await adminClient.from("audit_log").insert({
      action_type: "spa_worker_onboarding_complete",
      entity_type: "spa_workers",
      entity_id: worker.id,
      actor_user_id: user.id,
      after_json: {
        worker_id: worker.id,
        slug: finalSlug,
        availability_count: availabilityCount,
        service_count: serviceCount,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        worker_id: worker.id,
        slug: finalSlug,
        message: "Onboarding complete! You are now visible to customers.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("spa-worker-complete-onboarding error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
