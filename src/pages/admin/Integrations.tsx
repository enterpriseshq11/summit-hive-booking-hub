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
import { Link2, Save, TestTube, RefreshCw, CreditCard, Construction, CheckCircle, XCircle, Clock, Mail, Shield } from "lucide-react";
import { format } from "date-fns";

interface GhlConfig {
  id: string;
  business_unit: string;
  webhook_url: string | null;
  pipeline_stage_webhook_url: string | null;
  is_active: boolean;
  last_tested_at: string | null;
  last_fired_at: string | null;
  last_status: string | null;
}

interface PipelineStageWebhook {
  id: string;
  stage_name: string;
  webhook_url: string | null;
  is_active: boolean;
  last_tested_at: string | null;
  last_fired_at: string | null;
  last_status: string | null;
}

const UNIT_LABELS: Record<string, string> = {
  summit: "Summit Event Center",
  spa: "Restoration Lounge Spa",
  fitness: "A-Z Total Fitness",
  coworking: "The Hive Coworking",
  voice_vault: "Voice Vault",
  elevated_by_elyse: "Elevated by Elyse",
  mobile_homes: "Mobile Homes",
};

const STAGE_LABELS: Record<string, string> = {
  new: "New Lead",
  contact_attempted: "Contact Attempted",
  responded: "Responded",
  warm_lead: "Warm Lead",
  hot_lead: "Hot Lead",
  proposal_sent: "Proposal Sent",
  contract_out: "Contract Out",
  deposit_received: "Deposit Received",
  booked: "Booked",
  completed: "Completed",
  lost: "Lost",
};

const FUTURE_INTEGRATION_GROUPS = [
  {
    label: "E-Signature",
    items: [
      { name: "DocuSign", desc: "Industry-standard e-signature" },
      { name: "PandaDoc", desc: "Document automation and e-signature" },
    ],
  },
  {
    label: "Ad Platforms",
    items: [
      { name: "Facebook Ads", desc: "Meta ad campaign tracking" },
      { name: "Google Ads", desc: "Google search and display ads" },
      { name: "TikTok Ads", desc: "TikTok ad campaign tracking" },
    ],
  },
  {
    label: "Email & CRM",
    items: [
      { name: "Mailchimp", desc: "Email marketing and automation" },
    ],
  },
  {
    label: "Business Listings",
    items: [
      { name: "Google Business Profile", desc: "Local SEO and reviews" },
    ],
  },
];

function StatusBadge({ status }: { status: string | null }) {
  if (!status || status === "never_fired") return <Badge variant="outline" className="border-zinc-600 text-zinc-500 text-xs">Never Fired</Badge>;
  if (status === "success" || status === "fired") return <Badge className="bg-green-500/20 text-green-400 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
  if (status === "failed") return <Badge className="bg-red-500/20 text-red-400 text-xs"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
  return <Badge variant="outline" className="border-zinc-600 text-zinc-500 text-xs">{status}</Badge>;
}

