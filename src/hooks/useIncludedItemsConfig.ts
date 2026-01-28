import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IncludedItemsConfig {
  photoBoothEnabled: boolean;
  voiceVaultEnabled: boolean;
}

export function useIncludedItemsConfig() {
  return useQuery({
    queryKey: ["included-items-config"],
    queryFn: async (): Promise<IncludedItemsConfig> => {
      const { data, error } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["included_360_photobooth_enabled", "included_voice_vault_enabled"]);

      if (error) {
        console.error("Failed to fetch included items config:", error);
        return { photoBoothEnabled: true, voiceVaultEnabled: true };
      }

      const configMap = (data || []).reduce((acc, item) => {
        acc[item.key] = item.value === "true";
        return acc;
      }, {} as Record<string, boolean>);

      return {
        photoBoothEnabled: configMap["included_360_photobooth_enabled"] ?? true,
        voiceVaultEnabled: configMap["included_voice_vault_enabled"] ?? true,
      };
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}
