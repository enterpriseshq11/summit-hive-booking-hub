import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Booking</DialogTitle>
        </DialogHeader>

        {!booking ? (
          <div className="text-sm text-zinc-300">No booking selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-zinc-300">Start</label>
                <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300">End</label>
                <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-zinc-300">Customer name</label>
                <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300">Phone</label>
                <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <Input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="mt-1" />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">Estimated total</label>
              <Input
                inputMode="decimal"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="mt-1"
                placeholder='Leave blank for "Estimate pending"'
              />
              <p className="mt-1 text-xs text-zinc-400">For request-only events, leave blank if the estimate isn’t ready.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !booking}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
