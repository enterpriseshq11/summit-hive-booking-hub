import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type BlackoutDate = Database["public"]["Tables"]["blackout_dates"]["Row"];
type BlackoutInsert = Database["public"]["Tables"]["blackout_dates"]["Insert"];

export function useBlackouts(businessId?: string) {
  return useQuery({
    queryKey: ["blackouts", businessId],
    queryFn: async () => {
      let query = supabase
        .from("blackout_dates")
        .select("*, businesses(name, type), resources(name)")
        .order("start_datetime", { ascending: true });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBlackout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blackout: BlackoutInsert) => {
      const { data, error } = await supabase
        .from("blackout_dates")
        .insert(blackout)
        .select()
        .single();
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "blackout",
        entity_id: data.id,
        action_type: "created",
        after_json: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blackouts"] });
      toast.success("Blackout created");
    },
    onError: (error) => {
      toast.error("Failed to create blackout: " + error.message);
    },
  });
}

export function useDeleteBlackout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: before } = await supabase
        .from("blackout_dates")
        .select()
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("blackout_dates")
        .delete()
        .eq("id", id);
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "blackout",
        entity_id: id,
        action_type: "deleted",
        before_json: before,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blackouts"] });
      toast.success("Blackout removed");
    },
    onError: (error) => {
      toast.error("Failed to remove blackout: " + error.message);
    },
  });
}
