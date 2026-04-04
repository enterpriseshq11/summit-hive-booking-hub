import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SmsConsentCheckbox } from "@/components/booking/SmsConsentCheckbox";
import { cn } from "@/lib/utils";
import { format, addDays, startOfToday, isBefore, startOfDay } from "date-fns";
import { 
  CalendarIcon, CalendarDays, Clock, CheckCircle, XCircle, ChevronRight, ArrowLeft,
  Heart, Flame, Star, Users, MapPin, Sparkles, ArrowRight, HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSpaAvailability, isPromoDate, calculateServicePrice } from "@/hooks/useSpaAvailability";
import { useSpaPaymentsConfig } from "@/hooks/useSpaPaymentsConfig";
import { SpaWorkerService } from "@/hooks/useSpaWorkerServices";

// Time slots for request mode: 10:00 AM to 8:30 PM in 30-min increments
const REQUEST_TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10;
  const min = i % 2 === 0 ? "00" : "30";
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return { value: `${hour}:${min}`, label: `${displayHour}:${min} ${ampm}` };
});

// Service option type
interface ServiceOption {
  duration: number;
  price: number;
  label: string;
  promoPrice?: number;
  note?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  options: ServiceOption[];
  featured?: boolean;
  isPromo?: boolean;
  isFree?: boolean;
}

// Default services — updated menu with 60 min base + 90 min (+$35) upgrade
const DEFAULT_SERVICES: Service[] = [
  { id: "scalp-stimulation", name: "Scalp Stimulation", description: "Targeted scalp therapy to promote relaxation and circulation.", icon: Sparkles, options: [{ duration: 60, price: 45, label: "60 min" }, { duration: 90, price: 80, label: "90 min" }] },
  { id: "infrared-sauna", name: "Infrared Sauna", description: "Deep-penetrating heat therapy for detox and recovery.", icon: Flame, options: [{ duration: 60, price: 45, label: "60 min" }, { duration: 90, price: 80, label: "90 min" }] },
  { id: "yoni-steam", name: "Yoni Steam", description: "Herbal steam session for feminine wellness and relaxation.", icon: Heart, options: [{ duration: 60, price: 60, label: "60 min" }, { duration: 90, price: 95, label: "90 min" }] },
  { id: "neck-back-shoulders", name: "Neck, Back & Shoulders", description: "Focused relief for upper body tension and stress.", icon: Heart, options: [{ duration: 60, price: 75, label: "60 min" }, { duration: 90, price: 110, label: "90 min" }] },
  { id: "trigger-point", name: "Trigger Point Release", description: "Precision pressure to release chronic muscle knots.", icon: Flame, options: [{ duration: 60, price: 85, label: "60 min" }, { duration: 90, price: 120, label: "90 min" }] },
  { id: "radiant-renewal", name: "Radiant Renewal", description: "Rejuvenating full-body treatment for glowing skin and deep relaxation.", icon: Star, options: [{ duration: 60, price: 90, label: "60 min" }, { duration: 90, price: 125, label: "90 min" }] },
  { id: "total-body-stretch", name: "Total Body Stretch", description: "Assisted stretching to improve flexibility and reduce tension.", icon: Heart, options: [{ duration: 60, price: 90, label: "60 min" }, { duration: 90, price: 125, label: "90 min" }] },
  { id: "hot-stone", name: "Hot Stone", description: "Heated stone therapy for deep muscle relaxation.", icon: Flame, featured: true, options: [{ duration: 60, price: 100, label: "60 min" }, { duration: 90, price: 135, label: "90 min" }] },
  { id: "cupping", name: "Cupping", description: "Suction therapy to increase blood flow and release tension.", icon: Flame, featured: true, options: [{ duration: 60, price: 100, label: "60 min" }, { duration: 90, price: 135, label: "90 min" }] },
  { id: "deep-tissue", name: "Deep Tissue", description: "Focused therapeutic work with deeper pressure.", icon: Flame, options: [{ duration: 60, price: 110, label: "60 min" }, { duration: 90, price: 145, label: "90 min" }] },
  { id: "lymphatic-drainage", name: "Lymphatic Drainage", description: "Gentle technique to support your body's natural detox process.", icon: Heart, options: [{ duration: 60, price: 120, label: "60 min" }, { duration: 90, price: 155, label: "90 min" }] },
  { id: "table-thai", name: "Table Thai", description: "Thai-style stretching and compression on the massage table.", icon: Star, options: [{ duration: 60, price: 120, label: "60 min" }, { duration: 90, price: 155, label: "90 min" }] },
  { id: "sugar-scrub", name: "Hydrating Sugar Scrub", description: "Exfoliating body scrub that leaves skin soft and hydrated.", icon: Sparkles, options: [{ duration: 60, price: 125, label: "60 min" }, { duration: 90, price: 160, label: "90 min" }] },
  { id: "mud-detox", name: "Mud Detox", description: "Mineral-rich mud wrap for deep detoxification.", icon: Star, featured: true, options: [{ duration: 60, price: 150, label: "60 min" }, { duration: 90, price: 185, label: "90 min" }] },
  { id: "seaweed-wrap", name: "Seaweed Body Wrap", description: "Nourishing seaweed wrap to hydrate and firm the skin.", icon: Star, options: [{ duration: 60, price: 150, label: "60 min" }, { duration: 90, price: 185, label: "90 min" }] },
  { id: "chamomile-wrap", name: "Chamomile Body Wrap", description: "Soothing chamomile wrap for sensitive skin and deep calm.", icon: Heart, options: [{ duration: 60, price: 150, label: "60 min" }, { duration: 90, price: 185, label: "90 min" }] },
  { id: "herbal-bath", name: "Natural Herbal Bath", description: "Therapeutic herbal soak for total mind and body restoration.", icon: Sparkles, options: [{ duration: 60, price: 155, label: "60 min" }, { duration: 90, price: 190, label: "90 min" }] },
  { id: "cold-plunge", name: "Cold Plunge Bath", description: "Cold immersion therapy for recovery and invigoration.", icon: Flame, options: [{ duration: 60, price: 155, label: "60 min" }, { duration: 90, price: 190, label: "90 min" }] },
];

