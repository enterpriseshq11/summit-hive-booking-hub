import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, subMonths, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export type DateRangeType = "today" | "week" | "month" | "quarter" | "year" | "custom";

function getDateRange(rangeType: DateRangeType, customStart?: Date, customEnd?: Date) {
  const now = new Date();
  
  switch (rangeType) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "quarter":
      return { start: subMonths(now, 3), end: now };
    case "year":
      return { start: subMonths(now, 12), end: now };
    case "custom":
      return { start: customStart || subDays(now, 30), end: customEnd || now };
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

export function useCrmDashboardStats(dateRange: DateRangeType = "month") {
  return useQuery({
    queryKey: ["crm_dashboard_stats", dateRange],
    queryFn: async () => {
      const { start, end } = getDateRange(dateRange);
      const startStr = start.toISOString();
      const endStr = end.toISOString();

      // Previous period for comparison
      const periodLength = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - periodLength);
      const prevEnd = new Date(end.getTime() - periodLength);
      const prevStartStr = prevStart.toISOString();
      const prevEndStr = prevEnd.toISOString();

      // Current period leads
      const { data: currentLeads } = await supabase
        .from("crm_leads")
        .select("id, status")
        .gte("created_at", startStr)
        .lte("created_at", endStr);

      // Previous period leads
      const { data: prevLeads } = await supabase
        .from("crm_leads")
        .select("id, status")
        .gte("created_at", prevStartStr)
        .lte("created_at", prevEndStr);

      const newLeads = currentLeads?.length || 0;
      const prevNewLeads = prevLeads?.length || 0;
      const contacted = currentLeads?.filter(l => l.status !== "new").length || 0;
      const prevContacted = prevLeads?.filter(l => l.status !== "new").length || 0;
      const converted = currentLeads?.filter(l => l.status === "won").length || 0;
      const prevConverted = prevLeads?.filter(l => l.status === "won").length || 0;

      // Revenue
      const { data: currentRevenue } = await supabase
        .from("crm_revenue_events")
        .select("amount, business_unit")
        .gte("revenue_date", start.toISOString().split("T")[0])
        .lte("revenue_date", end.toISOString().split("T")[0]);

      const { data: prevRevenue } = await supabase
        .from("crm_revenue_events")
        .select("amount")
        .gte("revenue_date", prevStart.toISOString().split("T")[0])
        .lte("revenue_date", prevEnd.toISOString().split("T")[0]);

      const revenueTotal = currentRevenue?.reduce((s, r) => s + Number(r.amount), 0) || 0;
      const prevRevenueTotal = prevRevenue?.reduce((s, r) => s + Number(r.amount), 0) || 0;

      // Revenue by business unit
      const revenueByUnit = (currentRevenue || []).reduce((acc, r) => {
        acc[r.business_unit] = (acc[r.business_unit] || 0) + Number(r.amount);
        return acc;
      }, {} as Record<string, number>);

      // Commission owed
      const { data: pendingCommissions } = await supabase
        .from("crm_commissions")
        .select("amount")
        .in("status", ["pending", "approved"]);

      const commissionOwed = pendingCommissions?.reduce((s, c) => s + Number(c.amount), 0) || 0;

      // Active employees today
      const todayStart = startOfDay(new Date()).toISOString();
      const { data: activeEmployees } = await supabase
        .from("crm_activity_events")
        .select("actor_id")
        .gte("created_at", todayStart);

      const uniqueActiveEmployees = new Set(activeEmployees?.map(a => a.actor_id)).size;

      // Funnel data
      const { data: allLeads } = await supabase
        .from("crm_leads")
        .select("status")
        .gte("created_at", startStr)
        .lte("created_at", endStr);

      const funnelData = [
        { stage: "New", count: allLeads?.filter(l => l.status === "new").length || 0 },
        { stage: "Contacted", count: allLeads?.filter(l => l.status === "contacted").length || 0 },
        { stage: "Qualified", count: allLeads?.filter(l => l.status === "qualified").length || 0 },
        { stage: "Proposal", count: allLeads?.filter(l => l.status === "proposal_sent").length || 0 },
        { stage: "Won", count: allLeads?.filter(l => l.status === "won").length || 0 },
      ];

      return {
        kpis: {
          newLeads: {
            value: newLeads,
            change: prevNewLeads > 0 ? ((newLeads - prevNewLeads) / prevNewLeads) * 100 : 0,
          },
          contacted: {
            value: contacted,
            change: prevContacted > 0 ? ((contacted - prevContacted) / prevContacted) * 100 : 0,
          },
          converted: {
            value: converted,
            change: prevConverted > 0 ? ((converted - prevConverted) / prevConverted) * 100 : 0,
          },
          revenue: {
            value: revenueTotal,
            change: prevRevenueTotal > 0 ? ((revenueTotal - prevRevenueTotal) / prevRevenueTotal) * 100 : 0,
          },
          commissionOwed: {
            value: commissionOwed,
          },
          activeEmployees: {
            value: uniqueActiveEmployees,
          },
        },
        revenueByUnit,
        funnelData,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useSmartAlerts() {
  return useQuery({
    queryKey: ["crm_smart_alerts"],
    queryFn: async () => {
      const alerts: { type: string; severity: string; message: string; entityId?: string; entityType?: string }[] = [];

      // Leads untouched 24h
      const { data: untouched24 } = await supabase
        .from("crm_leads")
        .select("id, lead_name")
        .eq("status", "new")
        .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .gte("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

      untouched24?.forEach(lead => {
        alerts.push({
          type: "lead_untouched_24h",
          severity: "warning",
          message: `Lead "${lead.lead_name}" untouched for 24+ hours`,
          entityId: lead.id,
          entityType: "lead",
        });
      });

      // Leads untouched 48h
      const { data: untouched48 } = await supabase
        .from("crm_leads")
        .select("id, lead_name")
        .eq("status", "new")
        .lt("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
        .gte("created_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString());

      untouched48?.forEach(lead => {
        alerts.push({
          type: "lead_untouched_48h",
          severity: "critical",
          message: `Lead "${lead.lead_name}" untouched for 48+ hours`,
          entityId: lead.id,
          entityType: "lead",
        });
      });

      // Leads untouched 72h
      const { data: untouched72 } = await supabase
        .from("crm_leads")
        .select("id, lead_name")
        .eq("status", "new")
        .lt("created_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString());

      untouched72?.forEach(lead => {
        alerts.push({
          type: "lead_untouched_72h",
          severity: "critical",
          message: `URGENT: Lead "${lead.lead_name}" untouched for 72+ hours`,
          entityId: lead.id,
          entityType: "lead",
        });
      });

      // Leads without assignment
      const { data: unassigned } = await supabase
        .from("crm_leads")
        .select("id, lead_name")
        .is("assigned_employee_id", null)
        .not("status", "in", '("won","lost")');

      unassigned?.forEach(lead => {
        alerts.push({
          type: "lead_unassigned",
          severity: "warning",
          message: `Lead "${lead.lead_name}" has no assignment`,
          entityId: lead.id,
          entityType: "lead",
        });
      });

      // Pending commissions
      const { count: pendingCount } = await supabase
        .from("crm_commissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      if (pendingCount && pendingCount > 0) {
        alerts.push({
          type: "commission_pending",
          severity: "info",
          message: `${pendingCount} commission(s) pending approval`,
        });
      }

      // Overdue follow-ups
      const { data: overdueFollowups } = await supabase
        .from("crm_leads")
        .select("id, lead_name")
        .lt("follow_up_due", new Date().toISOString())
        .not("status", "in", '("won","lost")');

      overdueFollowups?.forEach(lead => {
        alerts.push({
          type: "followup_overdue",
          severity: "critical",
          message: `Follow-up overdue for "${lead.lead_name}"`,
          entityId: lead.id,
          entityType: "lead",
        });
      });

      return alerts.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return (severityOrder[a.severity as keyof typeof severityOrder] || 2) - 
               (severityOrder[b.severity as keyof typeof severityOrder] || 2);
      });
    },
    refetchInterval: 60000,
  });
}
