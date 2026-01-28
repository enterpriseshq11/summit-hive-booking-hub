import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch the voice_vault_payments_enabled config setting.
 * When false, Voice Vault bookings skip payment/deposit collection (pay on arrival).
 * Defaults to true if not set.
 */
export function useVoiceVaultPaymentsConfig() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["voice-vault-payments-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "voice_vault_payments_enabled")
        .maybeSingle();
      
      if (error) {
        console.error("Failed to fetch voice_vault_payments_enabled config:", error);
        return true; // Default to payments enabled
      }
      
      return data?.value === "true";
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    voiceVaultPaymentsEnabled: data ?? true,
    isLoading,
    error,
  };
}
