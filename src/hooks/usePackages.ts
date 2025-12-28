import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Package } from "@/types";

export function usePackages(bookableTypeId?: string) {
  return useQuery({
    queryKey: ["packages", bookableTypeId],
    queryFn: async () => {
      let query = supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (bookableTypeId) {
        query = query.eq("bookable_type_id", bookableTypeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Package[];
    },
  });
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Package;
    },
    enabled: !!id,
  });
}
