import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookableType } from "@/types";

export function useBookableTypes(businessId?: string) {
  return useQuery({
    queryKey: ["bookableTypes", businessId],
    queryFn: async () => {
      let query = supabase
        .from("bookable_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BookableType[];
    },
    enabled: businessId === undefined || !!businessId,
  });
}

export function useBookableType(id: string) {
  return useQuery({
    queryKey: ["bookableType", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookable_types")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BookableType;
    },
    enabled: !!id,
  });
}
