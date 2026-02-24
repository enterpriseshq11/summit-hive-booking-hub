import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useE3Booking, useE3AdvanceToYellow, useE3CancelBooking } from "@/hooks/useE3";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, Clock, DollarSign, Users, Calendar, Building2, FileText, Loader2, ExternalLink } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const STATE_COLORS: Record<string, string> = {
  red_hold: "bg-red-500/15 text-red-700 border-red-300",
  yellow_contract: "bg-yellow-500/15 text-yellow-700 border-yellow-300",
  green_booked: "bg-green-500/15 text-green-700 border-green-300",
  completed: "bg-blue-500/15 text-blue-700 border-blue-300",
  cancelled: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
};

const DOC_TYPES = [
  { value: "contract", label: "Master Event Contract" },
  { value: "cleaning", label: "Cleaning Agreement" },
  { value: "building_rules", label: "Building Rules & Policies" },
  { value: "alcohol_policy", label: "Alcohol Policy" },
  { value: "damage_policy", label: "Damage Policy" },
  { value: "cancellation_policy", label: "Cancellation Policy" },
  { value: "other", label: "Other" },
];

export default function E3BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: booking, isLoading } = useE3Booking(id);
  const advanceToYellow = useE3AdvanceToYellow();
  const cancelBooking = useE3CancelBooking();

  const [docType, setDocType] = useState("contract");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${id}/${docType}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("e3-documents")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("e3-documents")
        .getPublicUrl(path);

      const { error: dbError } = await supabase
        .from("e3_booking_documents")
        .insert({
          booking_id: id,
          document_type: docType,
          file_url: urlData.publicUrl,
        });
      if (dbError) throw dbError;

      toast.success(`${DOC_TYPES.find(d => d.value === docType)?.label || docType} uploaded.`);
      qc.invalidateQueries({ queryKey: ["e3_booking", id] });
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!booking) return <div className="p-8 text-destructive">Booking not found.</div>;

  const b = booking as any;
  const hallNames = b.e3_booking_halls?.map((bh: any) => bh.e3_halls?.name).filter(Boolean) || [];
  const docs = b.e3_booking_documents || [];
  const hasContract = docs.some((d: any) => d.document_type === "contract");
  const canUpload = ["red_hold", "yellow_contract"].includes(b.booking_state);

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
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {docs.length > 0 && (
              <ul className="space-y-2">
                {docs.map((d: any) => (
                  <li key={d.id} className="text-sm flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium capitalize">{d.document_type.replace("_", " ")}</span>
                      <span className="text-muted-foreground text-xs">
                        {format(new Date(d.uploaded_at), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                    {d.file_url && (
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {docs.length === 0 && (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            )}

            {canUpload && (
              <div className="flex items-end gap-3 pt-2 border-t">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Document Type</label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map(dt => (
                        <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                    Upload
                  </Button>
                </div>
              </div>
            )}
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
