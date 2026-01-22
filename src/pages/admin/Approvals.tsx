import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { useUpdateBookingStatus } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Check, X, MessageSquare, Calendar, Clock, Users, DollarSign, Info } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type BusinessUnit = "all" | "summit" | "hive" | "restoration" | "photo_booth" | "voice_vault";

const BUSINESS_UNIT_TABS: { value: BusinessUnit; label: string }[] = [
  { value: "summit", label: "The Summit" },
  { value: "hive", label: "The Hive" },
  { value: "restoration", label: "Restoration" },
  { value: "photo_booth", label: "360 Photo Booth" },
  { value: "voice_vault", label: "Voice Vault" },
  { value: "all", label: "All" },
];

function matchesUnit(b: any, unit: BusinessUnit) {
  if (unit === "all") return true;
  const t = b?.businesses?.type;
  const sb = b?.source_brand;
  switch (unit) {
    case "summit":
      return t === "summit" || sb === "summit";
    case "hive":
      return t === "coworking" || sb === "hive";
    case "restoration":
      return t === "spa" || sb === "restoration";
    case "photo_booth":
      return t === "photo_booth" || sb === "photo_booth";
    case "voice_vault":
      return t === "voice_vault" || sb === "voice_vault";
  }
}

function formatEstimate(booking: any) {
  const t = booking?.businesses?.type ?? booking?.source_brand;
  const isRequestOnly = t === "summit";
  const amount = booking?.total_amount;
  if (isRequestOnly && (!Number.isFinite(amount) || amount <= 0)) return "Estimate pending";
  if (!Number.isFinite(amount)) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

function formatUSD0(amount: any) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

type ApprovalItem =
  | { kind: "booking"; booking: any }
  | { kind: "hive_lease"; inquiry: any };

export default function AdminApprovals() {
  // IMPORTANT: Dashboard "Pending Approvals" uses bookings.status='pending'.
  // Keep this page on the same source of truth to prevent count/list mismatches.
  const {
    data: pendingBookings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["bookings", "approvals", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          businesses(name, type),
          bookable_types(name),
          packages(name)
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: pendingLeaseRequests, isLoading: leasePendingLoading } = useQuery({
    queryKey: ["office_inquiries", "lease_request", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("office_inquiries")
        .select("*")
        .eq("inquiry_type", "lease_request")
        .eq("approval_status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: deniedBookings, isLoading: deniedLoading } = useQuery({
    queryKey: ["bookings", "approvals", "denied"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          businesses(name, type),
          bookable_types(name),
          packages(name)
        `
        )
        .eq("status", "denied")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: deniedLeaseRequests, isLoading: leaseDeniedLoading } = useQuery({
    queryKey: ["office_inquiries", "lease_request", "denied"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("office_inquiries")
        .select("*")
        .eq("inquiry_type", "lease_request")
        .eq("approval_status", "denied")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useUpdateBookingStatus();
  const queryClient = useQueryClient();

  const updateLeaseApproval = useMutation({
    mutationFn: async (params: { id: string; status: "confirmed" | "denied"; reason?: string }) => {
      const now = new Date().toISOString();
      const patch: any = {
        approval_status: params.status,
      };
      if (params.status === "confirmed") {
        patch.approved_at = now;
        patch.denied_at = null;
        patch.denial_reason = null;
      } else {
        patch.denied_at = now;
        patch.denial_reason = params.reason || null;
      }

      const { data, error } = await supabase
        .from("office_inquiries")
        .update(patch)
        .eq("id", params.id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (updated) => {
      // refresh lists
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["office_inquiries", "lease_request", "pending"] }),
        queryClient.invalidateQueries({ queryKey: ["office_inquiries", "lease_request", "denied"] }),
        queryClient.invalidateQueries({ queryKey: ["admin_stats"] }),
        queryClient.invalidateQueries({ queryKey: ["admin_alerts"] }),
      ]);

      // notify customer (best-effort)
      try {
        await supabase.functions.invoke("send-inquiry-notification", {
          body: {
            type: updated.approval_status === "confirmed" ? "lease_approved" : "lease_denied",
            inquiry: {
              first_name: updated.first_name,
              last_name: updated.last_name,
              email: updated.email,
              phone: updated.phone,
              company_name: updated.company_name,
              workspace_type: updated.workspace_type,
              move_in_timeframe: updated.move_in_timeframe,
              seats_needed: updated.seats_needed,
              inquiry_type: updated.inquiry_type,
              needs_meeting_rooms: updated.needs_meeting_rooms,
              needs_business_address: updated.needs_business_address,
              office_code: updated.office_code,
              lease_term_months: updated.lease_term_months,
              monthly_rate: updated.monthly_rate,
              term_total: updated.term_total,
              deposit_amount: updated.deposit_amount,
              denial_reason: updated.denial_reason,
            },
          },
        });
      } catch {
        // non-blocking
      }
    },
  });
  const [searchParams] = useSearchParams();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [action, setAction] = useState<"approve" | "deny" | null>(null);
  const [notes, setNotes] = useState("");
  const [businessUnit, setBusinessUnit] = useState<BusinessUnit>("all");
  const [statusTab, setStatusTab] = useState<"pending" | "denied">("pending");
  const [viewDenied, setViewDenied] = useState<any>(null);
  const [selectedLease, setSelectedLease] = useState<any>(null);

  const filteredPending = useMemo(() => {
    const bookingItems: ApprovalItem[] = (pendingBookings || [])
      .filter((b: any) => matchesUnit(b, businessUnit))
      .map((b: any) => ({ kind: "booking", booking: b }));

    const shouldIncludeHiveLease = businessUnit === "all" || businessUnit === "hive";
    const leaseItems: ApprovalItem[] = shouldIncludeHiveLease
      ? (pendingLeaseRequests || []).map((i: any) => ({ kind: "hive_lease", inquiry: i }))
      : [];

    return [...bookingItems, ...leaseItems];
  }, [pendingBookings, businessUnit]);

  const filteredDenied = useMemo(() => {
    const bookingItems: ApprovalItem[] = (deniedBookings || [])
      .filter((b: any) => matchesUnit(b, businessUnit))
      .map((b: any) => ({ kind: "booking", booking: b }));

    const shouldIncludeHiveLease = businessUnit === "all" || businessUnit === "hive";
    const leaseItems: ApprovalItem[] = shouldIncludeHiveLease
      ? (deniedLeaseRequests || []).map((i: any) => ({ kind: "hive_lease", inquiry: i }))
      : [];

    return [...bookingItems, ...leaseItems];
  }, [deniedBookings, businessUnit]);

  // Deep link support from staff email: /admin/approvals?id=<booking_id>
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const match = (pendingBookings || []).find((b: any) => b.id === id);
    if (!match) return;

    setSelectedBooking(match);
    setAction("approve");
  }, [searchParams, pendingBookings]);

  const handleAction = () => {
    if (!action) return;

    // Hive lease request
    if (selectedLease) {
      updateLeaseApproval.mutate({
        id: selectedLease.id,
        status: action === "approve" ? "confirmed" : "denied",
        reason: notes,
      });
      setSelectedLease(null);
      setAction(null);
      setNotes("");
      return;
    }

    // Standard booking
    if (!selectedBooking) return;
    
    updateStatus.mutate({
      id: selectedBooking.id,
      status: action === "approve" ? "confirmed" : "denied",
      notes,
    }, {
      onSuccess: async () => {
        // Send decision email to customer
        try {
          await supabase.functions.invoke("send-booking-notification", {
            body: {
              booking_id: selectedBooking.id,
              notification_type: action === "approve" ? "confirmation" : "denied",
              channels: ["email"],
              recipients: ["customer"],
            },
          });
        } catch {
          // non-blocking
        }

        setSelectedBooking(null);
        setAction(null);
        setNotes("");
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Approvals</h1>
          <p className="text-zinc-300">Review pending or requested bookings by business unit</p>
        </div>

        <Tabs value={businessUnit} onValueChange={(v) => setBusinessUnit(v as BusinessUnit)}>
          <TabsList className="w-full justify-start flex-wrap h-auto">
            {BUSINESS_UNIT_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as "pending" | "denied")}>
          <TabsList className="w-full justify-start flex-wrap h-auto">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="denied">Denied</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Helper Text */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-300">How approvals work</p>
              <ul className="mt-1 text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• <strong>Approve:</strong> Customer receives “Request Approved / Booking Confirmed”</li>
                  <li>• <strong>Deny:</strong> Customer receives “Request Denied” (include reason if provided)</li>
                <li>• Requests older than 48 hours should be prioritized</li>
              </ul>
            </div>
          </div>
        </div>

        {statusTab === "pending" && (isLoading || leasePendingLoading) ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : statusTab === "denied" && (deniedLoading || leaseDeniedLoading) ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="py-10">
              <h3 className="text-lg font-medium">Couldn't load approvals</h3>
              <p className="text-muted-foreground mt-1">
                {(error as any)?.message || "Please refresh and try again."}
              </p>
            </CardContent>
          </Card>
        ) : statusTab === "pending" && filteredPending.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No pending approvals</h3>
              <p className="text-muted-foreground">All booking requests have been processed</p>
            </CardContent>
          </Card>
        ) : statusTab === "denied" && filteredDenied.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No denied requests</h3>
              <p className="text-muted-foreground">Denied requests will show here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(statusTab === "pending" ? filteredPending : filteredDenied).map((item) => (
              <Card
                key={item.kind === "booking" ? item.booking.id : item.inquiry.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {item.kind === "booking"
                              ? item.booking.guest_name || "Customer"
                              : `${item.inquiry.first_name || "Customer"} ${item.inquiry.last_name || ""}`.trim()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.kind === "booking"
                              ? item.booking.guest_email || "No email provided"
                              : item.inquiry.email || "No email provided"}
                          </p>
                        </div>
                        {statusTab === "pending" ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending Review
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Denied
                          </Badge>
                        )}
                      </div>

                      {item.kind === "booking" ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(item.booking.start_datetime), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(item.booking.start_datetime), "h:mm a")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{item.booking.guest_count || 1} guests</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatEstimate(item.booking)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(item.inquiry.created_at), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(item.inquiry.created_at), "h:mm a")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Lease request</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatUSD0(item.inquiry.term_total)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {item.kind === "booking" ? (
                          <>
                            <Badge variant="secondary">{item.booking.businesses?.name}</Badge>
                            <Badge variant="outline">{item.booking.bookable_types?.name}</Badge>
                            {item.booking.packages?.name && (
                              <Badge variant="outline">{item.booking.packages?.name}</Badge>
                            )}
                          </>
                        ) : (
                          <>
                            <Badge variant="secondary">The Hive</Badge>
                            <Badge variant="outline">Office Lease Request</Badge>
                            {item.inquiry.office_code && (
                              <Badge variant="outline">Office {item.inquiry.office_code}</Badge>
                            )}
                            {item.inquiry.lease_term_months && (
                              <Badge variant="outline">{item.inquiry.lease_term_months} months</Badge>
                            )}
                          </>
                        )}
                      </div>

                      {item.kind === "booking" && item.booking.notes && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <p className="text-muted-foreground">Customer Notes:</p>
                          <p>{item.booking.notes}</p>
                        </div>
                      )}

                      {item.kind === "hive_lease" && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                          <p className="text-muted-foreground">Pricing:</p>
                          <p>
                            Monthly: <span className="font-medium">{formatUSD0(item.inquiry.monthly_rate)}</span>
                          </p>
                          <p>
                            Term total: <span className="font-medium">{formatUSD0(item.inquiry.term_total)}</span>
                          </p>
                          <p>
                            Deposit/down: <span className="font-medium">{formatUSD0(item.inquiry.deposit_amount)}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">Request-based — no payment collected now.</p>
                        </div>
                      )}

                      {statusTab === "denied" && item.kind === "booking" && (item.booking.cancellation_reason || item.booking.internal_notes) && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <p className="text-muted-foreground">Denied Reason:</p>
                          <p>{item.booking.cancellation_reason || item.booking.internal_notes}</p>
                        </div>
                      )}

                      {statusTab === "denied" && item.kind === "hive_lease" && item.inquiry.denial_reason && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <p className="text-muted-foreground">Denied Reason:</p>
                          <p>{item.inquiry.denial_reason}</p>
                        </div>
                      )}
                    </div>

                    {statusTab === "pending" ? (
                      <div className="flex lg:flex-col gap-2 lg:justify-center">
                        <Button
                          className="flex-1 lg:flex-none"
                          onClick={() => {
                            if (item.kind === "booking") {
                              setSelectedBooking(item.booking);
                              setSelectedLease(null);
                            } else {
                              setSelectedLease(item.inquiry);
                              setSelectedBooking(null);
                            }
                            setAction("approve");
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 lg:flex-none"
                          onClick={() => {
                            if (item.kind === "booking") {
                              setSelectedBooking(item.booking);
                              setSelectedLease(null);
                            } else {
                              setSelectedLease(item.inquiry);
                              setSelectedBooking(null);
                            }
                            setAction("deny");
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Deny
                        </Button>
                      </div>
                    ) : (
                      <div className="flex lg:flex-col gap-2 lg:justify-center">
                        <Button
                          variant="outline"
                          className="flex-1 lg:flex-none"
                          onClick={() => setViewDenied(item.kind === "booking" ? item.booking : item.inquiry)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Approval/Denial Dialog */}
        <Dialog open={!!action} onOpenChange={() => { setAction(null); setNotes(""); setSelectedLease(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {action === "approve" ? "Approve Booking" : "Deny Booking"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {(selectedBooking || selectedLease) && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium">
                    {selectedLease
                      ? `${selectedLease.first_name || "Customer"} ${selectedLease.last_name || ""}`.trim()
                      : selectedBooking.guest_name || `${selectedBooking.profiles?.first_name} ${selectedBooking.profiles?.last_name}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLease
                      ? `Submitted ${format(new Date(selectedLease.created_at), "MMMM d, yyyy 'at' h:mm a")}`
                      : format(new Date(selectedBooking.start_datetime), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-sm">
                    {selectedLease
                      ? `The Hive — Office Lease Request${selectedLease.office_code ? ` (Office ${selectedLease.office_code})` : ""}`
                      : `${selectedBooking.businesses?.name} - ${selectedBooking.bookable_types?.name}`}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">
                  {action === "approve" ? "Internal Notes (optional)" : "Reason for Denial"}
                </label>
                <Textarea
                  placeholder={action === "approve" 
                    ? "Add any internal notes..." 
                    : "Please provide a reason for denial..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              {action === "approve" && (
                <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                  <p>Upon approval:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Customer gets a “Request Approved / Booking Confirmed” email</li>
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setAction(null); setNotes(""); }}>
                Cancel
              </Button>
              <Button
                variant={action === "approve" ? "default" : "destructive"}
                onClick={handleAction}
                disabled={updateStatus.isPending || updateLeaseApproval.isPending}
              >
                {updateStatus.isPending || updateLeaseApproval.isPending
                  ? "Processing..."
                  : action === "approve"
                    ? "Approve & Notify Customer"
                    : "Deny Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Denied details (read-only) */}
        <Dialog open={!!viewDenied} onOpenChange={(o) => !o && setViewDenied(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Denied Request</DialogTitle>
            </DialogHeader>

            {viewDenied && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium">
                    {viewDenied.guest_name || "Customer"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(viewDenied.start_datetime), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-sm">
                    {viewDenied.businesses?.name} - {viewDenied.bookable_types?.name}
                  </p>
                </div>

                {(viewDenied.cancellation_reason || viewDenied.internal_notes) && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium">Denied Reason</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {viewDenied.cancellation_reason || viewDenied.internal_notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
