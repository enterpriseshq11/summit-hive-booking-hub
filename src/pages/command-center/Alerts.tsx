import { useState } from "react";
import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import { useCrmAlerts, useMarkAlertRead, useDismissAlert } from "@/hooks/useCrmAlerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function CommandCenterAlerts() {
  const navigate = useNavigate();
  const [showRead, setShowRead] = useState(false);
  const { data: alerts, isLoading } = useCrmAlerts({ unreadOnly: !showRead });
  const markRead = useMarkAlertRead();
  const dismiss = useDismissAlert();

  const severityConfig = {
    critical: {
      icon: AlertCircle,
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      iconColor: "text-red-500",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/50",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-500",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-500",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    },
  };

  const handleAlertClick = (alert: (typeof alerts)[0]) => {
    // Mark as read
    if (!alert.is_read) {
      markRead.mutate(alert.id);
    }

    // Navigate to entity if applicable
    if (alert.entity_type === "lead" && alert.entity_id) {
      navigate(`/command-center/leads/${alert.entity_id}`);
    } else if (alert.alert_type === "commission_pending") {
      navigate("/command-center/commissions?status=pending");
    }
  };

  const unreadCount = alerts?.filter((a) => !a.is_read).length || 0;
  const criticalCount = alerts?.filter((a) => a.severity === "critical").length || 0;

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Alerts</h1>
            <p className="text-zinc-400">
              {unreadCount > 0
                ? `${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""}`
                : "No unread alerts"}
              {criticalCount > 0 && ` • ${criticalCount} critical`}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowRead(!showRead)}
            className="border-zinc-700 text-zinc-300"
          >
            {showRead ? "Hide Read" : "Show All"}
          </Button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-8 text-center text-zinc-500">
                Loading alerts...
              </CardContent>
            </Card>
          ) : alerts?.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-zinc-100 mb-1">All Clear!</h3>
                <p className="text-zinc-500">No alerts require your attention.</p>
              </CardContent>
            </Card>
          ) : (
            alerts?.map((alert) => {
              const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.info;
              const Icon = config.icon;

              return (
                <Card
                  key={alert.id}
                  className={cn(
                    "bg-zinc-900 border transition-colors cursor-pointer",
                    config.borderColor,
                    alert.is_read ? "opacity-60" : "",
                    "hover:border-amber-500/50"
                  )}
                  onClick={() => handleAlertClick(alert)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-lg", config.bgColor)}>
                        <Icon className={cn("h-5 w-5", config.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-zinc-100">{alert.title}</h4>
                          <Badge className={cn("capitalize text-xs", config.badgeColor)}>
                            {alert.severity}
                          </Badge>
                          {!alert.is_read && (
                            <span className="h-2 w-2 bg-amber-500 rounded-full" />
                          )}
                        </div>
                        {alert.description && (
                          <p className="text-sm text-zinc-400 mb-2">{alert.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </span>
                          <span className="capitalize">{alert.alert_type?.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {alert.entity_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-zinc-100"
                            onClick={() => handleAlertClick(alert)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-red-400"
                          onClick={() => dismiss.mutate(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </CommandCenterLayout>
  );
}
