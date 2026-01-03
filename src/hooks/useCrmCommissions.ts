import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CrmCommission = Database["public"]["Tables"]["crm_commissions"]["Row"];
type CommissionStatus = Database["public"]["Enums"]["commission_status"];

export interface CrmCommissionWithRelations extends CrmCommission {
  employee?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  revenue_event?: {
    amount: number;
    description: string | null;
    business_unit: string;
    revenue_date: string;
  } | null;
  approved_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function useCrmCommissions(filters?: {
  employeeId?: string;
  status?: CommissionStatus;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["crm_commissions", filters],
    queryFn: async () => {
      let query = supabase
        .from("crm_commissions")
        .select(`
          *,
          employee:profiles!crm_commissions_employee_id_fkey(first_name, last_name, email),
          revenue_event:crm_revenue_events!crm_commissions_revenue_event_id_fkey(amount, description, business_unit, revenue_date),
          approved_by_profile:profiles!crm_commissions_approved_by_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrmCommissionWithRelations[];
    },
  });
}

export function useApproveCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("crm_commissions")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", commissionId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("crm_activity_events").insert({
        event_type: "commission_approved",
        actor_id: user?.id,
        entity_type: "commission",
        entity_id: commissionId,
        after_data: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_commissions"] });
      toast.success("Commission approved");
    },
    onError: (error) => {
      toast.error("Failed to approve: " + error.message);
    },
  });
}

export function useMarkCommissionPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("crm_commissions")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", commissionId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("crm_activity_events").insert({
        event_type: "commission_paid",
        actor_id: user?.id,
        entity_type: "commission",
        entity_id: commissionId,
        after_data: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_commissions"] });
      toast.success("Commission marked as paid");
    },
    onError: (error) => {
      toast.error("Failed to mark paid: " + error.message);
    },
  });
}

export function useCommissionStats() {
  return useQuery({
    queryKey: ["crm_commission_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_commissions")
        .select("amount, status");

      if (error) throw error;

      const pending = data.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0);
      const approved = data.filter(c => c.status === "approved").reduce((s, c) => s + Number(c.amount), 0);
      const paid = data.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);

      return { pending, approved, paid, total: pending + approved + paid };
    },
  });
}
