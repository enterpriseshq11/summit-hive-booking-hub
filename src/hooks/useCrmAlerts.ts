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

// Hook to generate automated alerts
export function useGenerateAlerts() {
  const createAlert = useCreateAlert();

  return useMutation({
    mutationFn: async () => {
      const alerts: Database["public"]["Tables"]["crm_alerts"]["Insert"][] = [];

      // Check for leads untouched 24+ hours
      const { data: untouchedLeads } = await supabase
        .from("crm_leads")
        .select("id, lead_name")
        .eq("status", "new")
        .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (untouchedLeads?.length) {
        for (const lead of untouchedLeads) {
          alerts.push({
            alert_type: "lead_untouched",
            severity: "warning",
            title: `Lead untouched for 24+ hours`,
            description: `${lead.lead_name} has not been contacted yet`,
            entity_type: "lead",
            entity_id: lead.id,
          });
        }
      }

      // Check for overdue follow-ups
      const { data: overdueFollowups } = await supabase
        .from("crm_leads")
        .select("id, lead_name")
        .lt("follow_up_due", new Date().toISOString())
        .not("status", "in", '("won","lost")');

      if (overdueFollowups?.length) {
        for (const lead of overdueFollowups) {
          alerts.push({
            alert_type: "followup_overdue",
            severity: "critical",
            title: `Follow-up overdue`,
            description: `Follow-up for ${lead.lead_name} is past due`,
            entity_type: "lead",
            entity_id: lead.id,
          });
        }
      }

      // Check for pending commissions
      const { data: pendingCommissions, count } = await supabase
        .from("crm_commissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      if (count && count > 0) {
        alerts.push({
          alert_type: "commission_pending",
          severity: "info",
          title: `${count} commissions pending approval`,
          description: `Review and approve pending commissions`,
        });
      }

      // Insert all alerts (skip duplicates based on entity)
      for (const alert of alerts) {
        // Check if similar alert exists
        const { data: existing } = await supabase
          .from("crm_alerts")
          .select("id")
          .eq("alert_type", alert.alert_type)
          .eq("entity_id", alert.entity_id || "")
          .eq("is_dismissed", false)
          .limit(1);

        if (!existing?.length) {
          await createAlert.mutateAsync(alert);
        }
      }

      return alerts.length;
    },
  });
}
