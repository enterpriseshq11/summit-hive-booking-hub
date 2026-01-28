import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Plus, Trash2, AlertTriangle, Calendar, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";

interface TimeWindow {
  id?: string;
  start: string;
  end: string;
}

interface DayAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  businessId?: string;
  businessName?: string;
  providerId?: string;
  existingBookings?: any[];
  onSuccess?: () => void;
}

export function DayAvailabilityModal({
  open,
  onOpenChange,
  selectedDate,
  businessId,
  businessName,
  providerId,
  existingBookings = [],
  onSuccess
}: DayAvailabilityModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullDayUnavailable, setFullDayUnavailable] = useState(false);
  const [availabilityWindows, setAvailabilityWindows] = useState<TimeWindow[]>([]);
  const [existingOverrideId, setExistingOverrideId] = useState<string | null>(null);
  const [hasCustomOverride, setHasCustomOverride] = useState(false);

  // Get bookings for this day
  const dayBookings = useMemo(() => {
    if (!selectedDate || !existingBookings) return [];
    return existingBookings.filter((b: any) => {
      const bookingDate = new Date(b.start_datetime);
      return isSameDay(bookingDate, selectedDate);
    });
  }, [selectedDate, existingBookings]);

  // Get booked time ranges for conflict checking
  const bookedRanges = useMemo(() => {
    return dayBookings.map((b: any) => ({
      start: format(new Date(b.start_datetime), "HH:mm"),
      end: format(new Date(b.end_datetime), "HH:mm"),
      name: b.guest_name || "Booking"
    }));
  }, [dayBookings]);

  // Load existing availability override for the selected date
  useEffect(() => {
    if (!open || !selectedDate || !businessId) return;

    const loadData = async () => {
      setLoading(true);

      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        // Check for existing override for this date
        const { data: override, error } = await supabase
          .from("availability_overrides")
          .select("*")
          .eq("business_id", businessId)
          .eq("override_date", dateStr)
          .maybeSingle();

        if (error && error.code !== "PGRST116") throw error;

        if (override) {
          setExistingOverrideId(override.id);
          setFullDayUnavailable(override.is_unavailable);
          setHasCustomOverride(true);
          
          // Parse availability windows from JSON
          const windows = (override.availability_windows as any[] || []).map((w: any, idx: number) => ({
            id: `existing-${idx}`,
            start: w.start || "09:00",
            end: w.end || "17:00"
          }));
          
          setAvailabilityWindows(windows.length > 0 ? windows : [{ start: "09:00", end: "17:00" }]);
        } else {
          // No override exists - load default availability for this day of week
          setExistingOverrideId(null);
          setFullDayUnavailable(false);
          setHasCustomOverride(false);
          
          const dayOfWeek = selectedDate.getDay();
          
          const { data: defaultWindows } = await supabase
            .from("availability_windows")
            .select("*")
            .eq("day_of_week", dayOfWeek)
            .eq("is_active", true);

          if (defaultWindows && defaultWindows.length > 0) {
            setAvailabilityWindows(defaultWindows.map((w, idx) => ({
              id: `default-${idx}`,
              start: w.start_time?.slice(0, 5) || "09:00",
              end: w.end_time?.slice(0, 5) || "17:00"
            })));
          } else {
            // Default to 9-5 if no windows configured
            setAvailabilityWindows([{ start: "09:00", end: "17:00" }]);
          }
        }
      } catch (error) {
        console.error("Failed to load availability:", error);
        toast.error("Failed to load availability data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, selectedDate, businessId, providerId]);

  const addAvailabilityWindow = () => {
    setAvailabilityWindows([...availabilityWindows, { start: "09:00", end: "17:00" }]);
  };

  const removeAvailabilityWindow = (index: number) => {
    if (availabilityWindows.length > 1) {
      setAvailabilityWindows(availabilityWindows.filter((_, i) => i !== index));
    }
  };

  const updateAvailabilityWindow = (index: number, field: "start" | "end", value: string) => {
    const updated = [...availabilityWindows];
    updated[index] = { ...updated[index], [field]: value };
    setAvailabilityWindows(updated);
  };

  // Validate time windows
  const validateWindows = (): string | null => {
    for (let i = 0; i < availabilityWindows.length; i++) {
      const window = availabilityWindows[i];
      if (window.start >= window.end) {
        return `Window ${i + 1}: End time must be after start time`;
      }
    }

    // Check for overlapping windows
    for (let i = 0; i < availabilityWindows.length; i++) {
      for (let j = i + 1; j < availabilityWindows.length; j++) {
        const a = availabilityWindows[i];
        const b = availabilityWindows[j];
        if (a.start < b.end && a.end > b.start) {
          return `Windows ${i + 1} and ${j + 1} overlap`;
        }
      }
    }

    return null;
  };

  // Check if availability windows conflict with existing bookings
  const checkBookingConflicts = (): string[] => {
    if (fullDayUnavailable && dayBookings.length > 0) {
      return [`${dayBookings.length} existing booking(s) will remain but no new bookings can be made`];
    }

    const conflicts: string[] = [];
    for (const booking of bookedRanges) {
      let covered = false;
      for (const window of availabilityWindows) {
        if (booking.start >= window.start && booking.end <= window.end) {
          covered = true;
          break;
        }
      }
      if (!covered) {
        conflicts.push(`Booking at ${booking.start} - ${booking.end} (${booking.name}) is outside availability windows`);
      }
    }
    return conflicts;
  };

  const handleSave = async () => {
    if (!selectedDate || !businessId) return;

    // Validate
    if (!fullDayUnavailable) {
      const validationError = validateWindows();
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    // Check booking conflicts (warn but allow)
    const conflicts = checkBookingConflicts();
    if (conflicts.length > 0) {
      const proceed = window.confirm(
        `Warning:\n${conflicts.join("\n")}\n\nExisting bookings will remain but may be outside the new availability windows. Continue?`
      );
      if (!proceed) return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      // Prepare availability windows data
      const windowsData = fullDayUnavailable 
        ? [] 
        : availabilityWindows.map(w => ({ start: w.start, end: w.end }));

      if (existingOverrideId) {
        // Update existing override
        const { error } = await supabase
          .from("availability_overrides")
          .update({
            is_unavailable: fullDayUnavailable,
            availability_windows: windowsData,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingOverrideId);

        if (error) throw error;
      } else {
        // Insert new override
        const { error } = await supabase
          .from("availability_overrides")
          .insert({
            business_id: businessId,
            provider_id: providerId,
            override_date: dateStr,
            is_unavailable: fullDayUnavailable,
            availability_windows: windowsData,
            created_by: user?.id
          });

        if (error) throw error;
      }

      // Log to audit
      await supabase.from("audit_log").insert([{
        action_type: "availability_override_saved",
        entity_type: "availability_override",
        entity_id: dateStr,
        actor_user_id: user?.id,
        after_json: {
          date: dateStr,
          business_id: businessId,
          is_unavailable: fullDayUnavailable,
          availability_windows: windowsData
        }
      }]);

      toast.success("Availability saved for " + format(selectedDate, "MMM d, yyyy"));
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to save availability:", error);
      toast.error(`Failed to save: ${error?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!existingOverrideId) return;

    const confirmed = window.confirm(
      "This will remove the custom availability for this date and revert to the default schedule. Continue?"
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("availability_overrides")
        .delete()
        .eq("id", existingOverrideId);

      if (error) throw error;

      toast.success("Reset to default availability");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to reset: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Edit Availability — {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {businessName && <span className="text-accent">{businessName}</span>}
            {businessName && " • "}
            Set custom availability windows for this specific date. These will override default hours.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-zinc-400">Loading...</div>
        ) : (
          <div className="space-y-5">
            {/* Override indicator */}
            {hasCustomOverride && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-accent">Custom availability set for this date</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetToDefault}
                  className="text-zinc-400 hover:text-white text-xs"
                >
                  Reset to default
                </Button>
              </div>
            )}

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
                        {format(new Date(b.start_datetime), "h:mm a")} - {format(new Date(b.end_datetime), "h:mm a")} — {b.guest_name || "Guest"}
                      </li>
                    ))}
                    {dayBookings.length > 3 && (
                      <li>...and {dayBookings.length - 3} more</li>
                    )}
                  </ul>
                  <p className="mt-2 text-amber-200/60 text-xs">
                    Existing bookings will remain unaffected.
                  </p>
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

            {/* Availability Windows (only if not full day unavailable) */}
            {!fullDayUnavailable && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300 font-medium">Available Time Windows</Label>
                  <span className="text-xs text-zinc-500">Only these times will be bookable</span>
                </div>
                
                {availabilityWindows.map((window, index) => (
                  <div key={index} className="flex items-center gap-2 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="h-4 w-4 text-green-400" />
                      <Input
                        type="time"
                        value={window.start}
                        onChange={(e) => updateAvailabilityWindow(index, "start", e.target.value)}
                        className="w-28 bg-zinc-700 border-zinc-600 text-white"
                      />
                      <span className="text-zinc-400">to</span>
                      <Input
                        type="time"
                        value={window.end}
                        onChange={(e) => updateAvailabilityWindow(index, "end", e.target.value)}
                        className="w-28 bg-zinc-700 border-zinc-600 text-white"
                      />
                    </div>
                    {availabilityWindows.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAvailabilityWindow(index)}
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
                  onClick={addAvailabilityWindow}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time Window
                </Button>

                <p className="text-xs text-zinc-500 mt-2">
                  Example: 9:00-12:00 and 14:00-17:00 for a midday break
                </p>
              </div>
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
            {saving ? "Saving..." : "Save Availability"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
