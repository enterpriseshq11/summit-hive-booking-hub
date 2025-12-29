import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNextAvailable } from "@/hooks/useAvailability";
import { 
  AvailabilitySearch, 
  NextAvailableWidget, 
  WaitlistCTA,
  LiveAvailabilityIndicator,
  BookingStepIndicator,
  AvailabilityHelpModal,
} from "@/components/booking";
import { 
  Building2, 
  Sparkles, 
  Dumbbell, 
  ArrowRight, 
  CreditCard,
  FileCheck,
  Shield,
  Gift,
  User,
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

export default function BookingHub() {
  const navigate = useNavigate();
  const { data: businesses, isLoading } = useBusinesses();
  const [currentStep] = useState(1);
  const [completedSteps] = useState<number[]>([]);

  // Get availability status for the indicator
  const { isLoading: isAvailabilityLoading, isError: isAvailabilityError, refetch } = useNextAvailable();

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

  const handleRetryAvailability = useCallback(() => {
    refetch();
  }, [refetch]);

  // Reset filters handler for the help modal
  const handleResetFilters = useCallback(() => {
    // This will be passed to AvailabilitySearch component
    window.location.reload(); // Simple reset - reload the page to clear all filters
  }, []);

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
            {/* Live Availability Indicator - Proper States */}
            <LiveAvailabilityIndicator 
              isLoading={isAvailabilityLoading}
              isError={isAvailabilityError}
              onRetry={handleRetryAvailability}
            />
            
            {/* H1 - Single line desktop, max 2 lines mobile */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground leading-tight">
              Find Your Perfect Time
            </h1>
            
            {/* Subtext - Platform value */}
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto">
              Book Summit • Coworking • Spa • Fitness in minutes.
            </p>
            
            {/* Trust line - appears ONCE */}
            <p className="text-accent font-medium text-sm">
              You'll review everything before payment.
            </p>
          </div>

          {/* Step Indicator - Enhanced with Accessibility */}
          <BookingStepIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          {/* Global Availability Search */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl p-6 shadow-2xl border border-border">
              <AvailabilitySearch 
                showPartySize={false}
                onSlotSelect={handleSlotSelect}
              />
              
              {/* Help link - under search */}
              <div className="mt-4 flex justify-center">
                <AvailabilityHelpModal onResetFilters={handleResetFilters} />
              </div>
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
                    {/* Next Available Widget with proper states */}
                    <NextAvailableWidget 
                      businessType={business.type}
                      showPrice={false}
                      limit={2}
                      onSlotSelect={handleSlotSelect}
                    />

                    <Button 
                      asChild 
                      className="w-full bg-primary hover:bg-accent hover:text-primary transition-all font-semibold focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      size="lg"
                    >
                      <Link to={route} className="flex items-center justify-center gap-2">
                        View Times
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

      {/* Pricing & Process Clarity Section - NO DUPLICATE TRUST LINE */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-primary-foreground">Clear Process. No Surprises.</h2>
              <p className="text-primary-foreground/70 text-lg">
                See a complete breakdown before any payment is taken
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Review Before You Commit */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <FileCheck className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-primary-foreground">Review Before You Commit</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70">
                  <p>
                    Every booking shows a <strong className="text-primary-foreground">summary screen</strong> with date, time, and total before payment.
                  </p>
                </CardContent>
              </Card>

              {/* No Hidden Fees */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <CreditCard className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-primary-foreground">No Hidden Fees</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70">
                  <p>
                    See your total <strong className="text-primary-foreground">before checkout</strong>. Taxes and any add-ons are shown upfront.
                  </p>
                </CardContent>
              </Card>

              {/* Secure Checkout */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-primary-foreground">Secure Checkout</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70">
                  <p>
                    All transactions are <strong className="text-primary-foreground">encrypted</strong> and securely processed.
                  </p>
                </CardContent>
              </Card>
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
              className="h-auto py-8 flex-col gap-4 hover:border-accent hover:bg-accent/5 transition-all shadow-premium hover:shadow-premium-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <Link to="/gift-cards">
                <Gift className="h-8 w-8 text-accent" />
                <span className="text-base font-semibold">Gift Cards</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="h-auto py-8 flex-col gap-4 hover:border-accent hover:bg-accent/5 transition-all shadow-premium hover:shadow-premium-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <Link to="/account">
                <User className="h-8 w-8 text-accent" />
                <span className="text-base font-semibold">My Bookings</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="h-auto py-8 flex-col gap-4 hover:border-accent hover:bg-accent/5 transition-all shadow-premium hover:shadow-premium-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <Link to="/fitness">
                <Dumbbell className="h-8 w-8 text-accent" />
                <span className="text-base font-semibold">Memberships</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="h-auto py-8 flex-col gap-4 hover:border-accent hover:bg-accent/5 transition-all shadow-premium hover:shadow-premium-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
