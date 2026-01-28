import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string) {
  // datetime-local has no timezone; treat it as local time.
  const d = new Date(value);
  return d.toISOString();
}

export function BookingEditDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any | null;
  onUpdated?: () => void;
}) {
  const { open, onOpenChange, booking, onUpdated } = props;

  const initial = useMemo(() => {
    if (!booking) return null;
    return {
      start: toDatetimeLocalValue(booking.start_datetime),
      end: toDatetimeLocalValue(booking.end_datetime),
      guestName: booking.guest_name ?? "",
      guestEmail: booking.guest_email ?? "",
      guestPhone: booking.guest_phone ?? "",
      notes: booking.notes ?? "",
      totalAmount: typeof booking.total_amount === "number" ? String(booking.total_amount) : "",
    };
  }, [booking]);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Cancellation state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setStart(initial.start);
    setEnd(initial.end);
    setGuestName(initial.guestName);
    setGuestEmail(initial.guestEmail);
    setGuestPhone(initial.guestPhone);
    setNotes(initial.notes);
    setTotalAmount(initial.totalAmount);
  }, [initial]);

  // Reset cancellation state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setShowCancelConfirm(false);
      setCancelReason("");
      setCancelling(false);
    }
  }, [open]);

  const onSave = async () => {
    if (!booking?.id) return;
    setSaving(true);
    try {
      const updates: Partial<BookingRow> = {
        start_datetime: fromDatetimeLocalValue(start),
        end_datetime: fromDatetimeLocalValue(end),
        guest_name: guestName || null,
        guest_email: guestEmail || null,
        guest_phone: guestPhone || null,
        notes: notes || null,
      };

      if (totalAmount.trim().length) {
        const n = Number(totalAmount);
        if (Number.isFinite(n)) updates.total_amount = n;
      }

      const { error } = await supabase.from("bookings").update(updates).eq("id", booking.id);
      if (error) throw error;

      toast.success("Booking updated");
      onUpdated?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(`Failed to update booking: ${e?.message ?? "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const onCancelAppointment = async () => {
    if (!booking?.id) return;
    setCancelling(true);
    
    try {
      // 1. Update booking status to cancelled
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: cancelReason || null,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // 2. Log to audit_log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        action_type: "booking_cancelled",
        entity_type: "bookings",
        entity_id: booking.id,
        actor_user_id: user?.id || null,
        before_json: { status: booking.status },
        after_json: { status: "cancelled", cancellation_reason: cancelReason || null },
      });

      // 3. Send cancellation notification to customer
      try {
        const { error: notifyError } = await supabase.functions.invoke("send-booking-notification", {
          body: {
            booking_id: booking.id,
            notification_type: "cancellation",
            channels: ["email", "sms"],
            recipients: ["customer"],
          },
        });
        
        if (notifyError) {
          console.warn("Cancellation notification failed:", notifyError);
          toast.warning("Booking cancelled, but notification failed to send");
        } else {
          toast.success("Appointment cancelled and customer notified");
        }
      } catch (notifyErr) {
        console.warn("Cancellation notification error:", notifyErr);
        toast.warning("Booking cancelled, but notification may not have sent");
      }

      onUpdated?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(`Failed to cancel booking: ${e?.message ?? "Unknown error"}`);
    } finally {
      setCancelling(false);
    }
  };

  const isAlreadyCancelled = booking?.status === "cancelled";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Booking</DialogTitle>
        </DialogHeader>

        {!booking ? (
          <div className="text-sm text-zinc-300">No booking selected.</div>
        ) : showCancelConfirm ? (
          // Cancellation confirmation view
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
              <div>
                <p className="font-semibold text-red-300">Cancel this appointment?</p>
                <p className="text-sm text-red-200/80 mt-1">
                  This will notify the customer via email/SMS that their appointment has been cancelled.
                </p>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-3 text-sm">
              <p className="text-zinc-300">
                <span className="text-zinc-400">Customer:</span> {booking.guest_name || "Guest"}
              </p>
              <p className="text-zinc-300">
                <span className="text-zinc-400">Date:</span>{" "}
                {new Date(booking.start_datetime).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">Reason (optional)</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Staff unavailable, customer requested, etc."
                className="mt-1 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
                rows={2}
              />
              <p className="mt-1 text-xs text-zinc-400">
                This will be included in the customer notification and saved to the booking record.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="border-zinc-600 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white"
              >
                Go Back
              </Button>
              <Button
                variant="destructive"
                onClick={onCancelAppointment}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Appointment"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Normal edit view
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-zinc-300">Start</label>
                <Input 
                  type="datetime-local" 
                  value={start} 
                  onChange={(e) => setStart(e.target.value)} 
                  className="mt-1 bg-zinc-800 border-zinc-600 text-white" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300">End</label>
                <Input 
                  type="datetime-local" 
                  value={end} 
                  onChange={(e) => setEnd(e.target.value)} 
                  className="mt-1 bg-zinc-800 border-zinc-600 text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-zinc-300">Customer name</label>
                <Input 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)} 
                  className="mt-1 bg-zinc-800 border-zinc-600 text-white" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300">Phone</label>
                <Input 
                  value={guestPhone} 
                  onChange={(e) => setGuestPhone(e.target.value)} 
                  className="mt-1 bg-zinc-800 border-zinc-600 text-white" 
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <Input 
                value={guestEmail} 
                onChange={(e) => setGuestEmail(e.target.value)} 
                className="mt-1 bg-zinc-800 border-zinc-600 text-white" 
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">Estimated total</label>
              <Input
                inputMode="decimal"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="mt-1 bg-zinc-800 border-zinc-600 text-white"
                placeholder='Leave blank for "Estimate pending"'
              />
              <p className="mt-1 text-xs text-zinc-400">For request-only events, leave blank if the estimate isn't ready.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">Notes</label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="mt-1 bg-zinc-800 border-zinc-600 text-white" 
              />
            </div>

            {/* Cancel Appointment Section */}
            {!isAlreadyCancelled && (
              <div className="pt-3 border-t border-zinc-700">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full border-red-700 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 hover:border-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Appointment
                </Button>
              </div>
            )}

            {isAlreadyCancelled && (
              <div className="pt-3 border-t border-zinc-700">
                <div className="text-center text-sm text-red-400 bg-red-900/20 py-2 px-3 rounded border border-red-800">
                  This booking has already been cancelled
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer for edit mode (not shown during cancel confirmation) */}
        {!showCancelConfirm && booking && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={saving}
              className="border-zinc-600 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving || !booking}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
