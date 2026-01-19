import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CalendarDays, Building2, Sparkles, Dumbbell, MapPin, Phone, Clock, Check, Star, Zap, Shield, Heart, ExternalLink } from "lucide-react";
import { NextAvailableStrip, ExperiencePreviewPanel, SocialProofSection, FAQSection, FloatingHelpCTA, GiftCardStrip, ExperienceQuickSelector, WhatsIncludedStrip, ExampleBookingModal, PreFooterCTA } from "@/components/home";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";
import azLogoIcon from "@/assets/az-logo-icon.png";
const businesses = [{
  name: "The Summit",
  tagline: "Premium Event Venue",
  description: "Premier event venue for weddings, corporate events, and celebrations that leave lasting impressions.",
  bestFor: "Weddings • Galas • Corporate",
  bullets: ["Up to 300 guests", "Full catering options", "AV & lighting included"],
  fastFacts: ["Holds up to 300 guests", "Average booking: 2-3 weeks ahead", "Top feature: Full-service coordination"],
  icon: Building2,
  href: "/summit",
  colorClass: "summit"
}, {
  name: "The Hive Coworking",
  tagline: "Private Offices + Coworking",
  description: "Modern workspaces and private offices with 24/7 access. Your productivity headquarters.",
  bestFor: "Remote Work • Startups • Meetings",
  bullets: ["24/7 access", "High-speed WiFi", "Meeting rooms available"],
  fastFacts: ["24/7 keycard access", "Day passes available", "Top feature: Private offices"],
  icon: Building2,
  href: "/coworking",
  colorClass: "coworking"
}, {
  name: "Restoration Lounge",
  tagline: "Recovery + Spa Treatments",
  description: "Luxury spa treatments and massage therapy. Escape the everyday and rediscover balance.",
  bestFor: "Massage • Facials • Recovery",
  bullets: ["Licensed therapists", "Premium products", "Private suites"],
  fastFacts: ["Licensed therapists", "Usually book 1-2 days ahead", "Top feature: Private suites"],
  icon: Sparkles,
  href: "/spa",
  colorClass: "spa"
}, {
  name: "Total Fitness",
  tagline: "24/7 Gym + Coaching",
  description: "24/7 gym access with group classes and personal training. Transform your potential.",
  bestFor: "Strength • Cardio • Classes",
  bullets: ["Modern equipment", "Group classes", "Personal training"],
  fastFacts: ["Open 24/7", "Flexible memberships", "Top feature: Personal training"],
  icon: Dumbbell,
  href: "/fitness",
  colorClass: "fitness"
}];
const steps = [{
  number: "01",
  title: "Choose Your Experience",
  description: "Browse venues, spa, gym, or coworking",
  icon: Star
}, {
  number: "02",
  title: "See Real-Time Availability",
  description: "Find the perfect time that works for you",
  icon: CalendarDays
}, {
  number: "03",
  title: "Confirm & Pay Deposit",
  description: "Secure your spot with transparent pricing",
  icon: Zap
}, {
  number: "04",
  title: "Show Up — We Handle the Rest",
  description: "Everything's ready when you arrive",
  icon: Heart
}];
const proofChips = [{
  icon: Zap,
  text: "Book in Minutes"
}, {
  icon: Clock,
  text: "Real-Time Availability"
}, {
  icon: MapPin,
  text: "Local Destination"
}, {
  icon: Shield,
  text: "Secure Booking"
}];
export default function Index() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <div className="min-h-screen overflow-hidden">
      {/* Hero Section - Premium Black & Gold */}
      <section className="relative pt-4 pb-20 md:pt-6 md:pb-28 lg:pt-8 lg:pb-36 overflow-hidden bg-primary">
        {/* Solid dark background with radial spotlight behind H1 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,hsl(var(--accent)/0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.08)_0%,transparent_60%)]" />
        
        {/* Reduced intensity grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Honeycomb Watermark Pattern - Left */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -left-20 top-1/4 w-[500px] h-[500px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-home-left" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-home-left)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Right */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -right-20 top-1/3 w-[600px] h-[600px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-home-right" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-home-right)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Center Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.10]" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-home-center" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-home-center)" />
          </svg>
        </div>
        
        {/* Faint grain texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
      }} />
        
        {/* One-time gold shimmer sweep - cinematic on load */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent -translate-x-full animate-[shimmer-sweep_2s_ease-out_0.5s_forwards]" />
        </div>
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-6">
              {/* Logo + Location Pill Group - Tight spacing */}
              <div className="space-y-3 opacity-0 animate-fade-in-down" style={{
              animationDelay: "0.05s"
            }}>
                {/* Logo Icon */}
                <div className="flex justify-center lg:justify-start">
                  <img alt="A-Z Enterprises" className="h-44 w-44 object-contain" src="/lovable-uploads/cf63743c-5431-4ce2-a81a-b629897e880c.png" />
                </div>
                
                {/* Location Badge - Directly under logo */}
                <div className="flex justify-center lg:justify-start">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm font-medium text-white/90">
                    <MapPin className="h-4 w-4 text-accent" />
                    {SITE_CONFIG.location.full} • Local team • Premium experiences
                  </div>
                </div>
              </div>
              
              {/* Main Headline - Updated copy with tighter line-height */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl font-bold tracking-tight text-white opacity-0 animate-fade-in-up leading-[1.1]" style={{
                animationDelay: "0.2s"
              }}>
                  <span className="block">Wapakoneta's Premium</span>
                  <span className="block mt-1">Destination for</span>
                  <span className="block mt-1 text-accent">
                    Events, Work, Wellness & Fitness
                  </span>
                </h1>
                
                {/* Gold accent divider */}
                <div className="hidden lg:block w-24 h-1 bg-gradient-to-r from-accent to-accent/50 opacity-0 animate-fade-in" style={{
                animationDelay: "0.4s"
              }} />
                
                {/* Updated subheadline */}
                <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-0 animate-fade-in-up" style={{
                animationDelay: "0.5s"
              }}>
                  Book in minutes. Confirm details before payment.
                  <span className="block mt-1 font-medium text-white/80">Local support when you need it.</span>
                </p>
              </div>

              {/* HOMEPAGE-02: Pick Your Experience Quick Selector */}
              <div className="opacity-0 animate-fade-in-up" style={{
              animationDelay: "0.55s"
            }}>
                <p className="text-sm text-white/50 mb-3 text-center lg:text-left">Pick your experience:</p>
                <ExperienceQuickSelector />
              </div>
              
              {/* Section anchor chips */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 opacity-0 animate-fade-in-up" style={{
              animationDelay: "0.6s"
            }}>
                <button onClick={() => scrollToSection('availability')} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  Availability
                </button>
                <button onClick={() => scrollToSection('experiences')} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  Experiences
                </button>
                <button onClick={() => scrollToSection('faq')} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  FAQ
                </button>
              </div>
              
              {/* HOMEPAGE-01: Two CTAs - Primary + Secondary */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 opacity-0 animate-fade-in-up" style={{
              animationDelay: "0.7s"
            }}>
                <Button size="lg" className="text-lg px-10 py-7 bg-accent hover:bg-accent/90 text-primary font-bold shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group" asChild>
                  <Link to="/booking">
                    {/* Inner highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CalendarDays className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">Book Now</span>
                    <ArrowRight className="h-5 w-5 ml-2 relative z-10" />
                  </Link>
                </Button>
                
                {/* Secondary CTA */}
                <Button size="lg" className="text-lg px-8 py-7 bg-accent hover:bg-accent/90 text-primary font-bold shadow-xl shadow-accent/20 hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-1" onClick={() => scrollToSection('experiences')}>
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Explore All Experiences
                </Button>
              </div>

              {/* Proof Chips - Subtle */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4 opacity-0 animate-fade-in" style={{
              animationDelay: "0.9s"
            }}>
                {proofChips.map((chip, index) => <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
                    <chip.icon className="h-4 w-4 text-accent/80" />
                    <span>{chip.text}</span>
                  </div>)}
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 opacity-0 animate-fade-in" style={{
              animationDelay: "1s"
            }}>
                <a href={SITE_CONFIG.contact.phoneLink} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>{SITE_CONFIG.contact.phone}</span>
                </a>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Clock className="h-4 w-4" />
                  <span>{SITE_CONFIG.hours.shortDays}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Experience Preview Panel */}
            <div className="hidden lg:block opacity-0 animate-fade-in-left" style={{
            animationDelay: "0.5s"
          }}>
              <ExperiencePreviewPanel />
            </div>
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-background" style={{
        clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
      }} />
      </section>

      {/* HOMEPAGE-03: Next Available Strip - With Toggle */}
      <NextAvailableStrip />

      {/* Trust Strip - Replaces numeric stats */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 max-w-4xl mx-auto text-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-5 w-5 text-accent" />
              <span className="font-medium">Trusted locally</span>
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-5 w-5 text-accent" />
              <span className="font-medium">Bookings every week</span>
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-5 w-5 text-accent" />
              <span className="font-medium">High satisfaction</span>
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-5 w-5 text-accent" />
              <span className="font-medium">4 experiences under one roof</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Testimonials, Trust Strip, Guarantees */}
      <SocialProofSection />

      {/* Experience Section Header */}
      <section id="experiences" className="pt-24 pb-12 container scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-semibold text-accent mb-6 opacity-0 animate-fade-in-up" style={{
          animationDelay: "0.1s"
        }}>
            <Sparkles className="h-4 w-4" />
            Four Unique Experiences
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in-up" style={{
          animationDelay: "0.2s"
        }}>
            One <span className="text-accent">Destination</span>
          </h2>
          <p className="text-lg text-muted-foreground opacity-0 animate-fade-in-up" style={{
          animationDelay: "0.3s"
        }}>
            From life's biggest celebrations to everyday wellness, we've got you covered.
          </p>
        </div>
      </section>

      {/* HOMEPAGE-04: Business Cards with Fast Facts */}
      <section className="py-12 pb-16 container">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {businesses.map((business, index) => <Link key={business.href} to={business.href} className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl" role="link" aria-label={`Learn more about ${business.name} - ${business.tagline}`}>
              <Card className="relative overflow-hidden border border-border bg-card hover:border-accent/40 transition-all duration-500 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 opacity-0 animate-fade-in-up h-full" style={{
            animationDelay: `${0.1 * (index + 1)}s`
          }}>
                {/* Subtle gold glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="relative p-8">
                  <div className="flex flex-col h-full">
                    {/* Icon and Title Row */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-all duration-300">
                        <business.icon className="h-7 w-7 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold tracking-tight text-foreground">
                            {business.name}
                          </h3>
                        </div>
                        <p className="font-medium text-sm text-accent/80">
                          {business.tagline}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                      {business.description}
                    </p>

                    {/* Fast Facts - HOMEPAGE-04 */}
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50 mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Fast Facts</p>
                      <ul className="space-y-1">
                        {business.fastFacts.map((fact, i) => <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-accent shrink-0" />
                            <span>{fact}</span>
                          </li>)}
                      </ul>
                    </div>

                    {/* Best for line */}
                    <p className="text-xs text-muted-foreground mt-auto">
                      Best for: {business.bestFor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>)}
        </div>

        {/* Single section CTA */}
        <div className="text-center mt-12">
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-primary font-semibold">
            <Link to="/booking" className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Book Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* HOMEPAGE-05: What's Included at A-Z Icon Row */}
      <WhatsIncludedStrip />

      {/* Gift Cards Strip */}
      <GiftCardStrip />

      {/* HOMEPAGE-08: How It Works Section with Example Modal */}
      <section className="py-28 relative overflow-hidden">
        {/* Diagonal background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08)_0%,transparent_70%)]" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white mb-6">
              <Zap className="h-4 w-4 text-accent" />
              Simple & Seamless
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Book in <span className="text-accent">4 Easy Steps</span>
            </h2>
            {/* Example Booking Modal Trigger */}
            <div className="mt-6">
              <ExampleBookingModal />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => <div key={index} className="relative text-center group opacity-0 animate-fade-in-up" style={{
            animationDelay: `${0.15 * (index + 1)}s`
          }}>
                {/* Connector line */}
                {index < steps.length - 1 && <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent/50 to-accent/20" />}
                
                {/* Step card */}
                <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6 group-hover:bg-white/20 group-hover:border-accent/50 group-hover:-translate-y-2 transition-all duration-300 shadow-xl">
                  <step.icon className="h-12 w-12 text-accent" />
                  <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-accent text-primary text-sm font-bold flex items-center justify-center shadow-lg shadow-accent/30">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
                <p className="text-sm text-white/60">{step.description}</p>
              </div>)}
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-background" style={{
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 0)"
      }} />
      </section>

      {/* HOMEPAGE-07: FAQ Section - Enhanced with high-intent questions */}
      <div id="faq" className="scroll-mt-20">
        <FAQSection />
      </div>

      {/* Final CTA Section - Updated copy */}
      <section className="relative py-28 overflow-hidden">
        {/* Premium gold gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent/95 to-accent/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
        
        {/* Subtle pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center text-primary">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Your Next Booking Starts Here.
            </h2>
            <p className="text-lg text-primary/70 mb-10 max-w-xl mx-auto">
              Your event, workspace, treatment, or workout is a few clicks away.
            </p>

            <Button size="lg" className="text-lg px-14 py-7 bg-primary text-primary-foreground font-bold shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300" asChild>
              <Link to="/booking">
                <CalendarDays className="h-5 w-5 mr-2" />
                Book Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* HOMEPAGE-10: Pre-Footer CTA Strip */}
      <PreFooterCTA />

      {/* Footer Info - Enhanced contrast and clickable links */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Location</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {SITE_CONFIG.location.full}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Contact</h3>
              <div className="space-y-1">
                <a href={SITE_CONFIG.contact.phoneLink} className="block text-sm text-white/80 hover:text-accent transition-colors font-medium">
                  {SITE_CONFIG.contact.phone}
                </a>
                <a href={SITE_CONFIG.contact.emailLink} className="block text-sm text-white/80 hover:text-accent transition-colors">
                  {SITE_CONFIG.contact.email}
                </a>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold mb-3 text-lg">Hours</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {SITE_CONFIG.hours.days}<br />
                {SITE_CONFIG.hours.time}
              </p>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/50">
              {SITE_CONFIG.business.copyright}
            </p>
          </div>
        </div>
      </section>

      {/* Floating Help CTA */}
      <FloatingHelpCTA />
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>;
}