import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BusinessType } from "@/types";

interface AvailabilityParams {
  business_type?: BusinessType;
  bookable_type_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  party_size?: number;
  resource_id?: string;
}

interface AvailableSlot {
  id: string;
  start_time: string;
  end_time: string;
  resource_id: string;
  resource_name: string;
  bookable_type_id: string;
  bookable_type_name: string;
  base_price: number;
  is_available: boolean;
}

interface AvailabilityResponse {
  success: boolean;
  slots: AvailableSlot[];
  all_slots: AvailableSlot[];
  next_available: Record<string, AvailableSlot[]>;
  query: AvailabilityParams;
  error?: string;
}

export function useAvailability(params: AvailabilityParams, enabled = true) {
  return useQuery({
    queryKey: ["availability", params],
    queryFn: async (): Promise<AvailabilityResponse> => {
      const { data, error } = await supabase.functions.invoke("check-availability", {
        body: params,
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to check availability");

      return data;
    },
    enabled: enabled && Boolean(params.date || params.start_date),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useNextAvailable(businessType?: BusinessType) {
  const today = new Date().toISOString().split("T")[0];
  
  return useQuery({
    queryKey: ["next-available", businessType, today],
    queryFn: async (): Promise<AvailableSlot[]> => {
      const { data, error } = await supabase.functions.invoke("check-availability", {
        body: {
          business_type: businessType,
          date: today,
        },
      });

      if (error) throw error;
      if (!data.success) return [];

      if (businessType && data.next_available[businessType]) {
        return data.next_available[businessType].slice(0, 3);
      }

      // Flatten all next available slots
      return Object.values(data.next_available as Record<string, AvailableSlot[]>)
        .flat()
        .slice(0, 3);
    },
    staleTime: 60000,
  });
}

interface CreateHoldParams {
  bookable_type_id: string;
  resource_id: string;
  start_datetime: string;
  end_datetime: string;
  provider_id?: string;
}

export function useCreateSlotHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateHoldParams) => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      const sessionId = !userId ? `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : null;

      // Calculate expiry (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("slot_holds")
        .insert({
          bookable_type_id: params.bookable_type_id,
          resource_id: params.resource_id,
          start_datetime: params.start_datetime,
          end_datetime: params.end_datetime,
          provider_id: params.provider_id,
          user_id: userId,
          session_id: sessionId,
          expires_at: expiresAt,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useReleaseSlotHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (holdId: string) => {
      const { error } = await supabase
        .from("slot_holds")
        .update({ status: "released" })
        .eq("id", holdId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}
