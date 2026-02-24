import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Admin: fetch all commissions with booking + coordinator details
export function useE3CommissionsAdmin(status?: string) {
  return useQuery({
    queryKey: ["e3_commissions_admin", status],
    queryFn: async () => {
      let q = supabase
        .from("e3_commissions")
        .select(`
          *,
          e3_bookings!e3_commissions_booking_id_fkey(
            id, event_date, gross_revenue, net_contribution,
            booking_state, payment_status, financial_snapshot_json,
            e3_venues(name),
            e3_time_blocks(name),
            e3_booking_halls(hall_id, e3_halls(name))
          ),
          e3_coordinators!e3_commissions_coordinator_id_fkey(
            first_name, last_name, email, tier_level
          )
        `)
        .order("created_at", { ascending: false });

      if (status) q = q.eq("status", status as any);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// Admin: fetch referral overrides for a commission
export function useE3OverridesForCommission(commissionId?: string) {
  return useQuery({
    queryKey: ["e3_overrides", commissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_referral_overrides")
        .select(`
          *,
          e3_coordinators!e3_referral_overrides_beneficiary_id_fkey(first_name, last_name, email)
        `)
        .eq("commission_id", commissionId!)
        .order("override_depth");
      if (error) throw error;
      return data;
    },
    enabled: !!commissionId,
  });
}

// Admin: fetch all overrides (for payout view)
export function useE3AllOverrides(status?: string) {
  return useQuery({
    queryKey: ["e3_all_overrides", status],
    queryFn: async () => {
      let q = supabase
        .from("e3_referral_overrides")
        .select(`
          *,
          e3_coordinators!e3_referral_overrides_beneficiary_id_fkey(first_name, last_name),
          e3_commissions!e3_referral_overrides_commission_id_fkey(
            booking_id, coordinator_id, status,
            e3_coordinators!e3_commissions_coordinator_id_fkey(first_name, last_name)
          )
        `)
        .order("created_at", { ascending: false });
      if (status) q = q.eq("status", status as any);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// Coordinator: view own commissions
export function useE3MyCommissions() {
  return useQuery({
    queryKey: ["e3_my_commissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_commissions")
        .select(`
          *,
          e3_bookings!e3_commissions_booking_id_fkey(
            id, event_date, client_name, gross_revenue, net_contribution,
            booking_state, financial_snapshot_json,
            e3_venues(name),
            e3_time_blocks(name),
            e3_booking_halls(hall_id, e3_halls(name))
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Coordinator: view override earnings received
export function useE3MyOverrideEarnings() {
  return useQuery({
    queryKey: ["e3_my_override_earnings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_referral_overrides")
        .select(`
          *,
          e3_commissions!e3_referral_overrides_commission_id_fkey(
            booking_id, commission_amount, status,
            e3_bookings!e3_commissions_booking_id_fkey(event_date, client_name, e3_venues(name)),
            e3_coordinators!e3_commissions_coordinator_id_fkey(first_name, last_name)
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Mutations
export function useE3ApproveCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commissionId: string) => {
      const { data, error } = await supabase.rpc("e3_approve_commission", { p_commission_id: commissionId });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_commissions_admin"] });
      toast.success("Commission approved.");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useE3PayCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commissionId: string) => {
      const { data, error } = await supabase.rpc("e3_pay_commission", { p_commission_id: commissionId });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_commissions_admin"] });
      toast.success("Commission marked paid.");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useE3ApproveOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (overrideId: string) => {
      const { data, error } = await supabase.rpc("e3_approve_override", { p_override_id: overrideId });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_all_overrides"] });
      qc.invalidateQueries({ queryKey: ["e3_overrides"] });
      toast.success("Override approved.");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useE3BulkApproveCommissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await supabase.rpc("e3_bulk_approve_commissions", { p_commission_ids: ids });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["e3_commissions_admin"] });
      toast.success(`${data.approved_count} commissions approved.`);
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useE3BulkPayCommissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await supabase.rpc("e3_bulk_pay_commissions", { p_commission_ids: ids });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["e3_commissions_admin"] });
      toast.success(`${data.paid_count} commissions marked paid.`);
    },
    onError: (e) => toast.error(e.message),
  });
}

// Audit log
export function useE3AuditLog(filters?: {
  bookingId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["e3_audit_log", filters],
    queryFn: async () => {
      let q = supabase
        .from("e3_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (filters?.bookingId) q = q.eq("entity_id", filters.bookingId);
      if (filters?.action) q = q.eq("action", filters.action);
      if (filters?.startDate) q = q.gte("created_at", filters.startDate);
      if (filters?.endDate) q = q.lte("created_at", filters.endDate);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}
