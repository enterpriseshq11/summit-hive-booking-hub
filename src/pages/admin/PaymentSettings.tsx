import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, AlertCircle, Sparkles, Mic, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type PaymentConfigKey = "spa_payments_enabled" | "voice_vault_payments_enabled" | "photobooth360_payments_enabled";

interface PaymentToggleConfig {
  key: PaymentConfigKey;
  label: string;
  description: string;
  icon: typeof Sparkles;
  iconColor: string;
  depositInfo: string;
}

const paymentConfigs: PaymentToggleConfig[] = [
  {
    key: "spa_payments_enabled",
    label: "Spa (Restoration Lounge)",
    description: "Massage, bodywork, and wellness services",
    icon: Sparkles,
    iconColor: "text-pink-400",
    depositInfo: "$20 non-refundable booking fee, applied to final bill",
  },
  {
    key: "voice_vault_payments_enabled",
    label: "Voice Vault",
    description: "Professional voice recording studio sessions",
    icon: Mic,
    iconColor: "text-purple-400",
    depositInfo: "1/3 deposit at booking, remaining 2/3 due on arrival",
  },
  {
    key: "photobooth360_payments_enabled",
    label: "360 Photo Booth",
    description: "360-degree photo booth experiences and rentals",
    icon: Camera,
    iconColor: "text-blue-400",
    depositInfo: "1/3 deposit at booking, remaining 2/3 due on arrival",
  },
];

export default function PaymentSettings() {
  const queryClient = useQueryClient();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  // Fetch all payment configs in one query
  const { data: configData, isLoading } = useQuery({
    queryKey: ["payment-settings-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", paymentConfigs.map(c => c.key));

      if (error) {
        console.error("Failed to fetch payment configs:", error);
        throw error;
      }

      // Convert to a map for easy access
      const configMap: Record<string, boolean> = {};
      for (const config of paymentConfigs) {
        const found = data?.find(d => d.key === config.key);
        configMap[config.key] = found?.value === "true";
      }
      return configMap;
    },
  });

  // Mutation to update a payment setting
  const updatePaymentSetting = useMutation({
    mutationFn: async ({ key, enabled }: { key: PaymentConfigKey; enabled: boolean }) => {
      const { error } = await supabase
        .from("app_config")
        .update({ 
          value: enabled ? "true" : "false", 
          updated_at: new Date().toISOString() 
        })
        .eq("key", key);

      if (error) throw error;
      return { key, enabled };
    },
    onMutate: ({ key }) => {
      setUpdatingKey(key);
    },
    onSuccess: ({ key, enabled }) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["payment-settings-all"] });
      queryClient.invalidateQueries({ queryKey: ["spa-payments-config"] });
      queryClient.invalidateQueries({ queryKey: ["voice-vault-payments-config"] });
      queryClient.invalidateQueries({ queryKey: ["photobooth360-payments-config"] });
      
      const config = paymentConfigs.find(c => c.key === key);
      toast.success(
        enabled
          ? `${config?.label} payments enabled. Deposits will be collected at booking.`
          : `${config?.label} payments disabled. Customers will pay on arrival.`
      );
    },
    onError: (error, { key }) => {
      console.error(`Failed to update ${key}:`, error);
      toast.error("Failed to update setting. Please try again.");
    },
    onSettled: () => {
      setUpdatingKey(null);
    },
  });

  const handleToggle = (key: PaymentConfigKey, checked: boolean) => {
    updatePaymentSetting.mutate({ key, enabled: checked });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-amber-400" />
            Payment Settings
          </h1>
          <p className="text-zinc-400 mt-1">
            Control payment collection for each business unit. Toggle OFF for pay-on-arrival mode.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-zinc-300">
            <strong className="text-amber-400">How it works:</strong> When payment is <strong>ON</strong>, 
            deposits are collected at booking. When <strong>OFF</strong>, bookings are confirmed immediately 
            and customers pay the full amount on arrival. Prices remain visible in both modes.
          </AlertDescription>
        </Alert>

        {/* Payment Toggle Cards */}
        <div className="grid gap-4">
          {paymentConfigs.map((config) => {
            const isEnabled = configData?.[config.key] ?? false;
            const isUpdating = updatingKey === config.key;
            const Icon = config.icon;

            return (
              <Card key={config.key} className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-zinc-800 ${config.iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          {config.label}
                          <Badge 
                            variant={isEnabled ? "default" : "secondary"}
                            className={isEnabled ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-zinc-700 text-zinc-400"}
                          >
                            {isEnabled ? "Deposit Required" : "Pay on Arrival"}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          {config.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleToggle(config.key, checked)}
                        disabled={isLoading || isUpdating}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    ) : isEnabled ? (
                      <div className="text-sm text-zinc-300">
                        <span className="text-green-400 font-medium">Deposit Collection Active:</span>{" "}
                        {config.depositInfo}
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-300">
                        <span className="text-amber-400 font-medium">Pay on Arrival:</span>{" "}
                        No payment collected at booking. Full amount due when customer arrives.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="text-sm text-zinc-500 space-y-2">
              <p className="font-medium text-zinc-400">Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Changes take effect immediately for new bookings.</li>
                <li>Existing bookings are not affected by toggle changes.</li>
                <li>Prices are always displayed regardless of payment mode.</li>
                <li>When payments are disabled, booking confirmation is immediate.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
