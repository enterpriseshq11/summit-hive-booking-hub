import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PromoCode {
  id: string;
  code: string;
  business_unit: string;
  discount_type: string;
  discount_value: number;
  description: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  max_uses: number | null;
  current_uses: number;
  stackable_with_service_discount: boolean;
  created_at: string;
  updated_at: string;
}

function isPromoActive(p: PromoCode): boolean {
  if (!p.is_active) return false;
  const now = new Date();
  if (p.start_date && new Date(p.start_date) > now) return false;
  if (p.end_date && new Date(p.end_date) < now) return false;
  if (p.max_uses !== null && p.current_uses >= p.max_uses) return false;
  return true;
}

export function useValidatePromoCode(code: string | null, businessUnit: string) {
  return useQuery({
    queryKey: ["promo-code", code, businessUnit],
    queryFn: async () => {
      if (!code) return null;
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .ilike("code", code.trim())
        .eq("is_active", true)
        .limit(1)
        .single();
      if (error || !data) return null;
      const promo = data as unknown as PromoCode;
      if (!isPromoActive(promo)) return null;
      // Check business unit match (allow "all" for cross-business promos)
      if (promo.business_unit !== businessUnit && promo.business_unit !== "all") return null;
      return promo;
    },
    enabled: !!code && code.trim().length > 0,
    staleTime: 30_000,
  });
}

export function useServiceDiscountConfig(businessUnit: string) {
  return useQuery({
    queryKey: ["service-discount-config", businessUnit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_discount_config")
        .select("*")
        .eq("business_unit", businessUnit)
        .single();
      if (error || !data) return null;
      return data as { id: string; business_unit: string; enabled: boolean; discount_percent: number; categories: string[] };
    },
    staleTime: 60_000,
  });
}
