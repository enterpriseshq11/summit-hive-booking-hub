import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HiveLease {
  id: string;
  office_code: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string | null;
  lease_start: string;
  lease_end: string | null;
  monthly_rate: number;
  payment_method: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = ["hive_leases"];

export function useHiveLeases(officeCode?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, officeCode],
    queryFn: async () => {
      let q = supabase.from("hive_leases").select("*").order("created_at", { ascending: false });
      if (officeCode) q = q.eq("office_code", officeCode);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as HiveLease[];
    },
  });
}

export function useCreateHiveLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      office_code: string;
      tenant_name: string;
      tenant_email: string;
      tenant_phone?: string;
      lease_start: string;
      lease_end?: string;
      monthly_rate: number;
      payment_method: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      let stripeCustomerId: string | null = null;
      let stripeSubscriptionId: string | null = null;

      if (input.payment_method === "stripe") {
        try {
          const { data: stripeResult, error: stripeError } = await supabase.functions.invoke(
            "fitness-membership-stripe",
            {
              body: {
                action: "create",
                name: input.tenant_name,
                email: input.tenant_email,
                monthly_amount: input.monthly_rate,
                membership_type: `Hive Lease - ${input.office_code}`,
                business_unit: "coworking",
              },
            }
          );
          if (!stripeError && stripeResult) {
            stripeCustomerId = stripeResult.customer_id;
            stripeSubscriptionId = stripeResult.subscription_id;
          }
        } catch (e) {
          console.warn("Stripe lease subscription failed:", e);
        }
      }

      // Update office status to booked
      await supabase
        .from("hive_private_offices")
        .update({ status: "booked" })
        .eq("code", input.office_code);

      const { data, error } = await supabase
        .from("hive_leases")
        .insert({
          ...input,
          tenant_phone: input.tenant_phone || null,
          lease_end: input.lease_end || null,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["hive_private_offices"] });
      toast.success("Lease created");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useEndHiveLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leaseId,
      officeCode,
      subscriptionId,
    }: {
      leaseId: string;
      officeCode: string;
      subscriptionId?: string | null;
    }) => {
      // Cancel Stripe subscription if applicable
      if (subscriptionId) {
        try {
          await supabase.functions.invoke("fitness-membership-stripe", {
            body: { action: "cancel", subscription_id: subscriptionId },
          });
        } catch { /* ok */ }
      }

      await supabase
        .from("hive_leases")
        .update({ status: "terminated" })
        .eq("id", leaseId);

      await supabase
        .from("hive_private_offices")
        .update({ status: "available", booked_until: null })
        .eq("code", officeCode);

      await supabase.from("crm_activity_events").insert({
        event_type: "status_change" as any,
        entity_type: "hive_lease",
        entity_id: leaseId,
        event_category: "lease_terminated",
        entity_name: "Hive Lease",
        metadata: { office_code: officeCode },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["hive_private_offices"] });
      toast.success("Lease ended, office now available");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
