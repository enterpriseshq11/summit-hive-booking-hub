import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface KpiTileConfig {
  id: string;
  title: string;
  category: "revenue" | "leads" | "operations" | "team";
  size: "small" | "medium" | "large";
  href?: string;
}

// ── Consolidated KPI hooks using server-side functions ──

export function useRevenueKpis() {
  return useQuery({
    queryKey: ["kpi", "revenue"],
    queryFn: async () => {
      // Use owner dashboard function for revenue data (most comprehensive)
      const { data, error } = await supabase.rpc("get_owner_dashboard_kpis" as any, {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error || !data) {
        return {
          totalRevenueToday: 0, totalRevenueMonth: 0, stripePaymentsToday: 0,
          outstandingBalances: 0, unitRevenue: {} as Record<string, number>, stripeIntegrated: true,
        };
      }
      const d = data as any;
      return {
        totalRevenueToday: d.total_revenue_today || 0,
        totalRevenueMonth: d.total_revenue_month || 0,
        stripePaymentsToday: d.stripe_payments_today || 0,
        outstandingBalances: d.outstanding_balances || 0,
        unitRevenue: d.revenue_by_unit || {},
        stripeIntegrated: true,
      };
    },
    refetchInterval: 60000,
  });
}

export function useLeadKpis(userId?: string) {
  return useQuery({
    queryKey: ["kpi", "leads", userId],
    queryFn: async () => {
      const uid = userId || (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase.rpc("get_owner_dashboard_kpis" as any, {
        p_user_id: uid,
      });
      if (error || !data) {
        return {
          totalActive: 0, newLeadsWeek: 0, contactedToday: 0,
          overdue: 0, hotNoContact: 0, conversionRate: 0,
          sourceBreakdown: {}, unitBreakdown: {},
        };
      }
      const d = data as any;
      return {
        totalActive: d.total_active_leads || 0,
        newLeadsWeek: d.new_leads_week || 0,
        contactedToday: d.leads_contacted_today || 0,
        overdue: d.overdue_follow_ups || 0,
        hotNoContact: d.hot_leads_no_contact || 0,
        conversionRate: d.pipeline_conversion_rate || 0,
        sourceBreakdown: d.leads_by_source || {},
        unitBreakdown: d.leads_by_unit || {},
      };
    },
    refetchInterval: 60000,
  });
}

export function useOpsKpis() {
  return useQuery({
    queryKey: ["kpi", "operations"],
    queryFn: async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase.rpc("get_owner_dashboard_kpis" as any, {
        p_user_id: uid,
      });
      if (error || !data) {
        return {
          bookingsToday: 0, bookingsWeek: 0, pendingApprovals: 0,
          activeMemberships: 0, openOffices: "0/0", occupiedOffices: 0,
          totalOffices: 0, occupancyRate: 0,
        };
      }
      const d = data as any;
      return {
        bookingsToday: d.bookings_today || 0,
        bookingsWeek: d.bookings_week || 0,
        pendingApprovals: d.pending_approvals || 0,
        activeMemberships: d.active_memberships || 0,
        openOffices: d.open_office_listings || "0/0",
        occupiedOffices: 0,
        totalOffices: 0,
        occupancyRate: d.hive_occupancy_rate || 0,
      };
    },
    refetchInterval: 60000,
  });
}

export function useTeamKpis() {
  return useQuery({
    queryKey: ["kpi", "team"],
    queryFn: async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase.rpc("get_owner_dashboard_kpis" as any, {
        p_user_id: uid,
      });
      if (error || !data) {
        return { commissionPending: 0, commissionApproved: 0, nextPayrollDate: null as string | null };
      }
      const d = data as any;
      // Next payroll run date from admin_settings
      let nextPayrollDate: string | null = null;
      try {
        const { data: setting } = await (supabase as any)
          .from("admin_settings")
          .select("value")
          .eq("key", "next_payroll_run_date")
          .maybeSingle();
        if (setting?.value) nextPayrollDate = setting.value;
      } catch { /* table may not exist */ }

      return {
        commissionPending: d.commission_pending || 0,
        commissionApproved: d.commission_approved_unpaid || 0,
        nextPayrollDate,
      };
    },
    refetchInterval: 60000,
  });
}

