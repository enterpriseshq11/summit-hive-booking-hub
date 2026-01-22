import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { usePendingApprovals, useUpdateBookingStatus } from "@/hooks/useBookings";
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
import { useQuery } from "@tanstack/react-query";

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

export default function AdminApprovals() {
  // Use the same pending-approval logic as the dashboard count,
  // but also tolerate projects that use 'requested' alongside 'pending'.
  const { data: pendingBookings, isLoading, isError, error } = usePendingApprovals();

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

  const { data: confirmedBookings, isLoading: confirmedLoading } = useQuery({
    queryKey: ["bookings", "approvals", "confirmed"],
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
        .eq("status", "confirmed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useUpdateBookingStatus();
  const [searchParams] = useSearchParams();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [action, setAction] = useState<"approve" | "deny" | null>(null);
  const [notes, setNotes] = useState("");
  const [businessUnit, setBusinessUnit] = useState<BusinessUnit>("all");
  const [statusTab, setStatusTab] = useState<"pending" | "confirmed" | "denied">("pending");
  const [viewDenied, setViewDenied] = useState<any>(null);
  const [viewConfirmed, setViewConfirmed] = useState<any>(null);

  const filteredPending = useMemo(() => {
    return (pendingBookings || []).filter((b: any) => matchesUnit(b, businessUnit));
  }, [pendingBookings, businessUnit]);

  const filteredDenied = useMemo(() => {
    return (deniedBookings || []).filter((b: any) => matchesUnit(b, businessUnit));
  }, [deniedBookings, businessUnit]);

  const filteredConfirmed = useMemo(() => {
    return (confirmedBookings || []).filter((b: any) => matchesUnit(b, businessUnit));
  }, [confirmedBookings, businessUnit]);

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
    if (!selectedBooking || !action) return;
    
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

        <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as "pending" | "confirmed" | "denied")}>
          <TabsList className="w-full justify-start flex-wrap h-auto">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
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

        {statusTab === "pending" && isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : statusTab === "confirmed" && confirmedLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : statusTab === "denied" && deniedLoading ? (
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
        ) : statusTab === "confirmed" && filteredConfirmed.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No confirmed bookings</h3>
              <p className="text-muted-foreground">Approved bookings will show here.</p>
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
            {(statusTab === "pending"
              ? filteredPending
              : statusTab === "confirmed"
                ? filteredConfirmed
                : filteredDenied
            ).map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.guest_name || "Customer"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.guest_email || "No email provided"}
                          </p>
                        </div>
                        {statusTab === "pending" ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending Review
                          </Badge>
                        ) : statusTab === "confirmed" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Confirmed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Denied
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(booking.start_datetime), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(booking.start_datetime), "h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.guest_count || 1} guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatEstimate(booking)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{booking.businesses?.name}</Badge>
                        <Badge variant="outline">{booking.bookable_types?.name}</Badge>
                        {booking.packages?.name && (
                          <Badge variant="outline">{booking.packages?.name}</Badge>
                        )}
                      </div>

                      {booking.notes && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <p className="text-muted-foreground">Customer Notes:</p>
                          <p>{booking.notes}</p>
                        </div>
                      )}

                      {statusTab === "denied" && (booking.cancellation_reason || booking.internal_notes) && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <p className="text-muted-foreground">Denied Reason:</p>
                          <p>{booking.cancellation_reason || booking.internal_notes}</p>
                        </div>
                      )}
                    </div>

                    {statusTab === "pending" ? (
                      <div className="flex lg:flex-col gap-2 lg:justify-center">
                        <Button
                          className="flex-1 lg:flex-none"
                          onClick={() => {
                            setSelectedBooking(booking);
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
                            setSelectedBooking(booking);
                            setAction("deny");
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Deny
                        </Button>
                      </div>
                    ) : statusTab === "confirmed" ? (
                      <div className="flex lg:flex-col gap-2 lg:justify-center">
                        <Button
                          variant="outline"
                          className="flex-1 lg:flex-none"
                          onClick={() => setViewConfirmed(booking)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    ) : (
                      <div className="flex lg:flex-col gap-2 lg:justify-center">
                        <Button
                          variant="outline"
                          className="flex-1 lg:flex-none"
                          onClick={() => setViewDenied(booking)}
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
        <Dialog open={!!action} onOpenChange={() => { setAction(null); setNotes(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {action === "approve" ? "Approve Booking" : "Deny Booking"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedBooking && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium">
                    {selectedBooking.guest_name || `${selectedBooking.profiles?.first_name} ${selectedBooking.profiles?.last_name}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedBooking.start_datetime), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-sm">
                    {selectedBooking.businesses?.name} - {selectedBooking.bookable_types?.name}
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
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? "Processing..." : action === "approve" ? "Approve & Notify Customer" : "Deny Request"}
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

        {/* Confirmed details (read-only) */}
        <Dialog open={!!viewConfirmed} onOpenChange={(o) => !o && setViewConfirmed(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmed Booking</DialogTitle>
            </DialogHeader>

            {viewConfirmed && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium">
                    {viewConfirmed.guest_name || "Customer"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(viewConfirmed.start_datetime), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-sm">
                    {viewConfirmed.businesses?.name} - {viewConfirmed.bookable_types?.name}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
