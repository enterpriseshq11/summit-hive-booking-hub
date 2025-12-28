import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Provider = Database["public"]["Tables"]["providers"]["Row"];
type ProviderSchedule = Database["public"]["Tables"]["provider_schedules"]["Row"];

export function useProviders(businessId?: string) {
  return useQuery({
    queryKey: ["providers", businessId],
    queryFn: async () => {
      let query = supabase
        .from("providers")
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

export function useProvider(providerId: string) {
  return useQuery({
    queryKey: ["provider", providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select(`
          *,
          businesses(name, type),
          provider_schedules(*)
        `)
        .eq("id", providerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });
}

export function useProviderSchedules(providerId: string) {
  return useQuery({
    queryKey: ["provider_schedules", providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_schedules")
        .select("*")
        .eq("provider_id", providerId)
        .eq("is_active", true)
        .order("day_of_week");

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });
}

export function useAvailableProviders(params: {
  businessId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  return useQuery({
    queryKey: ["available_providers", params],
    queryFn: async () => {
      const dayOfWeek = new Date(params.date).getDay();

      // Get providers for the business with schedules for this day
      const { data: providers, error: pError } = await supabase
        .from("providers")
        .select(`
          *,
          provider_schedules!inner(*)
        `)
        .eq("business_id", params.businessId)
        .eq("is_active", true)
        .eq("accepts_bookings", true)
        .eq("provider_schedules.day_of_week", dayOfWeek)
        .eq("provider_schedules.is_active", true);

      if (pError) throw pError;

      // Check for existing bookings
      const { data: existingBookings } = await supabase
        .from("bookings")
        .select("assigned_provider_id")
        .gte("start_datetime", `${params.date}T${params.startTime}`)
        .lt("end_datetime", `${params.date}T${params.endTime}`)
        .not("status", "in", '("cancelled","no_show")');

      const bookedProviderIds = new Set(
        existingBookings?.map((b) => b.assigned_provider_id).filter(Boolean)
      );

      // Check blackouts
      const { data: blackouts } = await supabase
        .from("blackout_dates")
        .select("provider_id")
        .lte("start_datetime", `${params.date}T${params.endTime}`)
        .gte("end_datetime", `${params.date}T${params.startTime}`)
        .not("provider_id", "is", null);

      const blackedOutProviderIds = new Set(blackouts?.map((b) => b.provider_id));

      // Filter available providers
      const available = providers?.filter((p) => {
        if (bookedProviderIds.has(p.id)) return false;
        if (blackedOutProviderIds.has(p.id)) return false;

        // Check schedule hours
        const schedule = (p.provider_schedules as ProviderSchedule[])?.[0];
        if (!schedule) return false;

        const schedStart = schedule.start_time;
        const schedEnd = schedule.end_time;
        return params.startTime >= schedStart && params.endTime <= schedEnd;
      });

      return available || [];
    },
    enabled: !!(params.businessId && params.date && params.startTime && params.endTime),
  });
}

export function useAssignProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      providerId,
    }: {
      bookingId: string;
      providerId: string;
    }) => {
      const { data: before } = await supabase
        .from("bookings")
        .select("assigned_provider_id")
        .eq("id", bookingId)
        .single();

      const { data, error } = await supabase
        .from("bookings")
        .update({ assigned_provider_id: providerId })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "booking",
        entity_id: bookingId,
        action_type: "provider_assigned",
        before_json: before,
        after_json: { assigned_provider_id: providerId },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["booking", variables.bookingId] });
      toast.success("Provider assigned");
    },
    onError: (error) => {
      toast.error("Failed to assign provider: " + error.message);
    },
  });
}