export default function AdminIntegrations() {
  const [configs, setConfigs] = useState<GhlConfig[]>([]);
  const [stageWebhooks, setStageWebhooks] = useState<PipelineStageWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [dnsChecking, setDnsChecking] = useState(false);
  const [dnsResult, setDnsResult] = useState<{ status: string; checkedAt: string; details?: string } | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [{ data: c }, { data: s }] = await Promise.all([
      supabase.from("ghl_webhook_config").select("*").order("business_unit"),
      supabase.from("ghl_pipeline_stage_webhooks").select("*").order("stage_name"),
    ]);
    setConfigs((c as any) || []);
    setStageWebhooks((s as any) || []);
    setLoading(false);
  };

  const checkDnsVerification = async () => {
    setDnsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-domain-verification", {
        body: { domain: "a-zenterpriseshq.com" },
      });
      if (error) throw error;
      setDnsResult({
        status: data?.verified ? "Verified" : data?.pending ? "Pending" : "Failed",
        checkedAt: new Date().toISOString(),
        details: data?.details || data?.message || undefined,
      });
      if (data?.verified) toast.success("Domain verified!");
      else toast.info(data?.message || "Domain not yet verified");
    } catch (err: any) {
      setDnsResult({ status: "Error", checkedAt: new Date().toISOString(), details: err.message });
      toast.error("Check failed: " + err.message);
    }
    setDnsChecking(false);
  };

  const saveConfig = async (config: GhlConfig) => {
    setSaving(config.id);
    const { error } = await supabase.from("ghl_webhook_config")
      .update({ webhook_url: config.webhook_url, pipeline_stage_webhook_url: config.pipeline_stage_webhook_url, is_active: config.is_active })
      .eq("id", config.id);
    if (error) toast.error("Failed: " + error.message);
    else toast.success(`${UNIT_LABELS[config.business_unit]} saved`);
    setSaving(null);
  };

  const testWebhook = async (config: GhlConfig) => {
    if (!config.webhook_url) { toast.error("No URL configured"); return; }
    setTesting(config.id);
    try {
      const payload = {
        first_name: "Test", last_name: "Lead", email: "test@a-zenterpriseshq.com",
        phone: "419-000-0000", business_unit: config.business_unit,
        source: "Test", event_type: "Test Submission",
        preferred_date: new Date().toISOString().split("T")[0],
        notes: "This is a test payload from A-Z Command integrations page",
        submission_timestamp: new Date().toISOString(), lead_id: "TEST-001",
      };
      const res = await fetch(config.webhook_url, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const newStatus = res.ok ? "success" : "failed";
      await supabase.from("ghl_webhook_config")
        .update({ last_tested_at: new Date().toISOString(), last_fired_at: new Date().toISOString(), last_status: newStatus })
        .eq("id", config.id);
      if (res.ok) toast.success(`Test successful! HTTP ${res.status}`);
      else toast.error(`HTTP ${res.status}`);
      loadAll();
    } catch (err) {
      toast.error("Test failed: " + String(err));
    }
    setTesting(null);
  };

  const saveStageWebhook = async (sw: PipelineStageWebhook) => {
    setSaving(sw.id);
    const { error } = await supabase.from("ghl_pipeline_stage_webhooks")
      .update({ webhook_url: sw.webhook_url, is_active: sw.is_active })
      .eq("id", sw.id);
    if (error) toast.error("Failed: " + error.message);
    else toast.success(`${STAGE_LABELS[sw.stage_name] || sw.stage_name} saved`);
    setSaving(null);
  };

  const testStageWebhook = async (sw: PipelineStageWebhook) => {
    if (!sw.webhook_url) { toast.error("No URL configured"); return; }
    setTesting(sw.id);
    try {
    const stageLabel = STAGE_LABELS[sw.stage_name] || sw.stage_name;
      const payload = {
        event: "pipeline_stage_changed",
        lead_id: "TEST-001", lead_name: "Test Lead", email: "test@a-zenterpriseshq.com",
        phone: "419-000-0000", business_unit: "summit",
        previous_stage_key: "new", previous_stage_name: "New Lead",
        new_stage_key: sw.stage_name, new_stage_name: stageLabel,
        assigned_to: "Dylan Legge", timestamp: new Date().toISOString(),
        source: "website",
      };
      const res = await fetch(sw.webhook_url, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const newStatus = res.ok ? "success" : "failed";
      await supabase.from("ghl_pipeline_stage_webhooks")
        .update({ last_tested_at: new Date().toISOString(), last_fired_at: new Date().toISOString(), last_status: newStatus })
        .eq("id", sw.id);
      if (res.ok) toast.success("Test successful!");
      else toast.error(`HTTP ${res.status}`);
      loadAll();
    } catch (err) {
      toast.error("Failed: " + String(err));
    }
    setTesting(null);
  };

  const updateConfig = (id: string, updates: Partial<GhlConfig>) =>
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

  const updateStage = (id: string, updates: Partial<PipelineStageWebhook>) =>
    setStageWebhooks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

  const resyncFailed = async (businessUnit: string) => {
    toast.info(`Resync triggered for ${UNIT_LABELS[businessUnit] || businessUnit} — check activity log`);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-zinc-400">Configure webhooks, Stripe, and external integrations</p>
        </div>

        {loading ? <p className="text-zinc-500">Loading...</p> : (
          <>
            {/* SECTION 1: Lead Intake Webhooks */}
            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-amber-400" /> Section 1 — Lead Intake Webhooks
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Paste your GHL webhook URL for each business unit. When a lead submits an intake form, it fires to both A-Z Command and GHL simultaneously.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {configs.map(config => (
                  <div key={config.id} className="p-4 border border-zinc-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">{UNIT_LABELS[config.business_unit] || config.business_unit} — Webhook URL</h3>
                      <div className="flex items-center gap-2">
                        <Switch checked={config.is_active} onCheckedChange={v => updateConfig(config.id, { is_active: v })} />
                        <span className="text-xs text-zinc-400">{config.is_active ? "Active" : "Disabled"}</span>
                      </div>
                    </div>
                    <Input value={config.webhook_url || ""} onChange={e => updateConfig(config.id, { webhook_url: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm" placeholder="https://services.leadconnectorhq.com/hooks/..." />
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" className="bg-amber-500 text-black hover:bg-amber-400" onClick={() => saveConfig(config)} disabled={saving === config.id}>
                        <Save className="h-3 w-3 mr-1" /> {saving === config.id ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => testWebhook(config)} disabled={!config.webhook_url || testing === config.id}>
                        <TestTube className="h-3 w-3 mr-1" /> {testing === config.id ? "Testing..." : "Test"}
                      </Button>
                      {config.last_status === "failed" && (
                        <Button size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={() => resyncFailed(config.business_unit)}>
                          <RefreshCw className="h-3 w-3 mr-1" /> Resync Failed
                        </Button>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        <StatusBadge status={config.last_status} />
                        {config.last_fired_at && (
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {format(new Date(config.last_fired_at), "MMM d 'at' h:mm a")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SECTION 2: Pipeline Stage Webhooks */}
            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-blue-400" /> Section 2 — Pipeline Stage Webhooks
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Fire to GHL when a lead moves to a specific pipeline stage in A-Z Command.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stageWebhooks.map(sw => (
                  <div key={sw.id} className="p-3 border border-zinc-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">{STAGE_LABELS[sw.stage_name] || sw.stage_name} — Webhook URL</h3>
                      <Switch checked={sw.is_active} onCheckedChange={v => updateStage(sw.id, { is_active: v })} />
                    </div>
                    <Input value={sw.webhook_url || ""} onChange={e => updateStage(sw.id, { webhook_url: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm" placeholder="https://services.leadconnectorhq.com/hooks/..." />
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-amber-500 text-black hover:bg-amber-400" onClick={() => saveStageWebhook(sw)} disabled={saving === sw.id}>
                        <Save className="h-3 w-3 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => testStageWebhook(sw)} disabled={!sw.webhook_url || testing === sw.id}>
                        <TestTube className="h-3 w-3 mr-1" /> Test
                      </Button>
                      <StatusBadge status={sw.last_status} />
                      {sw.last_fired_at && <span className="text-xs text-zinc-500 ml-auto">{format(new Date(sw.last_fired_at), "MMM d h:mm a")}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SECTION 2.5: Email Domain Verification */}
            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-emerald-400" /> Email Configuration
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Verify email domain status for transactional confirmation emails.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-zinc-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">a-zenterpriseshq.com</p>
                      <p className="text-zinc-500 text-sm">Sender domain for all 6 business unit confirmation emails</p>
                    </div>
                    {dnsResult && (
                      <Badge className={
                        dnsResult.status === "Verified" ? "bg-green-500/20 text-green-400" :
                        dnsResult.status === "Pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }>
                        {dnsResult.status === "Verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {dnsResult.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                        {dnsResult.status === "Failed" && <XCircle className="h-3 w-3 mr-1" />}
                        {dnsResult.status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      className="bg-emerald-500 text-white hover:bg-emerald-400"
                      onClick={checkDnsVerification}
                      disabled={dnsChecking}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {dnsChecking ? "Checking..." : "Check Email Domain Verification"}
                    </Button>
                    {dnsResult?.checkedAt && (
                      <span className="text-xs text-zinc-500">
                        Last checked: {format(new Date(dnsResult.checkedAt), "MMM d 'at' h:mm a")}
                      </span>
                    )}
                  </div>
                  {dnsResult?.details && dnsResult.status !== "Verified" && (
                    <div className="p-3 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                      {dnsResult.details}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SECTION 3: Stripe Connection */}
            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-400" /> Section 3 — Stripe Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Stripe</p>
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">Pending Connection — Phase 2</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="border-zinc-700 text-zinc-300" disabled>
                    Connect Stripe Account
                  </Button>
                </div>
                <p className="text-zinc-500 text-sm mt-3">
                  Stripe integration will be wired in Phase 2. Connection status, last sync timestamp, and disconnect/reconnect controls will appear here.
                </p>
              </CardContent>
            </Card>

            {/* SECTION 4: Future Integrations */}
            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Construction className="h-5 w-5 text-zinc-400" /> Section 4 — Future Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {FUTURE_INTEGRATION_GROUPS.map(group => (
                  <div key={group.label}>
                    <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">{group.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.items.map(int => (
                        <div key={int.name} className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg">
                          <div>
                            <p className="text-white text-sm font-medium">{int.name}</p>
                            <p className="text-zinc-500 text-xs">{int.desc}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">Not Connected</Badge>
                            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-500" disabled>Connect</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
