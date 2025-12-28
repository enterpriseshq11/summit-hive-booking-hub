import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { usePendingApprovals, useUpdateBookingStatus } from "@/hooks/useBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Check, X, MessageSquare, Calendar, Clock, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function AdminApprovals() {
  const { data: pendingBookings, isLoading } = usePendingApprovals();
  const updateStatus = useUpdateBookingStatus();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [action, setAction] = useState<"approve" | "deny" | null>(null);
  const [notes, setNotes] = useState("");

  const handleAction = () => {
    if (!selectedBooking || !action) return;
    
    updateStatus.mutate({
      id: selectedBooking.id,
      status: action === "approve" ? "confirmed" : "cancelled",
      notes,
    }, {
      onSuccess: () => {
        setSelectedBooking(null);
        setAction(null);
        setNotes("");
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
          <p className="text-muted-foreground">Review and process pending booking requests</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : pendingBookings?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No pending approvals</h3>
              <p className="text-muted-foreground">All booking requests have been processed</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingBookings?.map((booking) => (
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
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending Review
                        </Badge>
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
                          <span>${booking.total_amount?.toFixed(2)}</span>
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
                    </div>

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
                    <li>Payment link will be sent to customer</li>
                    <li>Required documents will be queued for signature</li>
                    <li>Confirmation email will be sent after payment</li>
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
                {updateStatus.isPending ? "Processing..." : action === "approve" ? "Approve & Send Payment Link" : "Deny Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
