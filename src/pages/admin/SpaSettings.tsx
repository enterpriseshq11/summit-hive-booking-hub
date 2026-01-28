import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, CreditCard, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SpaSettings() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch spa_payments_enabled config
  const { data: spaPaymentsEnabled, isLoading } = useQuery({
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
  });

  // Mutation to update spa_payments_enabled
  const updatePaymentsSetting = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from("app_config")
        .update({ value: enabled ? "true" : "false", updated_at: new Date().toISOString() })
        .eq("key", "spa_payments_enabled");

      if (error) throw error;
      return enabled;
    },
    onMutate: () => {
      setIsUpdating(true);
    },
    onSuccess: (enabled) => {
      queryClient.invalidateQueries({ queryKey: ["spa-payments-config"] });
      toast.success(
        enabled
          ? "Spa payments enabled. Customers will pay deposits at booking."
          : "Spa payments disabled. Customers will pay on arrival."
      );
    },
    onError: (error) => {
      console.error("Failed to update spa payments setting:", error);
      toast.error("Failed to update setting. Please try again.");
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const handleToggle = (checked: boolean) => {
    updatePaymentsSetting.mutate(checked);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-pink-400" />
            Spa Settings
          </h1>
          <p className="text-zinc-400 mt-1">
            Configure settings for the Restoration Lounge spa services
          </p>
        </div>

        {/* Payment Settings Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-pink-400" />
              Payment Settings
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Control how payments are collected for spa bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading settings...
              </div>
            ) : (
              <>
                {/* Toggle Row */}
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div className="space-y-1">
                    <Label htmlFor="spa-payments" className="text-white font-medium">
                      Collect Payment at Booking
                    </Label>
                    <p className="text-sm text-zinc-400">
                      {spaPaymentsEnabled
                        ? "Customers pay a deposit when booking online"
                        : "Customers pay on arrival (no upfront payment required)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                    <Switch
                      id="spa-payments"
                      checked={spaPaymentsEnabled ?? false}
                      onCheckedChange={handleToggle}
                      disabled={isUpdating}
                      className="data-[state=checked]:bg-pink-500"
                    />
                  </div>
                </div>

                {/* Status Alert */}
                <Alert className={spaPaymentsEnabled ? "border-pink-500/50 bg-pink-500/10" : "border-amber-500/50 bg-amber-500/10"}>
                  <AlertCircle className={`h-4 w-4 ${spaPaymentsEnabled ? "text-pink-400" : "text-amber-400"}`} />
                  <AlertDescription className="text-zinc-300">
                    {spaPaymentsEnabled ? (
                      <>
                        <strong className="text-pink-400">Payments Enabled:</strong> Customers will be required to pay
                        a deposit when booking spa services online. The deposit will be applied to their final bill.
                      </>
                    ) : (
                      <>
                        <strong className="text-amber-400">Pay on Arrival:</strong> No payment is collected at booking.
                        Customers will pay the full amount when they arrive for their appointment.
                      </>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Additional Info */}
                <div className="text-sm text-zinc-500 space-y-1">
                  <p>• This setting applies to all spa bookings made through the website.</p>
                  <p>• Changes take effect immediately for new bookings.</p>
                  <p>• Existing bookings are not affected.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
