import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type CrmAlert = Database["public"]["Tables"]["crm_alerts"]["Row"];

export function useCrmAlerts(filters?: {
  unreadOnly?: boolean;
  severity?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["crm_alerts", filters],
    queryFn: async () => {
      let query = supabase
        .from("crm_alerts")
        .select("*")
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false })
        .limit(filters?.limit || 50);

      if (filters?.unreadOnly) {
        query = query.eq("is_read", false);
      }
      if (filters?.severity) {
        query = query.eq("severity", filters.severity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrmAlert[];
    },
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("crm_alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_alerts"] });
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("crm_alerts")
        .update({ is_dismissed: true })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_alerts"] });
    },
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: Database["public"]["Tables"]["crm_alerts"]["Insert"]) => {
      const { data, error } = await supabase
        .from("crm_alerts")
        .insert(alert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_alerts"] });
    },
  });
}

// Hook to generate automated alerts with real trigger logic
export function useGenerateAlerts() {
  const createAlert = useCreateAlert();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const alerts: Database["public"]["Tables"]["crm_alerts"]["Insert"][] = [];
      const now = new Date();

      // ===== LEAD UNTOUCHED ALERTS (24 / 48 / 72 hours) =====
      const { data: untouchedLeads24 } = await supabase
        .from("crm_leads")
        .select("id, lead_name, created_at")
        .eq("status", "new")
        .lt("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .gte("created_at", new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString());

      for (const lead of untouchedLeads24 || []) {
        alerts.push({
          alert_type: "lead_untouched_24h",
          severity: "warning",
          title: `Lead untouched for 24+ hours`,
          description: `${lead.lead_name} has not been contacted since creation`,
          entity_type: "lead",
          entity_id: lead.id,
        });
      }

      const { data: untouchedLeads48 } = await supabase
        .from("crm_leads")
        .select("id, lead_name, created_at")
        .eq("status", "new")
        .lt("created_at", new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString())
        .gte("created_at", new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString());

      for (const lead of untouchedLeads48 || []) {
        alerts.push({
          alert_type: "lead_untouched_48h",
          severity: "warning",
          title: `Lead untouched for 48+ hours`,
          description: `${lead.lead_name} is still in "New" status after 48 hours`,
          entity_type: "lead",
          entity_id: lead.id,
        });
      }

      const { data: untouchedLeads72 } = await supabase
        .from("crm_leads")
        .select("id, lead_name, created_at")
        .eq("status", "new")
        .lt("created_at", new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString());

      for (const lead of untouchedLeads72 || []) {
        alerts.push({
          alert_type: "lead_untouched_72h",
          severity: "critical",
          title: `URGENT: Lead untouched for 72+ hours`,
          description: `${lead.lead_name} requires immediate attention - no contact in 3+ days`,
          entity_type: "lead",
          entity_id: lead.id,
        });
      }

      // ===== FOLLOW-UP OVERDUE ALERTS =====
      const { data: overdueFollowups } = await supabase
        .from("crm_leads")
        .select("id, lead_name, follow_up_due")
        .lt("follow_up_due", now.toISOString())
        .not("status", "in", '("won","lost")');

      for (const lead of overdueFollowups || []) {
        alerts.push({
          alert_type: "followup_overdue",
          severity: "critical",
          title: `Follow-up overdue`,
          description: `Follow-up for ${lead.lead_name} was due ${lead.follow_up_due ? new Date(lead.follow_up_due).toLocaleDateString() : 'earlier'}`,
          entity_type: "lead",
          entity_id: lead.id,
        });
      }

      // ===== EMPLOYEE INACTIVITY ALERTS =====
      // Check for employees with no activity in the last 24 hours during expected work hours
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .neq("role", "read_only");

      for (const roleData of roles || []) {
        const { data: recentActivity } = await supabase
          .from("crm_activity_events")
          .select("id")
          .eq("actor_id", roleData.user_id)
          .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (!recentActivity?.length) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", roleData.user_id)
            .single();

          if (profile) {
            alerts.push({
              alert_type: "employee_inactive",
              severity: "warning",
              title: `Employee inactive 24+ hours`,
              description: `${profile.first_name} ${profile.last_name} has no recorded activity in the last 24 hours`,
              entity_type: "employee",
              entity_id: roleData.user_id,
            });
          }
        }
      }

      // ===== REVENUE MISSING COMMISSION ALERTS =====
      const { data: revenueNoCommission } = await supabase
        .from("crm_revenue_events")
        .select("id, amount, employee_attributed_id")
        .not("employee_attributed_id", "is", null);

      for (const rev of revenueNoCommission || []) {
        const { data: commission } = await supabase
          .from("crm_commissions")
          .select("id")
          .eq("revenue_event_id", rev.id)
          .limit(1);

        if (!commission?.length) {
          alerts.push({
            alert_type: "revenue_no_commission",
            severity: "info",
            title: `Revenue missing commission calculation`,
            description: `Revenue event $${rev.amount} has no linked commission record`,
            entity_type: "revenue",
            entity_id: rev.id,
          });
        }
      }

      // ===== PENDING COMMISSIONS ALERT =====
      const { data: pendingCommissions, count } = await supabase
        .from("crm_commissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      if (count && count > 0) {
        alerts.push({
          alert_type: "commission_pending",
          severity: "info",
          title: `${count} commission${count > 1 ? 's' : ''} pending approval`,
          description: `Review and approve pending commissions in the Commissions page`,
        });
      }

      // ===== INSERT ALERTS (skip duplicates) =====
      let createdCount = 0;
      for (const alert of alerts) {
        // Check if similar alert already exists
        const { data: existing } = await supabase
          .from("crm_alerts")
          .select("id")
          .eq("alert_type", alert.alert_type)
          .eq("entity_id", alert.entity_id || "")
          .eq("is_dismissed", false)
          .limit(1);

        if (!existing?.length) {
          await createAlert.mutateAsync(alert);
          createdCount++;
        }
      }

      // Refresh alerts
      queryClient.invalidateQueries({ queryKey: ["crm_alerts"] });

      return { total: alerts.length, created: createdCount };
    },
  });
}

// Hook to get alert count for badge display
export function useAlertCount() {
  return useQuery({
    queryKey: ["crm_alerts_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("crm_alerts")
        .select("id", { count: "exact", head: true })
        .eq("is_dismissed", false)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
  });
}
