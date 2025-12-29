import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinesses } from "@/hooks/useBusinesses";
import { AvailabilitySearch, NextAvailableWidget, WaitlistCTA } from "@/components/booking";
import { 
  Building2, 
  Sparkles, 
  Dumbbell, 
  CalendarDays, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  HelpCircle,
  Gift,
  User,
  Zap,
  Shield
} from "lucide-react";
import type { BusinessType } from "@/types";

const businessIcons: Record<BusinessType, React.ComponentType<{ className?: string }>> = {
  summit: Building2,
  coworking: Building2,
  spa: Sparkles,
  fitness: Dumbbell,
};

const businessRoutes: Record<BusinessType, string> = {
  summit: "/summit",
  coworking: "/coworking",
  spa: "/spa",
  fitness: "/fitness",
};

const businessLabels: Record<BusinessType, string> = {
  summit: "The Summit",
  coworking: "The Hive",
  spa: "Restoration Lounge",
  fitness: "Total Fitness",
};

const businessDescriptions: Record<BusinessType, string> = {
  summit: "Events, weddings & celebrations",
  coworking: "Workspaces & meeting rooms",
  spa: "Massage, facials & recovery",
  fitness: "Gym, classes & training",
};

// Booking flow steps - visual only
const bookingSteps = [
  { 
    step: 1, 
    title: "Choose Experience", 
    description: "Select business & service",
    icon: Building2,
  },
  { 
    step: 2, 
    title: "Pick Date & Time", 
    description: "View real-time availability",
    icon: CalendarDays,
  },
  { 
    step: 3, 
    title: "Review Pricing", 
    description: "See total & deposit",
    icon: CreditCard,
  },
  { 
    step: 4, 
    title: "Confirm & Book", 
    description: "Complete your reservation",
    icon: CheckCircle2,
  },
];

