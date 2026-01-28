import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Plus, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO, isSameDay } from "date-fns";

interface TimeBlock {
  id?: string;
  start_time: string;
  end_time: string;
  is_blocked?: boolean;
}

interface DayAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  businessId?: string;
  providerId?: string;
  existingBookings?: any[];
  onSuccess?: () => void;
}

export function DayAvailabilityModal({
  open,
  onOpenChange,
  selectedDate,
  businessId,
  providerId,
  existingBookings = [],
  onSuccess
}: DayAvailabilityModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullDayUnavailable, setFullDayUnavailable] = useState(false);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<TimeBlock[]>([]);
  const [blockedBlocks, setBlockedBlocks] = useState<TimeBlock[]>([]);
  const [existingBlackoutId, setExistingBlackoutId] = useState<string | null>(null);

  // Get bookings for this day
  const dayBookings = useMemo(() => {
    if (!selectedDate || !existingBookings) return [];
    return existingBookings.filter((b: any) => {
      const bookingDate = new Date(b.start_datetime);
      return isSameDay(bookingDate, selectedDate);
    });
  }, [selectedDate, existingBookings]);

  // Load existing availability and blackouts for the selected date
  useEffect(() => {
    if (!open || !selectedDate) return;

    const loadData = async () => {
      setLoading(true);

      try {
        const dayOfWeek = selectedDate.getDay();
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        // Get availability windows for this day of week
        const { data: windows } = await supabase
          .from("availability_windows")
          .select("*")
          .eq("day_of_week", dayOfWeek)
          .eq("is_active", true);

        // Filter by provider or business if applicable
        const relevantWindows = (windows || []).filter(w => {
          if (providerId && w.provider_id === providerId) return true;
          if (!providerId && !w.provider_id) return true;
          return false;
        });

        if (relevantWindows.length > 0) {
          setAvailabilityBlocks(relevantWindows.map(w => ({
            id: w.id,
            start_time: w.start_time.slice(0, 5), // HH:mm format
            end_time: w.end_time.slice(0, 5)
          })));
        } else {
          // Default availability if none set
          setAvailabilityBlocks([{ start_time: "09:00", end_time: "17:00" }]);
        }

        // Get blackout dates for this specific date
        const startOfDay = `${dateStr}T00:00:00`;
        const endOfDay = `${dateStr}T23:59:59`;

        const { data: blackouts } = await supabase
          .from("blackout_dates")
          .select("*")
          .gte("start_datetime", startOfDay)
          .lte("start_datetime", endOfDay);

        // Check for full-day blackout
        const fullDayBlackout = (blackouts || []).find(b => {
          const start = new Date(b.start_datetime);
          const end = new Date(b.end_datetime);
          // If it spans from midnight to midnight (or close), it's full day
          return start.getHours() === 0 && end.getHours() === 23;
        });

        if (fullDayBlackout) {
          setFullDayUnavailable(true);
          setExistingBlackoutId(fullDayBlackout.id);
        } else {
          setFullDayUnavailable(false);
          setExistingBlackoutId(null);
        }

        // Get partial blackouts (blocked time blocks)
        const partialBlackouts = (blackouts || []).filter(b => {
          const start = new Date(b.start_datetime);
          const end = new Date(b.end_datetime);
          return !(start.getHours() === 0 && end.getHours() === 23);
        });

        setBlockedBlocks(partialBlackouts.map(b => ({
          id: b.id,
          start_time: format(new Date(b.start_datetime), "HH:mm"),
          end_time: format(new Date(b.end_datetime), "HH:mm"),
          is_blocked: true
        })));

      } catch (error) {
        console.error("Failed to load availability:", error);
        toast.error("Failed to load availability data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, selectedDate, businessId, providerId]);

  const addAvailabilityBlock = () => {
    setAvailabilityBlocks([...availabilityBlocks, { start_time: "09:00", end_time: "17:00" }]);
  };

  const removeAvailabilityBlock = (index: number) => {
    if (availabilityBlocks.length > 1) {
      setAvailabilityBlocks(availabilityBlocks.filter((_, i) => i !== index));
    }
  };

  const updateAvailabilityBlock = (index: number, field: "start_time" | "end_time", value: string) => {
    const updated = [...availabilityBlocks];
    updated[index][field] = value;
    setAvailabilityBlocks(updated);
  };

  const addBlockedBlock = () => {
    setBlockedBlocks([...blockedBlocks, { start_time: "12:00", end_time: "13:00", is_blocked: true }]);
  };

  const removeBlockedBlock = (index: number) => {
    setBlockedBlocks(blockedBlocks.filter((_, i) => i !== index));
  };

  const updateBlockedBlock = (index: number, field: "start_time" | "end_time", value: string) => {
    const updated = [...blockedBlocks];
    updated[index][field] = value;
    setBlockedBlocks(updated);
  };

  const handleSave = async () => {
    if (!selectedDate) return;

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      // Handle full day unavailable
      if (fullDayUnavailable) {
        // Check for conflicting bookings
        if (dayBookings.length > 0) {
          const confirmed = window.confirm(
            `There are ${dayBookings.length} existing booking(s) on this day. Making the full day unavailable will not cancel them. Continue?`
          );
          if (!confirmed) {
            setSaving(false);
            return;
          }
        }

        // Delete existing partial blackouts for this day
        await supabase
          .from("blackout_dates")
          .delete()
          .gte("start_datetime", `${dateStr}T00:00:00`)
          .lte("start_datetime", `${dateStr}T23:59:59`);

        // Create full-day blackout
        if (!existingBlackoutId) {
          await supabase
            .from("blackout_dates")
            .insert({
              business_id: businessId,
              provider_id: providerId,
              start_datetime: `${dateStr}T00:00:00`,
              end_datetime: `${dateStr}T23:59:59`,
              reason: "Full day unavailable",
              created_by: user?.id
            });
        }
      } else {
        // Remove full-day blackout if it exists
        if (existingBlackoutId) {
          await supabase
            .from("blackout_dates")
            .delete()
            .eq("id", existingBlackoutId);
        }

        // Handle blocked time blocks
        // First, delete existing partial blackouts
        await supabase
          .from("blackout_dates")
          .delete()
          .gte("start_datetime", `${dateStr}T00:00:00`)
          .lte("start_datetime", `${dateStr}T23:59:59`);

        // Then insert new blocked blocks
        if (blockedBlocks.length > 0) {
          const blockedInserts = blockedBlocks.map(block => ({
            business_id: businessId,
            provider_id: providerId,
            start_datetime: `${dateStr}T${block.start_time}:00`,
            end_datetime: `${dateStr}T${block.end_time}:00`,
            reason: "Time blocked",
            created_by: user?.id
          }));

          await supabase
            .from("blackout_dates")
            .insert(blockedInserts);
        }
      }

      // Log to audit
      await supabase.from("audit_log").insert([{
        action_type: "availability_updated",
        entity_type: "availability",
        entity_id: dateStr,
        actor_user_id: user?.id,
        after_json: JSON.parse(JSON.stringify({
          date: dateStr,
          full_day_unavailable: fullDayUnavailable,
          blocked_blocks: blockedBlocks
        }))
      }]);

      toast.success("Availability updated");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to save availability:", error);
      toast.error(`Failed to save: ${error?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Manage Availability — {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Set availability windows or block specific times for this day.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Existing Bookings Warning */}
            {dayBookings.length > 0 && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-300">
                    {dayBookings.length} existing booking{dayBookings.length > 1 ? "s" : ""} on this day
                  </p>
                  <ul className="mt-1 text-amber-200/80 space-y-0.5">
                    {dayBookings.slice(0, 3).map((b: any) => (
                      <li key={b.id}>
                        {format(new Date(b.start_datetime), "h:mm a")} — {b.guest_name || "Guest"}
                      </li>
                    ))}
                    {dayBookings.length > 3 && (
                      <li>...and {dayBookings.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Full Day Toggle */}
            <div className="flex items-center justify-between bg-zinc-800 rounded-lg p-4">
              <div>
                <Label className="text-white font-medium">Mark Full Day Unavailable</Label>
                <p className="text-sm text-zinc-400 mt-0.5">
                  Block the entire day from new bookings
                </p>
              </div>
              <Switch
                checked={fullDayUnavailable}
                onCheckedChange={setFullDayUnavailable}
              />
            </div>

            {/* Availability Blocks (only if not full day unavailable) */}
            {!fullDayUnavailable && (
              <>
                {/* Current Availability */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-zinc-300">Available Hours</Label>
                  </div>
                  
                  {availabilityBlocks.map((block, index) => (
                    <div key={index} className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded">
                      <div className="flex items-center gap-2 flex-1">
                        <Clock className="h-4 w-4 text-green-400" />
                        <Input
                          type="time"
                          value={block.start_time}
                          onChange={(e) => updateAvailabilityBlock(index, "start_time", e.target.value)}
                          className="w-28 bg-zinc-700 border-zinc-600 text-white"
                        />
                        <span className="text-zinc-400">to</span>
                        <Input
                          type="time"
                          value={block.end_time}
                          onChange={(e) => updateAvailabilityBlock(index, "end_time", e.target.value)}
                          className="w-28 bg-zinc-700 border-zinc-600 text-white"
                        />
                      </div>
                      {availabilityBlocks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAvailabilityBlock(index)}
                          className="text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAvailabilityBlock}
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Availability Window
                  </Button>
                </div>

                {/* Blocked Times */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-zinc-300">Blocked Times (Unavailable)</Label>
                  </div>
                  
                  {blockedBlocks.length === 0 ? (
                    <p className="text-sm text-zinc-500">No specific times blocked</p>
                  ) : (
                    blockedBlocks.map((block, index) => (
                      <div key={index} className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 p-2 rounded">
                        <div className="flex items-center gap-2 flex-1">
                          <Clock className="h-4 w-4 text-red-400" />
                          <Input
                            type="time"
                            value={block.start_time}
                            onChange={(e) => updateBlockedBlock(index, "start_time", e.target.value)}
                            className="w-28 bg-zinc-700 border-zinc-600 text-white"
                          />
                          <span className="text-zinc-400">to</span>
                          <Input
                            type="time"
                            value={block.end_time}
                            onChange={(e) => updateBlockedBlock(index, "end_time", e.target.value)}
                            className="w-28 bg-zinc-700 border-zinc-600 text-white"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBlockedBlock(index)}
                          className="text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addBlockedBlock}
                    className="border-red-800 text-red-300 hover:bg-red-900/30"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Block Time Slot
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="border-zinc-600 text-white hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-accent text-black hover:bg-accent/90"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
