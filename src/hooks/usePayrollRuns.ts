import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface PayrollRun {
  id: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'locked' | 'approved' | 'paid';
  total_amount: number;
  commission_count: number;
  locked_at: string | null;
  locked_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  paid_at: string | null;
  paid_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function usePayrollRuns(status?: string) {
  return useQuery({
    queryKey: ["payroll-runs", status],
    queryFn: async () => {
      let query = supabase
        .from("payroll_runs")
        .select("*")
        .order("period_start", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PayrollRun[];
    },
  });
}

export function usePayrollRun(id: string) {
  return useQuery({
    queryKey: ["payroll-run", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PayrollRun;
    },
    enabled: !!id,
  });
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { period_start: string; period_end: string }) => {
      const { data: result, error } = await supabase
        .from("payroll_runs")
        .insert({
          period_start: data.period_start,
          period_end: data.period_end,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("crm_activity_events").insert({
        event_type: "payroll_created",
        actor_id: user?.id,
        entity_type: "payroll_run",
        entity_id: result.id,
        entity_name: `${data.period_start} to ${data.period_end}`,
        after_data: result,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      toast({ title: "Payroll run created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating payroll run", description: error.message, variant: "destructive" });
    },
  });
}

export function useLockPayrollRun() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get approved commissions for the period
      const { data: run } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("id", id)
        .single();

      if (!run) throw new Error("Payroll run not found");

      // Assign approved commissions to this run
      const { data: commissions } = await supabase
        .from("crm_commissions")
        .select("id, amount")
        .eq("status", "approved")
        .is("payroll_run_id", null);

      const commissionIds = commissions?.map((c) => c.id) || [];
      const totalAmount = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      if (commissionIds.length > 0) {
        await supabase
          .from("crm_commissions")
          .update({ payroll_run_id: id })
          .in("id", commissionIds);
      }

      const { data: result, error } = await supabase
        .from("payroll_runs")
        .update({
          status: "locked",
          locked_at: new Date().toISOString(),
          locked_by: user?.id,
          total_amount: totalAmount,
          commission_count: commissionIds.length,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("crm_activity_events").insert({
        event_type: "payroll_locked",
        actor_id: user?.id,
        entity_type: "payroll_run",
        entity_id: id,
        before_data: run,
        after_data: result,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      queryClient.invalidateQueries({ queryKey: ["crm-commissions"] });
      toast({ title: "Payroll run locked" });
    },
    onError: (error: Error) => {
      toast({ title: "Error locking payroll run", description: error.message, variant: "destructive" });
    },
  });
}

export function useApprovePayrollRun() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: before } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("id", id)
        .single();

      const { data: result, error } = await supabase
        .from("payroll_runs")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("crm_activity_events").insert({
        event_type: "payroll_approved",
        actor_id: user?.id,
        entity_type: "payroll_run",
        entity_id: id,
        before_data: before,
        after_data: result,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      toast({ title: "Payroll run approved" });
    },
    onError: (error: Error) => {
      toast({ title: "Error approving payroll run", description: error.message, variant: "destructive" });
    },
  });
}

export function useMarkPayrollPaid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: before } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("id", id)
        .single();

      // Mark all commissions in this run as paid
      await supabase
        .from("crm_commissions")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("payroll_run_id", id);

      const { data: result, error } = await supabase
        .from("payroll_runs")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paid_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("crm_activity_events").insert({
        event_type: "payroll_paid",
        actor_id: user?.id,
        entity_type: "payroll_run",
        entity_id: id,
        before_data: before,
        after_data: result,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      queryClient.invalidateQueries({ queryKey: ["crm-commissions"] });
      toast({ title: "Payroll marked as paid" });
    },
    onError: (error: Error) => {
      toast({ title: "Error marking payroll as paid", description: error.message, variant: "destructive" });
    },
  });
}

export function usePayrollRunCommissions(payrollRunId: string) {
  return useQuery({
    queryKey: ["payroll-run-commissions", payrollRunId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_commissions")
        .select(`
          *,
          employee:profiles!crm_commissions_employee_id_fkey(id, first_name, last_name, email),
          revenue_event:crm_revenue_events(id, amount, business_unit, description)
        `)
        .eq("payroll_run_id", payrollRunId);

      if (error) throw error;
      return data;
    },
    enabled: !!payrollRunId,
  });
}