// Default tile layout for Dylan
export const DYLAN_DEFAULT_TILES: KpiTileConfig[] = [
  { id: "rev_today", title: "Total Revenue Today", category: "revenue", size: "medium" },
  { id: "rev_month", title: "Total Revenue This Month", category: "revenue", size: "medium" },
  { id: "stripe_today", title: "Stripe Payments Today", category: "revenue", size: "medium" },
  { id: "outstanding", title: "Outstanding Balances", category: "revenue", size: "medium" },
  { id: "rev_summit", title: "Summit Revenue", category: "revenue", size: "small" },
  { id: "rev_spa", title: "Spa Revenue", category: "revenue", size: "small" },
  { id: "rev_fitness", title: "Fitness Revenue", category: "revenue", size: "small" },
  { id: "rev_hive", title: "Hive Revenue", category: "revenue", size: "small" },
  { id: "rev_vault", title: "Voice Vault Revenue", category: "revenue", size: "small" },
  { id: "rev_mobile", title: "Mobile Homes Revenue", category: "revenue", size: "small" },
  { id: "rev_elevated", title: "Elevated by Elyse Revenue", category: "revenue", size: "small" },
  { id: "leads_active", title: "Total Active Leads", category: "leads", size: "medium", href: "/admin/leads" },
  { id: "leads_new", title: "New Leads This Week", category: "leads", size: "medium", href: "/admin/leads" },
  { id: "leads_contacted", title: "Leads Contacted Today", category: "leads", size: "small" },
  { id: "leads_overdue", title: "Overdue Follow-Ups", category: "leads", size: "medium", href: "/admin/leads?filter=overdue" },
  { id: "leads_hot", title: "Hot Leads No Contact 24h", category: "leads", size: "medium", href: "/admin/pipeline?filter=hot" },
  { id: "pipeline_rate", title: "Pipeline Conversion Rate", category: "leads", size: "small" },
  { id: "bookings_today", title: "Bookings Today", category: "operations", size: "medium", href: "/admin/schedule" },
  { id: "bookings_week", title: "Bookings This Week", category: "operations", size: "small" },
  { id: "approvals", title: "Pending Approvals", category: "operations", size: "medium", href: "/admin/approvals" },
  { id: "offices", title: "Open Office Listings", category: "operations", size: "small", href: "/admin/business/hive/office-listings" },
  { id: "occupancy", title: "Hive Occupancy Rate", category: "operations", size: "small", href: "/admin/business/hive/office-listings" },
  { id: "memberships", title: "Active Memberships", category: "operations", size: "small" },
  { id: "comm_pending", title: "Commission Pending", category: "team", size: "medium", href: "/admin/commissions" },
  { id: "comm_approved", title: "Commission Approved Unpaid", category: "team", size: "medium" },
  { id: "payroll_next", title: "Next Payroll Run", category: "team", size: "small" },
];

// Role-based fixed dashboards
export const VICTORIA_TILES: KpiTileConfig[] = [
  { id: "rev_today", title: "Total Revenue Today", category: "revenue", size: "medium" },
  { id: "rev_month", title: "Total Revenue This Month", category: "revenue", size: "medium" },
  { id: "leads_active", title: "Active Leads", category: "leads", size: "medium", href: "/admin/leads" },
  { id: "leads_overdue", title: "Overdue Follow-Ups", category: "leads", size: "medium", href: "/admin/leads?filter=overdue" },
  { id: "bookings_today", title: "Bookings Today", category: "operations", size: "medium", href: "/admin/schedule" },
  { id: "bookings_week", title: "Bookings This Week", category: "operations", size: "small" },
  { id: "approvals", title: "Pending Approvals", category: "operations", size: "medium", href: "/admin/approvals" },
  { id: "occupancy", title: "Hive Occupancy Rate", category: "operations", size: "small", href: "/admin/business/hive/office-listings" },
  { id: "pipeline_rate", title: "Pipeline Conversion Rate", category: "leads", size: "small" },
  { id: "leads_hot", title: "Hot Leads No Contact 24h", category: "leads", size: "medium", href: "/admin/pipeline?filter=hot" },
];