export default function BookingHub() {
  const navigate = useNavigate();
  const { data: businesses, isLoading } = useBusinesses();
  const [activeStep] = useState(1); // Visual indicator only

  const handleSlotSelect = (slot: any) => {
    const businessType = slot.bookable_type_name?.toLowerCase().includes("summit") 
      ? "summit" 
      : slot.bookable_type_name?.toLowerCase().includes("spa") 
        ? "spa" 
        : slot.bookable_type_name?.toLowerCase().includes("fitness")
          ? "fitness"
          : "coworking";
    navigate(`/${businessType}?slot=${slot.id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Black & Gold */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-primary">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
            {/* Live Availability Indicator */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Real-Time Availability
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground">
              Find Your Perfect Time
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto">
              Browse availability, select your slot, and book in under 2 minutes.
              <span className="block mt-2 text-accent font-medium">You'll review everything before payment.</span>
            </p>
          </div>

          {/* Step Indicator - Enhanced Clarity */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-primary-foreground/20 hidden md:block" />
              <div 
                className="absolute top-6 left-0 h-0.5 bg-accent transition-all hidden md:block" 
                style={{ width: `${((activeStep - 1) / (bookingSteps.length - 1)) * 100}%` }}
              />
              
              {bookingSteps.map((step, index) => (
                <div 
                  key={step.step}
                  className="relative flex flex-col items-center text-center z-10 flex-1"
                >
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.step < activeStep 
                        ? 'bg-accent border-accent text-primary' 
                        : step.step === activeStep
                          ? 'bg-accent border-accent text-primary ring-4 ring-accent/30'
                          : 'bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground/60'
                    }`}
                  >
                    {step.step < activeStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="mt-3 hidden md:block">
                    <p className={`text-sm font-medium ${
                      step.step <= activeStep ? 'text-accent' : 'text-primary-foreground/60'
                    }`}>
                      {step.step === activeStep && <span className="text-xs block text-primary-foreground/50 mb-0.5">Step {step.step} of 4</span>}
                      {step.title}
                    </p>
                    <p className="text-xs text-primary-foreground/50 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Availability Search */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl p-6 shadow-2xl border border-border">
              <AvailabilitySearch 
                showPartySize={false}
                onSlotSelect={handleSlotSelect}
              />
            </div>
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* Business Cards with Next Available */}
      <section className="py-16 md:py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Business</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Select a business to see available times and services
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            businesses?.map((business) => {
              const Icon = businessIcons[business.type];
              const route = businessRoutes[business.type];
              const label = businessLabels[business.type];
              const description = businessDescriptions[business.type];

              return (
                <Card 
                  key={business.id} 
                  className="group hover:shadow-premium-hover hover:border-accent/30 transition-all duration-300 overflow-hidden shadow-premium"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-105 transition-all">
                        <Icon className="h-7 w-7 text-primary group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl group-hover:text-accent transition-colors">
                          {label}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Next Available Widget */}
                    <NextAvailableWidget 
                      businessType={business.type}
                      showPrice={true}
                      limit={2}
                      onSlotSelect={handleSlotSelect}
                    />

                    <Button 
                      asChild 
                      className="w-full bg-primary hover:bg-accent hover:text-primary transition-all font-semibold"
                      size="lg"
                    >
                      <Link to={route} className="flex items-center justify-center gap-2">
                        View All Options
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Pricing & Process Clarity Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-primary-foreground">Clear Process. No Surprises.</h2>
              <p className="text-primary-foreground/70 text-lg">
                You'll see a complete breakdown before any payment is taken
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Transparent Pricing */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <CreditCard className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-primary-foreground">No Hidden Fees</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70 space-y-2">
                  <p>
                    See your total <strong className="text-primary-foreground">before checkout</strong>. Deposits, taxes, and any add-ons are shown upfront.
                  </p>
                  <p className="text-primary-foreground/50 text-xs">
                    No processing fees added at the end.
                  </p>
                </CardContent>
              </Card>

              {/* Booking Confirmation */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <FileCheck className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-primary-foreground">Review Before You Commit</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70 space-y-2">
                  <p>
                    Every booking shows a <strong className="text-primary-foreground">summary screen</strong> with date, time, and total before payment.
                  </p>
                  <p className="text-primary-foreground/50 text-xs">
                    Cancel for free up to 48 hours before.
                  </p>
                </CardContent>
              </Card>

              {/* Secure & Flexible */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-primary-foreground">Secure Payments</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70 space-y-2">
                  <p>
                    All transactions are <strong className="text-primary-foreground">encrypted</strong> and processed through Stripe.
                  </p>
                  <p className="text-primary-foreground/50 text-xs">
                    Your card details are never stored on our servers.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Availability Help Text */}
            <div className="mt-10 p-5 bg-primary-foreground/5 rounded-xl border border-primary-foreground/10 flex items-start gap-4">
              <HelpCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-primary-foreground mb-1">Can't find the time you need?</p>
                <p className="text-primary-foreground/70">
                  Some services have limited availability or require approval. 
                  Try a different date, or{" "}
                  <Link to="/summit" className="text-accent hover:underline font-medium">submit a request</Link>{" "}
                  for custom event bookings. We'll respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 md:py-20 container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Button 
              asChild 
              variant="outline" 
              className="h-auto py-8 flex-col gap-4 hover:border-accent hover:bg-accent/5 transition-all shadow-premium hover:shadow-premium-hover"
            >
              <Link to="/gift-cards">
                <Gift className="h-8 w-8 text-accent" />
                <span className="text-base font-semibold">Gift Cards</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="h-auto py-8 flex-col gap-4 hover:border-accent hover:bg-accent/5 transition-all shadow-premium hover:shadow-premium-hover"
            >
              <Link to="/account">
                <User className="h-8 w-8 text-accent" />
                <span className="text-base font-semibold">My Bookings</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="h-auto py-8 flex-col gap-4 hover:border-accent hover:bg-accent/5 transition-all shadow-premium hover:shadow-premium-hover"
            >
              <Link to="/fitness">
                <Dumbbell className="h-8 w-8 text-accent" />
                <span className="text-base font-semibold">Memberships</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="h-auto py-8 flex-col gap-4 hover:border-accent hover:bg-accent/5 transition-all shadow-premium hover:shadow-premium-hover"
            >
              <Link to="/spa">
                <Sparkles className="h-8 w-8 text-accent" />
                <span className="text-base font-semibold">Spa Services</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
