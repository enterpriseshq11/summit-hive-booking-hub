import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization")!;
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await anonClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: ownerRole } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "owner")
      .maybeSingle();

    if (!ownerRole) {
      return new Response(JSON.stringify({ error: "Owner access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userIds } = await req.json();
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({ error: "userIds array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { id: string; success: boolean; error?: string; method?: string }[] = [];

    for (const uid of userIds) {
      if (uid === user.id) {
        results.push({ id: uid, success: false, error: "Cannot delete yourself" });
        continue;
      }

      // Try hard delete first via REST API directly for more control
      try {
        const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${uid}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ should_soft_delete: false }),
        });

        if (resp.ok) {
          results.push({ id: uid, success: true, method: 'hard_delete' });
          continue;
        }

        const errBody = await resp.text();
        
        // If hard delete fails, try soft delete
        const resp2 = await fetch(`${supabaseUrl}/auth/v1/admin/users/${uid}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ should_soft_delete: true }),
        });

        if (resp2.ok) {
          results.push({ id: uid, success: true, method: 'soft_delete' });
        } else {
          const errBody2 = await resp2.text();
          results.push({ id: uid, success: false, error: `hard: ${errBody}, soft: ${errBody2}` });
        }
      } catch (e) {
        results.push({ id: uid, success: false, error: String(e) });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
