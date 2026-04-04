import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, startOfWeek, startOfMonth, subDays, format } from "date-fns";

export interface KpiTileConfig {
  id: string;
  title: string;
  category: "revenue" | "leads" | "operations" | "team";
  size: "small" | "medium" | "large";
  href?: string;
}

const today = () => startOfDay(new Date()).toISOString();
const weekStart = () => startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
const monthStart = () => startOfMonth(new Date()).toISOString();

export function useRevenueKpis() {
  return useQuery({
    queryKey: ["kpi", "revenue"],
    queryFn: async () => {
      const todayStr = today();
      const monthStr = monthStart();

      // Revenue events today
      const { data: todayRevenue } = await supabase
        .from("crm_revenue_events")
        .select("amount, business_unit")
        .gte("revenue_date", todayStr);

      // Revenue events this month
      const { data: monthRevenue } = await supabase
        .from("crm_revenue_events")
        .select("amount, business_unit")
        .gte("revenue_date", monthStr);

      // Outstanding balances (deposits paid, balance_due > 0)
      const { data: outstanding } = await supabase
        .from("bookings")
        .select("balance_due")
        .gt("balance_due", 0)
        .not("status", "in", '("cancelled","completed")');

      const sumBy = (data: any[], unit?: string) =>
        (data || [])
          .filter((r: any) => !unit || r.business_unit === unit)
          .reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);

      const units = ["summit", "spa", "fitness", "coworking", "voice_vault", "mobile_homes", "elevated_by_elyse"];
      const unitRevenue: Record<string, number> = {};
      units.forEach(u => { unitRevenue[u] = sumBy(monthRevenue || [], u); });

      // Stripe payments today
      let stripeToday = 0;
      try {
        const { data: stripeTxns } = await (supabase as any)
          .from("stripe_transactions")
          .select("amount")
          .eq("status", "succeeded")
          .gte("stripe_created_at", todayStr)
          .or("is_duplicate.is.null,is_duplicate.eq.false");
        stripeToday = (stripeTxns || []).reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0) / 100;
      } catch { /* table may not exist */ }

      return {
        totalRevenueToday: sumBy(todayRevenue || []),
        totalRevenueMonth: sumBy(monthRevenue || []),
        stripePaymentsToday: stripeToday,
        outstandingBalances: (outstanding || []).reduce((s, r) => s + (Number(r.balance_due) || 0), 0),
        unitRevenue,
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
      const weekStr = weekStart();
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss");

      // Total active leads
      const { count: totalActive } = await supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .not("status", "in", '("won","lost")');

      // New leads this week
      const { data: newLeadsWeek } = await supabase
        .from("crm_leads")
        .select("id, source, business_unit")
        .gte("created_at", weekStr);

      // Leads contacted today
      const { count: contactedToday } = await supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .gte("last_contacted_at", todayStr);

      // Overdue follow-ups
      const { count: overdue } = await supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .lt("follow_up_due", todayStr + "T23:59:59")
        .not("status", "in", '("won","lost")');

      // Hot leads no contact 24h
      const { count: hotNoContact } = await supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .eq("temperature", "hot")
        .or(`last_contacted_at.is.null,last_contacted_at.lt.${yesterday}`);

      // Pipeline conversion rate
      const { count: totalLeads } = await supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true });
      const { count: bookedLeads } = await supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "won");

      const conversionRate = (totalLeads || 0) > 0
        ? Math.round(((bookedLeads || 0) / (totalLeads || 1)) * 100)
        : 0;

      // Source breakdown
      const sourceBreakdown: Record<string, number> = {};
      (newLeadsWeek || []).forEach((l: any) => {
        const src = l.source || "unknown";
        sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
      });

      // Unit breakdown for Kae
      const unitBreakdown: Record<string, number> = {};
      (newLeadsWeek || []).forEach((l: any) => {
        const unit = l.business_unit || "unknown";
        unitBreakdown[unit] = (unitBreakdown[unit] || 0) + 1;
      });

      return {
        totalActive: totalActive || 0,
        newLeadsWeek: newLeadsWeek?.length || 0,
        contactedToday: contactedToday || 0,
        overdue: overdue || 0,
        hotNoContact: hotNoContact || 0,
        conversionRate,
        sourceBreakdown,
        unitBreakdown,
      };
    },
    refetchInterval: 60000,
  });
}

export function useOpsKpis() {
  return useQuery({
    queryKey: ["kpi", "operations"],
    queryFn: async () => {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const weekEnd = format(subDays(startOfWeek(new Date(), { weekStartsOn: 1 }), -6), "yyyy-MM-dd");

      // Bookings today
      const { count: bookingsToday } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("start_datetime", todayStr)
        .lt("start_datetime", todayStr + "T23:59:59");

      // Bookings this week
      const { count: bookingsWeek } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("start_datetime", weekStart())
        .lt("start_datetime", weekEnd + "T23:59:59");

      // Pending approvals
      const { count: pendingApprovals } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      // Active memberships - query may fail if table doesn't exist
      let activeMemberships = 0;
      try {
        const { count } = await supabase
          .from("memberships" as any)
          .select("id", { count: "exact", head: true })
          .eq("status", "active");
        activeMemberships = count || 0;
      } catch {
        activeMemberships = 0;
      }

      // Office occupancy
      const { data: offices } = await supabase
        .from("hive_private_offices")
        .select("id, status");
      const totalOffices = offices?.length || 0;
      const occupiedOffices = offices?.filter((o: any) => o.status === "booked").length || 0;
      const availableOffices = totalOffices - occupiedOffices;

      return {
        bookingsToday: bookingsToday || 0,
        bookingsWeek: bookingsWeek || 0,
        pendingApprovals: pendingApprovals || 0,
        activeMemberships: activeMemberships || 0,
        openOffices: `${availableOffices}/${totalOffices}`,
        occupiedOffices,
        totalOffices,
        occupancyRate: totalOffices > 0 ? Math.round((occupiedOffices / totalOffices) * 100) : 0,
      };
    },
    refetchInterval: 60000,
  });
}

