import { useMemo, useRef, useState } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { BusinessType, BookableType, Package } from "@/types";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { usePackages } from "@/hooks/usePackages";
import { useAvailability, useCreateSlotHold, useReleaseSlotHold } from "@/hooks/useAvailability";
import { PackageSelector } from "@/components/booking/PackageSelector";

type Step = "service" | "calendar" | "time" | "contact";

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

export function ExperienceBookingWizard({
  businessType,
  checkoutFunction = "experience-checkout",
  depositPercent = 33,
  minDeposit = 20,
  requestOnly = false,
}: {
  businessType: BusinessType;
  checkoutFunction?: string;
  depositPercent?: number;
  minDeposit?: number;
  requestOnly?: boolean;
}) {
  const today = startOfToday();
  const calendarStepRef = useRef<HTMLDivElement>(null);
  const timeStepRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("service");
  const [selectedBookableTypeId, setSelectedBookableTypeId] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: businesses } = useBusinesses();
  const business = businesses?.find((b) => b.type === businessType);

  const { data: bookableTypes } = useBookableTypes(business?.id);

  const effectiveBookableTypeId = selectedBookableTypeId || (bookableTypes?.[0]?.id ?? "");
  const effectiveBookableType: BookableType | undefined = bookableTypes?.find(
    (bt) => bt.id === effectiveBookableTypeId
  );

  const { data: packages } = usePackages(effectiveBookableTypeId || undefined);

  const durationMins = selectedPackage?.duration_mins || effectiveBookableType?.min_duration_mins || 60;
  const rangeStart = format(today, "yyyy-MM-dd");
  const rangeEnd = format(addDays(today, 30), "yyyy-MM-dd");

  // Range availability map for calendar coloring
  const rangeAvailability = useAvailability(
    {
      business_type: businessType,
      bookable_type_id: effectiveBookableTypeId || undefined,
      start_date: rangeStart,
      end_date: rangeEnd,
      duration_mins: durationMins,
    },
    !!effectiveBookableTypeId && !!selectedPackage
  );

  const dayAvailability = useAvailability(
    {
      business_type: businessType,
      bookable_type_id: effectiveBookableTypeId || undefined,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
      duration_mins: durationMins,
    },
    !!effectiveBookableTypeId && !!selectedPackage && !!selectedDate && step !== "service"
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
    // Disable days with no availability in the 30-day window (once package picked)
    if (!selectedPackage) return undefined;
    const days: Date[] = [];
    for (let i = 0; i <= 30; i++) {
      const d = addDays(today, i);
      const key = format(d, "yyyy-MM-dd");
      if (!availabilityByDay[key]) days.push(d);
    }
    return days;
  }, [availabilityByDay, selectedPackage, today]);

  const createHold = useCreateSlotHold();
  const releaseHold = useReleaseSlotHold();

  const total = selectedPackage ? Number(selectedPackage.base_price) : 0;
  const { deposit, remaining } = computeDeposit(total, depositPercent, minDeposit);

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
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
    if (requestOnly) {
      toast.info("Request-based only for now.");
      return;
    }
    if (!selectedPackage || !selectedDate || !selectedSlot) {
      toast.error("Please select a package, date, and time.");
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
    let holdId: string | null = null;
    try {
      const hold = await createHold.mutateAsync({
        bookable_type_id: selectedSlot.bookable_type_id,
        resource_id: selectedSlot.resource_id,
        start_datetime: selectedSlot.start_time,
        end_datetime: selectedSlot.end_time,
      });
      holdId = hold.id;

      const { data, error } = await supabase.functions.invoke(checkoutFunction, {
        body: {
          business_type: businessType,
          package_id: selectedPackage.id,
          resource_id: selectedSlot.resource_id,
          start_datetime: selectedSlot.start_time,
          end_datetime: selectedSlot.end_time,
          customer_name: guestInfo.name.trim(),
          customer_email: guestInfo.email.trim(),
          customer_phone: guestInfo.phone.trim(),
          hold_id: holdId,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error(data?.error || "Checkout session failed");

      window.location.href = data.url;
    } catch (err: any) {
      const message = err?.message || "Unable to proceed to payment.";
      toast.error(message);
      if (holdId) {
        try {
          await releaseHold.mutateAsync(holdId);
        } catch {
          // ignore
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = dayAvailability.data?.slots || [];
  const isLoadingSlots = dayAvailability.isLoading;

  return (
    <div className="space-y-6">
      {/* Step 1: Service/package */}
      {step === "service" && (
        <div className="space-y-4">
          {bookableTypes && bookableTypes.length > 1 ? (
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select value={effectiveBookableTypeId} onValueChange={(v) => {
                setSelectedBookableTypeId(v);
                setSelectedPackage(null);
                setSelectedDate(undefined);
                setSelectedSlot(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {bookableTypes.map((bt) => (
                    <SelectItem key={bt.id} value={bt.id}>
                      {bt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {effectiveBookableTypeId ? (
            <PackageSelector
              bookableTypeId={effectiveBookableTypeId}
              selectedPackageId={selectedPackage?.id}
              onSelect={handleSelectPackage}
            />
          ) : (
            <div className="text-sm text-muted-foreground">Loading services…</div>
          )}
        </div>
      )}

      {/* Step 2: Calendar */}
      {step !== "service" && (
        <div ref={calendarStepRef} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {selectedPackage ? (
              <Badge variant="secondary" className="text-xs">
                {selectedPackage.name} • {selectedPackage.duration_mins} min
              </Badge>
            ) : null}
            {selectedDate ? (
              <Badge variant="secondary" className="text-xs">
                {format(selectedDate, "MMM d")}
              </Badge>
            ) : null}
            {selectedSlot ? (
              <Badge variant="secondary" className="text-xs">
                {format(new Date(selectedSlot.start_time), "h:mm a")}
              </Badge>
            ) : null}
          </div>

          <h3 className="text-lg font-semibold">Select a Date</h3>
          <div className="rounded-lg border border-border p-3 bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelectDate}
              disabled={disabledDays}
              fromDate={today}
              toDate={addDays(today, 30)}
              modifiers={{ available: (d) => availabilityByDay[format(d, "yyyy-MM-dd")] === true }}
              modifiersClassNames={{ available: "bg-accent/10" }}
            />
          </div>
          {rangeAvailability.isError ? (
            <p className="text-sm text-destructive">Unable to load availability.</p>
          ) : null}
        </div>
      )}

      {/* Step 3: Time */}
      {step === "time" && (
        <div ref={timeStepRef} className="space-y-3">
          <h3 className="text-lg font-semibold">Select a Time</h3>
          {isLoadingSlots ? (
            <p className="text-sm text-muted-foreground">Loading times…</p>
          ) : timeSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available times for this date.</p>
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

          {!requestOnly ? (
            <Card className="border-border">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm">
                  <strong>Total:</strong> ${total.toFixed(0)}
                </p>
                <p className="text-sm">
                  <strong>Deposit Due Today ({depositPercent}%):</strong> ${deposit.toFixed(0)}
                </p>
                <p className="text-sm">
                  <strong>Remaining Balance Due on Arrival:</strong> ${remaining.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Your deposit reserves this time slot and is applied toward your total. Remaining balance is due at check-in.
                </p>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${businessType}-name`}>Name</Label>
              <Input
                id={`${businessType}-name`}
                value={guestInfo.name}
                onChange={(e) => setGuestInfo((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${businessType}-email`}>Email</Label>
              <Input
                id={`${businessType}-email`}
                value={guestInfo.email}
                onChange={(e) => setGuestInfo((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${businessType}-phone`}>Phone</Label>
              <Input
                id={`${businessType}-phone`}
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo((p) => ({ ...p, phone: e.target.value }))}
                placeholder="(###) ###-####"
              />
            </div>
          </div>

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
              className="bg-accent text-primary hover:bg-accent/90"
              onClick={proceedToPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing…" : requestOnly ? "Submit Request" : "Proceed to Payment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
