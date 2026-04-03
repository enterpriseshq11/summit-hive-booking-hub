import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Link2, Save, TestTube } from "lucide-react";

interface GhlConfig {
  id: string;
  business_unit: string;
  webhook_url: string | null;
  pipeline_stage_webhook_url: string | null;
  is_active: boolean;
  last_tested_at: string | null;
}

const UNIT_LABELS: Record<string, string> = {
  summit: "The Summit Event Center",
  spa: "Restoration Lounge Spa",
  fitness: "A-Z Total Fitness",
  coworking: "The Hive Coworking",
  voice_vault: "Voice Vault",
  elevated_by_elyse: "Elevated by Elyse",
  mobile_homes: "Mobile Homes",
};

export default function AdminIntegrations() {
  const [configs, setConfigs] = useState<GhlConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const { data } = await supabase
      .from("ghl_webhook_config")
      .select("*")
      .order("business_unit");
    setConfigs((data as any) || []);
    setLoading(false);
  };

  const saveConfig = async (config: GhlConfig) => {
    setSaving(config.id);
    const { error } = await supabase
      .from("ghl_webhook_config")
      .update({
        webhook_url: config.webhook_url,
        pipeline_stage_webhook_url: config.pipeline_stage_webhook_url,
        is_active: config.is_active,
      })
      .eq("id", config.id);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success(`${UNIT_LABELS[config.business_unit]} webhook saved`);
    }
    setSaving(null);
  };

  const testWebhook = async (config: GhlConfig) => {
    if (!config.webhook_url) {
      toast.error("No webhook URL configured");
      return;
    }

    try {
      const res = await fetch(config.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test: true,
          business_unit: config.business_unit,
          timestamp: new Date().toISOString(),
          first_name: "Test",
          last_name: "Lead",
          email: "test@test.com",
          phone: "555-000-0000",
        }),
      });

      await supabase
        .from("ghl_webhook_config")
        .update({ last_tested_at: new Date().toISOString() })
        .eq("id", config.id);

      if (res.ok) {
        toast.success("Webhook test successful!");
      } else {
        toast.error(`Webhook returned HTTP ${res.status}`);
      }
      loadConfigs();
    } catch (err) {
      toast.error("Webhook test failed: " + String(err));
    }
  };

  const updateConfig = (id: string, updates: Partial<GhlConfig>) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-zinc-400">Configure Go High Level webhooks and external integrations</p>
        </div>

        <Card className="border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Link2 className="h-5 w-5 text-amber-400" />
              Go High Level Webhook URLs
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Paste your GHL webhook URL for each business unit. When a lead submits an intake form,
              it will fire to both A-Z Command and GHL simultaneously.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-zinc-400">Loading...</div>
            ) : (
              configs.map((config) => (
                <div key={config.id} className="p-4 border border-zinc-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">
                      {UNIT_LABELS[config.business_unit] || config.business_unit}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.is_active}
                        onCheckedChange={(v) => updateConfig(config.id, { is_active: v })}
                      />
                      <span className="text-xs text-zinc-400">
                        {config.is_active ? "Active" : "Disabled"}
                      </span>
                      {config.last_tested_at && (
                        <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                          Tested
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-zinc-400 text-xs">Lead Intake Webhook URL</Label>
                    <Input
                      value={config.webhook_url || ""}
                      onChange={(e) => updateConfig(config.id, { webhook_url: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
                      placeholder="https://services.leadconnectorhq.com/hooks/..."
                    />
                  </div>

                  <div>
                    <Label className="text-zinc-400 text-xs">Pipeline Stage Webhook URL (optional)</Label>
                    <Input
                      value={config.pipeline_stage_webhook_url || ""}
                      onChange={(e) => updateConfig(config.id, { pipeline_stage_webhook_url: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
                      placeholder="https://services.leadconnectorhq.com/hooks/..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-amber-500 text-black hover:bg-amber-400"
                      onClick={() => saveConfig(config)}
                      disabled={saving === config.id}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      {saving === config.id ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-zinc-300"
                      onClick={() => testWebhook(config)}
                      disabled={!config.webhook_url}
                    >
                      <TestTube className="h-3 w-3 mr-1" /> Test
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
