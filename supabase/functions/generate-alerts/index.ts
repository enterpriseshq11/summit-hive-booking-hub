import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log("[GENERATE-ALERTS] Starting daily alert generation...");
    const now = new Date();
    const alertsToCreate: any[] = [];

    // 1. Check for untouched leads (24h, 48h, 72h)
    const { data: leads } = await supabaseClient
      .from("crm_leads")
      .select("id, lead_name, created_at, status")
      .eq("status", "new");

    for (const lead of leads || []) {
      const createdAt = new Date(lead.created_at);
      const hoursOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      let severity: string | null = null;
      if (hoursOld >= 72) severity = "high";
      else if (hoursOld >= 48) severity = "medium";
      else if (hoursOld >= 24) severity = "low";

      if (severity) {
        // Check for existing alert
        const { data: existing } = await supabaseClient
          .from("crm_alerts")
          .select("id")
          .eq("entity_type", "lead")
          .eq("entity_id", lead.id)
          .eq("alert_type", "lead_untouched")
          .eq("is_dismissed", false)
          .limit(1);

        if (!existing || existing.length === 0) {
          alertsToCreate.push({
            alert_type: "lead_untouched",
            title: `Lead untouched for ${Math.floor(hoursOld)}h`,
            description: `${lead.lead_name} has been in "new" status without activity`,
            entity_type: "lead",
            entity_id: lead.id,
            severity,
            target_roles: ["owner", "manager"],
          });
        }
      }
    }

    // 2. Check for overdue follow-ups
    const { data: overdueLeads } = await supabaseClient
      .from("crm_leads")
      .select("id, lead_name, follow_up_due")
      .lt("follow_up_due", now.toISOString())
      .not("status", "in", '("won","lost")');

    for (const lead of overdueLeads || []) {
      const { data: existing } = await supabaseClient
        .from("crm_alerts")
        .select("id")
        .eq("entity_type", "lead")
        .eq("entity_id", lead.id)
        .eq("alert_type", "follow_up_overdue")
        .eq("is_dismissed", false)
        .limit(1);

      if (!existing || existing.length === 0) {
        alertsToCreate.push({
          alert_type: "follow_up_overdue",
          title: "Follow-up overdue",
          description: `${lead.lead_name} follow-up was due ${lead.follow_up_due}`,
          entity_type: "lead",
          entity_id: lead.id,
          severity: "high",
          target_roles: ["owner", "manager"],
        });
      }
    }

    // 3. Check for employee inactivity (24h)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { data: employees } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .not("role", "in", '("owner")');

    for (const emp of employees || []) {
      const { data: recentActivity } = await supabaseClient
        .from("crm_activity_events")
        .select("id")
        .eq("actor_id", emp.user_id)
        .gte("created_at", oneDayAgo)
        .limit(1);

      if (!recentActivity || recentActivity.length === 0) {
        const { data: existing } = await supabaseClient
          .from("crm_alerts")
          .select("id")
          .eq("entity_type", "employee")
          .eq("entity_id", emp.user_id)
          .eq("alert_type", "employee_inactive")
          .eq("is_dismissed", false)
          .limit(1);

        if (!existing || existing.length === 0) {
          alertsToCreate.push({
            alert_type: "employee_inactive",
            title: "Employee inactive",
            description: "No CRM activity in the last 24 hours",
            entity_type: "employee",
            entity_id: emp.user_id,
            severity: "low",
            target_roles: ["owner", "manager"],
          });
        }
      }
    }

    // 4. Check for revenue events missing commissions
    const { data: revenueWithoutCommission } = await supabaseClient
      .from("crm_revenue_events")
      .select("id, amount, business_unit, employee_attributed_id")
      .not("employee_attributed_id", "is", null);

    for (const rev of revenueWithoutCommission || []) {
      const { data: commission } = await supabaseClient
        .from("crm_commissions")
        .select("id")
        .eq("revenue_event_id", rev.id)
        .limit(1);

      if (!commission || commission.length === 0) {
        const { data: existing } = await supabaseClient
          .from("crm_alerts")
          .select("id")
          .eq("entity_type", "revenue_event")
          .eq("entity_id", rev.id)
          .eq("alert_type", "revenue_missing_commission")
          .eq("is_dismissed", false)
          .limit(1);

        if (!existing || existing.length === 0) {
          alertsToCreate.push({
            alert_type: "revenue_missing_commission",
            title: "Revenue missing commission",
            description: `$${rev.amount} ${rev.business_unit} revenue has no commission record`,
            entity_type: "revenue_event",
            entity_id: rev.id,
            severity: "medium",
            target_roles: ["owner", "manager"],
          });
        }
      }
    }

    // 5. Check for pending commissions > 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: stalePending } = await supabaseClient
      .from("crm_commissions")
      .select("id, amount, employee_id")
      .eq("status", "pending")
      .lt("created_at", sevenDaysAgo);

    for (const comm of stalePending || []) {
      const { data: existing } = await supabaseClient
        .from("crm_alerts")
        .select("id")
        .eq("entity_type", "commission")
        .eq("entity_id", comm.id)
        .eq("alert_type", "commission_pending_stale")
        .eq("is_dismissed", false)
        .limit(1);

      if (!existing || existing.length === 0) {
        alertsToCreate.push({
          alert_type: "commission_pending_stale",
          title: "Commission pending > 7 days",
          description: `$${comm.amount} commission awaiting approval`,
          entity_type: "commission",
          entity_id: comm.id,
          severity: "medium",
          target_roles: ["owner", "manager"],
        });
      }
    }

    // Insert all new alerts
    if (alertsToCreate.length > 0) {
      const { error } = await supabaseClient.from("crm_alerts").insert(alertsToCreate);
      if (error) throw error;
    }

    console.log(`[GENERATE-ALERTS] Created ${alertsToCreate.length} new alerts`);

    return new Response(
      JSON.stringify({ success: true, alerts_created: alertsToCreate.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[GENERATE-ALERTS] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
