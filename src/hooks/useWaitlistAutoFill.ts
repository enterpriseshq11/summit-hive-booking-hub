import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WaitlistOffer {
  waitlistEntryId: string;
  slotStart: string;
  slotEnd: string;
  expiresInHours?: number;
}

export function useAutoFillWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      businessId: string;
      slotStart: string;
      slotEnd: string;
      resourceId?: string;
      bookableTypeId?: string;
    }) => {
      // Get eligible waitlist entries
      const { data: waitlistEntries, error: wError } = await supabase
        .from("waitlist_entries")
        .select("*")
        .eq("business_id", params.businessId)
        .eq("status", "waiting")
        .order("is_vip", { ascending: false })
        .order("position", { ascending: true });

      if (wError) throw wError;
      if (!waitlistEntries || waitlistEntries.length === 0) {
        return { offered: false, reason: "No eligible waitlist entries" };
      }

      const slotDate = params.slotStart.split("T")[0];

      // Find best matching entry
      const matchingEntry = waitlistEntries.find((entry) => {
        // Check date preference
        if (entry.preferred_date) {
          const prefDate = entry.preferred_date;
          const flexDays = entry.flexibility_days || 0;
          const prefDateObj = new Date(prefDate);
          const slotDateObj = new Date(slotDate);
          const daysDiff = Math.abs(
            (slotDateObj.getTime() - prefDateObj.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff > flexDays) return false;
        }

        // Check resource preference
        if (entry.resource_id && params.resourceId && entry.resource_id !== params.resourceId) {
          return false;
        }

        // Check bookable type
        if (entry.bookable_type_id && params.bookableTypeId && 
            entry.bookable_type_id !== params.bookableTypeId) {
          return false;
        }

        return true;
      });

      if (!matchingEntry) {
        return { offered: false, reason: "No matching preferences found" };
      }

      // Create offer
      const claimToken = `CLM-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      const { error: updateError } = await supabase
        .from("waitlist_entries")
        .update({
          status: "offered",
          claim_token: claimToken,
          claim_expires_at: expiresAt,
          notified_at: new Date().toISOString(),
        })
        .eq("id", matchingEntry.id);

      if (updateError) throw updateError;

      // Log to audit
      await supabase.from("audit_log").insert({
        entity_type: "waitlist_entry",
        entity_id: matchingEntry.id,
        action_type: "slot_offered",
        after_json: {
          slot_start: params.slotStart,
          slot_end: params.slotEnd,
          claim_token: claimToken,
          expires_at: expiresAt,
        },
      });

      return {
        offered: true,
        entry: matchingEntry,
        claimToken,
        expiresAt,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["waitlist_entries"] });
      if (result.offered) {
        toast.success("Slot offered to waitlist customer");
      }
    },
    onError: (error) => {
      toast.error("Failed to process waitlist: " + error.message);
    },
  });
}

export function useClaimWaitlistOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      claimToken,
    }: {
      entryId: string;
      claimToken: string;
    }) => {
      // Verify token and check expiry
      const { data: entry, error: fetchError } = await supabase
        .from("waitlist_entries")
        .select("*")
        .eq("id", entryId)
        .eq("claim_token", claimToken)
        .single();

      if (fetchError || !entry) {
        throw new Error("Invalid claim token");
      }

      if (new Date(entry.claim_expires_at!) < new Date()) {
        // Expired - reset to waiting
        await supabase
          .from("waitlist_entries")
          .update({
            status: "waiting",
            claim_token: null,
            claim_expires_at: null,
          })
          .eq("id", entryId);

        throw new Error("Offer has expired");
      }

      // Mark as claimed
      const { error: updateError } = await supabase
        .from("waitlist_entries")
        .update({
          status: "claimed",
          claimed_at: new Date().toISOString(),
        })
        .eq("id", entryId);

      if (updateError) throw updateError;

      await supabase.from("audit_log").insert({
        entity_type: "waitlist_entry",
        entity_id: entryId,
        action_type: "offer_claimed",
        after_json: { claimed_at: new Date().toISOString() },
      });

      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist_entries"] });
      toast.success("Offer claimed successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeclineWaitlistOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from("waitlist_entries")
        .update({
          status: "waiting",
          claim_token: null,
          claim_expires_at: null,
          position: 999, // Move to back of line
        })
        .eq("id", entryId);

      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "waitlist_entry",
        entity_id: entryId,
        action_type: "offer_declined",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist_entries"] });
      toast.info("Offer declined, moved to back of waitlist");
    },
    onError: (error) => {
      toast.error("Failed to decline offer: " + error.message);
    },
  });
}
