import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useE3Booking, useE3AdvanceToYellow, useE3CancelBooking, useE3DocumentTemplates } from "@/hooks/useE3";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, Clock, DollarSign, Calendar, Building2, FileText, Loader2, ExternalLink, Download, CheckCircle2, AlertCircle } from "lucide-react";
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

const REQUIRED_DOC_TYPES = [
  { key: "contract", label: "Master Event Contract", required: true },
  { key: "cleaning", label: "Cleaning Agreement", required: true },
  { key: "building_rules", label: "Building Rules & Policies", required: true },
  { key: "alcohol_policy", label: "Alcohol Policy", required: false },
  { key: "damage_policy", label: "Damage Policy", required: true },
  { key: "cancellation_policy", label: "Cancellation Policy", required: true },
];

export default function E3BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: booking, isLoading } = useE3Booking(id);
  const advanceToYellow = useE3AdvanceToYellow();
  const cancelBooking = useE3CancelBooking();
  const { data: templates = [] } = useE3DocumentTemplates();

  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadType = useRef<string>("");

  const handleUploadClick = (docTypeKey: string) => {
    activeUploadType.current = docTypeKey;
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docTypeKey = activeUploadType.current;
    if (!file || !id || !docTypeKey) return;

    setUploadingType(docTypeKey);
    try {
      // Find matching template
      const template = (templates as any[]).find(
        (t: any) => t.doc_type_key === docTypeKey && t.is_active
      );

      const ext = file.name.split(".").pop();
      const templatePath = template ? `templates/${template.id}/` : "";
      const path = `${id}/${templatePath}signed/${docTypeKey}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("e3-booking-documents")
        .upload(path, file);
      if (uploadError) throw uploadError;

      // Get a signed URL since bucket is private
      const { data: signedData, error: signedErr } = await supabase.storage
        .from("e3-booking-documents")
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year

      const fileUrl = signedData?.signedUrl || path;

      const { error: dbError } = await supabase
        .from("e3_booking_documents")
        .insert({
          booking_id: id,
          document_type: docTypeKey,
          template_id: template?.id || null,
          file_url: fileUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        });
      if (dbError) throw dbError;

      const label = REQUIRED_DOC_TYPES.find(d => d.key === docTypeKey)?.label || docTypeKey;
      toast.success(`${label} uploaded.`);
      qc.invalidateQueries({ queryKey: ["e3_booking", id] });
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingType(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!booking) return <div className="p-8 text-destructive">Booking not found.</div>;

  const b = booking as any;
  const hallNames = b.e3_booking_halls?.map((bh: any) => bh.e3_halls?.name).filter(Boolean) || [];
  const docs = (b.e3_booking_documents || []) as any[];
  const canUpload = ["red_hold", "yellow_contract"].includes(b.booking_state);

  // Check required doc completeness
  const uploadedTypes = new Set(docs.map((d: any) => d.document_type));
  const requiredDocs = REQUIRED_DOC_TYPES.filter(d => d.required);
  const allRequiredUploaded = requiredDocs.every(d => uploadedTypes.has(d.key));
  const missingCount = requiredDocs.filter(d => !uploadedTypes.has(d.key)).length;

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

        {/* Deadline Banners */}
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

        {/* Required Documents Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-4 w-4" /> Required Documents
              {allRequiredUploaded ? (
                <Badge variant="outline" className="bg-green-500/15 text-green-700 border-green-300 ml-2">All Complete</Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/15 text-red-700 border-red-300 ml-2">{missingCount} Missing</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleUpload}
            />

            {REQUIRED_DOC_TYPES.map((docDef) => {
              const uploaded = docs.find((d: any) => d.document_type === docDef.key);
              const template = (templates as any[]).find(
                (t: any) => t.doc_type_key === docDef.key && t.is_active
              );
              const isUploading = uploadingType === docDef.key;

              return (
                <div
                  key={docDef.key}
                  className="flex items-center justify-between py-2 px-3 rounded-md border bg-card"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {uploaded ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <AlertCircle className={`h-4 w-4 shrink-0 ${docDef.required ? "text-red-500" : "text-muted-foreground"}`} />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {docDef.label}
                        {!docDef.required && <span className="text-muted-foreground text-xs ml-1">(optional)</span>}
                      </p>
                      {template && (
                        <p className="text-xs text-muted-foreground">v{template.version_number}</p>
                      )}
                      {uploaded && (
                        <p className="text-xs text-muted-foreground">
                          Uploaded {format(new Date(uploaded.uploaded_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {template?.file_url && (
                      <a
                        href={template.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" /> Template
                      </a>
                    )}
                    {uploaded?.file_url && (
                      <a
                        href={uploaded.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </a>
                    )}
                    {canUpload && (
                      <Button
                        size="sm"
                        variant={uploaded ? "ghost" : "outline"}
                        className="h-7 text-xs"
                        onClick={() => handleUploadClick(docDef.key)}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-3 w-3 mr-1" />
                            {uploaded ? "Replace" : "Upload"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {b.booking_state === "red_hold" && (
            <>
              <Button
                onClick={() => advanceToYellow.mutate(b.id)}
                disabled={advanceToYellow.isPending || !allRequiredUploaded}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {allRequiredUploaded
                  ? "Submit Contract Package"
                  : `Upload ${missingCount} Required Doc${missingCount > 1 ? "s" : ""} First`}
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
