import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useE3Booking, useE3AdvanceToYellow, useE3CancelBooking } from "@/hooks/useE3";
import { ArrowLeft, Upload, Clock, DollarSign, Users, Calendar, Building2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const STATE_COLORS: Record<string, string> = {
  red_hold: "bg-red-500/15 text-red-700 border-red-300",
  yellow_contract: "bg-yellow-500/15 text-yellow-700 border-yellow-300",
  green_booked: "bg-green-500/15 text-green-700 border-green-300",
  completed: "bg-blue-500/15 text-blue-700 border-blue-300",
  cancelled: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
};

export default function E3BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading } = useE3Booking(id);
  const advanceToYellow = useE3AdvanceToYellow();
  const cancelBooking = useE3CancelBooking();

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!booking) return <div className="p-8 text-destructive">Booking not found.</div>;

  const b = booking as any;
  const hallNames = b.e3_booking_halls?.map((bh: any) => bh.e3_halls?.name).filter(Boolean) || [];
  const docs = b.e3_booking_documents || [];
  const hasContract = docs.some((d: any) => d.document_type === "contract");

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/e3/events")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> My Events
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <Badge variant="outline" className={STATE_COLORS[b.booking_state] || ""}>
            {b.booking_state?.replace("_", " ")}
          </Badge>
        </div>

        {/* Deadline Banner */}
        {b.booking_state === "red_hold" && b.expires_at && (
          <Card className="mb-4 border-red-300 bg-red-50">
            <CardContent className="py-3 flex items-center gap-2 text-red-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Red hold expires {formatDistanceToNow(new Date(b.expires_at), { addSuffix: true })}
              </span>
            </CardContent>
          </Card>
        )}
        {b.booking_state === "yellow_contract" && b.deposit_due_at && (
          <Card className="mb-4 border-yellow-300 bg-yellow-50">
            <CardContent className="py-3 flex items-center gap-2 text-yellow-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Deposit due {formatDistanceToNow(new Date(b.deposit_due_at), { addSuffix: true })}
              </span>
            </CardContent>
          </Card>
        )}

        {/* Event Info */}
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-lg">Event Info</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Client</span><p className="font-medium">{b.client_name}</p></div>
            <div><span className="text-muted-foreground">Email</span><p className="font-medium">{b.client_email}</p></div>
            <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{b.client_phone || "—"}</p></div>
            <div><span className="text-muted-foreground">Guests</span><p className="font-medium">{b.guest_count || "—"}</p></div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">Date</span>
                <p className="font-medium">{format(new Date(b.event_date), "MMMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">Time Block</span>
                <p className="font-medium">{b.e3_time_blocks?.name || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">Halls</span>
                <p className="font-medium">{hallNames.join(", ") || "—"}</p>
              </div>
            </div>
            <div><span className="text-muted-foreground">Type</span><p className="font-medium">{b.event_type || "—"}</p></div>
          </CardContent>
        </Card>

        {/* Financials */}
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-4 w-4" /> Financials</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Gross Revenue</span><span className="font-medium">${Number(b.gross_revenue).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Building Overhead</span><span>-${Number(b.building_overhead).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reset Total</span><span>-${Number(b.reset_total).toLocaleString()}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Total Cost</span><span className="font-medium">${Number(b.total_cost).toLocaleString()}</span></div>
            <div className="flex justify-between font-semibold"><span>Net Contribution</span><span className={Number(b.net_contribution) >= 0 ? "text-green-700" : "text-red-700"}>${Number(b.net_contribution).toLocaleString()}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Commission Rate</span><span>{((b.commission_percentage || 0) * 100).toFixed(0)}%</span></div>
            <div className="flex justify-between text-accent font-semibold"><span>Commission Estimate</span><span>${Number(b.commission_amount || 0).toLocaleString()}</span></div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-lg">Documents</CardTitle></CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {docs.map((d: any) => (
                  <li key={d.id} className="text-sm flex items-center gap-2">
                    <Upload className="h-3 w-3" />
                    <span>{d.document_type}</span>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(d.uploaded_at), "MMM d, yyyy HH:mm")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {/* TODO: Document upload UI will be added when storage bucket is created */}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {b.booking_state === "red_hold" && (
            <>
              <Button
                onClick={() => advanceToYellow.mutate(b.id)}
                disabled={advanceToYellow.isPending || !hasContract}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {hasContract ? "Advance to Yellow Contract" : "Upload Contract First"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelBooking.mutate({ bookingId: b.id })}
                disabled={cancelBooking.isPending}
              >
                Cancel Hold
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
