import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, RefreshCw, DollarSign, Users, MousePointerClick, Eye, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const CHART_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);
}

export default function AdTracking() {
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Facebook campaigns
  const { data: fbCampaigns } = useQuery({
    queryKey: ["facebook_ad_campaigns"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("facebook_ad_campaigns")
        .select("*")
        .order("date", { ascending: false });
      if (error) return [];
      return data || [];
    },
  });

  // Google campaigns
  const { data: googleCampaigns } = useQuery({
    queryKey: ["google_ad_campaigns"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("google_ad_campaigns")
        .select("*")
        .order("date", { ascending: false });
      if (error) return [];
      return data || [];
    },
  });

  // Lead source data for attribution chart
  const { data: leadSources } = useQuery({
    queryKey: ["lead_source_attribution"],
    queryFn: async () => {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data } = await supabase
        .from("crm_leads")
        .select("source")
        .gte("created_at", monthStart);
      const counts: Record<string, number> = {};
      (data || []).forEach((l: any) => {
        const src = l.source || "other";
        counts[src] = (counts[src] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  // Sync mutations
  const syncFacebook = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("facebook-ads-sync");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facebook_ad_campaigns"] });
      toast.success("Facebook Ads synced");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const syncGoogle = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("google-ads-sync");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google_ad_campaigns"] });
      toast.success("Google Ads synced");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const allCampaigns = [
    ...(fbCampaigns || []).map((c: any) => ({ ...c, platform: "facebook" })),
    ...(googleCampaigns || []).map((c: any) => ({ ...c, platform: "google" })),
  ];

  const filtered = platformFilter === "all"
    ? allCampaigns
    : allCampaigns.filter(c => c.platform === platformFilter);

  const fbLastSync = fbCampaigns?.[0]?.synced_at;
  const googleLastSync = googleCampaigns?.[0]?.synced_at;

  // 3-state connection logic: Connected (green), Stale (amber), Not Connected (red)
  const getConnectionState = (lastSync: string | undefined, hasData: boolean) => {
    if (!hasData && !lastSync) return "not_connected";
    if (!lastSync) return "not_connected";
    const hoursSince = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
    if (hoursSince <= 25) return "connected";
    return "stale";
  };

  const fbState = getConnectionState(fbLastSync, (fbCampaigns?.length || 0) > 0);
  const googleState = getConnectionState(googleLastSync, (googleCampaigns?.length || 0) > 0);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const totalSpendMonth = allCampaigns
    .filter(c => c.date >= monthStart)
    .reduce((s, c) => s + (Number(c.spend) || 0), 0);
  const totalLeadsMonth = allCampaigns
    .filter(c => c.date >= monthStart)
    .reduce((s, c) => s + (Number(c.leads) || 0), 0);

  const exportCsv = () => {
    const headers = ["Platform", "Campaign", "Date", "Spend", "Impressions", "Clicks", "Leads", "CPL"];
    const rows = filtered.map(c => [
      c.platform, c.campaign_name, c.date, c.spend, c.impressions, c.clicks, c.leads, c.cost_per_lead || "",
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-campaigns-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const ConnectionBadge = ({ state, lastSync }: { state: string; lastSync?: string }) => {
    if (state === "connected") {
      return <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">Connected</Badge>;
    }
    if (state === "stale") {
      return (
        <div>
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">Stale</Badge>
          {lastSync && <p className="text-xs text-amber-400/70 mt-0.5">Last sync: {format(new Date(lastSync), "MMM d, h:mm a")}</p>}
        </div>
      );
    }
    return (
      <div>
        <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">Not Connected</Badge>
        <p className="text-xs text-zinc-500 mt-0.5">Configure API credentials to connect</p>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-400" /> Ad Tracking
          </h1>
          <p className="text-zinc-400">Track campaign performance across ad platforms</p>
        </div>

        {/* Total Spend KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                <DollarSign className="h-4 w-4" /> Total Ad Spend (This Month)
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalSpendMonth)}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                <Users className="h-4 w-4" /> Total Ad Leads (This Month)
              </div>
              <p className="text-2xl font-bold text-white">{totalLeadsMonth}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                <MousePointerClick className="h-4 w-4" /> Avg Cost Per Lead
              </div>
              <p className="text-2xl font-bold text-white">
                {totalLeadsMonth > 0 ? formatCurrency(totalSpendMonth / totalLeadsMonth) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Connections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📘</span>
                <div>
                  <p className="text-white font-medium">Facebook Ads</p>
                  {fbCampaigns && fbCampaigns.length > 0 ? (
                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                      Connected · {fbCampaigns.length} campaigns
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">Awaiting Data</Badge>
                  )}
                  {fbLastSync && (
                    <p className="text-xs text-zinc-500 mt-1">Last sync: {format(new Date(fbLastSync), "MMM d, h:mm a")}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300"
                onClick={() => syncFacebook.mutate()}
                disabled={syncFacebook.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${syncFacebook.isPending ? "animate-spin" : ""}`} /> Sync Now
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="text-white font-medium">Google Ads</p>
                  {googleCampaigns && googleCampaigns.length > 0 ? (
                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                      Connected · {googleCampaigns.length} campaigns
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">Awaiting Data</Badge>
                  )}
                  {googleLastSync && (
                    <p className="text-xs text-zinc-500 mt-1">Last sync: {format(new Date(googleLastSync), "MMM d, h:mm a")}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300"
                onClick={() => syncGoogle.mutate()}
                disabled={syncGoogle.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${syncGoogle.isPending ? "animate-spin" : ""}`} /> Sync Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Performance Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Campaign Performance</h2>
            <div className="flex items-center gap-2">
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Platform</TableHead>
                  <TableHead className="text-zinc-400">Campaign Name</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400 text-right">Spend</TableHead>
                  <TableHead className="text-zinc-400 text-right">Impressions</TableHead>
                  <TableHead className="text-zinc-400 text-right">Clicks</TableHead>
                  <TableHead className="text-zinc-400 text-right">Leads</TableHead>
                  <TableHead className="text-zinc-400 text-right">CPL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Eye className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-500">No campaign data yet. Sync an ad platform to see results.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.slice(0, 100).map((c: any) => (
                    <TableRow key={c.id} className="border-zinc-800">
                      <TableCell>
                        <Badge variant="outline" className={c.platform === "facebook" ? "border-blue-500/30 text-blue-400" : "border-red-500/30 text-red-400"}>
                          {c.platform === "facebook" ? "Facebook" : "Google"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-medium">{c.campaign_name}</TableCell>
                      <TableCell className="text-zinc-300">{c.date}</TableCell>
                      <TableCell className="text-zinc-100 text-right">{formatCurrency(Number(c.spend) || 0)}</TableCell>
                      <TableCell className="text-zinc-300 text-right">{(c.impressions || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-zinc-300 text-right">{(c.clicks || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-zinc-300 text-right">{c.leads || 0}</TableCell>
                      <TableCell className="text-zinc-100 text-right">
                        {c.cost_per_lead ? formatCurrency(Number(c.cost_per_lead)) : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Lead Source Attribution Chart */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Lead Source Attribution (This Month)</h2>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              {leadSources && leadSources.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {leadSources.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-zinc-500 text-center py-8">No lead data for this month yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
