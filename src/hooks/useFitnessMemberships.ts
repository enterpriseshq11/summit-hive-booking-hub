import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FitnessMembership {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  membership_type: string;
  monthly_amount: number;
  start_date: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  next_billing_date: string | null;
  lead_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = ["fitness_memberships"];

export function useFitnessMemberships() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("fitness_memberships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FitnessMembership[];
    },
  });
}

export function useFitnessMembershipStats() {
  return useQuery({
    queryKey: ["fitness_membership_stats"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("fitness_memberships")
        .select("status, monthly_amount, updated_at");
      if (error) throw error;

      const all = (data || []) as any[];
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      return {
        totalActive: all.filter(m => m.status === "active").length,
        mrr: all
          .filter(m => m.status === "active")
          .reduce((s, m) => s + (Number(m.monthly_amount) || 0), 0),
        paymentFailed: all.filter(m => m.status === "payment_failed").length,
        cancelledThisMonth: all.filter(
          m => m.status === "cancelled" && m.updated_at >= monthStart
        ).length,
      };
    },
    refetchInterval: 30000,
  });
}

export function useCreateFitnessMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      membership_type: string;
      monthly_amount: number;
      start_date: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      let stripeCustomerId: string | null = null;
      let stripeSubscriptionId: string | null = null;
      let nextBillingDate: string | null = null;

      const { data: stripeResult, error: stripeError } = await supabase.functions.invoke(
        "fitness-membership-stripe",
        {
          body: {
            action: "create",
            name: `${input.first_name} ${input.last_name}`,
            email: input.email,
            monthly_amount: input.monthly_amount,
            membership_type: input.membership_type,
          },
        }
      );
      if (stripeError || !stripeResult?.customer_id) {
        const errMsg = stripeError?.message || stripeResult?.error || "Stripe subscription creation failed";
        throw new Error(`Stripe billing setup failed: ${errMsg}. Member was not created.`);
      }
      stripeCustomerId = stripeResult.customer_id;
      stripeSubscriptionId = stripeResult.subscription_id;
      nextBillingDate = stripeResult.next_billing_date;

      let leadId: string | null = null;
      try {
        const { data: lead } = await supabase
          .from("crm_leads")
          .insert({
            lead_name: `${input.first_name} ${input.last_name}`,
            email: input.email,
            phone: input.phone || null,
            business_unit: "fitness" as any,
            status: "won" as any,
            source: "admin_panel" as any,
            created_by: user?.id,
          } as any)
          .select("id")
          .single();
        leadId = lead?.id || null;
      } catch { /* ok */ }

      const { data, error } = await (supabase as any)
        .from("fitness_memberships")
        .insert({
          ...input,
          phone: input.phone || null,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          next_billing_date: nextBillingDate,
          lead_id: leadId,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["fitness_membership_stats"] });
      toast.success("Membership created");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateMembershipStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      stripeAction,
      subscriptionId,
    }: {
      id: string;
      status: string;
      stripeAction?: "pause" | "cancel" | "resume";
      subscriptionId?: string | null;
    }) => {
      if (stripeAction && subscriptionId) {
        await supabase.functions.invoke("fitness-membership-stripe", {
          body: { action: stripeAction, subscription_id: subscriptionId },
        });
      }

      const { error } = await (supabase as any)
        .from("fitness_memberships")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      await supabase.from("crm_activity_events").insert({
        event_type: "status_change" as any,
        entity_type: "fitness_membership",
        entity_id: id,
        event_category: "membership_updated",
        entity_name: "Fitness Membership",
        metadata: { new_status: status, stripe_action: stripeAction } as any,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["fitness_membership_stats"] });
      toast.success("Membership updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
