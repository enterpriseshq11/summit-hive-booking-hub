import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, Mic, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IncludedItemsState {
  included_360_photobooth_enabled: boolean;
  included_voice_vault_enabled: boolean;
}

export default function WhatsIncluded() {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch both config values
  const { data: config, isLoading } = useQuery({
    queryKey: ["included-items-admin-config"],
    queryFn: async (): Promise<IncludedItemsState> => {
      const { data, error } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["included_360_photobooth_enabled", "included_voice_vault_enabled"]);

      if (error) {
        console.error("Failed to fetch included items config:", error);
        return { included_360_photobooth_enabled: true, included_voice_vault_enabled: true };
      }

      const configMap = (data || []).reduce((acc, item) => {
        acc[item.key] = item.value === "true";
        return acc;
      }, {} as Record<string, boolean>);

      return {
        included_360_photobooth_enabled: configMap["included_360_photobooth_enabled"] ?? true,
        included_voice_vault_enabled: configMap["included_voice_vault_enabled"] ?? true,
      };
    },
  });

  // Mutation to update a config value
  const updateSetting = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("app_config")
        .update({ value: enabled ? "true" : "false", updated_at: new Date().toISOString() })
        .eq("key", key);

      if (error) throw error;
      return { key, enabled };
    },
    onMutate: ({ key }) => {
      setUpdating(key);
    },
    onSuccess: ({ key, enabled }) => {
      queryClient.invalidateQueries({ queryKey: ["included-items-admin-config"] });
      queryClient.invalidateQueries({ queryKey: ["included-items-config"] });
      const itemName = key === "included_360_photobooth_enabled" ? "360 Photo Booth" : "Voice Vault";
      toast.success(
        enabled
          ? `${itemName} is now visible in What's Included.`
          : `${itemName} is now hidden from What's Included.`
      );
    },
    onError: (error) => {
      console.error("Failed to update setting:", error);
      toast.error("Failed to update setting. Please try again.");
    },
    onSettled: () => {
      setUpdating(null);
    },
  });

  const handleToggle = (key: keyof IncludedItemsState, checked: boolean) => {
    updateSetting.mutate({ key, enabled: checked });
  };

  const items = [
    {
      key: "included_360_photobooth_enabled" as const,
      label: "Show '360 Photo Booth Included'",
      description: "Display the 360 Photo Booth as an included item for Summit event bookings",
      icon: Camera,
      color: "text-amber-400",
    },
    {
      key: "included_voice_vault_enabled" as const,
      label: "Show 'Voice Vault Included'",
      description: "Display Voice Vault studio access as an included item",
      icon: Mic,
      color: "text-purple-400",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            What's Included Settings
          </h1>
          <p className="text-zinc-400 mt-1">
            Control which items appear in the "What's Included" section on the website
          </p>
        </div>

        {/* Settings Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Included Items</CardTitle>
            <CardDescription className="text-zinc-400">
              Toggle visibility of included items across the website and booking confirmations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading settings...
              </div>
            ) : (
              <>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isEnabled = config?.[item.key] ?? true;
                  const isUpdating = updating === item.key;

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${item.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={item.key} className="text-white font-medium">
                            {item.label}
                          </Label>
                          <p className="text-sm text-zinc-400">{item.description}</p>
                          <p className="text-xs text-zinc-500">
                            Controls whether this item appears on the website and in booking confirmations.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                        <Switch
                          id={item.key}
                          checked={isEnabled}
                          onCheckedChange={(checked) => handleToggle(item.key, checked)}
                          disabled={isUpdating}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Info */}
                <div className="text-sm text-zinc-500 space-y-1 pt-4 border-t border-zinc-800">
                  <p>• Changes take effect immediately across all pages.</p>
                  <p>• Toggling OFF hides the item from public-facing pages and confirmations.</p>
                  <p>• No code or data is removed. Toggling ON restores visibility.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
