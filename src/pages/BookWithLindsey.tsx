import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { 
  Sparkles, Clock, Heart, ArrowRight, ArrowLeft, Star, CheckCircle, Calendar as CalendarIcon, 
  User, MapPin, Phone, Mail, Gift, Flame, Users, ChevronRight, AlertCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import restorationLoungeLogo from "@/assets/restoration-lounge-logo.jpg";

// Lindsey's pricing menu data
const SERVICES = {
  swedish: {
    id: "swedish",
    name: "Swedish Massage",
    description: "Relaxation focused, light to medium pressure.",
    icon: Heart,
    featured: false,
    options: [
      { duration: 30, price: 45, label: "30 min" },
      { duration: 60, price: 80, label: "60 min" },
    ],
  },
  deepTissue: {
    id: "deep-tissue",
    name: "Deep Tissue Massage",
    description: "Focused therapeutic work, deeper pressure.",
    icon: Flame,
    featured: false,
    options: [
      { duration: 30, price: 55, label: "30 min" },
      { duration: 60, price: null, label: "60 min", note: "Price TBD — contact for quote" },
    ],
  },
  ashiatsu: {
    id: "ashiatsu",
    name: "Ashiatsu (Barefoot Massage)",
    description: "Lindsey uses overhead bars for balance and applies deep pressure using feet for full body relief.",
    icon: Star,
    featured: true,
    options: [
      { duration: 60, price: 60, label: "60 min" },
      { duration: 90, price: 90, label: "90 min" },
    ],
  },
  couples: {
    id: "couples",
    name: "Couples Massage (Side-by-Side)",
    description: "Side-by-side couples massage with add-on options available such as hot stones, aromatherapy, and cupping. No 'dead time' during the session.",
    icon: Users,
    featured: true,
    isPromo: true,
    promoNote: "Promo: End of January + all of February",
    options: [
      { duration: 60, price: 85, promoPrice: 70, label: "60 min" },
      { duration: 90, price: 125, promoPrice: 95, label: "90 min" },
    ],
  },
  prenatalConsult: {
    id: "prenatal-consult",
    name: "Prenatal Consultation",
    description: "Quick consult to determine safest approach and best plan.",
    icon: Heart,
    featured: false,
    isFree: true,
    options: [{ duration: 15, price: 0, label: "Free" }],
  },
  migraineConsult: {
    id: "migraine-consult",
    name: "Migraine Consultation",
    description: "Quick consult to identify triggers and plan session focus.",
    icon: Heart,
    featured: false,
    isFree: true,
    options: [{ duration: 15, price: 0, label: "Free" }],
  },
};

const ADDONS = [
  { id: "hot-stones", name: "Hot Stones", available: true },
  { id: "aromatherapy", name: "Aromatherapy", available: true },
  { id: "cupping", name: "Cupping", available: true },
];

const ROOMS = [
  { 
    id: "11111111-1111-1111-1111-111111111111", 
    name: "H1 - Hallway Room", 
    description: "Calm, quiet, and perfect for focused recovery sessions.",
    capacity: 1,
    image: null, // Placeholder until photo provided
    placeholder: "Serene treatment space with natural lighting"
  },
  { 
    id: "22222222-2222-2222-2222-222222222222", 
    name: "B1 - Back Room", 
    description: "Secluded and peaceful for maximum relaxation. Ideal for couples.",
    capacity: 2,
    image: null, // Placeholder until photo provided
    placeholder: "Private couples suite with premium amenities"
  },
];

// Generate time slots from 9 AM to 9 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 20) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function BookWithLindsey() {
  const [step, setStep] = useState<"menu" | "booking">("menu");
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  // Booking state
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  const bookingFormRef = useRef<HTMLDivElement>(null);

  const getSelectedServiceData = () => {
    if (!selectedService) return null;
    return Object.values(SERVICES).find(s => s.id === selectedService);
  };

  const getSelectedOption = () => {
    const service = getSelectedServiceData();
    if (!service || !selectedDuration) return null;
    return service.options.find(o => o.duration === selectedDuration);
  };

  const calculatePrice = () => {
    const option = getSelectedOption();
    if (!option) return null;
    // Use promo price for couples if in promo period
    if ('promoPrice' in option && option.promoPrice) {
      return option.promoPrice;
    }
    return option.price;
  };

  const handleServiceSelect = (serviceId: string, duration: number) => {
    setSelectedService(serviceId);
    setSelectedDuration(duration);
    setStep("booking");
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDuration || !selectedDate || !selectedTime || !selectedRoom) {
      toast.error("Please complete all required fields");
      return;
    }

    if (!guestInfo.name || !guestInfo.email) {
      toast.error("Please provide your name and email");
      return;
    }

    setIsSubmitting(true);

    // Simulate booking submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setBookingComplete(true);
    toast.success("Booking request submitted! Lindsey will confirm within 24 hours.");
  };

  const resetBooking = () => {
    setSelectedService(null);
    setSelectedDuration(null);
    setSelectedRoom(null);
    setSelectedDate(undefined);
    setSelectedTime("");
    setGuestInfo({ name: "", email: "", phone: "" });
    setBookingComplete(false);
    setStep("menu");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Matching Spa Layout */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-primary min-h-[70vh] flex items-center">
        {/* Background - dark with subtle gold radial */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08)_0%,transparent_60%)]" />
        
        {/* Honeycomb Watermark Pattern - Left */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -left-20 top-1/4 w-[500px] h-[500px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-left-lindsey" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-left-lindsey)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Right */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -right-20 top-1/3 w-[600px] h-[600px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-right-lindsey" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-right-lindsey)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Center Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.10]" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-center-lindsey" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-center-lindsey)" />
          </svg>
        </div>
        
        <div className="container relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
            {/* Hero Copy - Left Side */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">
                Book With Lindsey
              </h1>
              <p className="text-xl md:text-2xl text-accent font-medium mb-4">
                Licensed Massage Therapist & Recovery Specialist
              </p>
              <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl">
                Results-driven recovery treatments. Every session is intentional, customized, and focused on real outcomes.
              </p>
              
              {/* Hero CTAs - Left Aligned */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center lg:items-start gap-3 mb-4">
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById("pricing-menu")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  View Services & Pricing
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowPricingModal(true)}
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  Quick Price Check
                </Button>
              </div>
              
              {/* Book With Lindsey CTA */}
              <div className="flex justify-center lg:justify-start mb-6">
                <Button
                  size="lg"
                  onClick={() => {
                    setStep("booking");
                    setTimeout(() => {
                      bookingFormRef.current?.scrollIntoView({ behavior: "smooth" });
                      bookingFormRef.current?.focus();
                    }, 100);
                  }}
                  className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold"
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Book With Lindsey
                </Button>
              </div>
              
              {/* Trust Badge */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-primary-foreground/70">
                <CheckCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                <span className="text-sm">Available 7 days a week • 9 AM – 9 PM</span>
              </div>
            </div>
            
            {/* Logo - Right Side */}
            <div className="flex-shrink-0 w-full lg:w-1/2 flex justify-center lg:justify-end">
              <img 
                src="/lovable-uploads/5509800c-167c-43ec-a79a-bef75a2b447b.png" 
                alt="The Hive Restoration Lounge Logo" 
                className="w-full max-w-md lg:max-w-lg object-contain drop-shadow-2xl"
                style={{ maxHeight: "clamp(280px, 40vw, 420px)" }}
              />
            </div>
          </div>
        </div>
        
        {/* Angled divider */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 bg-background" 
          style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} 
          aria-hidden="true" 
        />
      </section>

      {/* Pricing Menu Section */}
      <section id="pricing-menu" className="py-12 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Services & Pricing</h2>
          <p className="text-muted-foreground text-lg">Select a service to begin your booking</p>
        </div>

        {/* Featured Services */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            Featured Services
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ashiatsu Card */}
            <Card className="border-2 border-accent/50 shadow-gold-lg relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <Badge className="bg-accent text-primary font-bold">Most Popular</Badge>
              </div>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{SERVICES.ashiatsu.name}</CardTitle>
                <CardDescription className="text-base">{SERVICES.ashiatsu.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SERVICES.ashiatsu.options.map((opt) => (
                    <Button
                      key={opt.duration}
                      variant="outline"
                      className="w-full justify-between h-auto py-3 hover:border-accent hover:bg-accent/10"
                      onClick={() => handleServiceSelect("ashiatsu", opt.duration)}
                    >
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-accent font-bold">${opt.price}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Couples Card */}
            <Card className="border-2 border-accent/50 shadow-gold-lg relative overflow-hidden">
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className="bg-accent text-primary font-bold">Featured</Badge>
                <Badge variant="outline" className="border-green-500 text-green-600">Promo Active</Badge>
              </div>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{SERVICES.couples.name}</CardTitle>
                <CardDescription className="text-base">{SERVICES.couples.description}</CardDescription>
                <p className="text-sm text-green-600 font-medium mt-2">
                  <Gift className="h-4 w-4 inline mr-1" />
                  {SERVICES.couples.promoNote}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SERVICES.couples.options.map((opt) => (
                    <Button
                      key={opt.duration}
                      variant="outline"
                      className="w-full justify-between h-auto py-3 hover:border-accent hover:bg-accent/10"
                      onClick={() => handleServiceSelect("couples", opt.duration)}
                    >
                      <span className="font-medium">{opt.label}</span>
                      <div className="text-right">
                        <span className="text-muted-foreground line-through text-sm mr-2">${opt.price}</span>
                        <span className="text-accent font-bold">${opt.promoPrice}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Standard Services */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Massage Services</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Swedish */}
            <Card className="hover:shadow-gold transition-all">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">{SERVICES.swedish.name}</CardTitle>
                <CardDescription>{SERVICES.swedish.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {SERVICES.swedish.options.map((opt) => (
                    <Button
                      key={opt.duration}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:border-accent"
                      onClick={() => handleServiceSelect("swedish", opt.duration)}
                    >
                      <span>{opt.label}</span>
                      <span className="font-semibold">${opt.price}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deep Tissue */}
            <Card className="hover:shadow-gold transition-all">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                  <Flame className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">{SERVICES.deepTissue.name}</CardTitle>
                <CardDescription>{SERVICES.deepTissue.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {SERVICES.deepTissue.options.map((opt) => (
                    <Button
                      key={opt.duration}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:border-accent"
                      onClick={() => opt.price !== null ? handleServiceSelect("deep-tissue", opt.duration) : toast.info("Contact Lindsey for 60-min deep tissue pricing")}
                      disabled={opt.price === null}
                    >
                      <span>{opt.label}</span>
                      {opt.price !== null ? (
                        <span className="font-semibold">${opt.price}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">TBD</span>
                      )}
                    </Button>
                  ))}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <AlertCircle className="h-3 w-3" />
                    60-min deep tissue price to be confirmed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Consultations */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Free Consultations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-gold transition-all border-green-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{SERVICES.prenatalConsult.name}</CardTitle>
                  <Badge variant="outline" className="border-green-500 text-green-600">Free</Badge>
                </div>
                <CardDescription>{SERVICES.prenatalConsult.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-500/10"
                  onClick={() => handleServiceSelect("prenatal-consult", 15)}
                >
                  Schedule Consultation
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-gold transition-all border-green-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{SERVICES.migraineConsult.name}</CardTitle>
                  <Badge variant="outline" className="border-green-500 text-green-600">Free</Badge>
                </div>
                <CardDescription>{SERVICES.migraineConsult.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-500/10"
                  onClick={() => handleServiceSelect("migraine-consult", 15)}
                >
                  Schedule Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add-ons Note */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Available Add-ons</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Enhance your session with these optional additions. Pricing available upon request.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ADDONS.map((addon) => (
                    <Badge key={addon.id} variant="secondary">{addon.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Booking Form Section */}
      {step === "booking" && (
        <section ref={bookingFormRef} id="booking-form" className="py-12 bg-muted/30">
          <div className="container max-w-3xl">
            {bookingComplete ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Booking Request Submitted!</h2>
                  <p className="text-muted-foreground mb-6">
                    Lindsey will review your request and confirm within 24 hours. You'll receive an email confirmation shortly.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 text-left">
                      <h3 className="font-semibold mb-2">Your Booking Details</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li><strong>Service:</strong> {getSelectedServiceData()?.name}</li>
                        <li><strong>Duration:</strong> {selectedDuration} minutes</li>
                        <li><strong>Date:</strong> {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</li>
                        <li><strong>Time:</strong> {selectedTime && format(new Date(`2000-01-01T${selectedTime}`), "h:mm a")}</li>
                        <li><strong>Room:</strong> {ROOMS.find(r => r.id === selectedRoom)?.name}</li>
                        {calculatePrice() !== null && calculatePrice() !== 0 && (
                          <li><strong>Estimated Total:</strong> ${calculatePrice()}</li>
                        )}
                      </ul>
                    </div>
                    <Button onClick={resetBooking} className="bg-accent hover:bg-accent/90 text-primary">
                      Book Another Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Complete Your Booking</CardTitle>
                      <CardDescription>
                        {getSelectedServiceData()?.name} • {selectedDuration} min
                        {calculatePrice() !== null && calculatePrice() !== 0 && (
                          <span className="text-accent font-semibold ml-2">${calculatePrice()}</span>
                        )}
                        {calculatePrice() === 0 && (
                          <span className="text-green-600 font-semibold ml-2">Free</span>
                        )}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep("menu")}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Change Service
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Room Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Select Room</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {ROOMS.map((room) => (
                          <Card
                            key={room.id}
                            className={cn(
                              "cursor-pointer transition-all hover:border-accent",
                              selectedRoom === room.id && "border-accent ring-2 ring-accent"
                            )}
                            onClick={() => setSelectedRoom(room.id)}
                          >
                            <CardContent className="p-4 text-center">
                              {room.image ? (
                                <img src={room.image} alt={room.name} className="w-full h-24 object-cover rounded mb-2" />
                              ) : (
                                <div className="w-full h-24 bg-gradient-to-br from-accent/10 to-accent/5 rounded flex flex-col items-center justify-center mb-2 border border-accent/20">
                                  <MapPin className="h-6 w-6 text-accent/60 mb-1" />
                                  <span className="text-xs text-muted-foreground">{room.placeholder}</span>
                                </div>
                              )}
                              <h4 className="font-semibold text-sm">{room.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{room.description}</p>
                              {selectedRoom === room.id && (
                                <Badge className="mt-2" variant="secondary">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Selected
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className={cn("w-full justify-start", !selectedDate && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Time</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Guest Info */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Your Information</Label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={guestInfo.name}
                            onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={guestInfo.email}
                            onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="you@email.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone (optional)</Label>
                        <Input
                          type="tel"
                          value={guestInfo.phone}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <Card className="bg-accent/5 border-accent/30">
                      <CardContent className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{getSelectedServiceData()?.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedDuration} minutes</p>
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

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
                      disabled={isSubmitting || !selectedRoom || !selectedDate || !selectedTime}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Lindsey will confirm your booking within 24 hours. No payment required now.
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Matterport Virtual Tour - Coming Soon */}
      <section className="py-12 container">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Take a Virtual Tour</h2>
          <p className="text-muted-foreground">Explore The Restoration Lounge before your visit</p>
        </div>
        <Card className="max-w-4xl mx-auto overflow-hidden shadow-premium">
          <div className="aspect-video bg-gradient-to-br from-primary via-primary/95 to-primary/90 flex items-center justify-center relative">
            {/* Honeycomb pattern overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08]" aria-hidden="true">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
                <pattern id="honeycomb-tour-booking" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
                  <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#honeycomb-tour-booking)" />
              </svg>
            </div>
            
            {/* Coming Soon Content */}
            <div className="relative z-10 text-center p-8">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 border-2 border-accent/40 shadow-gold">
                <MapPin className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-primary-foreground mb-2">3D Walkthrough Coming Soon</h3>
              <p className="text-primary-foreground/70 mb-4 max-w-md">
                Experience our private treatment rooms in stunning 360° detail.
              </p>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" disabled>
                Virtual Tour (Coming Soon)
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Back to Spa Link */}
      <section className="py-8 container text-center">
        <Link to="/spa">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Spa Page
          </Button>
        </Link>
      </section>

      {/* Quick Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Price Reference</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Swedish Massage</h4>
              <p className="text-sm text-muted-foreground">30 min — $45 | 60 min — $80</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Deep Tissue Massage</h4>
              <p className="text-sm text-muted-foreground">30 min — $55 | 60 min — TBD</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Ashiatsu (Barefoot)</h4>
              <p className="text-sm text-muted-foreground">60 min — $60 | 90 min — $90</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-600">Couples Massage (Promo)</h4>
              <p className="text-sm text-muted-foreground">
                60 min — <span className="line-through">$85</span> $70 | 90 min — <span className="line-through">$125</span> $95
              </p>
              <p className="text-xs text-green-600 mt-1">Promo valid through end of February</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Consultations</h4>
              <p className="text-sm text-muted-foreground">Prenatal & Migraine — Free</p>
            </div>
          </div>
          <Button 
            className="w-full mt-4 bg-accent hover:bg-accent/90 text-primary"
            onClick={() => {
              setShowPricingModal(false);
              document.getElementById("pricing-menu")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            View Full Menu & Book
          </Button>
        </DialogContent>
      </Dialog>

      <ScrollToTopButton />
    </div>
  );
}
