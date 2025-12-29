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
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30">
              <CalendarDays className="h-4 w-4" />
              Booking Hub
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground">
              What would you like to book?
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto">
              Search availability across all A-Z services or choose a business below.
              Real-time availability, transparent pricing, book in minutes.
            </p>
          </div>

          {/* Step Indicator - Premium Gold Accent */}
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
                      step.step <= activeStep 
                        ? 'bg-accent border-accent text-primary' 
                        : 'bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground/60'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 hidden md:block">
                    <p className={`text-sm font-medium ${step.step <= activeStep ? 'text-accent' : 'text-primary-foreground/60'}`}>
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
              <h2 className="text-3xl font-bold mb-4 text-primary-foreground">How Booking Works</h2>
              <p className="text-primary-foreground/70 text-lg">
                Transparent pricing, easy process, no surprises
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Deposit Explanation */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <CreditCard className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-primary-foreground">Deposits & Payments</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70 space-y-2">
                  <p>
                    <strong className="text-primary-foreground">Events (Summit):</strong> 50% deposit secures your date. Balance due 14 days before.
                  </p>
                  <p>
                    <strong className="text-primary-foreground">Spa & Coworking:</strong> Full payment at booking.
                  </p>
                  <p>
                    <strong className="text-primary-foreground">Gym:</strong> Monthly membership, cancel anytime.
                  </p>
                </CardContent>
              </Card>

              {/* Approval Process */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <FileCheck className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-primary-foreground">Booking Confirmation</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70 space-y-2">
                  <p>
                    <strong className="text-primary-foreground">Instant bookings:</strong> Spa, gym classes, and coworking are confirmed immediately.
                  </p>
                  <p>
                    <strong className="text-primary-foreground">Event requests:</strong> Our team reviews and confirms within 24 hours.
                  </p>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-primary-foreground">Flexible & Secure</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70 space-y-2">
                  <p>
                    <strong className="text-primary-foreground">Cancellation:</strong> Free cancellation up to 48 hours before your booking.
                  </p>
                  <p>
                    <strong className="text-primary-foreground">Secure payments:</strong> All transactions encrypted and protected.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Availability Help Text */}
            <div className="mt-10 p-5 bg-primary-foreground/5 rounded-xl border border-primary-foreground/10 flex items-start gap-4">
              <HelpCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-primary-foreground mb-1">Why can't I see certain times?</p>
                <p className="text-primary-foreground/70">
                  Some services require approval or have limited provider availability. 
                  If you don't see your preferred time, try a different date or{" "}
                  <Link to="/summit" className="text-accent hover:underline font-medium">request an event quote</Link>.
                  You can also join the waitlist to be notified when spots open up.
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
