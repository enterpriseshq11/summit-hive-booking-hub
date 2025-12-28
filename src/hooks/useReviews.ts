import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Review = Database["public"]["Tables"]["reviews"]["Row"];
type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];

export function useReviews(filters?: { isPublic?: boolean; isFeatured?: boolean }) {
  return useQuery({
    queryKey: ["reviews", filters],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(
          `
          *,
          bookings(booking_number, businesses(name, type)),
          profiles:user_id(first_name, last_name)
        `
        )
        .order("created_at", { ascending: false });

      if (filters?.isPublic !== undefined) {
        query = query.eq("is_public", filters.isPublic);
      }
      if (filters?.isFeatured !== undefined) {
        query = query.eq("is_featured", filters.isFeatured);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ReviewUpdate }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "review",
        entity_id: id,
        action_type: "updated",
        after_json: updates,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review updated");
    },
    onError: (error) => {
      toast.error("Failed to update review: " + error.message);
    },
  });
}
