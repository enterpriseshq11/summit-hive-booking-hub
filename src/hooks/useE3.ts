import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useE3Venues() {
  return useQuery({
    queryKey: ["e3_venues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_venues" as any)
        .select("*")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useE3Halls(venueId?: string) {
  return useQuery({
    queryKey: ["e3_halls", venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_halls" as any)
        .select("*")
        .eq("active_status", true)
        .eq("venue_id", venueId!)
        .order("name");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!venueId,
  });
}

export function useE3TimeBlocks(venueId?: string) {
  return useQuery({
    queryKey: ["e3_time_blocks", venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_time_blocks" as any)
        .select("*")
        .eq("venue_id", venueId!)
        .order("start_time");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!venueId,
  });
}

export function useE3Bookings(filters?: {
  coordinatorOnly?: boolean;
  startDate?: string;
  endDate?: string;
  state?: string;
}) {
  return useQuery({
    queryKey: ["e3_bookings", filters],
    queryFn: async () => {
      let q = supabase
        .from("e3_bookings")
        .select(`
          *,
          e3_venues(name),
          e3_time_blocks(name, start_time, end_time),
          e3_coordinators(name),
          e3_booking_halls(hall_id, e3_halls(name))
        `)
        .order("event_date", { ascending: true });

      if (filters?.startDate) q = q.gte("event_date", filters.startDate);
      if (filters?.endDate) q = q.lte("event_date", filters.endDate);
      if (filters?.state) q = q.eq("booking_state", filters.state as any);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useE3Booking(bookingId?: string) {
  return useQuery({
    queryKey: ["e3_booking", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_bookings")
        .select(`
          *,
          e3_venues(name, address),
          e3_time_blocks(name, start_time, end_time),
          e3_coordinators(name, email),
          e3_booking_halls(hall_id, e3_halls(name, allocation_percentage, reset_buffer)),
          e3_booking_documents(*)
        `)
        .eq("id", bookingId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });
}

export function useE3CreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      p_venue_id: string;
      p_event_date: string;
      p_time_block_id: string;
      p_hall_ids: string[];
      p_client_name: string;
      p_client_email: string;
      p_client_phone?: string;
      p_event_type?: string;
      p_guest_count?: number;
      p_gross_revenue?: number;
      p_notes?: string;
      p_has_alcohol?: boolean;
    }) => {
      const { data, error } = await supabase.rpc("e3_create_booking", params);
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_bookings"] });
      toast.success("Booking created. Red hold active.");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useE3AdvanceToYellow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase.rpc("e3_advance_to_yellow", { p_booking_id: bookingId });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_bookings"] });
      qc.invalidateQueries({ queryKey: ["e3_booking"] });
      toast.success("Advanced to yellow contract. Deposit deadline set.");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useE3ApproveDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase.rpc("e3_approve_deposit", { p_booking_id: bookingId });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_bookings"] });
      qc.invalidateQueries({ queryKey: ["e3_booking"] });
      toast.success("Deposit approved. Booking is now green/booked.");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useE3CancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc("e3_cancel_booking", { p_booking_id: bookingId, p_reason: reason });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_bookings"] });
      qc.invalidateQueries({ queryKey: ["e3_booking"] });
      toast.success("Booking cancelled.");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useE3UpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      p_booking_id: string;
      p_hall_ids?: string[];
      p_time_block_id?: string;
      p_gross_revenue?: number;
      p_client_name?: string;
      p_client_email?: string;
      p_client_phone?: string;
      p_event_type?: string;
      p_guest_count?: number;
      p_notes?: string;
    }) => {
      const { data, error } = await supabase.rpc("e3_update_booking", params);
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_bookings"] });
      qc.invalidateQueries({ queryKey: ["e3_booking"] });
      toast.success("Booking updated.");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useE3DocumentTemplates() {
  return useQuery({
    queryKey: ["e3_document_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_document_templates" as any)
        .select("*")
        .eq("is_active", true)
        .order("template_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useE3CoordinatorProfile() {
  return useQuery({
    queryKey: ["e3_coordinator_profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("e3_coordinators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useE3PendingDeposits() {
  return useQuery({
    queryKey: ["e3_bookings", "pending_deposits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_bookings")
        .select(`
          *,
          e3_venues(name),
          e3_time_blocks(name),
          e3_coordinators(name),
          e3_booking_halls(hall_id, e3_halls(name))
        `)
        .eq("booking_state", "yellow_contract")
        .order("deposit_due_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
