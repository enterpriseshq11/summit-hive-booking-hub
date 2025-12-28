import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Membership = Database["public"]["Tables"]["memberships"]["Row"];
type MembershipInsert = Database["public"]["Tables"]["memberships"]["Insert"];
type MembershipTier = Database["public"]["Tables"]["membership_tiers"]["Row"];
type MembershipStatus = Database["public"]["Enums"]["membership_status"];

export function useMembershipTiers(businessId?: string) {
  return useQuery({
    queryKey: ["membership_tiers", businessId],
    queryFn: async () => {
      let query = supabase
        .from("membership_tiers")
        .select("*, businesses(name, type)")
        .eq("is_active", true)
        .order("sort_order");

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useMembership(userId?: string) {
  return useQuery({
    queryKey: ["membership", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("memberships")
        .select(`
          *,
          membership_tiers(*, businesses(name, type)),
          guest_passes(*)
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUserMemberships(userId?: string) {
  return useQuery({
    queryKey: ["user_memberships", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("memberships")
        .select(`
          *,
          membership_tiers(*, businesses(name, type))
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membership: MembershipInsert) => {
      const { data, error } = await supabase
        .from("memberships")
        .insert({
          ...membership,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Audit log
      await supabase.from("audit_log").insert({
        entity_type: "membership",
        entity_id: data.id,
        action_type: "created",
        after_json: data,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["membership", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ["user_memberships", variables.user_id] });
      toast.success("Membership created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create membership: " + error.message);
    },
  });
}

export function usePauseMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ membershipId, resumeDate }: { membershipId: string; resumeDate: string }) => {
      const { data: before } = await supabase
        .from("memberships")
        .select("*")
        .eq("id", membershipId)
        .single();

      // Check freeze rules
      if (before && before.pauses_used_this_year && before.pauses_used_this_year >= 2) {
        throw new Error("Maximum pauses (2) per year reached");
      }

      const { data, error } = await supabase
        .from("memberships")
        .update({
          status: "paused",
          paused_at: new Date().toISOString(),
          pause_resume_date: resumeDate,
          pauses_used_this_year: (before?.pauses_used_this_year || 0) + 1,
        })
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "membership",
        entity_id: membershipId,
        action_type: "paused",
        before_json: before,
        after_json: data,
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["membership", data.user_id] });
      toast.success("Membership paused");
    },
    onError: (error) => {
      toast.error("Failed to pause membership: " + error.message);
    },
  });
}

export function useResumeMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membershipId: string) => {
      const { data: before } = await supabase
        .from("memberships")
        .select("*")
        .eq("id", membershipId)
        .single();

      const { data, error } = await supabase
        .from("memberships")
        .update({
          status: "active",
          paused_at: null,
          pause_resume_date: null,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "membership",
        entity_id: membershipId,
        action_type: "resumed",
        before_json: before,
        after_json: data,
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["membership", data.user_id] });
      toast.success("Membership resumed");
    },
    onError: (error) => {
      toast.error("Failed to resume membership: " + error.message);
    },
  });
}

export function useCancelMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ membershipId, reason }: { membershipId: string; reason?: string }) => {
      const { data: before } = await supabase
        .from("memberships")
        .select("*")
        .eq("id", membershipId)
        .single();

      const { data, error } = await supabase
        .from("memberships")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "membership",
        entity_id: membershipId,
        action_type: "cancelled",
        before_json: before,
        after_json: data,
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["membership", data.user_id] });
      toast.success("Membership cancelled");
    },
    onError: (error) => {
      toast.error("Failed to cancel membership: " + error.message);
    },
  });
}

// Guest passes for family members
export function useCreateGuestPass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { 
      membershipId: string; 
      guestName: string; 
      guestEmail?: string;
      validDate: string;
    }) => {
      const passCode = `GP-${Date.now().toString(36).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("guest_passes")
        .insert({
          membership_id: params.membershipId,
          guest_name: params.guestName,
          guest_email: params.guestEmail,
          valid_date: params.validDate,
          pass_code: passCode,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["membership"] });
      toast.success("Guest pass created");
    },
    onError: (error) => {
      toast.error("Failed to create guest pass: " + error.message);
    },
  });
}

// Check if user has membership benefits
export function useMembershipBenefits(tierId?: string) {
  return useQuery({
    queryKey: ["membership_benefits", tierId],
    queryFn: async () => {
      if (!tierId) return [];
      
      const { data, error } = await supabase
        .from("membership_benefits")
        .select("*")
        .eq("tier_id", tierId)
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
    enabled: !!tierId,
  });
}
