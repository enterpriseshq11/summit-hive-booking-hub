import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
