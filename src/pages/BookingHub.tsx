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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 via-muted/30 to-background">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary">
                <CalendarDays className="h-4 w-4" />
                Booking Hub
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                What would you like to book?
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Search availability across all A-Z services or choose a business below.
                Real-time availability, transparent pricing, book in minutes.
              </p>
            </div>

            {/* Step Indicator - Visual Progress */}
            <div className="max-w-4xl mx-auto mb-10">
              <div className="flex items-center justify-between relative">
                {/* Progress line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-border hidden md:block" />
                <div 
                  className="absolute top-6 left-0 h-0.5 bg-primary transition-all hidden md:block" 
                  style={{ width: `${((activeStep - 1) / (bookingSteps.length - 1)) * 100}%` }}
                />
                
                {bookingSteps.map((step, index) => (
                  <div 
                    key={step.step}
                    className={`relative flex flex-col items-center text-center z-10 flex-1 ${
                      index < bookingSteps.length - 1 ? '' : ''
                    }`}
                  >
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.step <= activeStep 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'bg-background border-border text-muted-foreground'
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-3 hidden md:block">
                      <p className={`text-sm font-medium ${step.step <= activeStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Availability Search */}
            <div className="max-w-4xl mx-auto">
              <AvailabilitySearch 
                showPartySize={false}
                onSlotSelect={handleSlotSelect}
              />
            </div>
          </div>
        </section>

        {/* Business Cards with Next Available */}
        <section className="py-12 md:py-16 container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Browse by Business</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select a business to see available times and services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
                    className="group hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all">
                          <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
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
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        variant="outline"
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
        <section className="py-12 md:py-16 bg-muted/30 border-y">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold mb-3">How Booking Works</h2>
                <p className="text-muted-foreground">
                  Transparent pricing, easy process, no surprises
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Deposit Explanation */}
                <Card className="bg-background">
                  <CardHeader className="pb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Deposits & Payments</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong className="text-foreground">Events (Summit):</strong> 50% deposit secures your date. Balance due 14 days before.
                    </p>
                    <p>
                      <strong className="text-foreground">Spa & Coworking:</strong> Full payment at booking.
                    </p>
                    <p>
                      <strong className="text-foreground">Gym:</strong> Monthly membership, cancel anytime.
                    </p>
                  </CardContent>
                </Card>

                {/* Approval Process */}
                <Card className="bg-background">
                  <CardHeader className="pb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Booking Confirmation</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong className="text-foreground">Instant bookings:</strong> Spa, gym classes, and coworking are confirmed immediately.
                    </p>
                    <p>
                      <strong className="text-foreground">Event requests:</strong> Our team reviews and confirms within 24 hours.
                    </p>
                  </CardContent>
                </Card>

                {/* Help & Support */}
                <Card className="bg-background">
                  <CardHeader className="pb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Flexible & Secure</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong className="text-foreground">Cancellation:</strong> Free cancellation up to 48 hours before your booking.
                    </p>
                    <p>
                      <strong className="text-foreground">Secure payments:</strong> All transactions encrypted and protected.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Availability Help Text */}
              <div className="mt-8 p-4 bg-background rounded-lg border flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Why can't I see certain times?</p>
                  <p className="text-muted-foreground">
                    Some services require approval or have limited provider availability. 
                    If you don't see your preferred time, try a different date or{" "}
                    <Link to="/summit" className="text-primary hover:underline">request an event quote</Link>.
                    You can also join the waitlist to be notified when spots open up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12 md:py-16 container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                asChild 
                variant="outline" 
                className="h-auto py-6 flex-col gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Link to="/gift-cards">
                  <Gift className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Gift Cards</span>
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="h-auto py-6 flex-col gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Link to="/account">
                  <User className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">My Bookings</span>
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="h-auto py-6 flex-col gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Link to="/fitness">
                  <Dumbbell className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Memberships</span>
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="h-auto py-6 flex-col gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Link to="/spa">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Spa Services</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
