import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { 
  Sparkles, ArrowLeft, CheckCircle, 
  Info, Eye, Gift, Clock, Heart, Star, Loader2
} from "lucide-react";
import { LindseyAvailabilityCalendar } from "@/components/booking/LindseyAvailabilityCalendar";
import { useSpaPaymentsConfig } from "@/hooks/usePaymentConfigs";
import { useSpaWorkerBySlug, useWorkerServices, SpaWorkerService } from "@/hooks/useSpaWorkerServices";

// Map icon names to components
const ICON_MAP: Record<string, typeof Heart> = {
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
};

export default function BookWithWorker() {
  const { slug } = useParams<{ slug: string }>();
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  const { data: worker, isLoading: isLoadingWorker, error } = useSpaWorkerBySlug(slug);
  const { data: services = [], isLoading: isLoadingServices } = useWorkerServices(worker?.id);
  
  const { spaPaymentsEnabled } = useSpaPaymentsConfig();
  const ctaLabel = spaPaymentsEnabled ? "Book & Pay Deposit" : "Book Now";

  // Loading state
  if (isLoadingWorker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading booking page...</p>
        </div>
      </div>
    );
  }

  // Worker not found or inactive
  if (!worker || error) {
    return <Navigate to="/spa" replace />;
  }

  const formatPrice = (service: SpaWorkerService) => {
    if (service.is_free) return "Free";
    
    const hasActivePromo = service.promo_price && service.promo_ends_at && new Date(service.promo_ends_at) > new Date();
    
    if (hasActivePromo) {
      return (
        <span>
          <span className="line-through text-muted-foreground mr-2">${Number(service.price).toFixed(0)}</span>
          <span className="text-green-500 font-bold">${Number(service.promo_price).toFixed(0)}</span>
        </span>
      );
    }
    
    return `$${Number(service.price).toFixed(0)}`;
  };

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
            <pattern id={`honeycomb-${slug}`} x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill={`url(#honeycomb-${slug})`} />
          </svg>
        </div>
        
        <div className="container relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
            {/* Hero Copy */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">
                Book With {worker.display_name}
              </h1>
              <p className="text-xl md:text-2xl text-accent font-medium mb-4">
                {worker.title || "Massage Therapist"}
              </p>
              <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl">
                Professional massage therapy services. Every session is customized to your needs.
              </p>
              
              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center lg:items-start gap-3 mb-4 md:max-lg:translate-x-28">
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById("booking-calendar")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {ctaLabel}
                </Button>
                {services.length > 0 && (
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setShowPricingModal(true)}
                    className="border-accent/50 text-accent hover:bg-accent/10"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Quick Pricing
                  </Button>
                )}
              </div>
              
              {/* Trust Badge */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-primary-foreground/70">
                <CheckCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                <span className="text-sm">Professional • Licensed • Results-Focused</span>
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

      {/* Main Booking Calendar Section */}
      <section id="booking-calendar" className="py-12 container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Book Your Session</h2>
          <p className="text-muted-foreground text-lg">Select your service, date, and time</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <LindseyAvailabilityCalendar workerId={worker.id} workerServices={services} />
        </div>

        {/* Services Note */}
        {services.length === 0 && !isLoadingServices && (
          <Card className="max-w-4xl mx-auto mt-6 bg-muted/30 border-dashed">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Services Coming Soon</h4>
                  <p className="text-sm text-muted-foreground">
                    {worker.display_name} is setting up their service menu. Check back soon for available appointments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

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
            <DialogTitle>Services & Pricing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {services.map((service) => {
              const IconComponent = ICON_MAP[service.icon_name] || Heart;
              const hasPromo = service.promo_price && service.promo_ends_at && new Date(service.promo_ends_at) > new Date();
              
              return (
                <div 
                  key={service.id}
                  className={`p-3 rounded-lg ${hasPromo ? "bg-green-500/10" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-5 w-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {service.name}
                        {hasPromo && <Gift className="h-4 w-4 text-green-500" />}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {service.duration_mins} min — {formatPrice(service)}
                      </p>
                      {service.description && (
                        <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button 
            className="w-full mt-4 bg-accent hover:bg-accent/90 text-primary"
            onClick={() => {
              setShowPricingModal(false);
              document.getElementById("booking-calendar")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {ctaLabel}
          </Button>
        </DialogContent>
      </Dialog>

      <ScrollToTopButton />
    </div>
  );
}