export function useTeamKpis() {
  return useQuery({
    queryKey: ["kpi", "team"],
    queryFn: async () => {
      // Commission pending approval
      const { data: pendingComm } = await supabase
        .from("crm_commissions")
        .select("amount")
        .eq("status", "pending");

      // Commission approved unpaid
      const { data: approvedComm } = await supabase
        .from("crm_commissions")
        .select("amount")
        .eq("status", "approved");

      // Next payroll run date from admin_settings
      let nextPayrollDate: string | null = null;
      try {
        const { data: setting } = await (supabase as any)
          .from("admin_settings")
          .select("value")
          .eq("key", "next_payroll_run_date")
          .maybeSingle();
        if (setting?.value) {
          nextPayrollDate = setting.value;
        }
      } catch { /* table may not exist yet */ }

      return {
        commissionPending: (pendingComm || []).reduce((s, r) => s + (Number(r.amount) || 0), 0),
        commissionApproved: (approvedComm || []).reduce((s, r) => s + (Number(r.amount) || 0), 0),
        nextPayrollDate,
      };
    },
    refetchInterval: 60000,
  });
}

// Default tile layout for Dylan
export const DYLAN_DEFAULT_TILES: KpiTileConfig[] = [
  // Row 1 - Revenue Overview
  { id: "rev_today", title: "Total Revenue Today", category: "revenue", size: "medium" },
  { id: "rev_month", title: "Total Revenue This Month", category: "revenue", size: "medium" },
  { id: "stripe_today", title: "Stripe Payments Today", category: "revenue", size: "medium" },
  { id: "outstanding", title: "Outstanding Balances", category: "revenue", size: "medium" },
  // Row 2 - Revenue by Unit
  { id: "rev_summit", title: "Summit Revenue", category: "revenue", size: "small" },
  { id: "rev_spa", title: "Spa Revenue", category: "revenue", size: "small" },
  { id: "rev_fitness", title: "Fitness Revenue", category: "revenue", size: "small" },
  { id: "rev_hive", title: "Hive Revenue", category: "revenue", size: "small" },
  { id: "rev_vault", title: "Voice Vault Revenue", category: "revenue", size: "small" },
  { id: "rev_mobile", title: "Mobile Homes Revenue", category: "revenue", size: "small" },
  { id: "rev_elevated", title: "Elevated by Elyse Revenue", category: "revenue", size: "small" },
  // Row 3 - Leads
  { id: "leads_active", title: "Total Active Leads", category: "leads", size: "medium", href: "/admin/leads" },
  { id: "leads_new", title: "New Leads This Week", category: "leads", size: "medium", href: "/admin/leads" },
  { id: "leads_contacted", title: "Leads Contacted Today", category: "leads", size: "small" },
  { id: "leads_overdue", title: "Overdue Follow-Ups", category: "leads", size: "medium", href: "/admin/leads?filter=overdue" },
  { id: "leads_hot", title: "Hot Leads No Contact 24h", category: "leads", size: "medium", href: "/admin/pipeline?filter=hot" },
  { id: "pipeline_rate", title: "Pipeline Conversion Rate", category: "leads", size: "small" },
  // Row 4 - Operations
  { id: "bookings_today", title: "Bookings Today", category: "operations", size: "medium", href: "/admin/schedule" },
  { id: "bookings_week", title: "Bookings This Week", category: "operations", size: "small" },
  { id: "approvals", title: "Pending Approvals", category: "operations", size: "medium", href: "/admin/approvals" },
  { id: "offices", title: "Open Office Listings", category: "operations", size: "small" },
  { id: "memberships", title: "Active Memberships", category: "operations", size: "small" },
  // Row 5 - Team
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
  { id: "leads_active", title: "Active Leads", category: "leads", size: "medium", href: "/admin/leads" },
  { id: "leads_hot", title: "Hot Leads No Contact 24h", category: "leads", size: "medium" },
  { id: "schedule_gaps", title: "Schedule Gaps This Week", category: "operations", size: "medium" },
];

export const KAE_TILES: KpiTileConfig[] = [
  { id: "leads_source", title: "New Leads by Source", category: "leads", size: "large" },
  { id: "leads_unit", title: "Lead Volume by Unit", category: "leads", size: "large" },
  { id: "promotions_active", title: "Active Promotions", category: "operations", size: "small" },
  { id: "pipeline_rate_top", title: "Lead to Responded Rate", category: "leads", size: "small" },
  { id: "cost_per_lead", title: "Cost Per Lead", category: "leads", size: "medium" },
];
