import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Addon } from "@/types";

export function useAddons(bookableTypeId?: string, businessId?: string) {
  return useQuery({
    queryKey: ["addons", bookableTypeId, businessId],
    queryFn: async () => {
      let query = supabase
        .from("addons")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (bookableTypeId) {
        query = query.eq("bookable_type_id", bookableTypeId);
      }

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Addon[];
    },
  });
}

export function useAddon(id: string) {
  return useQuery({
    queryKey: ["addon", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addons")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Addon;
    },
    enabled: !!id,
  });
}
