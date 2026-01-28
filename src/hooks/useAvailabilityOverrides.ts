import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface AvailabilityOverride {
  id: string;
  business_id: string;
  provider_id: string | null;
  override_date: string;
  is_unavailable: boolean;
  availability_windows: { start: string; end: string }[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useAvailabilityOverrides(
  businessId?: string,
  startDate?: Date,
  endDate?: Date
) {
  return useQuery({
    queryKey: ["availability-overrides", businessId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async (): Promise<AvailabilityOverride[]> => {
      if (!businessId || !startDate || !endDate) return [];

      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("availability_overrides")
        .select("*")
        .eq("business_id", businessId)
        .gte("override_date", startStr)
        .lte("override_date", endStr);

      if (error) throw error;

      return (data || []).map(row => ({
        ...row,
        availability_windows: (row.availability_windows as any[] || [])
      }));
    },
    enabled: !!businessId && !!startDate && !!endDate,
    staleTime: 30000,
  });
}

// Helper to format override info for display
export function formatOverrideDisplay(override: AvailabilityOverride): string {
  if (override.is_unavailable) {
    return "Unavailable";
  }
  
  const windows = override.availability_windows || [];
  if (windows.length === 0) {
    return "No availability set";
  }
  
  return windows.map(w => `${w.start}-${w.end}`).join(", ");
}
