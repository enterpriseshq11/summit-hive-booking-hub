import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, addDays, startOfToday, isBefore, startOfDay } from "date-fns";
import { 
  CalendarIcon, Clock, CheckCircle, XCircle, ChevronRight, ArrowLeft,
  Heart, Flame, Star, Users, MapPin, Sparkles, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Services data
const SERVICES = [
  {
    id: "swedish",
    name: "Swedish Massage",
    description: "Relaxation focused, light to medium pressure.",
    icon: Heart,
    options: [
      { duration: 30, price: 45, label: "30 min" },
      { duration: 60, price: 80, label: "60 min" },
    ],
  },
  {
    id: "deep-tissue",
    name: "Deep Tissue Massage",
    description: "Focused therapeutic work, deeper pressure.",
    icon: Flame,
    options: [
      { duration: 30, price: 55, label: "30 min" },
      { duration: 60, price: null, label: "60 min", note: "Contact for quote" },
    ],
  },
  {
    id: "ashiatsu",
    name: "Ashiatsu (Barefoot Massage)",
    description: "Deep pressure using feet for full body relief.",
    icon: Star,
    featured: true,
    options: [
      { duration: 60, price: 60, label: "60 min" },
      { duration: 90, price: 90, label: "90 min" },
    ],
  },
  {
    id: "couples",
    name: "Couples Massage",
    description: "Side-by-side couples session with add-ons available.",
    icon: Users,
    featured: true,
    isPromo: true,
    options: [
      { duration: 60, price: 85, promoPrice: 70, label: "60 min" },
      { duration: 90, price: 125, promoPrice: 95, label: "90 min" },
    ],
  },
  {
    id: "prenatal-consult",
    name: "Prenatal Consultation",
    description: "Free consult to determine safest approach.",
    icon: Heart,
    isFree: true,
    options: [{ duration: 15, price: 0, label: "Free" }],
  },
  {
    id: "migraine-consult",
    name: "Migraine Consultation",
    description: "Free consult to identify triggers and plan session.",
    icon: Heart,
    isFree: true,
    options: [{ duration: 15, price: 0, label: "Free" }],
  },
];

const ROOMS = [
  { 
    id: "11111111-1111-1111-1111-111111111111", 
    name: "H1 - Hallway Room", 
    description: "Calm and quiet, perfect for focused recovery.",
    capacity: 1,
  },
  { 
    id: "22222222-2222-2222-2222-222222222222", 
    name: "B1 - Back Room", 
    description: "Secluded and peaceful. Ideal for couples.",
    capacity: 2,
  },
];

// Time slots from 9 AM to 8 PM
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

// Mock availability data
const generateMockAvailability = () => {
  const today = startOfToday();
  const availability: Record<string, { available: number; total: number }> = {};
  
  for (let i = 0; i < 60; i++) {
    const date = addDays(today, i);
    const dateKey = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseAvailable = isWeekend ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 6) + 2;
    const totalSlots = 8;
    
    availability[dateKey] = {
      available: Math.min(baseAvailable, totalSlots),
      total: totalSlots,
    };
  }
  
  return availability;
};

type BookingStep = "service" | "calendar" | "time" | "contact" | "confirm";

interface LindseyAvailabilityCalendarProps {
  onBookingComplete?: () => void;
}

