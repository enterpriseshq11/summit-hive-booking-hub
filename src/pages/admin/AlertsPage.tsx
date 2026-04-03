import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Archive, ExternalLink, AlertTriangle, Info, Zap } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SEVERITY_STYLES: Record<string, { icon: any; color: string }> = {
  critical: { icon: AlertTriangle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  info: { icon: Info, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  success: { icon: Zap, color: "text-green-400 bg-green-500/10 border-green-500/20" },
};

export default function AlertsPage() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("active");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts", tab],
    queryFn: async () => {
      let query = supabase.from("crm_alerts").select("*").order("created_at", { ascending: false }).limit(100);

      if (tab === "active") {
        query = query.eq("is_dismissed", false);
      } else {
        query = query.eq("is_dismissed", true);
      }

      // Filter by user if not owner
      if (!authUser?.roles?.includes("owner")) {
        query = query.eq("target_user_id", authUser?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await supabase.from("crm_alerts").update({ is_dismissed: true, is_read: true }).eq("id", alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert dismissed");
    },
  });

  const dismissAllMutation = useMutation({
    mutationFn: async () => {
      const ids = alerts.filter((a: any) => !a.is_dismissed).map((a: any) => a.id);
      if (ids.length === 0) return;
      for (const id of ids) {
        await supabase.from("crm_alerts").update({ is_dismissed: true, is_read: true }).eq("id", id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("All alerts dismissed");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await supabase.from("crm_alerts").update({ is_read: true }).eq("id", alertId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const getEntityLink = (alert: any): string | null => {
    if (alert.entity_type === "lead" && alert.entity_id) return `/admin/leads/${alert.entity_id}`;
    if (alert.entity_type === "booking" && alert.entity_id) return `/admin/schedule`;
    if (alert.entity_type === "commission") return `/admin/commissions`;
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-amber-400" /> Alerts
            </h1>
            <p className="text-zinc-400">{alerts.filter((a: any) => !a.is_read).length} unread</p>
          </div>
          {tab === "active" && alerts.length > 0 && (
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={() => dismissAllMutation.mutate()}>
              <Archive className="h-4 w-4 mr-1" /> Dismiss All
            </Button>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-zinc-800 border border-zinc-700">
            <TabsTrigger value="active" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">Active</TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4 space-y-3">
            {isLoading ? (
              <p className="text-zinc-500 text-center py-8">Loading...</p>
            ) : alerts.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-8 text-center">
                  <Bell className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500">{tab === "active" ? "No active alerts" : "No archived alerts"}</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert: any) => {
                const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
                const Icon = style.icon;
                const link = getEntityLink(alert);

                return (
                  <Card key={alert.id} className={`border ${style.color} ${!alert.is_read ? "ring-1 ring-amber-500/20" : ""}`}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white font-medium text-sm">{alert.title}</p>
                            {alert.description && <p className="text-zinc-400 text-sm mt-0.5">{alert.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {link && (
                              <Link to={link}>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            )}
                            {!alert.is_dismissed && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={() => dismissMutation.mutate(alert.id)}>
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-xs">{alert.alert_type?.replace(/_/g, " ")}</Badge>
                          <span className="text-zinc-600 text-xs">{format(new Date(alert.created_at), "MMM d 'at' h:mm a")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}