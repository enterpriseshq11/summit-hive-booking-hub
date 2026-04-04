import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[HIVE-LATE-PAYMENT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const now = new Date();
    const dayOfMonth = now.getDate();

    // Only create alerts on the 6th or later
    if (dayOfMonth < 6) {
      logStep("Before the 6th, skipping check");
      return new Response(JSON.stringify({ skipped: true, reason: "before_6th" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    logStep("Checking manual leases", { monthStart, monthEnd });

    // Get active manual leases
    const { data: leases, error: leaseErr } = await supabase
      .from("hive_leases")
      .select("id, tenant_name, office_code, monthly_rate")
      .eq("payment_method", "manual")
      .eq("status", "active");

    if (leaseErr) throw leaseErr;
    if (!leases || leases.length === 0) {
      logStep("No manual leases found");
      return new Response(JSON.stringify({ checked: 0, alerts_created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let alertsCreated = 0;

    for (const lease of leases) {
      // Check if revenue event exists for this tenant this month
      const { data: revenueEvents } = await supabase
        .from("crm_revenue_events")
        .select("id")
        .eq("business_unit", "coworking")
        .gte("revenue_date", monthStart)
        .lte("revenue_date", monthEnd)
        .or(`description.ilike.%${lease.tenant_name}%,description.ilike.%${lease.office_code}%`)
        .limit(1);

      if (revenueEvents && revenueEvents.length > 0) {
        continue; // Payment received
      }

      // Check if alert already exists for this month
      const alertDesc = `Manual lease payment not received for ${lease.tenant_name} at ${lease.office_code} — ${monthLabel}`;

      const { data: existingAlert } = await supabase
        .from("crm_alerts")
        .select("id")
        .eq("description", alertDesc)
        .limit(1);

      if (existingAlert && existingAlert.length > 0) {
        continue; // Alert already exists
      }

      // Create alert
      await supabase.from("crm_alerts").insert({
        alert_type: "follow_up_overdue",
        title: `Late Lease Payment — ${lease.tenant_name}`,
        description: alertDesc,
        severity: "warning",
        entity_type: "hive_lease",
        entity_id: lease.id,
        source_filter: "coworking",
        target_roles: ["owner", "manager"],
      });

      alertsCreated++;
      logStep("Alert created", { tenant: lease.tenant_name, office: lease.office_code });
    }

    logStep("Check complete", { checked: leases.length, alertsCreated });

    return new Response(JSON.stringify({ checked: leases.length, alerts_created: alertsCreated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
