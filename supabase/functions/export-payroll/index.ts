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
    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;

    // Check admin role
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .in("role", ["owner", "manager"]);

    if (!roles || roles.length === 0) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { payroll_run_id, format = "csv" } = await req.json();

    if (!payroll_run_id) {
      throw new Error("payroll_run_id is required");
    }

    // Get payroll run details
    const { data: payrollRun, error: runError } = await supabaseClient
      .from("payroll_runs")
      .select("*")
      .eq("id", payroll_run_id)
      .single();

    if (runError) throw runError;

    // Get commissions with employee and revenue details
    const { data: commissions, error: commError } = await supabaseClient
      .from("crm_commissions")
      .select(`
        id,
        amount,
        status,
        created_at,
        approved_at,
        paid_at,
        employee:profiles!crm_commissions_employee_id_fkey(id, first_name, last_name, email),
        revenue_event:crm_revenue_events(id, amount, business_unit, description, revenue_date),
        rule:commission_rules(name, commission_percent)
      `)
      .eq("payroll_run_id", payroll_run_id);

    if (commError) throw commError;

    // Build export data
    const exportData = {
      payroll_run: {
        id: payrollRun.id,
        period_start: payrollRun.period_start,
        period_end: payrollRun.period_end,
        status: payrollRun.status,
        total_amount: payrollRun.total_amount,
        commission_count: payrollRun.commission_count,
        approved_at: payrollRun.approved_at,
        paid_at: payrollRun.paid_at,
      },
      commissions: commissions?.map((c: any) => ({
        commission_id: c.id,
        employee_name: `${c.employee?.first_name || ""} ${c.employee?.last_name || ""}`.trim(),
        employee_email: c.employee?.email || "",
        commission_amount: c.amount,
        revenue_amount: c.revenue_event?.amount || 0,
        business_unit: c.revenue_event?.business_unit || "",
        revenue_description: c.revenue_event?.description || "",
        revenue_date: c.revenue_event?.revenue_date || "",
        rule_name: c.rule?.name || "",
        commission_percent: c.rule?.commission_percent || 0,
        status: c.status,
        approved_at: c.approved_at,
        paid_at: c.paid_at,
      })) || [],
      summary: {
        total_commissions: commissions?.length || 0,
        total_payout: commissions?.reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0,
        by_employee: {} as Record<string, number>,
      },
    };

    // Calculate per-employee totals
    commissions?.forEach((c: any) => {
      const email = c.employee?.email || "unknown";
      exportData.summary.by_employee[email] = 
        (exportData.summary.by_employee[email] || 0) + Number(c.amount);
    });

    if (format === "json") {
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="payroll-${payrollRun.period_start}-${payrollRun.period_end}.json"`,
        },
      });
    }

    // Generate CSV
    const csvRows = [
      // Header
      ["Employee Name", "Employee Email", "Commission Amount", "Revenue Amount", "Business Unit", "Description", "Revenue Date", "Rule", "Rate %", "Status", "Approved At", "Paid At"].join(","),
      // Data rows
      ...exportData.commissions.map((c) => [
        `"${c.employee_name}"`,
        `"${c.employee_email}"`,
        c.commission_amount,
        c.revenue_amount,
        `"${c.business_unit}"`,
        `"${c.revenue_description}"`,
        c.revenue_date,
        `"${c.rule_name}"`,
        c.commission_percent,
        c.status,
        c.approved_at || "",
        c.paid_at || "",
      ].join(",")),
      "",
      // Summary
      `"TOTAL","","${exportData.summary.total_payout}","","","","","","","","",""`,
    ];

    const csvContent = csvRows.join("\n");

    return new Response(csvContent, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="payroll-${payrollRun.period_start}-${payrollRun.period_end}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
