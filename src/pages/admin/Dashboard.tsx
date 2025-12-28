import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAlerts, useAdminStats } from "@/hooks/useAdminAlerts";
import { CalendarDays, Users, DollarSign, ClipboardList, Box, Star, AlertTriangle, AlertCircle, Info, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { authUser } = useAuth();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: alerts, isLoading: alertsLoading } = useAdminAlerts();

  const quickStats = [
    { 
      title: "Today's Bookings", 
      value: statsLoading ? "—" : String(stats?.todayBookings || 0), 
      icon: CalendarDays, 
      href: "/admin/schedule" 
    },
    { 
      title: "Pending Approvals", 
      value: statsLoading ? "—" : String(stats?.pendingApprovals || 0), 
      icon: ClipboardList, 
      href: "/admin/approvals",
      highlight: (stats?.pendingApprovals || 0) > 0
    },
    { 
      title: "Active Resources", 
      value: statsLoading ? "—" : String(stats?.activeResources || 0), 
      icon: Box, 
      href: "/admin/resources" 
    },
    { 
      title: "Pending Reviews", 
      value: statsLoading ? "—" : String(stats?.pendingReviews || 0), 
      icon: Star, 
      href: "/admin/reviews" 
    },
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error": return <Badge variant="destructive">Urgent</Badge>;
      case "warning": return <Badge className="bg-amber-500">Warning</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {authUser?.profile?.first_name || "Admin"}
          </p>
        </div>

        {/* Admin Alerts */}
        {!alertsLoading && alerts && alerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts Requiring Attention
            </h2>
            <div className="grid gap-3">
              {alerts.map((alert, index) => (
                <Link key={index} to={alert.link}>
                  <Card className={`hover:shadow-md transition-all ${
                    alert.severity === "error" ? "border-destructive/50" : 
                    alert.severity === "warning" ? "border-amber-500/50" : ""
                  }`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground">Click to view details</p>
                        </div>
                      </div>
                      {getSeverityBadge(alert.severity)}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Link key={stat.href} to={stat.href}>
              <Card className={`hover:shadow-md hover:border-primary/50 transition-all ${
                stat.highlight ? "border-primary" : ""
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    {stat.highlight && <Badge>Action Required</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stat.value}</div>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Revenue & Memberships */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Today's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-3xl font-bold text-primary">
                  ${stats?.todayRevenue?.toLocaleString() || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Memberships
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="text-3xl font-bold">
                  {stats?.activeMemberships || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              All systems operational. Phase 3 complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Booking Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Payment Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Webhooks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Authentication</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
