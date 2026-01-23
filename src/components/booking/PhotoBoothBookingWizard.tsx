import { useMemo, useRef, useState } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { useAvailability } from "@/hooks/useAvailability";
import { 
  Clock, 
  Minus, 
  Plus, 
  Check, 
  PartyPopper, 
  GraduationCap,
  Info,
  AlertCircle
} from "lucide-react";

type Step = "duration" | "calendar" | "time" | "contact";

const HOURLY_RATE = 45;
const MIN_HOURS = 1;
const MAX_HOURS = 6;

// Event add-on packages (display only)
const EVENT_ADDONS = [
  {
    id: "birthday",
    name: "Birthday Party Add-On",
    price: 50,
    icon: PartyPopper,
    description: "Custom birthday overlay + props pack",
  },
  {
    id: "graduation",
    name: "Grad Party Add-On",
    price: 150,
    icon: GraduationCap,
    description: "Premium graduation branding + red carpet setup",
  },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function roundCurrency(n: number) {
  return Math.round(n * 100) / 100;
}

function computeDeposit(total: number, depositPercent = 33, minDeposit = 20) {
  const pct = roundCurrency((total * depositPercent) / 100);
  const deposit = total <= 0 ? 0 : Math.max(pct, minDeposit);
  const clamped = Math.min(deposit, total);
  return {
    deposit: clamped,
    remaining: roundCurrency(Math.max(0, total - clamped)),
  };
}

export function PhotoBoothBookingWizard({
  depositPercent = 33,
  minDeposit = 20,
}: {
  depositPercent?: number;
  minDeposit?: number;
}) {
  const today = startOfToday();
  const calendarStepRef = useRef<HTMLDivElement>(null);
  const timeStepRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("duration");
  const [selectedHours, setSelectedHours] = useState(2);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { data: businesses } = useBusinesses();
  const business = businesses?.find((b) => b.type === "photo_booth");

  const { data: bookableTypes } = useBookableTypes(business?.id);
  const bookableType = bookableTypes?.[0];

  const durationMins = selectedHours * 60;
  const rangeStart = format(today, "yyyy-MM-dd");
  const rangeEnd = format(addDays(today, 60), "yyyy-MM-dd");

  // Range availability for calendar coloring
  const rangeAvailability = useAvailability(
    {
      business_type: "photo_booth",
      bookable_type_id: bookableType?.id,
      start_date: rangeStart,
      end_date: rangeEnd,
      duration_mins: durationMins,
    },
    !!bookableType?.id && step !== "duration"
  );

  // Day-specific availability
  const dayAvailability = useAvailability(
    {
      business_type: "photo_booth",
      bookable_type_id: bookableType?.id,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
      duration_mins: durationMins,
    },
    !!bookableType?.id && !!selectedDate && (step === "time" || step === "contact")
  );

  const availabilityByDay = useMemo(() => {
    const map: Record<string, boolean> = {};
    const slots = rangeAvailability.data?.slots || [];
    for (const s of slots) {
      const dayKey = s.start_time.slice(0, 10);
      map[dayKey] = true;
    }
    return map;
  }, [rangeAvailability.data?.slots]);

  const disabledDays = useMemo(() => {
    if (step === "duration") return undefined;
    const days: Date[] = [];
    for (let i = 0; i <= 60; i++) {
      const d = addDays(today, i);
      const key = format(d, "yyyy-MM-dd");
      if (!availabilityByDay[key]) days.push(d);
    }
    return days;
  }, [availabilityByDay, step, today]);

  // Slot holds are now created server-side in experience-checkout edge function

  const total = selectedHours * HOURLY_RATE;
  const { deposit, remaining } = computeDeposit(total, depositPercent, minDeposit);

  const handleSelectDuration = () => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setStep("calendar");
    setTimeout(() => calendarStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep("time");
    setTimeout(() => timeStepRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const proceedToPayment = async () => {
    console.info("[PHOTO_BOOTH_CHECKOUT] Proceed to Payment clicked", {
      step,
      selectedHours,
      selectedDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      selectedSlotId: selectedSlot?.id,
    });

    setPaymentError(null);

    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a date and time.");
      return;
    }
    if (!guestInfo.name.trim() || !guestInfo.email.trim() || !guestInfo.phone.trim()) {
      toast.error("Please enter your name, email, and phone.");
      return;
    }
    if (!isValidEmail(guestInfo.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Slot hold is now created server-side in the edge function
      const payload = {
        business_type: "photo_booth",
        bookable_type_id: bookableType?.id,
        resource_id: selectedSlot.resource_id,
        start_datetime: selectedSlot.start_time,
        end_datetime: selectedSlot.end_time,
        duration_hours: selectedHours,
        hourly_rate: HOURLY_RATE,
        total_amount: total,
        customer_name: guestInfo.name.trim(),
        customer_email: guestInfo.email.trim(),
        customer_phone: guestInfo.phone.trim(),
      };

      console.info("[PHOTO_BOOTH_CHECKOUT] Invoking experience-checkout", payload);

      const { data, error } = await supabase.functions.invoke("experience-checkout", {
        body: payload,
      });

      if (error) {
        console.error("[PHOTO_BOOTH_CHECKOUT] experience-checkout error", error);
        // Try to extract error message from response context
        const context = (error as any)?.context;
        if (context instanceof Response) {
          try {
            const text = await context.text();
            const json = JSON.parse(text);
            throw new Error(json?.error || "Checkout failed");
          } catch {
            throw new Error("Unable to proceed to payment");
          }
        }
        throw error;
      }
      
      if (!data?.url) {
        console.error("[PHOTO_BOOTH_CHECKOUT] Missing checkout URL", data);
        throw new Error(data?.error || "Checkout session failed");
      }

      const checkoutUrl = String(data.url);
      console.info("[PHOTO_BOOTH_CHECKOUT] Checkout session created", {
        booking_id: data?.booking_id,
        session_id: data?.session_id,
        url: checkoutUrl,
      });

      if (!/^https?:\/\//i.test(checkoutUrl)) {
        throw new Error("Checkout returned an invalid URL");
      }

      // Match Voice Vault: open in a new tab to avoid losing app state / blank screens
      console.info("[PHOTO_BOOTH_CHECKOUT] Redirect attempt", { method: "window.open" });
      const opened = window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        console.info("[PHOTO_BOOTH_CHECKOUT] Popup blocked, falling back to same-tab redirect");
        window.location.assign(checkoutUrl);
      } else {
        toast.success("Redirecting to secure payment...");
      }
    } catch (err: any) {
      const message = err?.message || "Unable to proceed to payment.";
      console.error("[PHOTO_BOOTH_CHECKOUT] Failed", { message, err });
      toast.error(message);
      setPaymentError("Payment couldn’t load. Please try again or contact us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = dayAvailability.data?.slots || [];
  const isLoadingSlots = dayAvailability.isLoading;

  return (
    <div className="space-y-6">
      {/* Step 1: Duration Selection */}
      {step === "duration" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Duration</h3>
            <p className="text-sm text-muted-foreground">
              Choose how many hours you need. Attendant, setup, and teardown included.
            </p>

            {/* Hours Stepper */}
            <Card className="border-accent/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      disabled={selectedHours <= MIN_HOURS}
                      onClick={() => setSelectedHours((h) => Math.max(MIN_HOURS, h - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-center min-w-[80px]">
                      <span className="text-4xl font-bold">{selectedHours}</span>
                      <span className="text-lg text-muted-foreground ml-1">
                        {selectedHours === 1 ? "hour" : "hours"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      disabled={selectedHours >= MAX_HOURS}
                      onClick={() => setSelectedHours((h) => Math.min(MAX_HOURS, h + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-accent">${total}</div>
                    <div className="text-sm text-muted-foreground">
                      ${HOURLY_RATE}/hr
                    </div>
                  </div>
                </div>

                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  {[1, 2, 3, 4, 5, 6].map((h) => (
                    <Button
                      key={h}
                      type="button"
                      variant={selectedHours === h ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "min-w-[60px]",
                        selectedHours === h && "bg-accent text-primary hover:bg-accent/90"
                      )}
                      onClick={() => setSelectedHours(h)}
                    >
                      {h} hr
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              type="button"
              className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold py-6"
              onClick={handleSelectDuration}
            >
              Continue - Select Date & Time
            </Button>
          </div>

          <Separator />

          {/* Event Add-On Packages (Display Only) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Event Add-On Packages</h3>
              <Badge variant="outline" className="text-xs">
                Event Center Only
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {EVENT_ADDONS.map((addon) => {
                const Icon = addon.icon;
                return (
                  <Card
                    key={addon.id}
                    className="border-border/50 bg-muted/30 cursor-not-allowed opacity-75"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {addon.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {addon.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-semibold text-muted-foreground">
                          +${addon.price}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                These add-on packages are only available when you book an Event Center reservation. 
                You'll select them during the Event Center booking flow.{" "}
                <a href="/#/summit" className="text-accent hover:underline">
                  Learn more about Event Center bookings →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Calendar */}
      {step !== "duration" && (
        <div ref={calendarStepRef} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedHours} {selectedHours === 1 ? "hour" : "hours"} • ${total}
            </Badge>
            {selectedDate && (
              <Badge variant="secondary" className="text-xs">
                {format(selectedDate, "MMM d")}
              </Badge>
            )}
            {selectedSlot && (
              <Badge variant="secondary" className="text-xs">
                {format(new Date(selectedSlot.start_time), "h:mm a")}
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => {
                setStep("duration");
                setSelectedDate(undefined);
                setSelectedSlot(null);
              }}
            >
              Change Duration
            </Button>
          </div>

          <h3 className="text-lg font-semibold">Select a Date</h3>
          <div className="rounded-lg border border-border p-3 bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelectDate}
              disabled={disabledDays}
              fromDate={today}
              toDate={addDays(today, 60)}
              modifiers={{ available: (d) => availabilityByDay[format(d, "yyyy-MM-dd")] === true }}
              modifiersClassNames={{ available: "bg-accent/10" }}
            />
          </div>
          {rangeAvailability.isLoading && (
            <p className="text-sm text-muted-foreground">Loading availability...</p>
          )}
          {rangeAvailability.isError && (
            <p className="text-sm text-destructive">Unable to load availability.</p>
          )}
        </div>
      )}

      {/* Step 3: Time */}
      {step === "time" && (
        <div ref={timeStepRef} className="space-y-3">
          <h3 className="text-lg font-semibold">Select a Time</h3>
          {isLoadingSlots ? (
            <p className="text-sm text-muted-foreground">Loading times...</p>
          ) : timeSlots.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No available times for this date. Please select another date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <Button
                    key={slot.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={cn("justify-center", isSelected && "bg-accent text-primary hover:bg-accent/90")}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setStep("contact");
                    }}
                  >
                    {format(new Date(slot.start_time), "h:mm a")}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Contact + Review & Pay */}
      {step === "contact" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review & Pay</h3>

          <Card className="border-border">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Duration</span>
                <span className="text-sm font-medium">
                  {selectedHours} {selectedHours === 1 ? "hour" : "hours"} @ ${HOURLY_RATE}/hr
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Date & Time</span>
                <span className="text-sm font-medium">
                  {selectedDate && format(selectedDate, "MMM d, yyyy")} at{" "}
                  {selectedSlot && format(new Date(selectedSlot.start_time), "h:mm a")}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold">${total}</span>
              </div>
              <div className="flex justify-between items-center text-accent">
                <span className="text-sm font-medium">Deposit Due Today ({depositPercent}%)</span>
                <span className="text-lg font-bold">${deposit.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="text-sm">Remaining Balance (due on arrival)</span>
                <span className="text-sm">${remaining.toFixed(0)}</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Your deposit reserves this time slot and is applied toward your total. Remaining balance is due at check-in.
              </p>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="photo-booth-name">Name</Label>
              <Input
                id="photo-booth-name"
                value={guestInfo.name}
                onChange={(e) => setGuestInfo((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photo-booth-email">Email</Label>
              <Input
                id="photo-booth-email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photo-booth-phone">Phone</Label>
              <Input
                id="photo-booth-phone"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo((p) => ({ ...p, phone: e.target.value }))}
                placeholder="(###) ###-####"
              />
            </div>
          </div>

          {paymentError && (
            <Alert>
              <AlertTitle>Payment couldn’t load</AlertTitle>
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("time")}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              className="bg-accent text-primary hover:bg-accent/90 flex-1"
              onClick={proceedToPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
