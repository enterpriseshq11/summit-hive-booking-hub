import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/types";

export function useBusinesses() {
  return useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Business[];
    },
  });
}

export function useBusinessBySlug(slug: string) {
  return useQuery({
    queryKey: ["business", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as Business;
    },
    enabled: !!slug,
  });
}

export function useBusinessByType(type: "summit" | "coworking" | "spa" | "fitness") {
  return useQuery({
    queryKey: ["business", "type", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("type", type)
        .single();

      if (error) throw error;
      return data as Business;
    },
    enabled: !!type,
  });
}
