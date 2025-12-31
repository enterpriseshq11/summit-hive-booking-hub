import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type UserPromotionStatus = "locked" | "in_progress" | "eligible" | "active" | "expired" | "claimed";

export interface UserPromotion {
  id: string;
  user_id: string;
  promotion_id: string;
  status: UserPromotionStatus;
  progress: number;
  progress_data: Record<string, unknown>;
  activated_at: string | null;
  expires_at: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
  promotions?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    short_description: string;
    type?: string;
    benefits?: unknown;
    primary_cta_label?: string;
    progress_target?: number;
  };
}

export function useUserPromotions() {
  const { authUser } = useAuth();

  return useQuery({
    queryKey: ["user_promotions", authUser?.id],
    queryFn: async (): Promise<UserPromotion[]> => {
      if (!authUser?.id) return [];

      const { data, error } = await (supabase
        .from("user_promotions" as any)
        .select(`
          *,
          promotions:promotion_id (
            id, title, slug, category, short_description,
            type, benefits, primary_cta_label, progress_target
          )
        `)
        .eq("user_id", authUser.id)
        .order("updated_at", { ascending: false }) as any);

      if (error) throw error;
      return (data || []) as UserPromotion[];
    },
    enabled: !!authUser?.id,
  });
}

export function useStartPromotion() {
  const queryClient = useQueryClient();
  const { authUser } = useAuth();

  return useMutation({
    mutationFn: async (promotionId: string) => {
      if (!authUser?.id) throw new Error("Must be logged in");

      const { data, error } = await (supabase
        .from("user_promotions" as any)
        .upsert({
          user_id: authUser.id,
          promotion_id: promotionId,
          status: "in_progress",
          progress: 0,
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_promotions"] });
      toast.success("You're now tracking this promotion!");
    },
    onError: (error) => {
      console.error("Error starting promotion:", error);
      toast.error("Something went wrong. Please try again.");
    },
  });
}

export function useClaimPromotion() {
  const queryClient = useQueryClient();
  const { authUser } = useAuth();

  return useMutation({
    mutationFn: async (promotionId: string) => {
      if (!authUser?.id) throw new Error("Must be logged in");

      const { data, error } = await (supabase
        .from("user_promotions" as any)
        .update({
          status: "active",
          activated_at: new Date().toISOString(),
          claimed_at: new Date().toISOString(),
        })
        .eq("user_id", authUser.id)
        .eq("promotion_id", promotionId)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_promotions"] });
      toast.success("Benefits activated! Enjoy your perks.");
    },
    onError: (error) => {
      console.error("Error claiming promotion:", error);
      toast.error("Something went wrong. Please try again.");
    },
  });
}

export function getPromotionUserStatus(
  userPromotion: UserPromotion | null | undefined,
  progressTarget: number | null
): {
  status: UserPromotionStatus;
  isEligible: boolean;
  progress: number;
  progressPercent: number;
} {
  if (!userPromotion) {
    return { status: "locked", isEligible: false, progress: 0, progressPercent: 0 };
  }

  const progress = userPromotion.progress || 0;
  const target = progressTarget || 1;
  const progressPercent = Math.min((progress / target) * 100, 100);
  const isEligible = progress >= target || userPromotion.status === "eligible";

  return {
    status: userPromotion.status,
    isEligible,
    progress,
    progressPercent,
  };
}
