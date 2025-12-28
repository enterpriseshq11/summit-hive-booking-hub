import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];
type PricingRuleInsert = Database["public"]["Tables"]["pricing_rules"]["Insert"];
type PricingRuleUpdate = Database["public"]["Tables"]["pricing_rules"]["Update"];

export function usePricingRules(businessId?: string) {
  return useQuery({
    queryKey: ["pricing_rules", businessId],
    queryFn: async () => {
      let query = supabase
        .from("pricing_rules")
        .select("*, businesses(name, type), bookable_types(name), packages(name)")
        .order("priority", { ascending: true });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: PricingRuleInsert) => {
      const { data, error } = await supabase
        .from("pricing_rules")
        .insert(rule)
        .select()
        .single();
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "pricing_rule",
        entity_id: data.id,
        action_type: "created",
        after_json: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing_rules"] });
      toast.success("Pricing rule created");
    },
    onError: (error) => {
      toast.error("Failed to create pricing rule: " + error.message);
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: PricingRuleUpdate;
    }) => {
      const { data: before } = await supabase
        .from("pricing_rules")
        .select()
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("pricing_rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "pricing_rule",
        entity_id: id,
        action_type: "updated",
        before_json: before,
        after_json: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing_rules"] });
      toast.success("Pricing rule updated");
    },
    onError: (error) => {
      toast.error("Failed to update pricing rule: " + error.message);
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: before } = await supabase
        .from("pricing_rules")
        .select()
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("pricing_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "pricing_rule",
        entity_id: id,
        action_type: "deleted",
        before_json: before,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing_rules"] });
      toast.success("Pricing rule deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete pricing rule: " + error.message);
    },
  });
}
