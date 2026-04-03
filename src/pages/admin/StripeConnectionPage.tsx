import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreditCard, CheckCircle, XCircle, Copy, TestTube, Unplug, Clock, Zap, Settings2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function StripeConnectionPage() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const { data: baseUrl } = useQuery({
    queryKey: ["admin_settings", "base_url"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", "base_url").maybeSingle();
      return data?.value || "https://summit-hive-booking-hub.lovable.app";
    },
  });

  const { data: lastWebhookEvent } = useQuery({
    queryKey: ["stripe_last_webhook"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("stripe_webhook_events").select("received_at, event_type").order("received_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  const { data: lastTransaction } = useQuery({
    queryKey: ["stripe_last_transaction"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("stripe_transactions").select("synced_at, amount, status").order("synced_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  const { data: autoRevenueEnabled } = useQuery({
    queryKey: ["admin_settings", "stripe_auto_revenue_enabled"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", "stripe_auto_revenue_enabled").maybeSingle();
      return data?.value === "true";
    },
  });

  const { data: autoCommissionEnabled } = useQuery({
    queryKey: ["admin_settings", "commission_auto_calculate_enabled"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", "commission_auto_calculate_enabled").maybeSingle();
      return data?.value === "true";
    },
  });

  const toggleSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      const { error } = await supabase.from("admin_settings").update({ value: String(value), updated_at: new Date().toISOString() }).eq("key", key);
      if (error) throw error;
      await supabase.from("crm_activity_events").insert({
        event_type: "status_change" as any,
        actor_id: authUser?.id,
        entity_type: "admin_settings",
        entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
        event_category: "settings_change",
        metadata: { action: "setting_toggled", key, value: String(value) },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_settings"] });
      toast.success("Setting updated");
    },
  });

  const webhookUrl = `${baseUrl}/functions/v1/stripe-webhook`;

  const handleTestConnection = () => {
    setTestResult("success_mock");
    toast.success("Test connection: Mock success. Live testing requires the real Stripe secret key.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-purple-400" /> Stripe Connection
          </h1>
          <p className="text-zinc-400">Manage your Stripe payment integration</p>
        </div>

        {/* Section 1: Connection Status */}
        <Card className="border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-zinc-800 rounded-lg">
                <p className="text-zinc-400 text-sm">Account Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-amber-500/20 text-amber-400">Pending Setup</Badge>
                </div>
                <p className="text-zinc-500 text-xs mt-2">Configure your Stripe secret key to connect</p>
              </div>
              <div className="p-4 border border-zinc-800 rounded-lg">
                <p className="text-zinc-400 text-sm">Webhook Secret</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-amber-500/20 text-amber-400">Placeholder Set</Badge>
                </div>
                <p className="text-zinc-500 text-xs mt-2">STRIPE_WEBHOOK_SECRET is set to PENDING_STRIPE_SETUP</p>
              </div>
              <div className="p-4 border border-zinc-800 rounded-lg">
                <p className="text-zinc-400 text-sm">Last Webhook Received</p>
                <div className="flex items-center gap-2 mt-1">
                  {lastWebhookEvent ? (
                    <span className="text-white text-sm flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      {format(new Date(lastWebhookEvent.received_at), "MMM d, yyyy 'at' h:mm a")}
                      <Badge variant="outline" className="ml-2 text-xs">{lastWebhookEvent.event_type}</Badge>
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-sm">No webhooks received yet</span>
                  )}
                </div>
              </div>
              <div className="p-4 border border-zinc-800 rounded-lg">
                <p className="text-zinc-400 text-sm">Last Payment Synced</p>
                <div className="flex items-center gap-2 mt-1">
                  {lastTransaction ? (
                    <span className="text-white text-sm flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      {format(new Date(lastTransaction.synced_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-sm">No payments synced yet</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={handleTestConnection}>
                <TestTube className="h-4 w-4 mr-2" /> Test Connection
              </Button>
              <Button variant="outline" className="border-red-500/30 text-red-400" onClick={() => setShowDisconnect(true)}>
                <Unplug className="h-4 w-4 mr-2" /> Disconnect
              </Button>
            </div>
            {testResult === "success_mock" && (
              <div className="p-3 border border-green-500/30 rounded-lg bg-green-500/5">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Mock test successful. Replace STRIPE_WEBHOOK_SECRET with your real key for live testing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Webhook Configuration */}
        <Card className="border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" /> Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-zinc-800 rounded-lg">
              <Label className="text-zinc-400 text-sm">Webhook Endpoint URL</Label>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 p-2 bg-zinc-800 rounded text-amber-400 font-mono text-sm truncate">
                  {webhookUrl}
                </code>
                <Button size="sm" variant="outline" className="border-zinc-700" onClick={() => copyToClipboard(webhookUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 border border-zinc-800 rounded-lg">
              <p className="text-white text-sm font-medium mb-2">Setup Instructions</p>
              <ol className="text-zinc-400 text-sm space-y-1 list-decimal pl-5">
                <li>Go to your Stripe dashboard → Developers → Webhooks → Add Endpoint</li>
                <li>Paste the URL above as the endpoint URL</li>
                <li>Select the following events to listen for:</li>
              </ol>
              <div className="flex flex-wrap gap-1.5 mt-2 ml-5">
                {[
                  "payment_intent.succeeded", "payment_intent.payment_failed",
                  "charge.refunded", "customer.subscription.created",
                  "customer.subscription.deleted", "invoice.payment_succeeded",
                  "invoice.payment_failed",
                ].map(evt => (
                  <Badge key={evt} variant="outline" className="text-xs font-mono border-zinc-700 text-zinc-300">{evt}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Sync Settings */}
        <Card className="border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-400" /> Sync Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg">
              <div>
                <p className="text-white text-sm font-medium">Auto-create revenue events from Stripe payments</p>
                <p className="text-zinc-500 text-xs">When a Stripe payment succeeds, automatically create a revenue event</p>
              </div>
              <Switch
                checked={autoRevenueEnabled || false}
                onCheckedChange={(v) => toggleSettingMutation.mutate({ key: "stripe_auto_revenue_enabled", value: v })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg">
              <div>
                <p className="text-white text-sm font-medium">Auto-calculate commissions from Stripe payments</p>
                <p className="text-zinc-500 text-xs">When a Stripe-sourced revenue event is created, auto-calculate commissions</p>
              </div>
              <Switch
                checked={autoCommissionEnabled || false}
                onCheckedChange={(v) => toggleSettingMutation.mutate({ key: "commission_auto_calculate_enabled", value: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Disconnect Dialog */}
        <AlertDialog open={showDisconnect} onOpenChange={setShowDisconnect}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Disconnect Stripe?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This will stop processing Stripe webhooks and auto-creating revenue events. Existing data will not be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-zinc-700 text-zinc-300">Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { toast.info("Stripe disconnect requires updating the webhook secret. Contact admin."); setShowDisconnect(false); }}>
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
