import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch the photobooth360_payments_enabled config setting.
 * When false, 360 Photo Booth bookings skip payment/deposit collection (pay on arrival).
 * Defaults to true if not set.
 */
export function usePhotoBoothPaymentsConfig() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["photobooth360-payments-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "photobooth360_payments_enabled")
        .maybeSingle();
      
      if (error) {
        console.error("Failed to fetch photobooth360_payments_enabled config:", error);
        return true; // Default to payments enabled
      }
      
      return data?.value === "true";
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    photoBoothPaymentsEnabled: data ?? true,
    isLoading,
    error,
  };
}
