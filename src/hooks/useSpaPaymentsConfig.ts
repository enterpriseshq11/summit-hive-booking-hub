import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch the spa_payments_enabled config setting.
 * When false, Spa bookings skip payment/deposit collection (pay on arrival).
 * Defaults to false if not set.
 */
export function useSpaPaymentsConfig() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["spa-payments-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "spa_payments_enabled")
        .maybeSingle();
      
      if (error) {
        console.error("Failed to fetch spa_payments_enabled config:", error);
        return false; // Default to payments disabled
      }
      
      return data?.value === "true";
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    spaPaymentsEnabled: data ?? false,
    isLoading,
    error,
  };
}
