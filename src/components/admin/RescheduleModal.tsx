import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Plus, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ProposedTime {
  date: string;
  time: string;
}

interface RescheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSuccess?: () => void;
}

export function RescheduleModal({ open, onOpenChange, booking, onSuccess }: RescheduleModalProps) {
  const [proposedTimes, setProposedTimes] = useState<ProposedTime[]>([
    { date: "", time: "" }
  ]);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  const addProposedTime = () => {
    if (proposedTimes.length < 3) {
      setProposedTimes([...proposedTimes, { date: "", time: "" }]);
    }
  };

  const removeProposedTime = (index: number) => {
    if (proposedTimes.length > 1) {
      setProposedTimes(proposedTimes.filter((_, i) => i !== index));
    }
  };

  const updateProposedTime = (index: number, field: "date" | "time", value: string) => {
    const updated = [...proposedTimes];
    updated[index][field] = value;
    setProposedTimes(updated);
  };

  const isValidTime = (pt: ProposedTime) => pt.date && pt.time;

  const handleSubmit = async () => {
    const validTimes = proposedTimes.filter(isValidTime);
    
    if (validTimes.length === 0) {
      toast.error("Please provide at least one proposed date and time");
      return;
    }

    setSending(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Generate a unique confirmation token
      const confirmationToken = crypto.randomUUID();

      // Calculate duration from original booking
      const originalStart = new Date(booking.start_datetime);
      const originalEnd = new Date(booking.end_datetime);
      const durationMs = originalEnd.getTime() - originalStart.getTime();

      // Format proposed times as ISO datetimes
      const proposedTimesData = validTimes.map(pt => {
        const dateTime = new Date(`${pt.date}T${pt.time}`);
        return {
          start: dateTime.toISOString(),
          end: new Date(dateTime.getTime() + durationMs).toISOString(),
          formatted: format(dateTime, "EEEE, MMMM d 'at' h:mm a")
        };
      });

      // Create reschedule request record
      const { data: rescheduleRequest, error: insertError } = await supabase
        .from("reschedule_requests")
        .insert({
          booking_id: booking.id,
          initiated_by: user?.id,
          reason: reason || null,
          proposed_times: proposedTimesData,
          original_start_datetime: booking.start_datetime,
          original_end_datetime: booking.end_datetime,
          confirmation_token: confirmationToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          status: "pending"
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update booking status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "reschedule_requested" })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // Log to audit
      await supabase.from("audit_log").insert([{
        action_type: "reschedule_requested",
        entity_type: "bookings",
        entity_id: booking.id,
        actor_user_id: user?.id,
        before_json: JSON.parse(JSON.stringify({ status: booking.status, start_datetime: booking.start_datetime })),
        after_json: JSON.parse(JSON.stringify({ status: "reschedule_requested", proposed_times: proposedTimesData }))
      }]);

      // Send notification to customer
      try {
        await supabase.functions.invoke("send-booking-notification", {
          body: {
            booking_id: booking.id,
            notification_type: "reschedule_request",
            channels: ["email", "sms"],
            recipients: ["customer"],
            extra_data: {
              reschedule_request_id: rescheduleRequest.id,
              proposed_times: proposedTimesData,
              reason: reason,
              confirmation_token: confirmationToken
            }
          }
        });
      } catch (notifyErr) {
        console.warn("Reschedule notification may not have sent:", notifyErr);
      }

      toast.success("Reschedule request sent to customer");
      
      // Reset form
      setProposedTimes([{ date: "", time: "" }]);
      setReason("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Reschedule error:", error);
      toast.error(`Failed to send reschedule request: ${error?.message || "Unknown error"}`);
    } finally {
      setSending(false);
    }
  };

  const resetAndClose = () => {
    setProposedTimes([{ date: "", time: "" }]);
    setReason("");
    onOpenChange(false);
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-lg bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Reschedule Appointment</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Propose new times for the customer to choose from. They will receive an email/SMS to confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Booking Info */}
          <div className="bg-zinc-800 rounded-lg p-3 text-sm">
            <p className="text-zinc-300">
              <span className="text-zinc-500">Customer:</span> {booking.guest_name || "Guest"}
            </p>
            <p className="text-zinc-300">
              <span className="text-zinc-500">Current Time:</span>{" "}
              {format(new Date(booking.start_datetime), "EEEE, MMMM d 'at' h:mm a")}
            </p>
          </div>

          {/* Proposed Times */}
          <div className="space-y-3">
            <Label className="text-zinc-300">Proposed New Times (up to 3)</Label>
            
            {proposedTimes.map((pt, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="date"
                      value={pt.date}
                      onChange={(e) => updateProposedTime(index, "date", e.target.value)}
                      className="pl-10 bg-zinc-800 border-zinc-600 text-white"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="relative w-32">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="time"
                      value={pt.time}
                      onChange={(e) => updateProposedTime(index, "time", e.target.value)}
                      className="pl-10 bg-zinc-800 border-zinc-600 text-white"
                    />
                  </div>
                </div>
                {proposedTimes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProposedTime(index)}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {proposedTimes.length < 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addProposedTime}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Another Option
              </Button>
            )}
          </div>

          {/* Reason */}
          <div>
            <Label className="text-zinc-300">Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Schedule conflict, provider unavailable..."
              className="mt-1 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
              rows={2}
            />
          </div>

          {/* Info */}
          <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 text-sm text-blue-300">
            <p>The customer will receive:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-blue-200">
              <li>Email with proposed times and confirm link</li>
              <li>SMS notification (if phone available)</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={resetAndClose}
            disabled={sending}
            className="border-zinc-600 text-white hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={sending || !proposedTimes.some(isValidTime)}
            className="bg-accent text-black hover:bg-accent/90"
          >
            {sending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Reschedule Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
