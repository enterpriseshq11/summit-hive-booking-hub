import { useEffect, useMemo, useRef, useState } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Package } from "@/types";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { usePackages } from "@/hooks/usePackages";
import { useAvailability, useCreateSlotHold, useReleaseSlotHold } from "@/hooks/useAvailability";
import { 
  Building2, Briefcase, Zap, CalendarCheck, ArrowLeft, ArrowRight, Check, Clock
} from "lucide-react";

type Step = "type" | "duration" | "calendar" | "time" | "contact" | "confirmation";

interface BookingOption {
  id: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  bookableTypeId: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function roundCurrency(n: number) {
  return Math.round(n * 100) / 100;
}

function computeDeposit(total: number, depositPercent = 33, minDeposit = 10) {
  if (total <= 0) return { deposit: 0, remaining: 0 };
  const pct = roundCurrency((total * depositPercent) / 100);
  const deposit = Math.max(pct, minDeposit);
  const clamped = Math.min(deposit, total);
  return {
    deposit: clamped,
    remaining: roundCurrency(Math.max(0, total - clamped)),
  };
}

export function HiveBookingWizard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = startOfToday();
  const calendarRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // State
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<BookingOption | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionType, setCompletionType] = useState<"paid" | "free" | null>(null);
  const [completedSummary, setCompletedSummary] = useState<any>(null);

  // Data hooks
  const { data: businesses } = useBusinesses();
  const business = businesses?.find((b) => b.type === "coworking");
  const { data: bookableTypes } = useBookableTypes(business?.id);
  const { data: packages } = usePackages(selectedType?.bookableTypeId);

  const createHold = useCreateSlotHold();
  const releaseHold = useReleaseSlotHold();

  // Booking options mapped to bookable types
  const bookingOptions: BookingOption[] = useMemo(() => {
    if (!bookableTypes) return [];
    
    const privateOffice = bookableTypes.find(bt => bt.slug === "private-office" || bt.name?.toLowerCase().includes("private"));
    const dedicatedDesk = bookableTypes.find(bt => bt.slug === "dedicated-desk" || bt.name?.toLowerCase().includes("dedicated"));
    const hotDesk = bookableTypes.find(bt => bt.slug === "hot-desk" || bt.name?.toLowerCase().includes("hot"));
    const tour = bookableTypes.find(bt => bt.slug === "tour" || bt.name?.toLowerCase() === "tour");
    
    const options: BookingOption[] = [];
    
    if (privateOffice) {
      options.push({
        id: "private-office",
        name: "Private Office",
        icon: Building2,
        tagline: "Lockable, professional office for teams and founders",
        bookableTypeId: privateOffice.id,
      });
    }
    
    if (dedicatedDesk) {
      options.push({
        id: "dedicated-desk",
        name: "Dedicated Desk",
        icon: Briefcase,
        tagline: "Your reserved desk in a high-performing environment",
        bookableTypeId: dedicatedDesk.id,
      });
    }
    
    if (hotDesk) {
      options.push({
        id: "day-pass",
        name: "Day Pass",
        icon: Zap,
        tagline: "Work here for the day with full amenities",
        bookableTypeId: hotDesk.id,
      });
    }
    
    if (tour) {
      options.push({
        id: "tour",
        name: "Schedule Tour",
        icon: CalendarCheck,
        tagline: "30-minute walkthrough of all workspace options",
        bookableTypeId: tour.id,
      });
    }
    
    return options;
  }, [bookableTypes]);

  // Duration and pricing
  const durationMins = selectedPackage?.duration_mins || 60;
  const total = selectedPackage ? Number(selectedPackage.base_price) : 0;
  const isFree = total <= 0;
  const { deposit, remaining } = computeDeposit(total, 33, 10);

  // Availability queries
  const rangeStart = format(today, "yyyy-MM-dd");
  const rangeEnd = format(addDays(today, 30), "yyyy-MM-dd");

  const rangeAvailability = useAvailability(
    {
      business_type: "coworking",
      bookable_type_id: selectedType?.bookableTypeId,
      start_date: rangeStart,
      end_date: rangeEnd,
      duration_mins: durationMins,
    },
    !!selectedPackage && step !== "type" && step !== "duration"
  );

  const dayAvailability = useAvailability(
    {
      business_type: "coworking",
      bookable_type_id: selectedType?.bookableTypeId,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
      duration_mins: durationMins,
    },
    !!selectedPackage && !!selectedDate && (step === "time" || step === "contact")
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
    if (!selectedPackage) return undefined;
    const days: Date[] = [];
    for (let i = 0; i <= 30; i++) {
      const d = addDays(today, i);
      const key = format(d, "yyyy-MM-dd");
      if (!availabilityByDay[key]) days.push(d);
    }
    return days;
  }, [availabilityByDay, selectedPackage, today]);

  const timeSlots = dayAvailability.data?.slots || [];

  // Handle Stripe return
  useEffect(() => {
    const booking = searchParams.get("booking");
    const bookingId = searchParams.get("booking_id");

    if (booking === "success" && bookingId) {
      const storedKey = `hive_booking_${bookingId}`;
      const stored = sessionStorage.getItem(storedKey);
      if (stored) {
        try {
          const summary = JSON.parse(stored);
          setCompletedSummary(summary);
          sessionStorage.removeItem(storedKey);
        } catch {}
      }
      setCompletionType("paid");
      setStep("confirmation");
      toast.success("Payment successful! Your workspace is booked.");
      searchParams.delete("booking");
      searchParams.delete("booking_id");
      setSearchParams(searchParams, { replace: true });
    } else if (booking === "cancelled") {
      toast.info("Payment was cancelled. You can try again.");
      searchParams.delete("booking");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Handlers
  const handleSelectType = (option: BookingOption) => {
    setSelectedType(option);
    setSelectedPackage(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setStep("duration");
  };

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setStep("calendar");
    setTimeout(() => calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep("time");
    setTimeout(() => timeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const handleSelectTime = (slot: any) => {
    setSelectedSlot(slot);
    setStep("contact");
    setTimeout(() => contactRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const goBack = () => {
    if (step === "duration") {
      setStep("type");
      setSelectedType(null);
    } else if (step === "calendar") {
      setStep("duration");
      setSelectedPackage(null);
    } else if (step === "time") {
      setStep("calendar");
      setSelectedSlot(null);
    } else if (step === "contact") {
      setStep("time");
    }
  };

  const resetBooking = () => {
    setStep("type");
    setSelectedType(null);
    setSelectedPackage(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setGuestInfo({ name: "", email: "", phone: "" });
    setCompletionType(null);
    setCompletedSummary(null);
  };

  const handleSubmit = async () => {
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
      // Create temporary hold
      const hold = await createHold.mutateAsync({
        bookable_type_id: selectedSlot.bookable_type_id,
        resource_id: selectedSlot.resource_id,
        start_datetime: selectedSlot.start_time,
        end_datetime: selectedSlot.end_time,
      });
      holdId = hold.id;

      if (isFree) {
        // For free bookings (tours), create booking directly
        const { data, error } = await supabase.functions.invoke("experience-checkout", {
          body: {
            business_type: "coworking",
            package_id: selectedPackage.id,
            resource_id: selectedSlot.resource_id,
            start_datetime: selectedSlot.start_time,
            end_datetime: selectedSlot.end_time,
            customer_name: guestInfo.name.trim(),
            customer_email: guestInfo.email.trim(),
            customer_phone: guestInfo.phone.trim(),
            hold_id: holdId,
            skip_payment: true, // Free booking flag
          },
        });

        if (error) throw error;
        
        setCompletedSummary({
          typeName: selectedType?.name,
          packageName: selectedPackage.name,
          duration: selectedPackage.duration_mins,
          dateLabel: format(selectedDate, "EEEE, MMMM d, yyyy"),
          timeLabel: format(new Date(selectedSlot.start_time), "h:mm a"),
          total: 0,
        });
        setCompletionType("free");
        setStep("confirmation");
        toast.success("Tour scheduled successfully!");
      } else {
        // For paid bookings, redirect to Stripe
        const { data, error } = await supabase.functions.invoke("experience-checkout", {
          body: {
            business_type: "coworking",
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
        if (!data?.url) throw new Error(data?.error || "Failed to create checkout session");

        // Store summary for post-payment display
        const bookingId = data.booking_id;
        if (bookingId) {
          sessionStorage.setItem(`hive_booking_${bookingId}`, JSON.stringify({
            typeName: selectedType?.name,
            packageName: selectedPackage.name,
            duration: selectedPackage.duration_mins,
            dateLabel: format(selectedDate, "EEEE, MMMM d, yyyy"),
            timeLabel: format(new Date(selectedSlot.start_time), "h:mm a"),
            total: deposit,
          }));
        }

        // Open Stripe in new tab
        window.open(data.url, "_blank", "noopener,noreferrer");
        toast.info("Complete your payment in the new tab to confirm your booking.");
      }
    } catch (err: any) {
      const message = err?.message || "Unable to complete booking.";
      toast.error(message);
      if (holdId) {
        try {
          await releaseHold.mutateAsync(holdId);
        } catch {}
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step indicator
  const stepLabels = ["Type", "Duration", "Date", "Time", "Details"];
  const stepIndex = step === "type" ? 0 : step === "duration" ? 1 : step === "calendar" ? 2 : step === "time" ? 3 : 4;

  if (step === "confirmation") {
    return (
      <Card className="border-accent/30 bg-card shadow-lg">
        <CardContent className="p-6 space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {completionType === "paid" ? "Payment Successful!" : "Tour Scheduled!"}
          </h2>
          <p className="text-muted-foreground">
            {completionType === "paid" 
              ? "Your workspace booking is confirmed. Check your email for your receipt and details."
              : "Your tour is confirmed. We'll see you soon!"}
          </p>
          
          {completedSummary && (
            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
              <p><strong>Type:</strong> {completedSummary.typeName}</p>
              <p><strong>Package:</strong> {completedSummary.packageName}</p>
              <p><strong>Duration:</strong> {completedSummary.duration} minutes</p>
              <p><strong>Date:</strong> {completedSummary.dateLabel}</p>
              <p><strong>Time:</strong> {completedSummary.timeLabel}</p>
              {completedSummary.total > 0 && (
                <p><strong>Deposit Paid:</strong> ${completedSummary.total.toFixed(2)}</p>
              )}
            </div>
          )}
          
          <Button onClick={resetBooking} className="bg-accent text-primary hover:bg-accent/90">
            Book Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      {step !== "type" && (
        <div className="flex items-center justify-center gap-2 mb-4">
          {stepLabels.map((label, idx) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                idx <= stepIndex 
                  ? "bg-accent text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {idx < stepIndex ? <Check className="h-3 w-3" /> : idx + 1}
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={cn(
                  "w-6 h-0.5 transition-colors",
                  idx < stepIndex ? "bg-accent" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Back button */}
      {step !== "type" && (
        <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      )}

      {/* Selection badges */}
      {step !== "type" && selectedType && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {selectedType.name}
          </Badge>
          {selectedPackage && (
            <Badge variant="secondary" className="text-xs">
              {selectedPackage.name} • {selectedPackage.duration_mins} min
            </Badge>
          )}
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
        </div>
      )}

      {/* Step 1: Choose Type */}
      {step === "type" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">What would you like to book?</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {bookingOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectType(option)}
                  className="group p-4 rounded-lg border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                        {option.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.tagline}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors mt-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Choose Duration/Package */}
      {step === "duration" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select a Package</h3>
          {!packages || packages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading packages…</p>
          ) : (
            <div className="grid gap-3">
              {packages.filter(p => p.is_active).map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className="group p-4 rounded-lg border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                        {pkg.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{pkg.duration_mins} minutes</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-accent">
                        {Number(pkg.base_price) > 0 ? `$${Number(pkg.base_price).toFixed(0)}` : "Free"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors ml-2 inline" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Calendar */}
      {step === "calendar" && (
        <div ref={calendarRef} className="space-y-4">
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
          {rangeAvailability.isLoading && (
            <p className="text-sm text-muted-foreground">Loading availability…</p>
          )}
          {rangeAvailability.isError && (
            <p className="text-sm text-destructive">Unable to load availability.</p>
          )}
        </div>
      )}

      {/* Step 4: Time Selection */}
      {step === "time" && (
        <div ref={timeRef} className="space-y-4">
          <h3 className="text-lg font-semibold">Select a Time</h3>
          {dayAvailability.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading times…</p>
          ) : timeSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available times for this date.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <Button
                    key={slot.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={cn("justify-center", isSelected && "bg-accent text-primary hover:bg-accent/90")}
                    onClick={() => handleSelectTime(slot)}
                  >
                    {format(new Date(slot.start_time), "h:mm a")}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 5: Contact & Payment */}
      {step === "contact" && (
        <div ref={contactRef} className="space-y-4">
          <h3 className="text-lg font-semibold">Your Information</h3>
          
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hive-name">Name</Label>
              <Input
                id="hive-name"
                value={guestInfo.name}
                onChange={(e) => setGuestInfo((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hive-email">Email</Label>
              <Input
                id="hive-email"
                type="email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hive-phone">Phone</Label>
              <Input
                id="hive-phone"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo((p) => ({ ...p, phone: e.target.value }))}
                placeholder="(###) ###-####"
              />
            </div>
          </div>

          {!isFree && (
            <Card className="border-accent/30">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm">
                  <strong>Total:</strong> ${total.toFixed(0)}
                </p>
                <p className="text-sm">
                  <strong>Deposit Due Today (33%):</strong> ${deposit.toFixed(0)}
                </p>
                <p className="text-sm">
                  <strong>Remaining Balance:</strong> ${remaining.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Your deposit reserves this time slot. Remaining balance is due at check-in.
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing…" : isFree ? "Confirm Tour" : "Proceed to Payment"}
            {!isSubmitting && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      )}
    </div>
  );
}
