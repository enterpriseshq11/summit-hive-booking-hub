import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const results = {
      moved_to_no_response: 0,
      flagged_follow_up_overdue: 0,
      flagged_stalled_hot: 0,
      flagged_deposit_overdue: 0,
    };

    // Rule 1: 3+ contact attempts with no response in 5 days → move to no_response
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { data: noResponseLeads } = await supabase
      .from("crm_leads")
      .select("id, lead_name")
      .in("status", ["new", "contact_attempted"])
      .gte("contact_attempts", 3)
      .lt("updated_at", fiveDaysAgo);

    if (noResponseLeads && noResponseLeads.length > 0) {
      for (const lead of noResponseLeads) {
        await supabase
          .from("crm_leads")
          .update({ status: "no_response" })
          .eq("id", lead.id);

        await supabase.from("crm_activity_events").insert({
          event_type: "lead_status_changed",
          entity_type: "lead",
          entity_id: lead.id,
          entity_name: lead.lead_name,
          event_category: "stage_changed",
          metadata: { automation_rule: "no_response_after_3_attempts" },
          before_data: { status: "contact_attempted" },
          after_data: { status: "no_response" },
        });
      }
      results.moved_to_no_response = noResponseLeads.length;
    }

    // Rule 2: Follow-up overdue → update temperature to flag (handled client-side via visual)
    // We log an activity event for overdue follow-ups not yet flagged
    const now = new Date().toISOString();
    const { data: overdueFollowUps } = await supabase
      .from("crm_leads")
      .select("id, lead_name")
      .lt("follow_up_due", now)
      .not("status", "in", '("booked","lost","no_response")');

    results.flagged_follow_up_overdue = overdueFollowUps?.length ?? 0;

    // Rule 3: Hot leads stalled > 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: stalledHot } = await supabase
      .from("crm_leads")
      .select("id")
      .eq("status", "hot_lead")
      .lt("updated_at", sevenDaysAgo);

    results.flagged_stalled_hot = stalledHot?.length ?? 0;

    // Rule 4: Contract sent but no deposit after 5 days
    const { data: depositOverdue } = await supabase
      .from("crm_leads")
      .select("id")
      .eq("status", "contract_sent")
      .lt("updated_at", fiveDaysAgo);

    results.flagged_deposit_overdue = depositOverdue?.length ?? 0;

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
