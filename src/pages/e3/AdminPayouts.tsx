import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useE3CommissionsAdmin,
  useE3ApproveCommission,
  useE3PayCommission,
  useE3BulkApproveCommissions,
  useE3BulkPayCommissions,
  useE3AllOverrides,
  useE3ApproveOverride,
} from "@/hooks/useE3Commissions";
import { ArrowLeft, Check, DollarSign, Clock, CheckCircle2, Ban } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
};

function CommissionRow({ c, selected, onToggle, showApprove, showPay }: any) {
  const approve = useE3ApproveCommission();
  const pay = useE3PayCommission();
  const booking = c.e3_bookings;
  const coord = c.e3_coordinators;
  const halls = booking?.e3_booking_halls?.map((h: any) => h.e3_halls?.name).filter(Boolean).join(", ") || "—";

  return (
    <Card className="border-border/50">
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          {(showApprove || showPay) && (
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggle(c.id)}
              className="mt-1"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {coord?.first_name} {coord?.last_name}
              </span>
              <Badge variant="outline" className={statusColors[c.status] || ""}>
                {c.status}
              </Badge>
              {coord?.tier_level && (
                <Badge variant="secondary" className="text-xs">{coord.tier_level}</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {booking?.event_date ? format(new Date(booking.event_date), "MMM d, yyyy") : "—"}
              {" · "}{booking?.e3_time_blocks?.name || "—"}
              {" · "}{halls}
              {" · "}{booking?.e3_venues?.name || "—"}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div>
                <span className="text-muted-foreground">Net: </span>
                <span className="font-medium">${Number(c.net_contribution).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Commission: </span>
                <span className="font-bold text-primary">
                  ${Number(c.commission_amount).toLocaleString()}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({(Number(c.commission_percent) * 100).toFixed(0)}%)
                  </span>
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
              <span>Created: {format(new Date(c.created_at), "MMM d, yyyy")}</span>
              {c.approved_at && <span>Approved: {format(new Date(c.approved_at), "MMM d, yyyy")}</span>}
              {c.paid_at && <span>Paid: {format(new Date(c.paid_at), "MMM d, yyyy")}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {showApprove && (
              <Button size="sm" variant="outline" onClick={() => approve.mutate(c.id)} disabled={approve.isPending}>
                <Check className="h-3 w-3 mr-1" /> Approve
              </Button>
            )}
            {showPay && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => pay.mutate(c.id)} disabled={pay.isPending}>
                <DollarSign className="h-3 w-3 mr-1" /> Mark Paid
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverridesSection() {
  const { data: overrides = [], isLoading } = useE3AllOverrides();
  const approveOverride = useE3ApproveOverride();

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading overrides...</p>;
  if (!overrides.length) return <p className="text-muted-foreground text-sm">No referral overrides found.</p>;

  return (
    <div className="space-y-3">
      {(overrides as any[]).map((o: any) => {
        const beneficiary = o.e3_coordinators;
        const baseComm = o.e3_commissions;
        const origCoord = baseComm?.e3_coordinators;
        const canApprove = o.status === "pending" && baseComm?.status !== "pending";

        return (
          <Card key={o.id} className="border-border/50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {beneficiary?.first_name} {beneficiary?.last_name}
                    </span>
                    <Badge variant="outline" className={statusColors[o.status] || ""}>
                      {o.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">L{o.override_depth}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Override from {origCoord?.first_name} {origCoord?.last_name}'s commission
                    {" · "}{o.override_percent}% = ${Number(o.override_amount).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Base commission status: <Badge variant="outline" className={`text-[10px] ${statusColors[baseComm?.status]}`}>{baseComm?.status}</Badge>
                  </div>
                </div>
                {canApprove && (
                  <Button size="sm" variant="outline" onClick={() => approveOverride.mutate(o.id)} disabled={approveOverride.isPending}>
                    <Check className="h-3 w-3 mr-1" /> Approve
                  </Button>
                )}
                {o.status === "pending" && baseComm?.status === "pending" && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Ban className="h-3 w-3" /> Base must be approved first
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function E3AdminPayouts() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: commissions = [], isLoading } = useE3CommissionsAdmin(tab === "all" ? undefined : tab);
  const bulkApprove = useE3BulkApproveCommissions();
  const bulkPay = useE3BulkPayCommissions();

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const totalPayout = (commissions as any[]).reduce((sum: number, c: any) => sum + Number(c.commission_amount), 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/e3")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Payouts</h1>
        </div>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelected(new Set()); }}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="paid">Paid History</TabsTrigger>
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {(commissions as any[]).length} commission{(commissions as any[]).length !== 1 ? "s" : ""}
                {" · "}Total: <span className="font-bold text-foreground">${totalPayout.toLocaleString()}</span>
              </div>
              {selected.size > 0 && (
                <div className="flex gap-2">
                  {tab === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => { bulkApprove.mutate([...selected]); setSelected(new Set()); }}
                      disabled={bulkApprove.isPending}
                    >
                      <Check className="h-3 w-3 mr-1" /> Approve {selected.size}
                    </Button>
                  )}
                  {tab === "approved" && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => { bulkPay.mutate([...selected]); setSelected(new Set()); }}
                      disabled={bulkPay.isPending}
                    >
                      <DollarSign className="h-3 w-3 mr-1" /> Pay {selected.size}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <TabsContent value="pending" className="space-y-3">
              {isLoading ? <p className="text-muted-foreground">Loading...</p> :
                (commissions as any[]).length === 0 ? <p className="text-muted-foreground">No pending commissions.</p> :
                (commissions as any[]).map((c: any) => (
                  <CommissionRow key={c.id} c={c} selected={selected.has(c.id)} onToggle={toggle} showApprove showPay={false} />
                ))
              }
            </TabsContent>

            <TabsContent value="approved" className="space-y-3">
              {isLoading ? <p className="text-muted-foreground">Loading...</p> :
                (commissions as any[]).length === 0 ? <p className="text-muted-foreground">No approved commissions awaiting payment.</p> :
                (commissions as any[]).map((c: any) => (
                  <CommissionRow key={c.id} c={c} selected={selected.has(c.id)} onToggle={toggle} showApprove={false} showPay />
                ))
              }
            </TabsContent>

            <TabsContent value="paid" className="space-y-3">
              {isLoading ? <p className="text-muted-foreground">Loading...</p> :
                (commissions as any[]).length === 0 ? <p className="text-muted-foreground">No paid commissions yet.</p> :
                (commissions as any[]).map((c: any) => (
                  <CommissionRow key={c.id} c={c} selected={false} onToggle={() => {}} showApprove={false} showPay={false} />
                ))
              }
            </TabsContent>

            <TabsContent value="overrides">
              <OverridesSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
