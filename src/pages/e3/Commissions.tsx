import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useE3MyCommissions, useE3MyOverrideEarnings } from "@/hooks/useE3Commissions";
import { useE3CoordinatorProfile } from "@/hooks/useE3";
import { ArrowLeft, TrendingUp, DollarSign, Clock, CheckCircle2, Banknote } from "lucide-react";
import { format } from "date-fns";

const statusIcon: Record<string, any> = {
  pending: <Clock className="h-3 w-3 text-yellow-400" />,
  approved: <CheckCircle2 className="h-3 w-3 text-blue-400" />,
  paid: <Banknote className="h-3 w-3 text-green-400" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function E3Commissions() {
  const navigate = useNavigate();
  const { data: profile } = useE3CoordinatorProfile();
  const { data: commissions = [], isLoading } = useE3MyCommissions();
  const { data: overrides = [], isLoading: loadingOverrides } = useE3MyOverrideEarnings();

  const totalEarned = (commissions as any[])
    .filter((c: any) => c.status === "paid")
    .reduce((s: number, c: any) => s + Number(c.commission_amount), 0);
  const totalPending = (commissions as any[])
    .filter((c: any) => c.status !== "paid")
    .reduce((s: number, c: any) => s + Number(c.commission_amount), 0);
  const totalOverrides = (overrides as any[])
    .filter((o: any) => o.status === "paid")
    .reduce((s: number, o: any) => s + Number(o.override_amount), 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/e3")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">My Commissions</h1>
          {profile && (
            <Badge variant="secondary">{(profile as any).tier_level || "bronze"}</Badge>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="py-4 text-center">
              <DollarSign className="h-5 w-5 mx-auto text-green-500 mb-1" />
              <div className="text-2xl font-bold">${totalEarned.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Paid</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
              <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Pending / Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-purple-500 mb-1" />
              <div className="text-2xl font-bold">${totalOverrides.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Override Earnings (Paid)</div>
            </CardContent>
          </Card>
        </div>

        {/* Commission rows */}
        <CardHeader className="px-0 pb-2">
          <CardTitle className="text-lg">Commission History</CardTitle>
        </CardHeader>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (commissions as any[]).length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No commissions yet. Complete bookings to earn.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {(commissions as any[]).map((c: any) => {
              const booking = c.e3_bookings;
              const halls = booking?.e3_booking_halls?.map((h: any) => h.e3_halls?.name).filter(Boolean).join(", ") || "—";

              return (
                <Card key={c.id} className="border-border/50">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {statusIcon[c.status]}
                          <Badge variant="outline" className={statusColors[c.status]}>
                            {c.status}
                          </Badge>
                          <span className="font-semibold text-sm">{booking?.client_name || "—"}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {booking?.event_date ? format(new Date(booking.event_date), "MMM d, yyyy") : "—"}
                          {" · "}{booking?.e3_time_blocks?.name || "—"}
                          {" · "}{halls}
                          {" · "}{booking?.e3_venues?.name || "—"}
                        </div>
                        <div className="flex gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Net: </span>
                            ${Number(c.net_contribution).toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Commission: </span>
                            <span className="font-bold text-primary">${Number(c.commission_amount).toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-1">({(Number(c.commission_percent) * 100).toFixed(0)}%)</span>
                          </div>
                        </div>
                        {/* Status timeline */}
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Created: {format(new Date(c.created_at), "MMM d")}</span>
                          {c.approved_at && <span>→ Approved: {format(new Date(c.approved_at), "MMM d")}</span>}
                          {c.paid_at && <span>→ Paid: {format(new Date(c.paid_at), "MMM d")}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/e3/bookings/${c.booking_id}`)}>
                        View Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Override earnings section */}
        <Separator className="my-8" />
        <CardHeader className="px-0 pb-2">
          <CardTitle className="text-lg">Referral Override Earnings</CardTitle>
        </CardHeader>

        {loadingOverrides ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (overrides as any[]).length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No referral override earnings yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {(overrides as any[]).map((o: any) => {
              const comm = o.e3_commissions;
              const origCoord = comm?.e3_coordinators;
              const booking = comm?.e3_bookings;

              return (
                <Card key={o.id} className="border-border/50">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2">
                      {statusIcon[o.status]}
                      <Badge variant="outline" className={statusColors[o.status]}>{o.status}</Badge>
                      <Badge variant="secondary" className="text-xs">Level {o.override_depth}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      From {origCoord?.first_name} {origCoord?.last_name}'s booking
                      {booking?.event_date ? ` on ${format(new Date(booking.event_date), "MMM d, yyyy")}` : ""}
                    </div>
                    <div className="mt-1 text-sm font-bold text-primary">
                      ${Number(o.override_amount).toLocaleString()}
                      <span className="text-xs text-muted-foreground ml-1">({o.override_percent}%)</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
