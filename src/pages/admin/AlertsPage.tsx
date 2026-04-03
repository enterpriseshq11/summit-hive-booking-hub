import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bell, Check, Archive, ExternalLink, AlertTriangle, Info, Zap,
  UserPlus, Clock, Wifi, CreditCard, Building2, Dumbbell, Briefcase, FileText,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ALERT_TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  new_lead: { icon: UserPlus, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "New Lead Submitted" },
  follow_up_overdue: { icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Follow-Up Overdue" },
  hot_lead_no_contact: { icon: AlertTriangle, color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Hot Lead No Contact 24h" },
  ghl_webhook_failed: { icon: Wifi, color: "text-red-400 bg-red-500/10 border-red-500/20", label: "GHL Webhook Failed" },
  stripe_payment: { icon: CreditCard, color: "text-green-400 bg-green-500/10 border-green-500/20", label: "Stripe Payment Received" },
  commission_pending: { icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Commission Pending" },
  office_inquiry: { icon: Building2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Office Inquiry Received" },
  membership_payment_failed: { icon: Dumbbell, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Membership Payment Failed" },
  new_hire_application: { icon: Briefcase, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "New Hire Application" },
  document_signature_required: { icon: FileText, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", label: "Document Signature Required" },
};

const ALL_ALERT_TYPES = Object.keys(ALERT_TYPE_CONFIG);

export default function AlertsPage() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("active");
  const [filterType, setFilterType] = useState("all");
  const [filterUnit, setFilterUnit] = useState("all");

  const isOwner = authUser?.roles?.includes("owner");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts", tab, filterType, filterUnit],
    queryFn: async () => {
      let query = supabase.from("crm_alerts").select("*").order("created_at", { ascending: false }).limit(200);

      if (tab === "active") query = query.eq("is_dismissed", false);
      else query = query.eq("is_dismissed", true);

      if (filterType !== "all") query = query.eq("alert_type", filterType);

      // Role-based visibility: owner sees all, others see only targeted
      if (!isOwner) {
        query = query.or(`target_user_id.eq.${authUser?.id},target_roles.cs.{${(authUser?.roles || []).join(",")}}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const unreadCount = alerts.filter((a: any) => !a.is_read).length;

  const dismissMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await supabase.from("crm_alerts").update({ is_dismissed: true, is_read: true }).eq("id", alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert dismissed");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await supabase.from("crm_alerts").update({ is_dismissed: false }).eq("id", alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert restored");
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
    if (alert.entity_type === "booking") return `/admin/schedule`;
    if (alert.entity_type === "commission") return `/admin/commissions`;
    if (alert.entity_type === "integration") return `/admin/settings/integrations`;
    if (alert.entity_type === "career_application" && alert.entity_id) return `/admin/careers`;
    if (alert.entity_type === "office_inquiry") return `/admin/business/hive/inquiries`;
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-amber-400" /> Alerts
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs ml-2">{unreadCount} unread</Badge>
              )}
            </h1>
            <p className="text-zinc-400">{alerts.length} total in {tab === "active" ? "active" : "archive"}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filters */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-48">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ALL_ALERT_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{ALERT_TYPE_CONFIG[t]?.label || t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tab === "active" && alerts.length > 0 && (
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={() => dismissAllMutation.mutate()}>
                <Archive className="h-4 w-4 mr-1" /> Dismiss All
              </Button>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-zinc-800 border border-zinc-700">
            <TabsTrigger value="active" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">Active Alerts</TabsTrigger>
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
                const config = ALERT_TYPE_CONFIG[alert.alert_type] || { icon: Info, color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", label: alert.alert_type };
                const Icon = config.icon;
                const link = getEntityLink(alert);

                return (
                  <Card key={alert.id} className={`border ${config.color} ${!alert.is_read ? "ring-1 ring-amber-500/30" : ""}`}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-white text-sm ${!alert.is_read ? "font-semibold" : "font-medium"}`}>{alert.title}</p>
                            {alert.description && <p className="text-zinc-400 text-sm mt-0.5">{alert.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!alert.is_read && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-zinc-400" onClick={() => markReadMutation.mutate(alert.id)}>
                                Mark read
                              </Button>
                            )}
                            {link && (
                              <Link to={link}>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-400 hover:text-amber-300">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            )}
                            {!alert.is_dismissed ? (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={() => dismissMutation.mutate(alert.id)}>
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-green-400" onClick={() => restoreMutation.mutate(alert.id)}>
                                Restore
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-xs">{config.label}</Badge>
                          {alert.entity_type && <Badge variant="outline" className="border-zinc-700 text-zinc-600 text-xs">{alert.entity_type}</Badge>}
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