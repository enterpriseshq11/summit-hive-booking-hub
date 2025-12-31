import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export type PromotionCategory = "signature" | "monthly" | "vault";
export type PromotionStatus = "active" | "paused" | "expired";

export interface Promotion {
  id: string;
  title: string;
  slug: string;
  category: PromotionCategory;
  status: PromotionStatus;
  start_date: string | null;
  end_date: string | null;
  short_description: string;
  long_description: string | null;
  eligibility_rules: Record<string, unknown>;
  benefits: string[];
  limits_fine_print: string | null;
  primary_cta_label: string;
  primary_cta_action: "open_modal" | "scroll_to_form" | "route_to_page";
  primary_cta_target: string | null;
  tags: string[];
  sort_order: number;
  badge: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromotionLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  offer_id: string | null;
  offer_title_snapshot: string | null;
  business_interest: string[] | null;
  notes: string | null;
  preferred_contact_method: string;
  source_page: string;
  status: "new" | "contacted" | "closed" | "archived";
  lead_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function usePromotions(filters?: {
  category?: PromotionCategory;
  status?: PromotionStatus;
  tags?: string[];
}) {
  return useQuery({
    queryKey: ["promotions", filters],
    queryFn: async () => {
      let query = supabase
        .from("promotions")
        .select("*")
        .order("sort_order", { ascending: true });

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as unknown[]).map((promo: Record<string, unknown>) => ({
        ...promo,
        benefits: typeof promo.benefits === "string" 
          ? JSON.parse(promo.benefits as string) 
          : promo.benefits || [],
        eligibility_rules: typeof promo.eligibility_rules === "string"
          ? JSON.parse(promo.eligibility_rules as string)
          : promo.eligibility_rules || {},
        tags: promo.tags || [],
      })) as Promotion[];
    },
  });
}

export function usePromotion(slug: string) {
  return useQuery({
    queryKey: ["promotion", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;

      const promo = data as unknown as Record<string, unknown>;
      return {
        ...promo,
        benefits: typeof promo.benefits === "string" 
          ? JSON.parse(promo.benefits as string) 
          : promo.benefits || [],
        eligibility_rules: typeof promo.eligibility_rules === "string"
          ? JSON.parse(promo.eligibility_rules as string)
          : promo.eligibility_rules || {},
        tags: promo.tags || [],
      } as Promotion;
    },
    enabled: !!slug,
  });
}

export function usePromotionLeads(filters?: {
  status?: string;
  offerId?: string;
}) {
  return useQuery({
    queryKey: ["promotion_leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("promotion_leads")
        .select("*, promotions(title, slug)")
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status as "new" | "contacted" | "closed" | "archived");
      }
      if (filters?.offerId) {
        query = query.eq("offer_id", filters.offerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as (PromotionLead & { promotions: { title: string; slug: string } | null })[];
    },
  });
}

export function useSubmitPromotionLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: {
      name: string;
      email: string;
      phone?: string;
      offer_id?: string;
      offer_title_snapshot?: string;
      business_interest?: string[];
      notes?: string;
      preferred_contact_method?: string;
      lead_type?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("promotion_leads")
        .insert({
          name: lead.name,
          email: lead.email,
          phone: lead.phone || null,
          offer_id: lead.offer_id || null,
          offer_title_snapshot: lead.offer_title_snapshot || null,
          business_interest: lead.business_interest || null,
          notes: lead.notes || null,
          preferred_contact_method: lead.preferred_contact_method || "email",
          lead_type: lead.lead_type || "standard",
          metadata: lead.metadata as Json || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion_leads"] });
      toast.success("Request submitted! We'll be in touch within 24 hours.");
    },
    onError: (error) => {
      console.error("Error submitting lead:", error);
      toast.error("Something went wrong. Please try again.");
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: string; status?: PromotionStatus }) => {
      const { data, error } = await supabase
        .from("promotions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion updated");
    },
    onError: (error) => {
      console.error("Error updating promotion:", error);
      toast.error("Failed to update promotion");
    },
  });
}

export function useUpdatePromotionLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: string; status?: "new" | "contacted" | "closed" | "archived" }) => {
      const { data, error } = await supabase
        .from("promotion_leads")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion_leads"] });
      toast.success("Lead updated");
    },
    onError: (error) => {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    },
  });
}
