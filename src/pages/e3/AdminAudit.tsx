import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useE3AuditLog } from "@/hooks/useE3Commissions";
import { ArrowLeft, Search } from "lucide-react";
import { format } from "date-fns";

const ACTION_TYPES = [
  "booking_created", "booking_updated", "booking_cancelled",
  "state_to_yellow_contract", "deposit_approved_green",
  "auto_expired", "auto_reverted_deposit_missed",
  "commission_auto_created", "commission_approved", "commission_paid",
  "override_approved", "admin_override_edit",
];

const actionColors: Record<string, string> = {
  booking_created: "bg-blue-500/20 text-blue-400",
  commission_auto_created: "bg-purple-500/20 text-purple-400",
  commission_approved: "bg-blue-500/20 text-blue-400",
  commission_paid: "bg-green-500/20 text-green-400",
  auto_expired: "bg-red-500/20 text-red-400",
  auto_reverted_deposit_missed: "bg-orange-500/20 text-orange-400",
  admin_override_edit: "bg-yellow-500/20 text-yellow-400",
  booking_cancelled: "bg-red-500/20 text-red-400",
  deposit_approved_green: "bg-green-500/20 text-green-400",
};

export default function E3AdminAudit() {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState("");
  const [action, setAction] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: logs = [], isLoading } = useE3AuditLog({
    bookingId: bookingId || undefined,
    action: action === "all" ? undefined : action,
    startDate: startDate || undefined,
    endDate: endDate ? endDate + "T23:59:59" : undefined,
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/e3")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <Badge variant="outline">{(logs as any[]).length} entries</Badge>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Booking / Entity ID</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Paste ID..."
                    value={bookingId}
                    onChange={e => setBookingId(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Action Type</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {ACTION_TYPES.map(a => (
                      <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entries */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (logs as any[]).length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No audit entries found.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {(logs as any[]).map((log: any) => {
              const before = log.before_state;
              const after = log.after_state;
              const overrideReason = after?.override_reason;

              return (
                <Card key={log.id} className="border-border/50">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={actionColors[log.action] || "bg-muted text-muted-foreground"}>
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.entity_type} · {log.entity_id?.slice(0, 8)}...
                          </span>
                        </div>

                        {overrideReason && (
                          <div className="mt-1 text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded">
                            Override reason: {overrideReason}
                          </div>
                        )}

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {before && (
                            <div>
                              <span className="text-muted-foreground font-medium">Before:</span>
                              <pre className="mt-1 bg-muted/50 p-2 rounded overflow-x-auto max-h-24 text-[10px]">
                                {JSON.stringify(before, null, 2)}
                              </pre>
                            </div>
                          )}
                          {after && (
                            <div>
                              <span className="text-muted-foreground font-medium">After:</span>
                              <pre className="mt-1 bg-muted/50 p-2 rounded overflow-x-auto max-h-24 text-[10px]">
                                {JSON.stringify(after, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), "MMM d, HH:mm")}
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
