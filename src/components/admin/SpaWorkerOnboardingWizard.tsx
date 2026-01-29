import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Copy, Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { useSpaWorkerAvailability } from "@/hooks/useSpaWorkerAvailability";
import { format } from "date-fns";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

// Generate time options from 6 AM to 10 PM
const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  const display = format(new Date(`2000-01-01T${time}`), "h:mm a");
  return { value: time, label: display };
});

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

type WeeklySchedule = Record<number, DaySchedule>;

const DEFAULT_SCHEDULE: WeeklySchedule = {
  0: { enabled: false, start: "10:00", end: "18:00" },
  1: { enabled: true, start: "09:00", end: "18:00" },
  2: { enabled: true, start: "09:00", end: "18:00" },
  3: { enabled: true, start: "09:00", end: "18:00" },
  4: { enabled: true, start: "09:00", end: "18:00" },
  5: { enabled: true, start: "09:00", end: "18:00" },
  6: { enabled: false, start: "10:00", end: "16:00" },
};

interface SpaWorkerOnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  workerName?: string;
}

export function SpaWorkerOnboardingWizard({ open, onComplete, workerName }: SpaWorkerOnboardingWizardProps) {
  const { currentWorker, saveSchedule, isSaving } = useSpaWorkerAvailability();
  const [step, setStep] = useState<"welcome" | "schedule" | "confirm">("welcome");
  const [schedule, setSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);

  const displayName = workerName || currentWorker?.first_name || "there";

  const handleDayChange = (day: number, field: keyof DaySchedule, value: boolean | string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const copyMondayToWeekdays = () => {
    const monday = schedule[1];
    setSchedule(prev => ({
      ...prev,
      1: monday,
      2: { ...monday },
      3: { ...monday },
      4: { ...monday },
      5: { ...monday },
    }));
  };

  const handleSaveAndComplete = async () => {
    if (!currentWorker?.id) return;

    const entries = Object.entries(schedule).map(([dayStr, config]) => ({
      worker_id: currentWorker.id,
      day_of_week: parseInt(dayStr),
      start_time: config.start + ":00",
      end_time: config.end + ":00",
      is_active: config.enabled,
    }));

    await saveSchedule(entries);
    onComplete();
  };

  const activeDays = Object.entries(schedule).filter(([_, config]) => config.enabled).length;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto [&>button]:hidden">
        {/* Welcome Step */}
        {step === "welcome" && (
          <>
            <DialogHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-amber-400" />
              </div>
              <DialogTitle className="text-2xl text-white">Welcome to Restoration Lounge, {displayName}!</DialogTitle>
              <DialogDescription className="text-zinc-400 text-base mt-2">
                Let's set up your schedule so customers can start booking appointments with you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-4">
                  <h3 className="font-medium text-white mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    What you'll set up
                  </h3>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Your weekly working hours (days and times)</li>
                    <li>• Customers will only see slots during your available hours</li>
                    <li>• You can change this anytime from your schedule page</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep("schedule")} className="bg-amber-500 hover:bg-amber-600 text-black gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Schedule Step */}
        {step === "schedule" && (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                Set Your Weekly Hours
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Choose which days you work and your available hours for each day.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Quick action */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyMondayToWeekdays}
                  className="text-xs border-zinc-700 hover:bg-zinc-800 gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy Monday to weekdays
                </Button>
              </div>

              {/* Days list */}
              <div className="space-y-2">
                {DAYS_OF_WEEK.map(day => (
                  <div
                    key={day.value}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border border-zinc-800 bg-zinc-800/30"
                  >
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <Switch
                        checked={schedule[day.value]?.enabled ?? false}
                        onCheckedChange={(checked) => handleDayChange(day.value, "enabled", checked)}
                      />
                      <span className={`font-medium ${!schedule[day.value]?.enabled ? "text-zinc-500" : "text-white"}`}>
                        {day.label}
                      </span>
                    </div>

                    {schedule[day.value]?.enabled ? (
                      <div className="flex items-center gap-2 flex-wrap pl-8 sm:pl-0">
                        <Select
                          value={schedule[day.value]?.start || "09:00"}
                          onValueChange={(value) => handleDayChange(day.value, "start", value)}
                        >
                          <SelectTrigger className="w-[110px] bg-zinc-800 border-zinc-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {TIME_OPTIONS.map(time => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-zinc-500">to</span>
                        <Select
                          value={schedule[day.value]?.end || "18:00"}
                          onValueChange={(value) => handleDayChange(day.value, "end", value)}
                        >
                          <SelectTrigger className="w-[110px] bg-zinc-800 border-zinc-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {TIME_OPTIONS.map(time => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="ml-8 sm:ml-0 text-zinc-500 bg-zinc-800">
                        Day off
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {activeDays === 0 && (
                <p className="text-sm text-orange-400 text-center">
                  Please enable at least one day so customers can book with you.
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-800">
              <Button variant="ghost" onClick={() => setStep("welcome")} className="text-zinc-400">
                Back
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                disabled={activeDays === 0}
                className="bg-amber-500 hover:bg-amber-600 text-black gap-2"
              >
                Review & Save
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Confirm Step */}
        {step === "confirm" && (
          <>
            <DialogHeader className="pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <DialogTitle className="text-2xl text-white text-center">Your Schedule is Ready!</DialogTitle>
              <DialogDescription className="text-zinc-400 text-center text-base">
                Here's a summary of your availability. Customers will be able to book during these times.
              </DialogDescription>
            </DialogHeader>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4">
                <h3 className="font-medium text-white mb-3">Your Working Hours</h3>
                <div className="space-y-2">
                  {DAYS_OF_WEEK.map(day => {
                    const config = schedule[day.value];
                    if (!config?.enabled) return null;

                    const startDisplay = TIME_OPTIONS.find(t => t.value === config.start)?.label || config.start;
                    const endDisplay = TIME_OPTIONS.find(t => t.value === config.end)?.label || config.end;

                    return (
                      <div key={day.value} className="flex justify-between text-sm">
                        <span className="text-zinc-400">{day.label}</span>
                        <span className="text-white">{startDisplay} – {endDisplay}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-700">
                  <p className="text-sm text-zinc-400">
                    <strong className="text-amber-400">{activeDays} days</strong> per week
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4 border-t border-zinc-800 mt-4">
              <Button variant="ghost" onClick={() => setStep("schedule")} className="text-zinc-400">
                Edit Schedule
              </Button>
              <Button
                onClick={handleSaveAndComplete}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Save & Start Booking
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
