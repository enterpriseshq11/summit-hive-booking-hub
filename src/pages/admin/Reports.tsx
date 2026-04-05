import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Users, BarChart3, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

// Managed team member emails for Victoria's filter
const MANAGED_EMAILS = [
  "mark@a-zenterpriseshq.com",
  "nasiya@a-zenterpriseshq.com",
  "elyse@a-zenterpriseshq.com",
];

function exportCsv(filename: string, headers: string[], rows: string[][]) {
  const bom = "\uFEFF";
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(","))].join("\r\n");
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function AdminReports() {
  const today = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(today), "yyyy-MM-dd"));
  const { authUser } = useAuth();
  const isOwner = authUser?.roles?.includes("owner") || false;
  const isManager = authUser?.roles?.includes("manager") || false;

  // Revenue data
  const { data: revenueData } = useQuery({
    queryKey: ["reports", "revenue", startDate, endDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("crm_revenue_events")
        .select("*")
        .gte("revenue_date", startDate)
        .lte("revenue_date", endDate)
        .order("revenue_date", { ascending: true });
      return data || [];
    },
  });

  // Lead data
  const { data: leadData } = useQuery({
    queryKey: ["reports", "leads", startDate, endDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("crm_leads")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate + "T23:59:59")
        .order("created_at", { ascending: true });
      return data || [];
    },
  });

  // Booking data
  const { data: bookingData } = useQuery({
    queryKey: ["reports", "bookings", startDate, endDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .gte("start_datetime", startDate)
        .lte("start_datetime", endDate + "T23:59:59")
        .order("start_datetime", { ascending: true });
      return data || [];
    },
  });

  // Team data (commissions) — filtered by role
  const { data: managedProfileIds } = useQuery({
    queryKey: ["managed_profile_ids", isOwner],
    queryFn: async () => {
      if (isOwner) return null; // owner sees all
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .in("email", MANAGED_EMAILS);
      return (data || []).map((p) => p.id);
    },
  });

  const { data: commissionData } = useQuery({
    queryKey: ["reports", "commissions", startDate, endDate, managedProfileIds],
    queryFn: async () => {
      let query = supabase
        .from("crm_commissions")
        .select("*, employee:profiles!crm_commissions_employee_id_fkey(first_name, last_name)")
        .gte("created_at", startDate)
        .lte("created_at", endDate + "T23:59:59");

      // Manager filter: only show managed team members
      if (!isOwner && managedProfileIds && managedProfileIds.length > 0) {
        query = query.in("employee_id", managedProfileIds);
      }

      const { data } = await query;
      return data || [];
    },
  });

  // Average time in stage data
  const { data: stageTimeData } = useQuery({
    queryKey: ["reports", "avg_stage_time", startDate, endDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("lead_stage_history" as any)
        .select("stage, entered_at, exited_at")
        .not("exited_at", "is", null)
        .gte("entered_at", startDate)
        .lte("entered_at", endDate + "T23:59:59");

      if (!data || data.length === 0) return [];

      const stageMap: Record<string, { totalHours: number; count: number }> = {};
      (data as any[]).forEach((row) => {
        const hours = (new Date(row.exited_at).getTime() - new Date(row.entered_at).getTime()) / (1000 * 60 * 60);
        if (!stageMap[row.stage]) stageMap[row.stage] = { totalHours: 0, count: 0 };
        stageMap[row.stage].totalHours += hours;
        stageMap[row.stage].count++;
      });

      return Object.entries(stageMap).map(([stage, { totalHours, count }]) => {
        const avg = totalHours / count;
        return {
          stage: stage.replace(/_/g, " "),
          avgTime: avg > 48 ? `${(avg / 24).toFixed(1)} days` : `${avg.toFixed(1)} hours`,
          avgHours: avg,
          count,
        };
      }).sort((a, b) => b.avgHours - a.avgHours);
    },
  });

  // Revenue charts
  const revenueByUnit = useMemo(() => {
    const map: Record<string, number> = {};
    revenueData?.forEach((r: any) => {
      const unit = r.business_unit || "other";
      map[unit] = (map[unit] || 0) + Number(r.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [revenueData]);

  const revenueBySource = useMemo(() => {
    const stripe = revenueData?.filter((r: any) => !r.is_manual).reduce((s: number, r: any) => s + Number(r.amount), 0) || 0;
    const manual = revenueData?.filter((r: any) => r.is_manual).reduce((s: number, r: any) => s + Number(r.amount), 0) || 0;
    return [{ name: "Stripe", value: Math.round(stripe) }, { name: "Manual", value: Math.round(manual) }].filter((d) => d.value > 0);
  }, [revenueData]);

  const dailyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    revenueData?.forEach((r: any) => {
      const day = r.revenue_date?.split("T")[0] || "";
      map[day] = (map[day] || 0) + Number(r.amount);
    });
    return Object.entries(map).sort().map(([date, total]) => ({ date: format(new Date(date), "MMM d"), total: Math.round(total) }));
  }, [revenueData]);

  // Lead charts
  const leadsByUnit = useMemo(() => {
    const map: Record<string, number> = {};
    leadData?.forEach((l: any) => { map[l.business_unit] = (map[l.business_unit] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leadData]);

  const leadsBySource = useMemo(() => {
    const map: Record<string, number> = {};
    leadData?.forEach((l: any) => { map[l.source || "other"] = (map[l.source || "other"] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leadData]);

  const leadsByStage = useMemo(() => {
    const map: Record<string, number> = {};
    leadData?.forEach((l: any) => { map[l.status || "new_lead"] = (map[l.status || "new_lead"] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [leadData]);

  // Team summary
  const teamSummary = useMemo(() => {
    const map: Record<string, { name: string; earned: number; count: number }> = {};
    commissionData?.forEach((c: any) => {
      const emp = c.employee;
      const name = emp ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() : "Unknown";
      if (!map[c.employee_id]) map[c.employee_id] = { name, earned: 0, count: 0 };
      map[c.employee_id].earned += Number(c.amount);
      map[c.employee_id].count++;
    });
    return Object.values(map);
  }, [commissionData]);

  const DatePicker = () => (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-zinc-400">From</Label>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-zinc-400">To</Label>
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-zinc-400">Business intelligence and exportable reports</p>
          </div>
        </div>

        <Tabs defaultValue="revenue">
          <TabsList className="bg-zinc-800/50 border border-zinc-700">
            <TabsTrigger value="revenue" className="data-[state=active]:bg-amber-500/20"><TrendingUp className="w-4 h-4 mr-1" /> Revenue</TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-amber-500/20"><Users className="w-4 h-4 mr-1" /> Leads</TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-amber-500/20"><BarChart3 className="w-4 h-4 mr-1" /> Team</TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-amber-500/20"><Calendar className="w-4 h-4 mr-1" /> Bookings</TabsTrigger>
          </TabsList>

          {/* REVENUE TAB */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <DatePicker />
              <Button variant="outline" size="sm" className="border-zinc-700"
                onClick={() => exportCsv("revenue_report.csv", ["Date", "Business Unit", "Amount", "Source", "Description"],
                  (revenueData || []).map((r: any) => [r.revenue_date, r.business_unit, String(r.amount), r.is_manual ? "manual" : "stripe", r.description || ""])
                )}>
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-white text-sm">Revenue by Business Unit</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer><BarChart data={revenueByUnit}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="name" tick={{ fill: "#999", fontSize: 12 }} /><YAxis tick={{ fill: "#999", fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-white text-sm">Stripe vs Manual</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer><PieChart><Pie data={revenueBySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{revenueBySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-sm">Daily Revenue</CardTitle></CardHeader>
              <CardContent className="h-64 overflow-x-auto">
                <ResponsiveContainer><LineChart data={dailyRevenue}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="date" tick={{ fill: "#999", fontSize: 11 }} /><YAxis tick={{ fill: "#999", fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} /></LineChart></ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LEADS TAB */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <DatePicker />
              <Button variant="outline" size="sm" className="border-zinc-700"
                onClick={() => exportCsv("leads_report.csv", ["Name", "Email", "Business Unit", "Source", "Stage", "Created"],
                  (leadData || []).map((l: any) => [l.lead_name, l.email || "", l.business_unit, l.source || "", l.status || "", l.created_at?.split("T")[0] || ""])
                )}>
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-white text-sm">Leads by Business Unit</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer><BarChart data={leadsByUnit}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="name" tick={{ fill: "#999", fontSize: 12 }} /><YAxis tick={{ fill: "#999", fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader><CardTitle className="text-white text-sm">Leads by Source</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer><PieChart><Pie data={leadsBySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{leadsBySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-sm">Pipeline Funnel</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer><BarChart data={leadsByStage} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis type="number" tick={{ fill: "#999", fontSize: 12 }} /><YAxis type="category" dataKey="name" tick={{ fill: "#999", fontSize: 11 }} width={120} /><Tooltip /><Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Average Time in Stage */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-white text-sm">Average Time in Each Stage</CardTitle></CardHeader>
              <CardContent>
                {stageTimeData && stageTimeData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-zinc-700 text-zinc-400">
                        <th className="text-left py-2 px-3">Stage</th>
                        <th className="text-right py-2 px-3">Average Time</th>
                        <th className="text-right py-2 px-3">Leads Measured</th>
                      </tr></thead>
                      <tbody>
                        {stageTimeData.map((row) => (
                          <tr key={row.stage} className="border-b border-zinc-800 text-white">
                            <td className="py-2 px-3 capitalize">{row.stage}</td>
                            <td className="py-2 px-3 text-right font-mono text-amber-400">{row.avgTime}</td>
                            <td className="py-2 px-3 text-right text-zinc-400">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm py-4 text-center">No stage transition data available for this period. Data will populate as leads move through stages.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEAM TAB */}
          <TabsContent value="team" className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <DatePicker />
              <div className="flex items-center gap-2">
                {!isOwner && isManager && (
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">Showing: Your managed team</Badge>
                )}
                <Button variant="outline" size="sm" className="border-zinc-700"
                  onClick={() => exportCsv("team_report.csv", ["Team Member", "Commissions Earned", "Commission Count"],
                    teamSummary.map((t) => [t.name, String(t.earned.toFixed(2)), String(t.count)])
                  )}>
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
            </div>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-zinc-700 text-zinc-400">
                      <th className="text-left py-2 px-3">Team Member</th>
                      <th className="text-right py-2 px-3">Commissions Earned</th>
                      <th className="text-right py-2 px-3">Commission Events</th>
                    </tr></thead>
                    <tbody>
                      {teamSummary.length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-8 text-zinc-500">No commission data for this period</td></tr>
                      ) : teamSummary.map((t, i) => (
                        <tr key={i} className="border-b border-zinc-800 text-white">
                          <td className="py-2 px-3">{t.name}</td>
                          <td className="py-2 px-3 text-right font-mono">${t.earned.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right">{t.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BOOKINGS TAB */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <DatePicker />
              <Button variant="outline" size="sm" className="border-zinc-700"
                onClick={() => exportCsv("bookings_report.csv", ["Booking #", "Business", "Status", "Start", "Total", "Guest"],
                  (bookingData || []).map((b: any) => [b.booking_number, b.business_id, b.status || "", b.start_datetime?.split("T")[0] || "", String(b.total_amount), b.guest_name || ""])
                )}>
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
            {(() => {
              const statusMap: Record<string, number> = {};
              bookingData?.forEach((b: any) => { statusMap[b.status || "unknown"] = (statusMap[b.status || "unknown"] || 0) + 1; });
              const statusData = Object.entries(statusMap).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
              const avgRevenue = bookingData?.length ? (bookingData.reduce((s: number, b: any) => s + Number(b.total_amount), 0) / bookingData.length).toFixed(0) : 0;
              return (
                <>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-amber-400">{bookingData?.length || 0}</p>
                      <p className="text-xs text-zinc-400">Total Bookings</p>
                    </CardContent></Card>
                    <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-amber-400">${avgRevenue}</p>
                      <p className="text-xs text-zinc-400">Avg Revenue / Booking</p>
                    </CardContent></Card>
                    <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-amber-400">{statusMap.confirmed || 0}</p>
                      <p className="text-xs text-zinc-400">Confirmed</p>
                    </CardContent></Card>
                  </div>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader><CardTitle className="text-white text-sm">Booking Status Breakdown</CardTitle></CardHeader>
                    <CardContent className="h-64">
                      <ResponsiveContainer><PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}