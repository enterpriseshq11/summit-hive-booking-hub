import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Role-based KPI hook — calls the correct consolidated DB function per role.
 */
export function useRoleKpis(role: string | undefined) {
  const fnName = getRpcName(role);

  return useQuery({
    queryKey: ["kpi", "role", fnName],
    queryFn: async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase.rpc(fnName as any, { p_user_id: uid });
      if (error) {
        console.warn(`[useRoleKpis] ${fnName} failed:`, error.message);
        return null;
      }
      return data as Record<string, any>;
    },
    refetchInterval: 60_000,
    enabled: !!role,
  });
}

function getRpcName(role: string | undefined): string {
  switch (role) {
    case "owner":
      return "get_owner_dashboard_kpis";
    case "manager":
      return "get_manager_dashboard_kpis";
    case "sales_acquisitions":
      return "get_sales_dashboard_kpis";
    case "spa_lead":
      return "get_spa_dashboard_kpis";
    case "marketing_lead":
      return "get_marketing_dashboard_kpis";
    case "ops_lead":
      return "get_ops_dashboard_kpis";
    case "ads_lead":
      return "get_ads_dashboard_kpis";
    default:
      return "get_manager_dashboard_kpis";
  }
}

/** Maps KPI tile IDs to values from the consolidated data blob */
export function resolveKpiValue(
  id: string,
  d: Record<string, any> | null | undefined
): { value: string | number; subtitle?: string; pending?: boolean } {
  if (!d) return { value: "—", pending: true };
  const fmt = (n: number) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  switch (id) {
    case "rev_today": return { value: fmt(d.total_revenue_today) };
    case "rev_month": return { value: fmt(d.total_revenue_month) };
    case "stripe_today": return { value: fmt(d.stripe_payments_today) };
    case "outstanding": return { value: fmt(d.outstanding_balances) };
    case "rev_summit": return { value: fmt(d.revenue_by_unit?.summit), subtitle: "This Month" };
    case "rev_spa": return { value: fmt(d.revenue_by_unit?.spa), subtitle: "This Month" };
    case "rev_fitness": return { value: fmt(d.revenue_by_unit?.fitness), subtitle: "This Month" };
    case "rev_hive": return { value: fmt(d.revenue_by_unit?.coworking), subtitle: "This Month" };
    case "rev_vault": return { value: fmt(d.revenue_by_unit?.voice_vault), subtitle: "This Month" };
    case "rev_mobile": return { value: fmt(d.revenue_by_unit?.mobile_homes), subtitle: "This Month" };
    case "rev_elevated": return { value: fmt(d.revenue_by_unit?.elevated_by_elyse || d.revenue_month_elevated_by_elyse), subtitle: "This Month" };
    case "rev_spa_today": return { value: fmt(d.spa_revenue_today), subtitle: "Today" };
    case "leads_active": return { value: d.total_active_leads ?? d.active_leads ?? d.assigned_leads_count ?? 0 };
    case "leads_new": return { value: d.new_leads_week ?? d.total_leads_week ?? 0 };
    case "leads_contacted": return { value: d.leads_contacted_today ?? 0, subtitle: "Today" };
    case "leads_overdue": return { value: d.overdue_follow_ups ?? d.overdue_follow_ups_assigned ?? 0 };
    case "leads_hot": return { value: d.hot_leads_no_contact ?? 0 };
    case "pipeline_rate":
    case "pipeline_rate_top": return { value: `${d.pipeline_conversion_rate ?? d.pipeline_conversion_top_of_funnel ?? 0}%` };
    case "leads_source": {
      const src = d.leads_by_source ?? d.new_leads_week_by_source ?? {};
      return { value: Object.entries(src).map(([k, v]) => `${k}: ${v}`).join(", ") || "No data" };
    }
    case "leads_unit": {
      const unit = d.leads_by_unit ?? d.lead_volume_comparison ?? {};
      return { value: Object.entries(unit).map(([k, v]) => `${k}: ${v}`).join(", ") || "No data" };
    }
    case "leads_new_spa": return { value: d.spa_new_leads_week ?? 0 };
    case "bookings_today":
    case "bookings_today_spa": return { value: d.bookings_today ?? d.spa_bookings_today ?? 0 };
    case "bookings_week": return { value: d.bookings_week ?? 0 };
    case "approvals": return { value: d.pending_approvals ?? 0 };
    case "offices": return { value: d.open_office_listings ?? "0/0" };
    case "memberships": return { value: d.active_memberships ?? 0 };
    case "occupancy": return { value: `${d.hive_occupancy_rate ?? 0}%` };
    case "comm_pending": return { value: fmt(d.commission_pending ?? d.commission_pending_month ?? 0) };
    case "comm_approved": return { value: fmt(d.commission_approved_unpaid ?? 0) };
    case "comm_paid": return { value: fmt(d.commission_paid_month ?? 0) };
    case "promotions_active": return { value: d.active_promotions_count ?? 0 };
    case "schedule_today": return { value: d.schedule_today ?? d.bookings_today ?? 0, subtitle: "Appointments" };
    case "schedule_gaps": return { value: d.schedule_gaps_week ?? 0, subtitle: "Days with no bookings" };
    case "pipeline_breakdown": {
      const pb = d.pipeline_stage_breakdown ?? {};
      return { value: Object.entries(pb).map(([k, v]) => `${k}: ${v}`).join(", ") || "—" };
    }
    case "cost_per_lead": return { value: d.cost_per_lead ? fmt(d.cost_per_lead) : "—" };
    case "ad_spend_month": return { value: d.ad_spend_month ? fmt(d.ad_spend_month) : "—" };
    case "payroll_next": return { value: d.next_payroll_run_date || "Not Set", subtitle: "Click to set date" };
    default: return { value: "—" };
  }
}
