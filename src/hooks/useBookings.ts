import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];
type BookingStatus = Database["public"]["Enums"]["booking_status"];

export function useBookings(filters?: {
  businessId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select(
          `
          *,
          businesses(name, type),
          bookable_types(name),
          packages(name)
        `
        )
        .order("start_datetime", { ascending: true });

      if (filters?.businessId) {
        query = query.eq("business_id", filters.businessId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.startDate) {
        query = query.gte("start_datetime", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("end_datetime", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          businesses(name, type),
          bookable_types(*),
          packages(*),
          profiles:customer_id(first_name, last_name, email, phone),
          booking_addons(*, addons(*)),
          booking_resources(*, resources(*)),
          payments(*),
          signed_documents(*, document_templates(name, type))
        `
        )
        .eq("id", bookingId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ["bookings", "pending"],
    queryFn: async () => {
      const baseSelect = `
          *,
          businesses(name, type),
          bookable_types(name),
          packages(name),
          profiles:customer_id(first_name, last_name, email, phone)
        `;

      // Some projects use only 'pending' (enum); others also include 'requested'.
      // If 'requested' isn't in the enum, Postgres will throw, so we retry safely.
      const tryStatuses = [
        ["pending", "requested"],
        ["pending"],
      ] as const;

      for (const statuses of tryStatuses) {
        const { data, error } = await supabase
          .from("bookings")
          .select(baseSelect)
          // cast because Supabase typings are stricter than runtime
          .in("status", statuses as unknown as BookingStatus[])
          .order("created_at", { ascending: true });

        if (!error) return data;

        const msg = (error as any)?.message ?? "";
        if (!msg.includes("invalid input value for enum")) throw error;
      }

      return [];
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: BookingStatus;
      notes?: string;
    }) => {
      const updates: BookingUpdate = { status };
      if (status === "cancelled") {
        updates.cancelled_at = new Date().toISOString();
        updates.cancellation_reason = notes;
      }
      if (status === "denied") {
        // Track denial reason in a dedicated field so it can be displayed in Admin → Approvals → Denied.
        updates.cancellation_reason = notes;
      }
      if (notes) {
        updates.internal_notes = notes;
      }

      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Log to audit
      await supabase.from("audit_log").insert({
        entity_type: "booking",
        entity_id: id,
        action_type: `status_changed_to_${status}`,
        after_json: { status, notes },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      // Aggressively invalidate all booking-related queries
      // This ensures all calendars (admin, public, my-schedule) update immediately
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      
      // Lindsey/Spa-specific booking queries
      queryClient.invalidateQueries({ queryKey: ["lindsey-bookings"] });
      
      // Invalidate admin dashboard stats
      queryClient.invalidateQueries({ queryKey: ["admin_stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin_alerts"] });
      
      // Invalidate availability so freed slots become bookable
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["next-available"] });
      queryClient.invalidateQueries({ queryKey: ["slot_holds"] });
      
      // Invalidate reschedule-related queries
      queryClient.invalidateQueries({ queryKey: ["reschedule_requests"] });
      
      toast.success(`Booking ${variables.status}`);
    },
    onError: (error) => {
      toast.error("Failed to update booking: " + error.message);
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: BookingInsert) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert(booking)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create booking: " + error.message);
    },
  });
}
