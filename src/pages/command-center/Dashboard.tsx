import { AdminLayout } from "@/components/admin";
import { useCrmDashboardStats, useSmartAlerts, type DateRangeType } from "@/hooks/useCrmDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Activity,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export default function CommandCenterDashboard() {
  const [searchParams] = useSearchParams();
  const dateRange = (searchParams.get("range") as DateRangeType) || "month";
  const navigate = useNavigate();

  const { data: stats, isLoading } = useCrmDashboardStats(dateRange);
  const { data: alerts } = useSmartAlerts();

  const kpiCards = [
    {
      title: "New Leads",
      value: stats?.kpis.newLeads.value || 0,
      change: stats?.kpis.newLeads.change || 0,
      icon: Target,
      onClick: () => navigate("/command-center/leads?status=new"),
    },
    {
      title: "Leads Contacted",
      value: stats?.kpis.contacted.value || 0,
      change: stats?.kpis.contacted.change || 0,
      icon: Users,
      onClick: () => navigate("/command-center/leads?status=contacted"),
    },
    {
      title: "Leads Converted",
      value: stats?.kpis.converted.value || 0,
      change: stats?.kpis.converted.change || 0,
      icon: TrendingUp,
      onClick: () => navigate("/command-center/leads?status=won"),
    },
    {
      title: "Revenue Booked",
      value: formatCurrency(stats?.kpis.revenue.value || 0),
      change: stats?.kpis.revenue.change || 0,
      icon: DollarSign,
      onClick: () => navigate("/command-center/revenue"),
      isCurrency: true,
    },
    {
      title: "Commission Owed",
      value: formatCurrency(stats?.kpis.commissionOwed.value || 0),
      icon: Percent,
      onClick: () => navigate("/command-center/commissions"),
      isCurrency: true,
    },
    {
      title: "Active Employees",
      value: stats?.kpis.activeEmployees.value || 0,
      icon: Activity,
      onClick: () => navigate("/command-center/employees"),
    },
  ];

  const revenueByUnitData = Object.entries(stats?.revenueByUnit || {}).map(([unit, amount]) => ({
    name: unit.charAt(0).toUpperCase() + unit.slice(1),
    value: amount,
  }));

  const funnelColors = ["#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981"];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Command Center</h1>
          <p className="text-zinc-400">Real-time business performance overview</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((kpi) => (
            <Card
              key={kpi.title}
              className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-amber-500/50 transition-colors"
              onClick={kpi.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className="h-5 w-5 text-amber-500" />
                  {kpi.change !== undefined && (
                    <div
                      className={cn(
                        "flex items-center text-xs",
                        kpi.change >= 0 ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {kpi.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {formatPercent(kpi.change)}
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-zinc-100">{kpi.value}</div>
                <div className="text-xs text-zinc-400">{kpi.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Chart */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg">Lead Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.funnelData && stats.funnelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46" }}
                      labelStyle={{ color: "#fafafa" }}
                    />
                    <Funnel
                      data={stats.funnelData}
                      dataKey="count"
                      nameKey="stage"
                      isAnimationActive
                    >
                      <LabelList
                        position="right"
                        fill="#fafafa"
                        stroke="none"
                        dataKey="stage"
                      />
                      <LabelList
                        position="center"
                        fill="#fafafa"
                        stroke="none"
                        dataKey="count"
                        formatter={(value: number) => value}
                      />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-zinc-500">
                  No lead data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Business Unit */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg">Revenue by Business Unit</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByUnitData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByUnitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46" }}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-zinc-500">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Smart Alerts Panel */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Smart Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts && alerts.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {alerts.slice(0, 10).map((alert, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      alert.severity === "critical" && "bg-red-500/10 hover:bg-red-500/20",
                      alert.severity === "warning" && "bg-amber-500/10 hover:bg-amber-500/20",
                      alert.severity === "info" && "bg-blue-500/10 hover:bg-blue-500/20"
                    )}
                    onClick={() => {
                      if (alert.entityType === "lead" && alert.entityId) {
                        navigate(`/command-center/leads/${alert.entityId}`);
                      } else if (alert.type === "commission_pending") {
                        navigate("/command-center/commissions?status=pending");
                      }
                    }}
                  >
                    {alert.severity === "critical" && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                    {alert.severity === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />}
                    {alert.severity === "info" && <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                    <span className="text-zinc-200 text-sm flex-1">{alert.message}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        alert.severity === "critical" && "border-red-500 text-red-500",
                        alert.severity === "warning" && "border-amber-500 text-amber-500",
                        alert.severity === "info" && "border-blue-500 text-blue-500"
                      )}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                No active alerts. Everything looks good!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
