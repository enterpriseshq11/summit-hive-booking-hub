import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAlerts, useAdminStats } from "@/hooks/useAdminAlerts";
import { useLaunchMetrics, checkThresholdAlerts, useStripeLiveReadiness } from "@/hooks/useLaunchMetrics";
import { 
  CalendarDays, Users, DollarSign, ClipboardList, Box, Star, 
  AlertTriangle, AlertCircle, Info, TrendingUp, Activity, 
  Zap, Target, BarChart3, CreditCard, UserMinus, Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { authUser } = useAuth();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: alerts, isLoading: alertsLoading } = useAdminAlerts();
  const { data: launchMetrics, isLoading: metricsLoading } = useLaunchMetrics();
  const { data: stripeReadiness } = useStripeLiveReadiness();

  const thresholdAlerts = launchMetrics ? checkThresholdAlerts(launchMetrics) : [];

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
      case "error": 
      case "critical": 
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning": 
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default: 
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
      case "critical": 
        return <Badge variant="destructive">Critical</Badge>;
      case "warning": 
        return <Badge className="bg-amber-500">Warning</Badge>;
      default: 
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {authUser?.profile?.first_name || "Admin"}
            </p>
          </div>
          
          {/* Launch Mode Indicator */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={stripeReadiness?.testModeActive 
                ? "border-amber-500 text-amber-500" 
                : "border-green-500 text-green-500"
              }
            >
              <Activity className="h-3 w-3 mr-1" />
              {stripeReadiness?.testModeActive ? "Test Mode" : "Live Mode"}
            </Badge>
            {stripeReadiness?.readyToFlip && (
              <Badge variant="secondary">Ready to Go Live</Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monitoring">Launch Monitoring</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                  Phase 4 complete. Launch monitoring active.
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
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            {/* Threshold Alerts */}
            {thresholdAlerts.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Performance Alerts
                </h2>
                <div className="grid gap-3">
                  {thresholdAlerts.map((alert, index) => (
                    <Card key={index} className={`${
                      alert.severity === "critical" ? "border-destructive/50" : "border-amber-500/50"
                    }`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              Current: {launchMetrics?.[alert.metric]} | Threshold: {alert.threshold}
                            </p>
                          </div>
                        </div>
                        {getSeverityBadge(alert.severity)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold text-green-500">
                        {launchMetrics?.paymentSuccessRate || 100}%
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Successful Today</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {launchMetrics?.successfulPaymentsToday || 0}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Failed Today</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className={`text-2xl font-bold ${(launchMetrics?.failedPaymentsToday || 0) > 0 ? "text-destructive" : ""}`}>
                        {launchMetrics?.failedPaymentsToday || 0}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold text-amber-500">
                        {launchMetrics?.pendingPayments || 0}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Success Rate</span>
                    <span>{launchMetrics?.paymentSuccessRate || 100}%</span>
                  </div>
                  <Progress value={launchMetrics?.paymentSuccessRate || 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Booking Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Booking Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Today</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold">{launchMetrics?.totalBookingsToday || 0}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold">{launchMetrics?.totalBookingsWeek || 0}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold text-green-500">
                        {launchMetrics?.bookingConversionRate || 100}%
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Abandoned</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className={`text-2xl font-bold ${(launchMetrics?.abandonedBookings || 0) > 5 ? "text-amber-500" : ""}`}>
                        {launchMetrics?.abandonedBookings || 0}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stripe Readiness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Stripe Live Mode Readiness
                </CardTitle>
                <CardDescription>
                  Awaiting explicit "GO LIVE" authorization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Secret Key Configured</span>
                    <Badge variant={stripeReadiness?.secretKeyConfigured ? "default" : "destructive"}>
                      {stripeReadiness?.secretKeyConfigured ? "✓ Ready" : "✗ Missing"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Webhook Secret Configured</span>
                    <Badge variant={stripeReadiness?.webhookSecretConfigured ? "default" : "secondary"}>
                      {stripeReadiness?.webhookSecretConfigured ? "✓ Ready" : "⚠ Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Products & Prices Created</span>
                    <Badge variant={stripeReadiness?.productsExist && stripeReadiness?.pricesExist ? "default" : "destructive"}>
                      {stripeReadiness?.productsExist && stripeReadiness?.pricesExist ? "✓ Ready" : "✗ Missing"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Current Mode</span>
                    <Badge variant="outline" className={stripeReadiness?.testModeActive ? "border-amber-500 text-amber-500" : "border-green-500 text-green-500"}>
                      {stripeReadiness?.testModeActive ? "Test Mode" : "Live Mode"}
                    </Badge>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <strong>⚠ DO NOT SWITCH TO LIVE MODE</strong> without explicit authorization.
                    Contact system administrator before proceeding.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Membership Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Membership Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">New Today</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold text-green-500">
                        +{launchMetrics?.newMembershipsToday || 0}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold">{launchMetrics?.activeMemberships || 0}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paused</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold text-amber-500">
                        {launchMetrics?.pausedMemberships || 0}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Churned (Week)</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className={`text-2xl font-bold ${(launchMetrics?.churnedMembershipsWeek || 0) > 0 ? "text-destructive" : ""}`}>
                        {launchMetrics?.churnedMembershipsWeek || 0}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Errors (Last Hour)</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className={`text-2xl font-bold ${(launchMetrics?.errorRateHour || 0) > 5 ? "text-destructive" : ""}`}>
                        {launchMetrics?.errorRateHour || 0}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Critical Errors (Today)</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className={`text-2xl font-bold ${(launchMetrics?.criticalErrors || 0) > 0 ? "text-destructive" : "text-green-500"}`}>
                        {launchMetrics?.criticalErrors || 0}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Waitlist Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Waitlist Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversions (Week)</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold text-green-500">
                        {launchMetrics?.waitlistConversions || 0}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expired Claims</p>
                    {metricsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className={`text-2xl font-bold ${(launchMetrics?.expiredClaims || 0) > 5 ? "text-amber-500" : ""}`}>
                        {launchMetrics?.expiredClaims || 0}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Today</p>
                    {metricsLoading ? (
                      <Skeleton className="h-10 w-24" />
                    ) : (
                      <div className="text-3xl font-bold text-primary">
                        ${launchMetrics?.totalRevenueToday?.toLocaleString() || 0}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    {metricsLoading ? (
                      <Skeleton className="h-10 w-24" />
                    ) : (
                      <div className="text-3xl font-bold">
                        ${launchMetrics?.totalRevenueWeek?.toLocaleString() || 0}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
