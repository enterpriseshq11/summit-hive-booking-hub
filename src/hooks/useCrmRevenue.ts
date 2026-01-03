import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CrmRevenueEvent = Database["public"]["Tables"]["crm_revenue_events"]["Row"];
type CrmRevenueInsert = Database["public"]["Tables"]["crm_revenue_events"]["Insert"];
type BusinessType = Database["public"]["Enums"]["business_type"];

export interface CrmRevenueWithRelations extends CrmRevenueEvent {
  lead?: {
    lead_name: string;
  } | null;
  recorded_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  employee_attributed?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function useCrmRevenue(filters?: {
  businessUnit?: BusinessType;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["crm_revenue", filters],
    queryFn: async () => {
      let query = supabase
        .from("crm_revenue_events")
        .select(`
          *,
          lead:crm_leads!crm_revenue_events_lead_id_fkey(lead_name),
          recorded_by_profile:profiles!crm_revenue_events_recorded_by_fkey(first_name, last_name),
          employee_attributed:profiles!crm_revenue_events_employee_attributed_id_fkey(first_name, last_name)
        `)
        .order("revenue_date", { ascending: false });

      if (filters?.businessUnit) {
        query = query.eq("business_unit", filters.businessUnit);
      }
      if (filters?.employeeId) {
        query = query.eq("employee_attributed_id", filters.employeeId);
      }
      if (filters?.startDate) {
        query = query.gte("revenue_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("revenue_date", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrmRevenueWithRelations[];
    },
  });
}

export function useCreateCrmRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (revenue: CrmRevenueInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("crm_revenue_events")
        .insert({ ...revenue, recorded_by: user?.id || revenue.recorded_by })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("crm_activity_events").insert({
        event_type: "revenue_created",
        actor_id: user?.id,
        entity_type: "revenue",
        entity_id: data.id,
        after_data: data,
      });

      // Auto-calculate commission if employee attributed
      if (revenue.employee_attributed_id) {
        // Find applicable commission rule
        const { data: rule } = await supabase
          .from("commission_rules")
          .select()
          .eq("is_active", true)
          .or(`employee_id.eq.${revenue.employee_attributed_id},employee_id.is.null`)
          .or(`business_unit.eq.${revenue.business_unit},business_unit.is.null`)
          .order("employee_id", { ascending: false, nullsFirst: false })
          .limit(1)
          .single();

        if (rule) {
          const commissionAmount = Number(revenue.amount) * (Number(rule.commission_percent) / 100);
          
          await supabase.from("crm_commissions").insert({
            employee_id: revenue.employee_attributed_id,
            revenue_event_id: data.id,
            rule_id: rule.id,
            amount: commissionAmount,
            status: "pending",
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_revenue"] });
      queryClient.invalidateQueries({ queryKey: ["crm_commissions"] });
      toast.success("Revenue recorded successfully");
    },
    onError: (error) => {
      toast.error("Failed to record revenue: " + error.message);
    },
  });
}

export function useRevenueStats(dateRange: { start: string; end: string }) {
  return useQuery({
    queryKey: ["crm_revenue_stats", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_revenue_events")
        .select("amount, business_unit")
        .gte("revenue_date", dateRange.start)
        .lte("revenue_date", dateRange.end);

      if (error) throw error;

      const total = data.reduce((sum, r) => sum + Number(r.amount), 0);
      const byUnit = data.reduce((acc, r) => {
        acc[r.business_unit] = (acc[r.business_unit] || 0) + Number(r.amount);
        return acc;
      }, {} as Record<string, number>);

      return { total, byUnit, count: data.length };
    },
  });
}
