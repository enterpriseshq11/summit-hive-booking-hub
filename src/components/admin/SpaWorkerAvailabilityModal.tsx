import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Copy } from "lucide-react";
import { 
  useSpaWorkerAvailability,
  useSaveWorkerAvailability,
  type SpaWorker,
  type SpaWorkerAvailability,
} from "@/hooks/useSpaWorkers";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

interface TimeWindow {
  start_time: string;
  end_time: string;
}

interface DayAvailability {
  enabled: boolean;
  windows: TimeWindow[];
}

interface SpaWorkerAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: SpaWorker | null;
}

export function SpaWorkerAvailabilityModal({ 
  open, 
  onOpenChange, 
  worker 
}: SpaWorkerAvailabilityModalProps) {
  const { data: existingAvailability = [], isLoading } = useSpaWorkerAvailability(worker?.id);
  const saveMutation = useSaveWorkerAvailability();

  const [availability, setAvailability] = useState<Record<number, DayAvailability>>({});
  const [copyFromDay, setCopyFromDay] = useState<number | null>(null);

  // Initialize availability from existing data
  useEffect(() => {
    if (!open) return;
    
    const initial: Record<number, DayAvailability> = {};
    
    DAYS_OF_WEEK.forEach(day => {
      const dayWindows = existingAvailability.filter(a => a.day_of_week === day.value);
      initial[day.value] = {
        enabled: dayWindows.length > 0,
        windows: dayWindows.length > 0 
          ? dayWindows.map(w => ({ start_time: w.start_time, end_time: w.end_time }))
          : [{ start_time: "09:00", end_time: "17:00" }],
      };
    });
    
    setAvailability(initial);
  }, [existingAvailability, open]);

  const handleDayToggle = (day: number, enabled: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
        windows: enabled && prev[day].windows.length === 0 
          ? [{ start_time: "09:00", end_time: "17:00" }] 
          : prev[day].windows,
      },
    }));
  };

  const handleAddWindow = (day: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        windows: [...prev[day].windows, { start_time: "09:00", end_time: "17:00" }],
      },
    }));
  };

  const handleRemoveWindow = (day: number, index: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        windows: prev[day].windows.filter((_, i) => i !== index),
      },
    }));
  };

  const handleWindowChange = (day: number, index: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        windows: prev[day].windows.map((w, i) => 
          i === index ? { ...w, [field]: value } : w
        ),
      },
    }));
  };

  const handleCopyToOtherDays = (fromDay: number) => {
    const sourceDay = availability[fromDay];
    if (!sourceDay) return;

    setAvailability(prev => {
      const updated = { ...prev };
      DAYS_OF_WEEK.forEach(day => {
        if (day.value !== fromDay) {
          updated[day.value] = {
            enabled: sourceDay.enabled,
            windows: sourceDay.windows.map(w => ({ ...w })),
          };
        }
      });
      return updated;
    });
    setCopyFromDay(fromDay);
    setTimeout(() => setCopyFromDay(null), 2000);
  };

  const handleSave = async () => {
    if (!worker) return;

    const availabilityToSave: Omit<SpaWorkerAvailability, "id">[] = [];

    Object.entries(availability).forEach(([dayStr, dayData]) => {
      const day = parseInt(dayStr);
      if (dayData.enabled) {
        dayData.windows.forEach(window => {
          availabilityToSave.push({
            worker_id: worker.id,
            day_of_week: day,
            start_time: window.start_time,
            end_time: window.end_time,
            is_active: true,
          });
        });
      }
    });

    await saveMutation.mutateAsync({
      workerId: worker.id,
      availability: availabilityToSave,
    });

    onOpenChange(false);
  };

  if (!worker) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            Availability - {worker.display_name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Set the hours when {worker.first_name} is available for bookings.
            </p>

            {DAYS_OF_WEEK.map(day => {
              const dayData = availability[day.value] || { enabled: false, windows: [] };
              
              return (
                <div 
                  key={day.value} 
                  className={`p-4 rounded-lg border ${
                    dayData.enabled 
                      ? "bg-zinc-800/50 border-zinc-700" 
                      : "bg-zinc-800/20 border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={dayData.enabled}
                        onCheckedChange={(checked) => handleDayToggle(day.value, checked)}
                      />
                      <Label className={dayData.enabled ? "text-white font-medium" : "text-zinc-500"}>
                        {day.label}
                      </Label>
                    </div>
                    {dayData.enabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToOtherDays(day.value)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        {copyFromDay === day.value ? "Copied!" : "Copy to all"}
                      </Button>
                    )}
                  </div>

                  {dayData.enabled && (
                    <div className="space-y-2 ml-10">
                      {dayData.windows.map((window, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={window.start_time}
                            onChange={(e) => handleWindowChange(day.value, idx, 'start_time', e.target.value)}
                            className="bg-zinc-700 border-zinc-600 text-white w-32"
                          />
                          <span className="text-zinc-400">to</span>
                          <Input
                            type="time"
                            value={window.end_time}
                            onChange={(e) => handleWindowChange(day.value, idx, 'end_time', e.target.value)}
                            className="bg-zinc-700 border-zinc-600 text-white w-32"
                          />
                          {dayData.windows.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveWindow(day.value, idx)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddWindow(day.value)}
                        className="text-amber-400 hover:text-amber-300"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add time window
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Availability
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
