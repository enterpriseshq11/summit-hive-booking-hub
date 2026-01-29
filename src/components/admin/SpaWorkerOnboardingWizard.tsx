import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, Copy, Calendar, Clock, ArrowRight, Sparkles, Plus, Trash2, DollarSign, Heart } from "lucide-react";
import { useSpaWorkerAvailability } from "@/hooks/useSpaWorkerAvailability";
import { useMyServices, useCreateService, useDeleteService } from "@/hooks/useSpaWorkerServices";
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

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "2 hours" },
];

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

interface NewServiceForm {
  name: string;
  description: string;
  duration_mins: number;
  price: string;
}

const EMPTY_SERVICE: NewServiceForm = {
  name: "",
  description: "",
  duration_mins: 60,
  price: "",
};

interface SpaWorkerOnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  workerName?: string;
}

export function SpaWorkerOnboardingWizard({ open, onComplete, workerName }: SpaWorkerOnboardingWizardProps) {
  const { currentWorker, saveSchedule, completeOnboarding, isSaving, isCompletingOnboarding, hasAvailability } = useSpaWorkerAvailability();
  const { data: myServices = [], isLoading: isLoadingServices } = useMyServices();
  const createServiceMutation = useCreateService();
  const deleteServiceMutation = useDeleteService();
  
  // Determine starting step based on existing data
  const [step, setStep] = useState<"welcome" | "schedule" | "services" | "confirm">("welcome");
  const [schedule, setSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);
  const [newService, setNewService] = useState<NewServiceForm>(EMPTY_SERVICE);
  const [showServiceForm, setShowServiceForm] = useState(false);

  // Start at services step if schedule already set
  useEffect(() => {
    if (hasAvailability && myServices.length === 0 && step === "welcome") {
      setStep("services");
    }
  }, [hasAvailability, myServices.length, step]);

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

  const handleSaveSchedule = async () => {
    if (!currentWorker?.id) return;

    const entries = Object.entries(schedule).map(([dayStr, config]) => ({
      worker_id: currentWorker.id,
      day_of_week: parseInt(dayStr),
      start_time: config.start + ":00",
      end_time: config.end + ":00",
      is_active: config.enabled,
    }));

    await saveSchedule(entries);
    setStep("services");
  };

  const handleAddService = async () => {
    if (!currentWorker?.id || !newService.name || !newService.price) return;

    await createServiceMutation.mutateAsync({
      worker_id: currentWorker.id,
      name: newService.name,
      description: newService.description || null,
      duration_mins: newService.duration_mins,
      price: parseFloat(newService.price),
      promo_price: null,
      promo_ends_at: null,
      is_free: false,
      is_active: true,
      sort_order: myServices.length,
      icon_name: "heart",
    });

    setNewService(EMPTY_SERVICE);
    setShowServiceForm(false);
  };

  const handleDeleteService = async (serviceId: string) => {
    await deleteServiceMutation.mutateAsync(serviceId);
  };

  const handleFinalComplete = async () => {
    await completeOnboarding();
    onComplete();
  };

  const activeDays = Object.entries(schedule).filter(([_, config]) => config.enabled).length;
  const hasServices = myServices.length > 0;

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
                Let's set up your profile so customers can start booking appointments with you.
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
                    <li>• Your services and pricing</li>
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

              <div className="space-y-2">
                {DAYS_OF_WEEK.map(day => (
                  <div
                    key={day.value}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border border-zinc-600 bg-zinc-700/40"
                  >
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <Switch
                        checked={schedule[day.value]?.enabled ?? false}
                        onCheckedChange={(checked) => handleDayChange(day.value, "enabled", checked)}
                      />
                      <span className={`font-medium ${!schedule[day.value]?.enabled ? "text-zinc-400" : "text-white"}`}>
                        {day.label}
                      </span>
                    </div>

                    {schedule[day.value]?.enabled ? (
                      <div className="flex items-center gap-2 flex-wrap pl-8 sm:pl-0">
                        <Select
                          value={schedule[day.value]?.start || "09:00"}
                          onValueChange={(value) => handleDayChange(day.value, "start", value)}
                        >
                          <SelectTrigger className="w-[110px] bg-zinc-700 border-zinc-500 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-700 border-zinc-500">
                            {TIME_OPTIONS.map(time => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-zinc-300 font-medium">to</span>
                        <Select
                          value={schedule[day.value]?.end || "18:00"}
                          onValueChange={(value) => handleDayChange(day.value, "end", value)}
                        >
                          <SelectTrigger className="w-[110px] bg-zinc-700 border-zinc-500 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-700 border-zinc-500">
                            {TIME_OPTIONS.map(time => (
                              <SelectItem key={time.value} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="ml-8 sm:ml-0 text-zinc-300 bg-zinc-600">
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
                onClick={handleSaveSchedule}
                disabled={activeDays === 0 || isSaving}
                className="bg-amber-500 hover:bg-amber-600 text-black gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next: Add Services
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Services Step */}
        {step === "services" && (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-amber-400" />
                Add Your Services
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add at least one service to display on your booking page.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Existing services list */}
              {myServices.length > 0 && (
                <div className="space-y-2">
                  {myServices.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-700 bg-zinc-800/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{service.name}</span>
                          <Badge variant="secondary" className="text-xs">{service.duration_mins} min</Badge>
                        </div>
                        {service.description && (
                          <p className="text-sm text-zinc-400 mt-1">{service.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-semibold">${Number(service.price).toFixed(0)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          disabled={deleteServiceMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add service form */}
              {showServiceForm ? (
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="service-name" className="text-white">Service Name *</Label>
                        <Input
                          id="service-name"
                          placeholder="e.g., Swedish Massage"
                          value={newService.name}
                          onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Duration *</Label>
                          <Select
                            value={newService.duration_mins.toString()}
                            onValueChange={(value) => setNewService(prev => ({ ...prev, duration_mins: parseInt(value) }))}
                          >
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              {DURATION_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value.toString()}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="service-price" className="text-white">Price *</Label>
                          <div className="relative mt-1">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                              id="service-price"
                              type="number"
                              placeholder="80"
                              value={newService.price}
                              onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                              className="bg-zinc-800 border-zinc-700 text-white pl-8"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="service-description" className="text-white">Description (optional)</Label>
                        <Textarea
                          id="service-description"
                          placeholder="Relaxing full-body massage using long flowing strokes..."
                          value={newService.description}
                          onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-zinc-800 border-zinc-700 text-white mt-1 h-20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setNewService(EMPTY_SERVICE);
                          setShowServiceForm(false);
                        }}
                        className="text-zinc-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddService}
                        disabled={!newService.name || !newService.price || createServiceMutation.isPending}
                        className="bg-amber-500 hover:bg-amber-600 text-black"
                      >
                        {createServiceMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Add Service"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
              <Button
                  variant="outline"
                  onClick={() => setShowServiceForm(true)}
                  className="w-full border-dashed border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              )}

              {!hasServices && (
                <p className="text-sm text-orange-400 text-center">
                  Add at least one service to continue.
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-800">
              <Button 
                variant="ghost" 
                onClick={() => setStep(hasAvailability ? "welcome" : "schedule")} 
                className="text-zinc-400"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                disabled={!hasServices}
                className="bg-amber-500 hover:bg-amber-600 text-black gap-2"
              >
                Review & Finish
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
              <DialogTitle className="text-2xl text-white text-center">Your Profile is Ready!</DialogTitle>
              <DialogDescription className="text-zinc-400 text-center text-base">
                Here's a summary. Once you save, customers can start booking with you.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-4">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    Working Hours
                  </h3>
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
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-4">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-amber-400" />
                    Your Services
                  </h3>
                  <div className="space-y-2">
                    {myServices.map(service => (
                      <div key={service.id} className="flex justify-between text-sm">
                        <span className="text-zinc-400">{service.name} ({service.duration_mins} min)</span>
                        <span className="text-amber-400">${Number(service.price).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-800 mt-4">
              <Button variant="ghost" onClick={() => setStep("services")} className="text-zinc-400">
                Edit Services
              </Button>
              <Button
                onClick={handleFinalComplete}
                disabled={isCompletingOnboarding}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {isCompletingOnboarding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Save & Go Live
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