export function LindseyAvailabilityCalendar({ onBookingComplete }: LindseyAvailabilityCalendarProps) {
  const [step, setStep] = useState<BookingStep>("service");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  // Ref for scrolling to calendar step
  const calendarStepRef = useRef<HTMLDivElement>(null);
  
  const availability = useMemo(() => generateMockAvailability(), []);
  
  // Generate mock slots for selected day
  const selectedDaySlots = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const dayAvail = availability[dateKey];
    
    if (!dayAvail) return [];
    
    return TIME_SLOTS.map((time, index) => ({
      time,
      available: index < dayAvail.available || Math.random() > 0.5,
      display: format(new Date(`2000-01-01T${time}`), "h:mm a"),
    }));
  }, [selectedDate, availability]);
  
  const getDateAvailability = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return availability[dateKey];
  };

  const getSelectedServiceData = () => {
    if (!selectedService) return null;
    return SERVICES.find(s => s.id === selectedService);
  };

  const getSelectedOption = () => {
    const service = getSelectedServiceData();
    if (!service || !selectedDuration) return null;
    return service.options.find(o => o.duration === selectedDuration);
  };

  const calculatePrice = () => {
    const option = getSelectedOption();
    if (!option) return null;
    if ('promoPrice' in option && option.promoPrice) {
      return option.promoPrice;
    }
    return option.price;
  };
  
  const handleServiceSelect = (serviceId: string, duration: number) => {
    setSelectedService(serviceId);
    setSelectedDuration(duration);
    // For couples massage, default to B1 room
    if (serviceId === "couples") {
      setSelectedRoom("22222222-2222-2222-2222-222222222222");
    }
    setStep("calendar");
    
    // Scroll to calendar step after state update
    setTimeout(() => {
      calendarStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setStep("time");
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("contact");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDuration || !selectedDate || !selectedTime) {
      toast.error("Please complete all required fields");
      return;
    }

    if (!guestInfo.name || !guestInfo.email) {
      toast.error("Please provide your name and email");
      return;
    }

    // Use selected room or default to H1
    const roomId = selectedRoom || "11111111-1111-1111-1111-111111111111";

    setIsSubmitting(true);

    try {
      // Create the booking in the database
      const startDatetime = `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`;
      const endMinutes = selectedDuration || 60;
      const [hours, mins] = selectedTime.split(":").map(Number);
      const endHours = hours + Math.floor((mins + endMinutes) / 60);
      const endMins = (mins + endMinutes) % 60;
      const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
      const endDatetime = `${format(selectedDate, "yyyy-MM-dd")}T${endTime}:00`;

      // Get spa business ID
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("type", "spa")
        .single();

      if (!business) {
        throw new Error("Business not found");
      }

      // Get or create bookable type
      const { data: bookableType } = await supabase
        .from("bookable_types")
        .select("id")
        .eq("business_id", business.id)
        .eq("slug", "massage")
        .single();

      const bookableTypeId = bookableType?.id || business.id;

      // Create booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          business_id: business.id,
          bookable_type_id: bookableTypeId,
          booking_number: `SPA-${Date.now()}`,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          guest_name: guestInfo.name,
          guest_email: guestInfo.email,
          guest_phone: guestInfo.phone || null,
          status: "pending",
          subtotal: calculatePrice() || 0,
          total_amount: calculatePrice() || 0,
          notes: `Service: ${getSelectedServiceData()?.name}, Duration: ${selectedDuration} min, Room: ${ROOMS.find(r => r.id === roomId)?.name}`,
        });

      if (bookingError) {
        console.error("Booking error:", bookingError);
        throw bookingError;
      }

      // Send notification email
      try {
        await supabase.functions.invoke("spa-booking-notification", {
          body: {
            type: "booking_confirmation",
            booking: {
              guest_name: guestInfo.name,
              guest_email: guestInfo.email,
              guest_phone: guestInfo.phone,
              service_name: getSelectedServiceData()?.name,
              duration: selectedDuration,
              room_name: ROOMS.find(r => r.id === roomId)?.name,
              date: format(selectedDate, "EEEE, MMMM d, yyyy"),
              time: format(new Date(`2000-01-01T${selectedTime}`), "h:mm a"),
              price: calculatePrice(),
            },
          },
        });
      } catch (notificationError) {
        console.warn("Notification error:", notificationError);
        // Don't fail the booking if notification fails
      }

      setBookingComplete(true);
      setStep("confirm");
      toast.success("Booking request submitted! Lindsey will confirm within 24 hours.");
      onBookingComplete?.();
    } catch (error) {
      console.error("Booking submission error:", error);
      toast.error("Failed to submit booking. Please try again.");
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
        setStep("time");
        break;
      default:
        break;
    }
  };

  // Step indicator
  const steps = [
    { key: "service", label: "Service" },
    { key: "calendar", label: "Date" },
    { key: "time", label: "Time" },
    { key: "contact", label: "Details" },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <Card className="shadow-premium border-border overflow-hidden">
      {/* Gold accent line */}
      <div className="h-1 bg-accent" />
      
      <CardHeader className="border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-accent" />
            Book Your Session
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
            <h2 className="text-2xl font-bold mb-2">Booking Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Lindsey will review and confirm within 24 hours. Check your email for details.
            </p>
            <div className="bg-muted rounded-lg p-4 text-left max-w-sm mx-auto mb-6">
              <h3 className="font-semibold mb-2">Your Booking Details</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Service:</strong> {getSelectedServiceData()?.name}</li>
                <li><strong>Duration:</strong> {selectedDuration} minutes</li>
                <li><strong>Date:</strong> {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</li>
                <li><strong>Time:</strong> {selectedTime && format(new Date(`2000-01-01T${selectedTime}`), "h:mm a")}</li>
                <li><strong>Room:</strong> {ROOMS.find(r => r.id === selectedRoom)?.name || "H1 - Hallway Room"}</li>
                {calculatePrice() !== null && calculatePrice() !== 0 && (
                  <li><strong>Estimated Total:</strong> ${calculatePrice()}</li>
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
                              {service.isPromo && (
                                <Badge variant="outline" className="border-green-500 text-green-600 text-xs">Promo</Badge>
                              )}
                              {service.isFree && (
                                <Badge variant="outline" className="border-green-500 text-green-600 text-xs">Free</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                              {service.options.map((opt) => (
                                <Button
                                  key={opt.duration}
                                  variant="outline"
                                  size="sm"
                                  className="hover:border-accent hover:bg-accent/10"
                                  onClick={() => handleServiceSelect(service.id, opt.duration)}
                                >
                                  <span>{opt.label}</span>
                                  {'promoPrice' in opt && opt.promoPrice ? (
                                    <span className="ml-2 text-accent font-semibold">${opt.promoPrice}</span>
                                  ) : opt.price !== null && opt.price > 0 ? (
                                    <span className="ml-2 text-accent font-semibold">${opt.price}</span>
                                  ) : opt.price === 0 ? (
                                    <span className="ml-2 text-accent font-semibold">Free</span>
                                  ) : (
                                    <span className="ml-2 text-muted-foreground text-xs">{opt.note}</span>
                                  )}
                                </Button>
                              ))}
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
              <div ref={calendarStepRef} className="space-y-4">
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
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-lg">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h4>
                  <p className="text-muted-foreground text-sm">Select your preferred time</p>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {selectedDaySlots.map((slot) => (
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
                      ) : (
                        <span className="text-xs text-muted-foreground">Booked</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Contact Information */}
            {step === "contact" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-lg">Almost Done!</h4>
                  <p className="text-muted-foreground text-sm">Enter your contact information to complete the booking</p>
                </div>

                {/* Summary Card */}
                <Card className="bg-accent/5 border-accent/30">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{getSelectedServiceData()?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDate && format(selectedDate, "EEE, MMM d")} at{" "}
                          {selectedTime && format(new Date(`2000-01-01T${selectedTime}`), "h:mm a")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ROOMS.find(r => r.id === selectedRoom)?.name || "H1 - Hallway Room"} • {selectedDuration} min
                        </p>
                      </div>
                      <div className="text-right">
                        {calculatePrice() !== null && calculatePrice() !== 0 ? (
                          <p className="text-2xl font-bold text-accent">${calculatePrice()}</p>
                        ) : (
                          <p className="text-xl font-bold text-green-600">Free</p>
                        )}
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
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="you@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
                  disabled={isSubmitting || !guestInfo.name || !guestInfo.email}
                >
                  {isSubmitting ? "Submitting..." : "Confirm Booking"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Lindsey will confirm within 24 hours. No payment required now.
                </p>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
