import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useE3CommissionsAdmin } from "@/hooks/useE3Commissions";
import { useE3Bookings, useE3Venues } from "@/hooks/useE3";
import { ArrowLeft, Download } from "lucide-react";
import { format } from "date-fns";

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function E3AdminReports() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");

  const { data: commissions = [] } = useE3CommissionsAdmin();
  const { data: bookings = [] } = useE3Bookings({ startDate: startDate || undefined, endDate: endDate || undefined });
  const { data: venues = [] } = useE3Venues();

  const filteredComm = (commissions as any[]).filter((c: any) => {
    if (startDate && c.created_at < startDate) return false;
    if (endDate && c.created_at > endDate + "T23:59:59") return false;
    return true;
  });

  const exportPayoutReport = () => {
    const headers = ["Coordinator", "Booking ID", "Event Date", "Net Contribution", "Commission %", "Commission Amount", "Status", "Paid At"];
    const rows = filteredComm.map((c: any) => [
      `${c.e3_coordinators?.first_name || ""} ${c.e3_coordinators?.last_name || ""}`,
      c.booking_id,
      c.e3_bookings?.event_date || "",
      c.net_contribution,
      (Number(c.commission_percent) * 100).toFixed(1) + "%",
      c.commission_amount,
      c.status,
      c.paid_at || "",
    ]);
    downloadCSV(`payout-report-${format(new Date(), "yyyy-MM-dd")}.csv`, headers, rows);
  };

  const exportMonthlyPerformance = () => {
    const coordMap: Record<string, any> = {};
    for (const c of filteredComm as any[]) {
      const key = c.coordinator_id;
      if (!coordMap[key]) {
        coordMap[key] = {
          name: `${c.e3_coordinators?.first_name || ""} ${c.e3_coordinators?.last_name || ""}`,
          tier: c.e3_coordinators?.tier_level || "",
          events: 0,
          netTotal: 0,
          commTotal: 0,
        };
      }
      coordMap[key].events++;
      coordMap[key].netTotal += Number(c.net_contribution);
      coordMap[key].commTotal += Number(c.commission_amount);
    }
    const headers = ["Coordinator", "Completed Events", "Total Net Contribution", "Total Commissions", "Tier"];
    const rows = Object.values(coordMap).map((c: any) => [c.name, c.events, c.netTotal, c.commTotal, c.tier]);
    downloadCSV(`monthly-performance-${format(new Date(), "yyyy-MM-dd")}.csv`, headers, rows);
  };

  const exportBookingLedger = () => {
    const headers = ["Booking ID", "State", "Event Date", "Venue", "Halls", "Gross Revenue", "Net Contribution", "Commission", "Docs Complete", "Created"];
    const rows = (bookings as any[]).map((b: any) => {
      const halls = b.e3_booking_halls?.map((h: any) => h.e3_halls?.name).filter(Boolean).join("; ") || "";
      return [
        b.id,
        b.booking_state,
        b.event_date,
        b.e3_venues?.name || "",
        halls,
        b.gross_revenue,
        b.net_contribution,
        b.commission_amount,
        b.financial_snapshot_json ? "Yes" : "No",
        b.created_at ? format(new Date(b.created_at), "yyyy-MM-dd") : "",
      ];
    });
    downloadCSV(`booking-ledger-${format(new Date(), "yyyy-MM-dd")}.csv`, headers, rows);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/e3")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Reports & Exports</h1>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div>
                <Label>Venue</Label>
                <Select value={venueFilter} onValueChange={setVenueFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Venues</SelectItem>
                    {(venues as any[]).map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payout Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Commission details per coordinator with snapshot amounts and payment status.
              </p>
              <Button size="sm" onClick={exportPayoutReport}>
                <Download className="h-3 w-3 mr-1" /> Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Per-coordinator event counts, total net contribution, commissions, and tier.
              </p>
              <Button size="sm" onClick={exportMonthlyPerformance}>
                <Download className="h-3 w-3 mr-1" /> Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Booking Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Full booking list with state, financials, snapshot status, and document completeness.
              </p>
              <Button size="sm" onClick={exportBookingLedger}>
                <Download className="h-3 w-3 mr-1" /> Export CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
