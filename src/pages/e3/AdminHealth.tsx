import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Activity, AlertTriangle, CheckCircle2, Loader2, Play, Bell, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function useE3SystemHealth() {
  return useQuery({
    queryKey: ["e3_system_health"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("e3_system_health");
      if (error) throw error;
      return data as any;
    },
    refetchInterval: 30000,
  });
}

export default function E3AdminHealth() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: health, isLoading, refetch } = useE3SystemHealth();
  const [automationResult, setAutomationResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const runAutomations = async () => {
    setRunning(true);
    setAutomationResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("e3-expire-bookings");
      if (error) throw error;
      setAutomationResult(data);
      toast.success(`Expired: ${data.expired}, Reverted: ${data.reverted}`);
      refetch();
      qc.invalidateQueries({ queryKey: ["e3_bookings"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRunning(false);
    }
  };

  const checks = health
    ? [
        {
          label: "Red holds expiring in 6h",
          value: health.red_holds_expiring_6h,
          severity: health.red_holds_expiring_6h > 0 ? "warn" : "ok",
        },
        {
          label: "Deposits overdue",
          value: health.deposits_overdue,
          severity: health.deposits_overdue > 0 ? "error" : "ok",
        },
        {
          label: "Commissions pending > 7 days",
          value: health.commissions_pending_7d,
          severity: health.commissions_pending_7d > 0 ? "warn" : "ok",
        },
        {
          label: "Overrides pending > 7 days",
          value: health.overrides_pending_7d,
          severity: health.overrides_pending_7d > 0 ? "warn" : "ok",
        },
        {
          label: "Bookings missing required docs",
          value: health.bookings_missing_docs,
          severity: health.bookings_missing_docs > 0 ? "error" : "ok",
        },
        {
          label: "Notifications queued",
          value: health.notifications_queued,
          severity: health.notifications_queued > 10 ? "warn" : "ok",
        },
        {
          label: "Notifications failed",
          value: health.notifications_failed,
          severity: health.notifications_failed > 0 ? "error" : "ok",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/e3")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">System Health</h1>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking system health...
          </div>
        ) : health?.error ? (
          <Card className="border-destructive">
            <CardContent className="py-6 text-destructive">{health.error}</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {checks.map((c) => (
                <Card
                  key={c.label}
                  className={
                    c.severity === "error"
                      ? "border-destructive"
                      : c.severity === "warn"
                      ? "border-yellow-400"
                      : ""
                  }
                >
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {c.severity === "error" ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : c.severity === "warn" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      <span className="text-sm font-medium">{c.label}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        c.severity === "error"
                          ? "bg-red-500/15 text-red-700"
                          : c.severity === "warn"
                          ? "bg-yellow-500/15 text-yellow-700"
                          : "bg-green-500/15 text-green-700"
                      }
                    >
                      {c.value}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {health?.checked_at && (
              <p className="text-xs text-muted-foreground mb-6">
                Last checked: {new Date(health.checked_at).toLocaleString()}
              </p>
            )}
          </>
        )}

        {/* Notification Outbox Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notification Outbox
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Notification rows are auto-created for key events (commission created/approved/paid, booking state changes).
            Actual delivery (email/SMS) will be connected in a future phase.
          </CardContent>
        </Card>

        {/* Run Automations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="h-4 w-4" /> Run Automations Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manually trigger expiration of stale red holds and revert missed deposits.
            </p>
            <Button onClick={runAutomations} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Run Now
            </Button>
            {automationResult && (
              <div className="text-sm bg-muted rounded-md p-3 space-y-1">
                <p>Expired: <span className="font-medium">{automationResult.expired}</span></p>
                <p>Reverted: <span className="font-medium">{automationResult.reverted}</span></p>
                <p className="text-xs text-muted-foreground">{automationResult.timestamp}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