const ROOMS = [
  { 
    id: "11111111-1111-1111-1111-111111111111", 
    name: "M1 - Main Spa Area",
    description: "Calm and quiet, perfect for focused recovery.",
    capacity: 1,
  },
  { 
    id: "22222222-2222-2222-2222-222222222222", 
    name: "P1 - Private Room",
    description: "Secluded and peaceful. Ideal for couples.",
    capacity: 2,
  },
];

type BookingStep = "service" | "calendar" | "time" | "contact" | "confirm";

// In request mode (payments OFF), we skip calendar/time steps entirely

interface SpaWorkerAvailabilityCalendarProps {
  onBookingComplete?: () => void;
  workerId?: string;
  workerServices?: SpaWorkerService[];
}

// Convert database services to component format
function convertWorkerServices(services: SpaWorkerService[]): Service[] {
  return services.map(svc => {
    const hasPromo = svc.promo_price && svc.promo_ends_at && new Date(svc.promo_ends_at) > new Date();
    return {
      id: svc.id,
      name: svc.name,
      description: svc.description || "",
      icon: Heart, // Default icon
      isFree: svc.is_free,
      isPromo: hasPromo,
      options: [{
        duration: svc.duration_mins,
        price: Number(svc.price),
        promoPrice: hasPromo ? Number(svc.promo_price) : undefined,
        label: svc.is_free ? "Free" : `${svc.duration_mins} min`,
      }],
    };
  });
}

