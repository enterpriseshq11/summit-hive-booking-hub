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
        return false;
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

/**
 * Hook to fetch the voice_vault_payments_enabled config setting.
 * When false, Voice Vault bookings skip payment/deposit collection (pay on arrival).
 * Defaults to true if not set (Voice Vault typically requires deposit).
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
        return true; // Default to payments enabled for Voice Vault
      }
      
      // Default to true if not found
      return data?.value !== "false";
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    voiceVaultPaymentsEnabled: data ?? true,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch the photobooth360_payments_enabled config setting.
 * When false, 360 Photo Booth bookings skip payment/deposit collection (pay on arrival).
 * Defaults to true if not set.
 */
export function usePhotoBooth360PaymentsConfig() {
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
      
      // Default to true if not found
      return data?.value !== "false";
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    photoBooth360PaymentsEnabled: data ?? true,
    isLoading,
    error,
  };
}
