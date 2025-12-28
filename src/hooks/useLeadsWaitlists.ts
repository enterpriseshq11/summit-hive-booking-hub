import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type WaitlistEntry = Database["public"]["Tables"]["waitlist_entries"]["Row"];

// Combined hook for admin page
export function useLeadsWaitlists(businessId?: string) {
  const leadsQuery = useQuery({
    queryKey: ["leads", businessId],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*, businesses(name, type), bookable_types(name)")
        .order("created_at", { ascending: false });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const waitlistsQuery = useQuery({
    queryKey: ["waitlist_entries", businessId],
    queryFn: async () => {
      let query = supabase
        .from("waitlist_entries")
        .select("*, businesses(name, type), bookable_types(name), resources(name)")
        .order("position", { ascending: true });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return {
    leads: leadsQuery.data,
    waitlists: waitlistsQuery.data,
    isLoading: leadsQuery.isLoading || waitlistsQuery.isLoading,
    error: leadsQuery.error || waitlistsQuery.error,
  };
}

export function useLeads(businessId?: string) {
  return useQuery({
    queryKey: ["leads", businessId],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*, businesses(name, type), bookable_types(name)")
        .order("created_at", { ascending: false });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useWaitlistEntries(businessId?: string) {
  return useQuery({
    queryKey: ["waitlist_entries", businessId],
    queryFn: async () => {
      let query = supabase
        .from("waitlist_entries")
        .select("*, businesses(name, type), bookable_types(name), resources(name)")
        .order("position", { ascending: true });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Database["public"]["Enums"]["lead_status"];
    }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead status updated");
    },
    onError: (error) => {
      toast.error("Failed to update lead: " + error.message);
    },
  });
}

export function useUpdateWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<WaitlistEntry>;
    }) => {
      const { data, error } = await supabase
        .from("waitlist_entries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist_entries"] });
      toast.success("Waitlist entry updated");
    },
    onError: (error) => {
      toast.error("Failed to update waitlist: " + error.message);
    },
  });
}

export function useSendWaitlistOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const claimToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("waitlist_entries")
        .update({
          claim_token: claimToken,
          claim_expires_at: expiresAt,
          notified_at: new Date().toISOString(),
          status: "offered",
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      // TODO: Trigger email/SMS notification with claim link
      await supabase.from("audit_log").insert({
        entity_type: "waitlist_entry",
        entity_id: id,
        action_type: "offer_sent",
        after_json: { claim_token: claimToken, expires_at: expiresAt },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist_entries"] });
      toast.success("Offer sent to waitlist entry");
    },
    onError: (error) => {
      toast.error("Failed to send offer: " + error.message);
    },
  });
}
