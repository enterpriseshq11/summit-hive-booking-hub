import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNextAvailable } from "@/hooks/useAvailability";
import { 
  AvailabilitySearch, 
  NextAvailableWidget, 
  WaitlistCTA,
  LiveAvailabilityIndicator,
  BookingStepIndicator,
  AvailabilityHelpModal,
  StickyBookingBar,
  BusinessFilterTabs,
  BookingSectionAnchor,
  QuickActionCard,
  HiveWaitlistModal,
  ScheduleTourModal,
  SpaWaitlistModal,
  FitnessWaitlistModal,
  SummitWaitlistModal,
  BookingCategoryPicker,
  BookingHelpSection,
  PaymentExampleBlock,
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
  Calendar,
  Phone,
  Mail,
  Bell,
  Info,
} from "lucide-react";
import { FloatingHelpCTA } from "@/components/home";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";
import type { BusinessType } from "@/types";

const businessIcons: Record<BusinessType, React.ComponentType<{ className?: string }>> = {
  summit: Building2,
  coworking: Building2,
  spa: Sparkles,
  fitness: Dumbbell,
  photo_booth: Building2,
  voice_vault: Building2,
};

const businessRoutes: Record<BusinessType, string> = {
  summit: "/summit",
  coworking: "/coworking",
  spa: "/spa",
  fitness: "/fitness",
  photo_booth: "/photo-booth",
  voice_vault: "/voice-vault",
};

const businessLabels: Record<BusinessType, string> = {
  summit: "The Summit",
  coworking: "The Hive",
  spa: "Restoration Lounge",
  fitness: "Total Fitness",
  photo_booth: "360 Photo Booth",
  voice_vault: "Voice Vault",
};

const businessDescriptions: Record<BusinessType, string> = {
  summit: "Premium Event Venue",
  coworking: "Private Offices + Coworking",
  spa: "Recovery + Spa Treatments",
  fitness: "24/7 Gym + Coaching",
  photo_booth: "360 Photo Booth Rental",
  voice_vault: "Podcast Studio",
};

// BOOKNOW-06: Best For one-liners
const businessBestFor: Record<BusinessType, string> = {
  summit: "Best for: Weddings, corporate events, private celebrations",
  coworking: "Best for: Remote work, startups, private offices",
  spa: "Best for: Massage, facials, recovery treatments",
  fitness: "Best for: Strength training, classes, personal coaching",
  photo_booth: "Best for: Weddings, parties, corporate events",
  voice_vault: "Best for: Podcast recording, voiceovers, content creation",
};

const businessTags: Record<BusinessType, string[]> = {
  summit: ["Weddings", "Corporate", "Celebrations"],
  coworking: ["Focus Work", "Meetings"],
  spa: ["Recovery", "Reset"],
  fitness: ["Training", "Performance"],
  photo_booth: ["360", "Events", "Add-on"],
  voice_vault: ["Recording", "Podcasts"],
};

// BOOKNOW-07: Deposit/pricing badges
const businessBadges: Record<BusinessType, { text: string; type: "deposit" | "info" }> = {
  summit: { text: "Deposit required", type: "deposit" },
  coworking: { text: "Day passes available", type: "info" },
  spa: { text: "Deposit required", type: "deposit" },
  fitness: { text: "Flexible memberships", type: "info" },
  photo_booth: { text: "Deposit required", type: "deposit" },
  voice_vault: { text: "Hourly booking", type: "info" },
};

