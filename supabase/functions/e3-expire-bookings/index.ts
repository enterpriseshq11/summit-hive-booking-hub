import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders }

  // ---- SECURITY: require admin JWT or service-role key ----
  const _authHeader = req.headers.get("Authorization") || "";
  const _bearer = _authHeader.replace(/^Bearer\s+/i, "");
  const _serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!_bearer) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (_bearer !== _serviceKey) {
    const _adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${_bearer}` } } },
    );
    const { data: _userData, error: _userErr } = await _adminClient.auth.getUser();
    if (_userErr || !_userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const _svc = createClient(Deno.env.get("SUPABASE_URL") ?? "", _serviceKey, { auth: { persistSession: false } });
    const { data: _roleRows } = await _svc
      .from("user_roles").select("role").eq("user_id", _userData.user.id);
    const _isAdmin = (_roleRows || []).some((r: any) => r.role === "owner" || r.role === "manager");
    if (!_isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
  // ---- END SECURITY ----
);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Expire stale red holds
    const { data: expiredCount, error: expErr } = await supabase.rpc("e3_expire_stale_bookings");
    if (expErr) console.error("Expire error:", expErr);

    // Revert missed deposits
    const { data: revertedCount, error: revErr } = await supabase.rpc("e3_revert_missed_deposits");
    if (revErr) console.error("Revert error:", revErr);

    const result = {
      expired: expiredCount ?? 0,
      reverted: revertedCount ?? 0,
      timestamp: new Date().toISOString(),
    };

    console.log("E3 expiration job:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("E3 expire error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