export function SpaWorkerAvailabilityCalendar({ onBookingComplete, workerId, workerServices }: SpaWorkerAvailabilityCalendarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<BookingStep>("service");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [preferredDateTime, setPreferredDateTime] = useState("");
  const [requestDate, setRequestDate] = useState<Date>();
  const [requestTime, setRequestTime] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [completionType, setCompletionType] = useState<"paid" | "free" | "pay_on_arrival" | null>(null);
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);
  const [completedSummary, setCompletedSummary] = useState<
    | {
        serviceName?: string;
        duration?: number;
        dateLabel?: string;
        timeLabel?: string;
        roomName?: string;
        total?: number;
      }
    | null
  >(null);
  
  // Refs for scrolling to steps
  const calendarStepRef = useRef<HTMLDivElement>(null);
  const timeStepRef = useRef<HTMLDivElement>(null);
  
  // Use the real availability hook
  const {
    selectedDaySlots,
    getAvailabilityMap,
    getDayAvailability,
    isLoading: isLoadingAvailability,
  } = useSpaAvailability({
    selectedDate,
    selectedDuration: selectedDuration || 60,
  });

  // Fetch spa payments config (when false, skip payment collection)
  const { spaPaymentsEnabled } = useSpaPaymentsConfig();

  // Handle Stripe return URLs (success/cancel) in the same way other paid flows do.
  useEffect(() => {
    const booking = searchParams.get("booking");
    const id = searchParams.get("id");

    if (!booking) return;

    if (booking === "success" && id) {
      setCompletionType("paid");
      setCompletedBookingId(id);
      setBookingComplete(true);
      setStep("confirm");
      toast.success("Payment successful. Your booking is confirmed.");

      try {
        const raw = sessionStorage.getItem(`spa_booking_${id}`);
        if (raw) setCompletedSummary(JSON.parse(raw));
      } catch {
        // ignore
      }

      // Clean the URL so refreshing doesn't re-trigger toasts.
      navigate("/spa", { replace: true });
    }

    if (booking === "cancelled") {
      toast.error("Payment cancelled. Your time is not reserved until payment is completed.");
      navigate("/spa", { replace: true });
    }
  }, [navigate, searchParams]);

  // Generate availability map for calendar coloring based on selected duration
  const availability = useMemo(() => {
    return getAvailabilityMap(60, selectedDuration || 60);
  }, [getAvailabilityMap, selectedDuration]);
  
  const getDateAvailability = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return availability[dateKey];
  };

  // Use worker services if provided, otherwise use defaults (Lindsey's)
  const SERVICES = useMemo(() => {
    if (workerServices && workerServices.length > 0) {
      return convertWorkerServices(workerServices);
    }
    return DEFAULT_SERVICES;
  }, [workerServices]);

  const getSelectedServiceData = () => {
    if (!selectedService) return null;
    return SERVICES.find(s => s.id === selectedService);
  };

  const getSelectedOption = () => {
    const service = getSelectedServiceData();
    if (!service || !selectedDuration) return null;
    return service.options.find(o => o.duration === selectedDuration);
  };

  // Calculate price based on service, duration, and selected date (for promo pricing)
  const calculatePrice = (): number | null => {
    const service = getSelectedServiceData();
    const option = getSelectedOption();
    if (!service || !option) return null;
    
    // For couples massage, check date-based promo pricing
    if (service.id === "couples" && selectedDate && 'promoPrice' in option) {
      if (isPromoDate(selectedDate)) {
        return option.promoPrice ?? option.price;
      }
    }
    
    return option.price;
  };
  
  // Request mode = spa payments OFF (no calendar, just request form)
  const isRequestMode = !spaPaymentsEnabled;

  const handleServiceSelect = (serviceId: string, duration: number) => {
    setSelectedService(serviceId);
    setSelectedDuration(duration);
    // For couples massage, default to B1 room
    if (serviceId === "couples") {
      setSelectedRoom("22222222-2222-2222-2222-222222222222");
    }
    
    if (isRequestMode) {
      // Skip calendar/time — go directly to contact/request form
      setStep("contact");
    } else {
      setStep("calendar");
    }
    
    // Scroll to next step after state update
    setTimeout(() => {
      calendarStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setStep("time");
      
      // Scroll to time step after state update - center to keep booking module visible
      setTimeout(() => {
        timeStepRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("contact");
  };

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePhone = (phone: string): boolean => {
    // Strip non-digits and check for 10+ digits (basic US validation)
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string; phone?: string } = {};
    
    if (!guestInfo.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!guestInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(guestInfo.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!guestInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(guestInfo.phone)) {
      errors.phone = "Please enter a valid phone number (10+ digits)";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = (): boolean => {
    const serviceData = getSelectedServiceData();
    const isFreeConsult = serviceData?.isFree === true;
    const price = calculatePrice();
    const isPaidService = price !== null && price > 0;
    
    // Consent only required for paid services when payments are enabled
    const needsConsent = isPaidService && spaPaymentsEnabled;
    
    return (
      guestInfo.name.trim().length > 0 &&
      validateEmail(guestInfo.email) &&
      validatePhone(guestInfo.phone) &&
      (isFreeConsult || !needsConsent || consentChecked)
    );
  };

  // Full price checkout helper
  const getPriceBreakdown = () => {
    const price = calculatePrice() || 0;
    if (price <= 0) return null; // Free consultation
    return {
      servicePrice: price,
      totalDue: price,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In request mode, date/time are not required (user provides preferred text)
    if (!isRequestMode && (!selectedService || !selectedDuration || !selectedDate || !selectedTime)) {
      toast.error("Please complete all required fields");
      return;
    }
    if (isRequestMode && (!selectedService || !selectedDuration)) {
      toast.error("Please select a service");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const serviceData = getSelectedServiceData();
    const isFreeConsult = serviceData?.isFree === true;
    const price = calculatePrice() || 0;
    const isPaidService = price > 0;
    
    // Consent required for paid services only when payments are enabled
    if (!isFreeConsult && isPaidService && spaPaymentsEnabled && !consentChecked) {
      toast.error("Please accept the payment policy to continue");
      return;
    }

    // Use selected room or default to H1
    const roomId = selectedRoom || "11111111-1111-1111-1111-111111111111";
    const consentTimestamp = new Date().toISOString();

    setIsSubmitting(true);

    try {
      // In request mode, use placeholder datetimes since user only provides preferred text
      let startDatetime: string;
      let endDatetime: string;
      
      if (isRequestMode) {
        // Use a placeholder date (today) since this is a request, not a confirmed slot
        const today = format(new Date(), "yyyy-MM-dd");
        startDatetime = `${today}T10:00:00`;
        const endMinutes = selectedDuration || 60;
        const endHours = 10 + Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
        endDatetime = `${today}T${endTime}:00`;
      } else {
        startDatetime = `${format(selectedDate!, "yyyy-MM-dd")}T${selectedTime}:00`;
        const endMinutes = selectedDuration || 60;
        const [hours, mins] = selectedTime.split(":").map(Number);
        const endHours = hours + Math.floor((mins + endMinutes) / 60);
        const endMins = (mins + endMinutes) % 60;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
        endDatetime = `${format(selectedDate!, "yyyy-MM-dd")}T${endTime}:00`;
      }

      // Call create-checkout edge function for spa bookings
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          service_id: selectedService,
          service_name: serviceData?.name || "Massage",
          duration: selectedDuration,
          price,
          room_id: isRequestMode ? undefined : roomId,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          customer_name: guestInfo.name.trim(),
          customer_email: guestInfo.email.trim(),
          customer_phone: guestInfo.phone.trim(),
          consent_no_show_fee: isPaidService && spaPaymentsEnabled ? consentChecked : undefined,
          consent_timestamp: isPaidService && spaPaymentsEnabled ? consentTimestamp : undefined,
          skip_payment: !spaPaymentsEnabled,
          request_mode: isRequestMode,
          preferred_datetime: isRequestMode ? preferredDateTime : undefined,
        },
      });

      if (error) {
        console.error("Checkout error:", error);
        throw new Error(error.message || "Failed to process booking");
      }

      // Handle free consultations (no payment needed)
      if (data?.is_free) {
        setCompletionType("free");
        setBookingComplete(true);
        setStep("confirm");
        
        // Show appropriate message based on email status
        if (data?.email_sent) {
          toast.success("Free consultation booked! Check your email for details.");
        } else {
          toast.success("Free consultation booked! Confirmation details will be sent shortly.");
          console.warn("Email not sent:", data?.email_error);
        }
        
        onBookingComplete?.();
        return;
      }

      // Handle request mode submissions (spa payments disabled, no calendar)
      if (data?.is_request) {
        setCompletionType("pay_on_arrival");
        setCompletedBookingId(data?.booking_id || null);
        setBookingComplete(true);
        setStep("confirm");
        
        const summary = {
          serviceName: serviceData?.name || "Massage",
          duration: selectedDuration || undefined,
          dateLabel: preferredDateTime || "To be confirmed",
          timeLabel: "To be confirmed",
          roomName: "To be assigned",
          servicePrice: data?.service_price,
          balanceDue: data?.balance_due,
          total: price,
        };
        setCompletedSummary(summary);
        
        toast.success("Request submitted! We will contact you to confirm your appointment.");
        onBookingComplete?.();
        return;
      }

      // Handle pay-on-arrival bookings (spa payments disabled but with calendar)
      if (data?.is_pay_on_arrival) {
        setCompletionType("pay_on_arrival");
        setCompletedBookingId(data?.booking_id || null);
        setBookingComplete(true);
        setStep("confirm");
        
        const summary = {
          serviceName: serviceData?.name || "Massage",
          duration: selectedDuration || undefined,
          dateLabel: selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : undefined,
          timeLabel: selectedTime ? format(new Date(`2000-01-01T${selectedTime}`), "h:mm a") : undefined,
          roomName: ROOMS.find((r) => r.id === roomId)?.name || "H1 - Hallway Room",
          servicePrice: data?.service_price,
          balanceDue: data?.balance_due,
          total: price,
        };
        setCompletedSummary(summary);
        
        if (data?.email_sent) {
          toast.success("Appointment confirmed! Check your email for details. Payment due on arrival.");
        } else {
          toast.success("Appointment confirmed! Payment due on arrival.");
        }
        
        onBookingComplete?.();
        return;
      }

      // Paid booking: open Stripe checkout
      if (data?.url) {
        toast.success("Redirecting to secure payment...");
        const bookingId = data?.booking_id as string | undefined;
        const breakdown = getPriceBreakdown();
        if (bookingId) {
          try {
            const summary = {
              serviceName: serviceData?.name || "Massage",
              duration: selectedDuration || undefined,
              dateLabel: selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : undefined,
              timeLabel: selectedTime ? format(new Date(`2000-01-01T${selectedTime}`), "h:mm a") : undefined,
              roomName: ROOMS.find((r) => r.id === roomId)?.name || "H1 - Hallway Room",
              servicePrice: breakdown?.servicePrice,
              totalPaid: breakdown?.totalDue,
              total: price,
            };
            sessionStorage.setItem(`spa_booking_${bookingId}`, JSON.stringify(summary));
          } catch {
            // ignore
          }
        }

        // Use location.href instead of window.open to prevent iOS popup blocking
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit booking. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedService(null);
    setSelectedDuration(null);
    setSelectedRoom(null);
    setSelectedDate(undefined);
    setSelectedTime("");
    setGuestInfo({ name: "", email: "", phone: "" });
    setPreferredDateTime("");
    setRequestDate(undefined);
    setRequestTime("");
    setFormErrors({});
    setConsentChecked(false);
    setBookingComplete(false);
    setStep("service");
  };

  const goBack = () => {
    switch (step) {
      case "calendar":
        setStep("service");
        break;
      case "time":
        setStep("calendar");
        break;
      case "contact":
        // In request mode, go back to service (skip calendar/time)
        setStep(isRequestMode ? "service" : "time");
        break;
      default:
        break;
    }
  };

  // Step indicator - in request mode, skip calendar/time steps
  const steps = isRequestMode
    ? [
        { key: "service", label: "Service" },
        { key: "contact", label: "Request Details" },
      ]
    : [
        { key: "service", label: "Service" },
        { key: "calendar", label: "Date" },
        { key: "time", label: "Time" },
        { key: "contact", label: "Details" },
      ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <Card ref={calendarStepRef} id="spa-booking-step-2" className="shadow-premium border-border overflow-hidden scroll-mt-24">
      {/* Gold accent line */}
      <div className="h-1 bg-accent" />
      
      <CardHeader className="border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-accent" />
            {isRequestMode ? "Request a Session" : "Book Your Session"}
          </CardTitle>
          
          {/* Step Indicator */}
          {!bookingComplete && (
            <div className="flex items-center gap-2">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                    i < currentStepIndex ? "bg-accent text-primary" :
                    i === currentStepIndex ? "bg-accent text-primary ring-2 ring-accent/30" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn(
                      "w-4 h-0.5",
                      i < currentStepIndex ? "bg-accent" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Current selection summary */}
        {selectedService && step !== "service" && !bookingComplete && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
            <Badge variant="secondary" className="text-xs">
              {getSelectedServiceData()?.name} • {selectedDuration} min
            </Badge>
            {selectedDate && (
              <Badge variant="secondary" className="text-xs">
                {format(selectedDate, "MMM d")}
              </Badge>
            )}
            {selectedTime && (
              <Badge variant="secondary" className="text-xs">
                {format(new Date(`2000-01-01T${selectedTime}`), "h:mm a")}
              </Badge>
            )}
            {calculatePrice() !== null && (
              <Badge className="bg-accent text-primary text-xs">
                ${calculatePrice()}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Booking Complete */}
        {bookingComplete ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {completionType === "paid" ? "Booking Confirmed!" : 
               isRequestMode ? "Request Received!" :
               completionType === "pay_on_arrival" ? "Appointment Confirmed!" : 
               "Consultation Booked!"}
            </h2>
            <p className="text-muted-foreground mb-6">
               {completionType === "paid"
                ? "Your payment has been received. Check your email for your receipt and details."
                : isRequestMode
                ? "We received your request and will contact you within 1 business day to confirm your appointment."
                : completionType === "pay_on_arrival"
                ? "Your appointment is confirmed. Payment is due at arrival."
                : "This is a free consultation. Check your email for details."}
            </p>
            <div className="bg-muted rounded-lg p-4 text-left max-w-sm mx-auto mb-6">
              <h3 className="font-semibold mb-2">Your Booking Details</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Service:</strong> {completedSummary?.serviceName || getSelectedServiceData()?.name}</li>
                <li><strong>Duration:</strong> {completedSummary?.duration ?? selectedDuration} minutes</li>
                <li><strong>Date:</strong> {completedSummary?.dateLabel || (selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy"))}</li>
                <li><strong>Time:</strong> {completedSummary?.timeLabel || (selectedTime && format(new Date(`2000-01-01T${selectedTime}`), "h:mm a"))}</li>
                <li><strong>Room:</strong> {completedSummary?.roomName || ROOMS.find(r => r.id === selectedRoom)?.name || "H1 - Hallway Room"}</li>
                {completionType === "paid" && (
                  <>
                    <li className="pt-2 border-t border-border mt-2 text-accent font-medium">
                      <strong>Paid in Full:</strong> ${(completedSummary as any)?.totalPaid ?? (completedSummary as any)?.servicePrice ?? calculatePrice()}
                    </li>
                  </>
                )}
                {completionType === "pay_on_arrival" && (
                  <>
                    <li className="pt-2 border-t border-border mt-2">
                      <strong>Service Price:</strong> ${(completedSummary as any)?.servicePrice ?? completedSummary?.total ?? calculatePrice()}
                    </li>
                    <li className="text-accent font-semibold">
                      <strong>Payment Due on Arrival:</strong> ${(completedSummary as any)?.balanceDue ?? calculatePrice()}
                    </li>
                  </>
                )}
              </ul>
            </div>
            <Button onClick={resetBooking} className="bg-accent hover:bg-accent/90 text-primary">
              Book Another Session
            </Button>
          </div>
        ) : (
          <>
            {/* Back Button */}
            {step !== "service" && (
              <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}

            {/* Step 1: Service Selection */}
            {step === "service" && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center mb-6">
                  Select a service to begin booking
                </p>
                
                {/* All Services - Unified List */}
                <div className="grid gap-3">
                  {SERVICES.map((service) => (
                    <Card 
                      key={service.id} 
                      className={cn(
                        "transition-colors cursor-pointer group",
                        service.featured ? "border-accent/50 hover:border-accent" : "hover:border-accent/50"
                      )}
                      onClick={() => handleServiceSelect(service.id, service.options[0].duration)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            service.featured ? "bg-accent/10" : "bg-muted",
                            "group-hover:bg-accent/20"
                          )}>
                            <service.icon className={cn(
                              "h-5 w-5 transition-colors",
                              service.featured ? "text-accent" : "text-muted-foreground",
                              "group-hover:text-accent"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{service.name}</h4>
                              {service.isPromo && isPromoDate(new Date()) && (
                                <Badge variant="outline" className="border-accent text-accent text-xs">
                                  Promo Active
                                </Badge>
                              )}
                              {service.isFree && (
                                <Badge variant="outline" className="border-accent text-accent text-xs">Free</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                              {service.options.map((opt) => {
                                // Determine display price based on current date promo status
                                const showPromoPrice = service.isPromo && opt.promoPrice !== undefined && isPromoDate(new Date());
                                const displayPrice = showPromoPrice ? opt.promoPrice : opt.price;
                                
                                return (
                                  <Button
                                    key={opt.duration}
                                    variant="outline"
                                    size="sm"
                                    className="hover:border-accent hover:bg-accent/10"
                                    onClick={() => handleServiceSelect(service.id, opt.duration)}
                                  >
                                    <span>{opt.label}</span>
                                    {displayPrice > 0 ? (
                                      <span className="ml-2">
                                        {showPromoPrice && opt.price !== opt.promoPrice && (
                                          <span className="line-through text-muted-foreground mr-1">${opt.price}</span>
                                        )}
                                        <span className="text-accent font-semibold">${displayPrice}</span>
                                      </span>
                                    ) : displayPrice === 0 ? (
                                      <span className="ml-2 text-accent font-semibold">Free</span>
                                    ) : opt.note ? (
                                      <span className="ml-2 text-muted-foreground text-xs">{opt.note}</span>
                                    ) : null}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Calendar - Date Selection */}
            {step === "calendar" && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Select your preferred date
                </p>
                
                {/* Room Selection for Couples */}
                {selectedService === "couples" && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Room (Couples massage uses B1 - Back Room)</Label>
                    <Badge variant="secondary">B1 - Back Room (Private couples suite)</Badge>
                  </div>
                )}

                {/* Room Selection for others */}
                {selectedService !== "couples" && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Select Room</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {ROOMS.map((room) => (
                        <Button
                          key={room.id}
                          variant={selectedRoom === room.id ? "default" : "outline"}
                          className={cn(
                            "h-auto py-3 flex flex-col items-center gap-1",
                            selectedRoom === room.id && "bg-accent text-primary hover:bg-accent/90"
                          )}
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-medium">{room.name.split(" - ")[0]}</span>
                          <span className="text-xs opacity-75">{room.name.split(" - ")[1]}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Calendar */}
                  <div className="flex-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => isBefore(startOfDay(date), startOfToday()) || date > addDays(new Date(), 60)}
                      className="rounded-md border pointer-events-auto"
                      modifiers={{
                        available: (date) => {
                          const avail = getDateAvailability(date);
                          return avail ? avail.available >= 4 : false;
                        },
                        limited: (date) => {
                          const avail = getDateAvailability(date);
                          return avail ? avail.available > 0 && avail.available < 4 : false;
                        },
                        fullyBooked: (date) => {
                          const avail = getDateAvailability(date);
                          return avail ? avail.available === 0 : false;
                        },
                      }}
                      modifiersClassNames={{
                        available: "bg-green-500/20 text-green-700 dark:text-green-400 font-medium",
                        limited: "bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium",
                        fullyBooked: "bg-red-500/20 text-red-700 dark:text-red-400 line-through opacity-60",
                      }}
                    />
                  </div>
                  
                  {/* Legend */}
                  <div className="lg:w-48 space-y-3">
                    <div className="text-sm font-medium">Availability</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-muted-foreground">Limited</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                        <span className="text-muted-foreground">Fully Booked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Time Selection */}
            {step === "time" && selectedDate && (
              <div ref={timeStepRef} id="lindsey-booking-step-3" className="space-y-4 scroll-mt-24">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-lg">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h4>
                  <p className="text-muted-foreground text-sm">Select your preferred time</p>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {selectedDaySlots.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">No available times for this date.</p>
                      <p className="text-sm text-muted-foreground mt-1">Try selecting a different date.</p>
                    </div>
                  ) : (
                    selectedDaySlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant="outline"
                        disabled={!slot.available}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={cn(
                          "h-12 flex flex-col items-center justify-center gap-0.5 transition-all",
                          slot.available 
                            ? "hover:bg-accent/10 hover:border-accent" 
                            : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span className="text-sm font-medium">{slot.display}</span>
                        {slot.available ? (
                          <span className="text-xs text-green-600">Open</span>
                        ) : slot.reason === "booked" ? (
                          <span className="text-xs text-destructive">Booked</span>
                        ) : slot.reason === "too-short" ? (
                          <span className="text-xs text-muted-foreground">Too late</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Closed</span>
                        )}
                      </Button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Contact Information */}
            {step === "contact" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-lg">
                    {isRequestMode ? "Request Your Appointment" : "Almost Done!"}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {isRequestMode 
                      ? "Tell us when you'd like to come in and we'll confirm your appointment"
                      : "Enter your contact information to complete the booking"}
                  </p>
                </div>

                {/* Summary Card */}
                <Card className="bg-accent/5 border-accent/30">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{getSelectedServiceData()?.name}</p>
                        {isRequestMode ? (
                          <p className="text-sm text-muted-foreground">{selectedDuration} min session</p>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground">
                              {selectedDate && format(selectedDate, "EEE, MMM d")} at{" "}
                              {selectedTime && format(new Date(`2000-01-01T${selectedTime}`), "h:mm a")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ROOMS.find(r => r.id === selectedRoom)?.name || "H1 - Hallway Room"} • {selectedDuration} min
                            </p>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        {(() => {
                          const breakdown = getPriceBreakdown();
                          if (!breakdown) {
                            return <p className="text-xl font-bold text-green-600">Free</p>;
                          }
                          
                          // Pay on arrival mode (payments disabled)
                          if (!spaPaymentsEnabled) {
                            return (
                              <div className="space-y-1 text-sm">
                                <p className="text-muted-foreground">
                                  Service Price: <span className="font-medium text-foreground">${breakdown.servicePrice}</span>
                                </p>
                                <p className="text-accent font-semibold">
                                  Due on Arrival: ${breakdown.servicePrice}
                                </p>
                              </div>
                            );
                          }
                          
                          // Full price payment mode
                          return (
                            <div className="space-y-1 text-sm">
                              <p className="text-xl font-bold text-foreground">
                                ${breakdown.servicePrice}
                              </p>
                              <p className="text-accent font-semibold text-xs">
                                Paid at checkout
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Fields */}
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={guestInfo.name}
                        onChange={(e) => {
                          setGuestInfo(prev => ({ ...prev, name: e.target.value }));
                          if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        placeholder="Your full name"
                        required
                        className={formErrors.name ? "border-destructive" : ""}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-destructive">{formErrors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => {
                          setGuestInfo(prev => ({ ...prev, email: e.target.value }));
                          if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        placeholder="you@email.com"
                        required
                        className={formErrors.email ? "border-destructive" : ""}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-destructive">{formErrors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={guestInfo.phone}
                      onChange={(e) => {
                        setGuestInfo(prev => ({ ...prev, phone: e.target.value }));
                        if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="(555) 123-4567"
                      required
                      className={formErrors.phone ? "border-destructive" : ""}
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-destructive">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Preferred Day/Time - Request Mode Only */}
                {isRequestMode && (
                  <div className="space-y-2">
                    <Label>When would you like to come in?</Label>
                    <p className="text-xs text-muted-foreground">Open 7 days a week, 10:00 AM – 8:30 PM.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Preferred Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              type="button"
                              className={cn("w-full h-9 justify-start text-left font-normal text-sm", !requestDate && "text-muted-foreground")}
                            >
                              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                              {requestDate ? format(requestDate, "MM/dd/yyyy") : "Pick date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50" align="start">
                            <Calendar
                              mode="single"
                              selected={requestDate}
                              onSelect={(d) => {
                                setRequestDate(d);
                                if (d && requestTime) {
                                  const timeLabel = REQUEST_TIME_SLOTS.find(t => t.value === requestTime)?.label || requestTime;
                                  setPreferredDateTime(`${format(d, "PPP")} at ${timeLabel}`);
                                }
                              }}
                              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="text-xs">Preferred Time *</Label>
                        <Select value={requestTime} onValueChange={(v) => {
                          setRequestTime(v);
                          const timeLabel = REQUEST_TIME_SLOTS.find(t => t.value === v)?.label || v;
                          if (requestDate) {
                            setPreferredDateTime(`${format(requestDate, "PPP")} at ${timeLabel}`);
                          } else {
                            setPreferredDateTime(`Time: ${timeLabel}`);
                          }
                        }}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Pick time" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50 max-h-48">
                            {REQUEST_TIME_SLOTS.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consent Checkbox - Only for paid services when payments enabled */}
                {calculatePrice() !== null && calculatePrice() !== 0 && spaPaymentsEnabled && (
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border">
                    <Checkbox
                      id="consent"
                      checked={consentChecked}
                      onCheckedChange={(checked) => setConsentChecked(checked === true)}
                      className="mt-0.5"
                    />
                    <Label 
                      htmlFor="consent" 
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      I understand that <span className="font-semibold text-accent">full payment</span> is required today to confirm my appointment. 
                      If I do not show up (or cancel outside the policy window), the payment is non-refundable.
                    </Label>
                  </div>
                )}

                {/* Pay on arrival notice when payments disabled (non-request mode) */}
                {!isRequestMode && calculatePrice() !== null && calculatePrice() !== 0 && !spaPaymentsEnabled && (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-sm text-foreground">
                      <strong>Payment due on arrival:</strong> ${calculatePrice()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No payment is required to book. Pay when you arrive for your appointment.
                    </p>
                  </div>
                )}

                {/* Request mode notice */}
                {isRequestMode && calculatePrice() !== null && calculatePrice() !== 0 && (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-sm text-foreground">
                      <strong>No payment required now.</strong> We will contact you to confirm your appointment and discuss payment options.
                    </p>
                  </div>
                )}

                {/* SMS Consent */}
                <SmsConsentCheckbox checked={smsConsent} onCheckedChange={setSmsConsent} />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
                  disabled={isSubmitting || !isFormValid()}
                >
                  {isSubmitting 
                    ? "Processing..." 
                    : calculatePrice() === 0 
                      ? "Confirm Booking" 
                      : isRequestMode
                        ? "Submit Request"
                        : spaPaymentsEnabled 
                          ? `Pay $${calculatePrice()} Now`
                          : "Confirm Appointment"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>

                {calculatePrice() !== 0 && spaPaymentsEnabled && (
                  <p className="text-center text-xs text-muted-foreground">
                    You will be redirected to secure payment for the full service price.
                  </p>
                )}
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
