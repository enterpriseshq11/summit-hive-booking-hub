import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { 
  Sparkles, Clock, Heart, ArrowLeft, Star, CheckCircle, 
  Users, Gift, Info, Eye
} from "lucide-react";
import { LindseyAvailabilityCalendar } from "@/components/booking/LindseyAvailabilityCalendar";

// Lindsey's pricing menu data for reference/modal only
const SERVICES = {
  swedish: {
    name: "Swedish Massage",
    options: [
      { duration: 30, price: 45 },
      { duration: 60, price: 80 },
    ],
  },
  deepTissue: {
    name: "Deep Tissue Massage",
    options: [
      { duration: 30, price: 55 },
      { duration: 60, price: null, note: "TBD" },
    ],
  },
  ashiatsu: {
    name: "Ashiatsu (Barefoot Massage)",
    options: [
      { duration: 60, price: 60 },
      { duration: 90, price: 90 },
    ],
  },
  couples: {
    name: "Couples Massage",
    options: [
      { duration: 60, price: 85, promoPrice: 70 },
      { duration: 90, price: 125, promoPrice: 95 },
    ],
  },
};

const ADDONS = [
  { id: "hot-stones", name: "Hot Stones" },
  { id: "aromatherapy", name: "Aromatherapy" },
  { id: "cupping", name: "Cupping" },
];

export default function BookWithLindsey() {
  const [showPricingModal, setShowPricingModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-primary min-h-[60vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08)_0%,transparent_60%)]" />
        
        {/* Honeycomb Watermark Pattern */}
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
            {/* Hero Copy */}
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
              
              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center lg:items-start gap-3 mb-4 md:translate-x-16 lg:translate-x-0">
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById("booking-calendar")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Book Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setShowPricingModal(true)}
                  className="border-accent/50 text-accent hover:bg-accent/10"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Quick Pricing
                </Button>
              </div>
              
              {/* Trust Badge */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-primary-foreground/70">
                <CheckCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                <span className="text-sm">Available 7 days a week • 9 AM – 9 PM</span>
              </div>
            </div>
            
            {/* Logo */}
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

      {/* Main Booking Calendar Section - THE SINGLE BOOKING PATH */}
      <section id="booking-calendar" className="py-12 container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Book Your Session</h2>
          <p className="text-muted-foreground text-lg">Select your service, date, and time all in one place</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <LindseyAvailabilityCalendar />
        </div>

        {/* Add-ons Note */}
        <Card className="max-w-4xl mx-auto mt-6 bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Available Add-ons</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Enhance your session with these optional additions. Discuss with Lindsey during your appointment.
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

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

      {/* Virtual Tour - Coming Soon */}
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
                <Eye className="h-8 w-8 text-accent" />
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
              <h4 className="font-semibold mb-2 text-green-600">
                <Gift className="h-4 w-4 inline mr-1" />
                Couples Massage (Promo)
              </h4>
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
              document.getElementById("booking-calendar")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Book Now
          </Button>
        </DialogContent>
      </Dialog>

      <ScrollToTopButton />
    </div>
  );
}