export const MARK_TILES: KpiTileConfig[] = [
  { id: "leads_active", title: "My Assigned Leads", category: "leads", size: "medium", href: "/admin/leads" },
  { id: "pipeline_breakdown", title: "Pipeline Breakdown", category: "leads", size: "large" },
  { id: "leads_overdue", title: "Overdue Follow-Ups", category: "leads", size: "medium", href: "/admin/leads?filter=overdue" },
  { id: "comm_pending", title: "My Commission Pending", category: "team", size: "medium" },
  { id: "comm_paid", title: "Commission Paid This Month", category: "team", size: "medium" },
  { id: "leads_new", title: "New Leads — Summit & Mobile", category: "leads", size: "medium" },
];

export const NASIYA_TILES: KpiTileConfig[] = [
  { id: "schedule_today", title: "My Schedule Today", category: "operations", size: "large" },
  { id: "bookings_today_spa", title: "Spa Bookings Today", category: "operations", size: "medium" },
  { id: "rev_spa_today", title: "Spa Revenue Today", category: "revenue", size: "medium" },
  { id: "comm_pending", title: "My Commission Pending", category: "team", size: "medium" },
  { id: "leads_new_spa", title: "Spa New Leads This Week", category: "leads", size: "medium" },
];

export const ELYSE_TILES: KpiTileConfig[] = [
  { id: "leads_new", title: "Total Leads This Week", category: "leads", size: "medium" },
  { id: "leads_source", title: "New Leads by Source", category: "leads", size: "large" },
  { id: "pipeline_rate", title: "Pipeline Conversion Rate", category: "leads", size: "small" },
  { id: "rev_elevated", title: "Elevated by Elyse Revenue", category: "revenue", size: "medium" },
  { id: "promotions_active", title: "Active Promotions", category: "operations", size: "small" },
  { id: "approvals", title: "Pending Approvals", category: "operations", size: "medium" },
];

export const ROSE_TILES: KpiTileConfig[] = [
  { id: "leads_overdue", title: "Overdue Follow-Ups", category: "leads", size: "medium", href: "/admin/leads?filter=overdue" },
  { id: "bookings_today", title: "Bookings Today", category: "operations", size: "medium", href: "/admin/schedule" },
  { id: "bookings_week", title: "Bookings This Week", category: "operations", size: "small" },
  { id: "approvals", title: "Pending Approvals", category: "operations", size: "medium", href: "/admin/approvals" },
  { id: "occupancy", title: "Hive Occupancy Rate", category: "operations", size: "small", href: "/admin/business/hive/office-listings" },
  { id: "leads_active", title: "Active Leads", category: "leads", size: "medium", href: "/admin/leads" },
  { id: "leads_hot", title: "Hot Leads No Contact 24h", category: "leads", size: "medium" },
  { id: "schedule_gaps", title: "Schedule Gaps This Week", category: "operations", size: "medium" },
];

export const KAE_TILES: KpiTileConfig[] = [
  { id: "leads_source", title: "New Leads by Source", category: "leads", size: "large" },
  { id: "leads_unit", title: "Lead Volume by Unit", category: "leads", size: "large" },
  { id: "promotions_active", title: "Active Promotions", category: "operations", size: "small" },
  { id: "pipeline_rate_top", title: "Lead to Responded Rate", category: "leads", size: "small" },
  { id: "cost_per_lead", title: "Cost Per Lead", category: "leads", size: "medium", href: "/admin/marketing/ad-tracking" },
  { id: "ad_spend_month", title: "Total Ad Spend This Month", category: "revenue", size: "medium", href: "/admin/marketing/ad-tracking" },
];