export default function BookingHub() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const businessSectionRef = useRef<HTMLElement>(null);
  const { data: businesses, isLoading } = useBusinesses();
  const [currentStep] = useState(1);
  const [completedSteps] = useState<number[]>([]);
  const [businessFilter, setBusinessFilter] = useState<BusinessType | "all">("all");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Waitlist modal states
  const [hiveWaitlistOpen, setHiveWaitlistOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [tourBusinessType, setTourBusinessType] = useState<"coworking" | "summit">("coworking");
  const [spaWaitlistOpen, setSpaWaitlistOpen] = useState(false);
  const [fitnessWaitlistOpen, setFitnessWaitlistOpen] = useState(false);
  const [summitWaitlistOpen, setSummitWaitlistOpen] = useState(false);

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

  const handleResetFilters = useCallback(() => {
    window.location.reload();
  }, []);

  const scrollToHero = useCallback(() => {
    heroRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToFAQ = useCallback(() => {
    document.getElementById("booking-faq")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle category picker selection - scrolls to business section
  const handleCategorySelect = useCallback((category: BusinessType | "all") => {
    setBusinessFilter(category);
    if (category !== "all") {
      setSelectedBusiness(businessLabels[category]);
      setTimeout(() => {
        businessSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  // Waitlist handlers by business type
  const getWaitlistHandler = (businessType: BusinessType) => {
    switch (businessType) {
      case "coworking":
        return () => setHiveWaitlistOpen(true);
      case "spa":
        return () => setSpaWaitlistOpen(true);
      case "fitness":
        return () => setFitnessWaitlistOpen(true);
      case "summit":
        return () => setSummitWaitlistOpen(true);
      default:
        return undefined;
    }
  };

  const getTourHandler = (businessType: BusinessType) => {
    if (businessType === "coworking" || businessType === "summit") {
      return () => {
        setTourBusinessType(businessType);
        setTourModalOpen(true);
      };
    }
    return undefined;
  };

  // Filter businesses based on selected filter
  const filteredBusinesses = businesses?.filter(
    (b) => businessFilter === "all" || b.type === businessFilter
  );

  // Keyboard handler for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Close any open modals/drawers handled by their own components
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Waitlist Modals */}
      <HiveWaitlistModal open={hiveWaitlistOpen} onOpenChange={setHiveWaitlistOpen} />
      <ScheduleTourModal open={tourModalOpen} onOpenChange={setTourModalOpen} businessType={tourBusinessType} />
      <SpaWaitlistModal open={spaWaitlistOpen} onOpenChange={setSpaWaitlistOpen} />
      <FitnessWaitlistModal open={fitnessWaitlistOpen} onOpenChange={setFitnessWaitlistOpen} />
      <SummitWaitlistModal open={summitWaitlistOpen} onOpenChange={setSummitWaitlistOpen} />

      {/* BOOKNOW-08: Enhanced Sticky Mini Booking Bar */}
      <StickyBookingBar
        selectedBusiness={selectedBusiness}
        selectedDate={selectedDate}
        onSearchClick={scrollToHero}
        heroRef={heroRef}
        onBusinessChange={(b) => b && setSelectedBusiness(businessLabels[b])}
        onDateChange={setSelectedDate}
      />

      {/* Hero Section - Premium Black & Gold */}
      <section ref={heroRef} id="availability" className="relative py-16 md:py-24 overflow-hidden bg-primary">
        {/* Background effects - Enhanced with vignette and spotlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.06)_0%,transparent_50%)]" />
        {/* Reduced grid visibility */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Honeycomb Watermark Pattern - Left */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -left-20 top-1/4 w-[500px] h-[500px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-booking-left" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-booking-left)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Right */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -right-20 top-1/3 w-[600px] h-[600px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-booking-right" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-booking-right)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Center Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.10]" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-booking-center" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-booking-center)" />
          </svg>
        </div>
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--primary))_100%)]" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-8">
            {/* Live Availability Indicator - Proper States */}
            <LiveAvailabilityIndicator 
              isLoading={isAvailabilityLoading}
              isError={isAvailabilityError}
              onRetry={handleRetryAvailability}
            />
            
            {/* H1 - Updated copy */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground leading-tight">
              Book In Minutes.<br className="hidden sm:block" /> Arrive To Excellence.
            </h1>
            
            {/* Subtext - Updated copy */}
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto">
              Choose your experience, see live availability, and confirm in a few clicks.
            </p>
            
            {/* Trust line - Gold accent */}
            <p className="text-accent font-medium text-sm">
              Review everything before payment — no surprises.
            </p>
          </div>

          {/* BOOKNOW-01: Quick Booking Category Picker */}
          <div className="max-w-4xl mx-auto mb-8">
            <BookingCategoryPicker />
          </div>

          {/* Section Anchor Chips */}
          <div className="max-w-4xl mx-auto mb-8">
            <BookingSectionAnchor />
          </div>

          {/* Step Indicator - Enhanced with Accessibility */}
          <BookingStepIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          {/* Global Availability Search - Premium card styling */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl p-6 shadow-2xl border border-accent/10 relative">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
              
              <div className="relative">
                <AvailabilitySearch 
                  showPartySize={false}
                  onSlotSelect={handleSlotSelect}
                />
                
                {/* Trust microline inside card */}
                <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-accent" />
                    Secure checkout • Review before payment
                  </p>
                  <AvailabilityHelpModal onResetFilters={handleResetFilters} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gradient transition divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* BOOKNOW-06: Business Cards with Best For + BOOKNOW-07: Badges */}
      <section ref={businessSectionRef} id="businesses" className="py-16 md:py-20 container">
        <div className="text-center mb-8">
          {/* Header with branded treatment */}
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-accent/50" />
            <Building2 className="h-5 w-5 text-accent" />
            <div className="h-px w-8 bg-accent/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Business</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-2">
            Start with the experience you want — we'll show the best times available.
          </p>
          {/* Helper line */}
          <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto">
            Not sure what to pick? Start with Spa for wellness, Summit for events, Hive for work, Fitness for training.
          </p>
        </div>

        {/* Business Filter Tabs */}
        <BusinessFilterTabs 
          activeFilter={businessFilter}
          onFilterChange={setBusinessFilter}
        />
        
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
            filteredBusinesses?.map((business) => {
              const Icon = businessIcons[business.type];
              const route = businessRoutes[business.type];
              const label = businessLabels[business.type];
              const description = businessDescriptions[business.type];
              const tags = businessTags[business.type];
              const bestFor = businessBestFor[business.type];
              const badge = businessBadges[business.type];

              return (
                <Card 
                  key={business.id} 
                  className="group hover:shadow-premium-hover hover:border-accent/30 transition-all duration-300 overflow-hidden shadow-premium focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      {/* Icon with gold accent line */}
                      <div className="relative">
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-105 transition-all">
                          <Icon className="h-7 w-7 text-primary group-hover:text-primary transition-colors" />
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent/50 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-xl group-hover:text-accent transition-colors">
                            {label}
                          </CardTitle>
                          {/* BOOKNOW-07: Badge */}
                          <Badge 
                            variant={badge.type === "deposit" ? "destructive" : "secondary"}
                            className={`text-xs ${badge.type === "deposit" ? "bg-accent/20 text-accent border-accent/30" : ""}`}
                          >
                            {badge.text}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm mt-1">
                          {description}
                        </CardDescription>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="text-xs bg-accent/5 border-accent/20 text-muted-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* BOOKNOW-06: Best For line */}
                    <p className="text-xs text-muted-foreground mt-3 italic flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {bestFor}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Next Available Widget with waitlist/tour recovery actions */}
                    <NextAvailableWidget 
                      businessType={business.type}
                      showPrice={false}
                      limit={2}
                      onSlotSelect={handleSlotSelect}
                      onJoinWaitlist={getWaitlistHandler(business.type)}
                      onRequestTour={getTourHandler(business.type)}
                      emptyMessage="No openings in the next 14 days"
                      emptySubMessage="High demand! Join waitlist or request a tour to see the space."
                    />

                    <Button 
                      asChild 
                      className="w-full bg-primary hover:bg-accent hover:text-primary transition-all font-semibold focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      size="lg"
                      data-event="booking_view_times_click"
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

      {/* BOOKNOW-05 & BOOKNOW-09: Pricing & Process Clarity Section with Payment Example */}
      <section id="trust" className="py-12 md:py-16 bg-primary">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary-foreground">Clear Process. No Surprises.</h2>
              <p className="text-primary-foreground/70 text-base">
                See a complete breakdown before any payment is taken
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Review Before You Commit */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-2 pt-5">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mb-2">
                    <FileCheck className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle className="text-base text-primary-foreground">Review Before You Commit</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70 pt-0">
                  <p>
                    Every booking shows a <strong className="text-primary-foreground">summary screen</strong> with date, time, and total before payment.
                  </p>
                </CardContent>
              </Card>

              {/* No Hidden Fees */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-2 pt-5">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mb-2">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle className="text-base text-primary-foreground">No Hidden Fees</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70 pt-0">
                  <p>
                    See your total <strong className="text-primary-foreground">before checkout</strong>. Taxes and any add-ons are shown upfront.
                  </p>
                </CardContent>
              </Card>

              {/* Secure Checkout */}
              <Card className="bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur">
                <CardHeader className="pb-2 pt-5">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mb-2">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle className="text-base text-primary-foreground">Secure Checkout</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-primary-foreground/70 pt-0">
                  <p>
                    All transactions are <strong className="text-primary-foreground">encrypted</strong> and securely processed.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* BOOKNOW-09: Payment Example Block */}
            <PaymentExampleBlock />

            {/* BOOKNOW-05: Waitlist Microcopy */}
            <div className="mt-6 p-4 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-primary-foreground text-sm">Can't find an opening?</p>
                <p className="text-xs text-primary-foreground/60 mt-1">
                  Join the waitlist and get notified if something opens sooner. We'll reach out within 24 hours if a spot becomes available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions - Premium shortcut cards */}
      <section className="py-16 md:py-20 container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Popular Next Steps</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              to="/gift-cards"
              icon={Gift}
              title="Gift Cards"
              description="Give the gift of experience"
              dataEvent="booking_quick_action_gift"
            />
            <QuickActionCard
              to="/account"
              icon={User}
              title="My Bookings"
              description="View and manage reservations"
              dataEvent="booking_quick_action_bookings"
            />
            <QuickActionCard
              to="/account?tab=wallet"
              icon={Calendar}
              title="Redeem Credit"
              description="Use gift cards & credits"
              dataEvent="booking_quick_action_credits"
            />
            <QuickActionCard
              href={SITE_CONFIG.contact.phoneLink}
              icon={Phone}
              title="Call Us"
              description="Speak with our team"
              dataEvent="booking_quick_action_call"
            />
          </div>
        </div>
      </section>

      {/* BOOKNOW-10: Enhanced Help/Support Section */}
      <div id="booking-faq">
        <BookingHelpSection onScrollToFAQ={scrollToFAQ} />
      </div>

      {/* Floating Help CTA */}
      <FloatingHelpCTA />

      {/* Scroll to Top */}
      <ScrollToTopButton />
    </div>
  );
}
