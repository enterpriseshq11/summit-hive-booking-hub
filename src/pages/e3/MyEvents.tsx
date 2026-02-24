import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useE3Bookings } from "@/hooks/useE3";
import { Plus, ArrowLeft } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const STATE_COLORS: Record<string, string> = {
  red_hold: "bg-red-500/15 text-red-700 border-red-300",
  yellow_contract: "bg-yellow-500/15 text-yellow-700 border-yellow-300",
  green_booked: "bg-green-500/15 text-green-700 border-green-300",
  completed: "bg-blue-500/15 text-blue-700 border-blue-300",
  cancelled: "bg-muted text-muted-foreground border-border",
  expired: "bg-muted text-muted-foreground border-border",
};

const STATE_LABELS: Record<string, string> = {
  red_hold: "Red Hold",
  yellow_contract: "Yellow Contract",
  green_booked: "Green Booked",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
};

export default function E3MyEvents() {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useE3Bookings();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/e3")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">My Events</h1>
          </div>
          <Button onClick={() => navigate("/e3/submit")}>
            <Plus className="h-4 w-4 mr-2" /> Submit Event
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No events yet.</p>
              <Button onClick={() => navigate("/e3/submit")}>Submit Your First Event</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: any) => {
              const hallNames = b.e3_booking_halls?.map((bh: any) => bh.e3_halls?.name).filter(Boolean).join(", ") || "—";
              const deadline = b.booking_state === "red_hold" && b.expires_at
                ? formatDistanceToNow(new Date(b.expires_at), { addSuffix: true })
                : b.booking_state === "yellow_contract" && b.deposit_due_at
                ? formatDistanceToNow(new Date(b.deposit_due_at), { addSuffix: true })
                : null;

              return (
                <Card
                  key={b.id}
                  className="cursor-pointer hover:border-accent/50 transition-colors"
                  onClick={() => navigate(`/e3/bookings/${b.id}`)}
                >
                  <CardContent className="py-4 flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{b.client_name}</span>
                        <Badge variant="outline" className={STATE_COLORS[b.booking_state] || ""}>
                          {STATE_LABELS[b.booking_state] || b.booking_state}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(b.event_date), "MMM d, yyyy")} · {b.e3_time_blocks?.name || "—"} · {hallNames}
                      </div>
                      {deadline && (
                        <div className="text-xs text-destructive mt-1">
                          {b.booking_state === "red_hold" ? "Expires" : "Deposit due"} {deadline}
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="text-sm font-medium">${Number(b.net_contribution || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Net Contribution</div>
                      <div className="text-xs text-accent font-medium">
                        ${Number(b.commission_amount || 0).toLocaleString()} commission
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
