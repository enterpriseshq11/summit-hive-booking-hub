import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useE3PendingDeposits, useE3ApproveDeposit, useE3CancelBooking } from "@/hooks/useE3";
import { ArrowLeft, Check, X, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function E3AdminDeposits() {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useE3PendingDeposits();
  const approveDeposit = useE3ApproveDeposit();
  const cancelBooking = useE3CancelBooking();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/e3")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Deposit Approvals</h1>
          <Badge variant="outline">{(bookings as any[]).length} pending</Badge>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (bookings as any[]).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No pending deposit approvals.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(bookings as any[]).map((b: any) => {
              const hallNames = b.e3_booking_halls?.map((bh: any) => bh.e3_halls?.name).filter(Boolean).join(", ") || "—";
              const timeLeft = b.deposit_due_at
                ? formatDistanceToNow(new Date(b.deposit_due_at), { addSuffix: true })
                : "—";
              const isOverdue = b.deposit_due_at && new Date(b.deposit_due_at) < new Date();

              return (
                <Card key={b.id} className={isOverdue ? "border-destructive" : ""}>
                  <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{b.client_name}</span>
                          <span className="text-xs text-muted-foreground">by {b.e3_coordinators?.name || "—"}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {format(new Date(b.event_date), "MMM d, yyyy")} · {b.e3_time_blocks?.name} · {hallNames}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          <span className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
                            Deposit due {timeLeft}
                          </span>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Gross: </span>
                          <span className="font-medium">${Number(b.gross_revenue).toLocaleString()}</span>
                          <span className="mx-2 text-muted-foreground">|</span>
                          <span className="text-muted-foreground">Net: </span>
                          <span className="font-medium">${Number(b.net_contribution).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveDeposit.mutate(b.id)}
                          disabled={approveDeposit.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelBooking.mutate({ bookingId: b.id, reason: "Deposit rejected by admin" })}
                          disabled={cancelBooking.isPending}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
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
