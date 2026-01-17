import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, SummitRequestModal, SummitWaitlistModal, SummitAnchorChips, StickyMobileSummitCTA } from "@/components/booking";
import { CalendarDays, MapPin, Users, Clock, Star, ArrowRight, Heart, Building2, PartyPopper, Utensils, Tv, Car, Quote, HelpCircle, ChevronRight, ChevronDown, Sparkles, Check, User, Phone, Mail, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";
import summitLogo from "@/assets/summit-logo.png";
import e3Logo from "@/assets/e3-logo.png";
export default function Summit() {
  const navigate = useNavigate();
  const {
    data: business
  } = useBusinessByType("summit");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string | undefined>();
  const [prefillQuestion, setPrefillQuestion] = useState<string | undefined>();
  const [expandedHighlight, setExpandedHighlight] = useState<string | null>(null);
  const [contactInput, setContactInput] = useState("");
  const handleSlotSelect = (slot: any) => {
    navigate(`/booking?slot=${slot.id}&business=summit`);
  };
  const handleEventTypeClick = (typeId: string) => {
    setSelectedEventType(typeId);
    setShowRequestModal(true);
  };
  const handleAskCoordinator = (question: string) => {
    setPrefillQuestion(question);
    setShowRequestModal(true);
  };
  const eventTypes = [{
    id: "wedding",
    name: "Weddings",
    tagline: "A seamless, unforgettable celebration",
    desc: "Your perfect day deserves a perfect venue. Full-service packages available.",
    icon: Heart
  }, {
    id: "corporate",
    name: "Corporate Events",
    tagline: "Professional events without friction",
    desc: "Professional settings for conferences, meetings, and team celebrations.",
    icon: Building2
  }, {
    id: "party",
    name: "Private Parties",
    tagline: "Memorable gatherings done right",
    desc: "Birthdays, anniversaries, and life's special moments celebrated in style.",
    icon: PartyPopper
  }];
  const processSteps = [{
    title: "Submit Request",
    desc: "Share your vision, preferred dates, and guest count"
  }, {
    title: "Victoria Reviews",
    desc: "Your dedicated event coordinator assesses your needs within 24 hours"
  }, {
    title: "Personalized Proposal",
    desc: "Receive a tailored plan designed for your event"
  }, {
    title: "Confirm & Schedule",
    desc: "Lock in your date and begin planning your celebration"
  }];
  const venueHighlights = [{
    id: "capacity",
    icon: Users,
    title: "Flexible Capacity",
    desc: "Adaptable spaces for intimate gatherings to grand celebrations",
    included: ["Main ballroom (up to 300)", "Ceremony lawn", "Bridal suite", "Groom's lounge"],
    upgrades: ["Extended outdoor terrace", "Additional breakout rooms"]
  }, {
    id: "catering",
    icon: Utensils,
    title: "Catering Options",
    desc: "In-house catering and approved vendor partnerships",
    included: ["Full-service kitchen", "Bar service setup", "Linens & tableware"],
    upgrades: ["Premium bar packages", "Custom menu design"]
  }, {
    id: "av",
    icon: Tv,
    title: "AV & Technology",
    desc: "State-of-the-art sound, lighting, and presentation systems",
    included: ["Sound system", "Projection equipment", "Wireless mics"],
    upgrades: ["Lighting design package", "Live streaming setup"]
  }, {
    id: "access",
    icon: Car,
    title: "Convenient Access",
    desc: "Ample parking and accessible facilities for all guests",
    included: ["100+ parking spaces", "ADA compliant", "Loading dock access"],
    upgrades: ["Valet coordination", "Shuttle service support"]
  }];
  const testimonials = [{
    quote: "Victoria made our vision come to life. Every detail was handled with care and professionalism.",
    eventType: "Wedding"
  }, {
    quote: "A flawless corporate event from start to finish. Our team was impressed with the venue and service.",
    eventType: "Corporate"
  }, {
    quote: "From the first tour to the last dance, everything exceeded our expectations. Truly a special place.",
    eventType: "Anniversary"
  }];
  const faqs = [{
    question: "How does booking work?",
    answer: "Submit a request with your event details, and Victoria will review and respond within 24 hours. She'll work with you to understand your vision and create a personalized proposal.",
    showAskLink: true
  }, {
    question: "How does pricing work?",
    answer: "Pricing varies based on event type, guest count, and selected services. You'll receive a personalized proposal after consultation—no commitment required.",
    showAskLink: true
  }, {
    question: "What is your cancellation policy?",
    answer: "We understand plans change. Victoria will discuss cancellation terms during the proposal process, ensuring you have clarity before any commitment.",
    showAskLink: false
  }, {
    question: "What's included with the venue?",
    answer: "Our venue packages include the space rental, tables and chairs, basic AV equipment, and dedicated event coordination. Additional services can be customized to your needs.",
    showAskLink: false
  }];
  const victoriaSpecialties = ["Personalized Event Planning Support", "Venue Walkthroughs & Layout Guidance", "Capacity Planning & Event Logistics", "Clear Pricing & Booking Coordination"];
  return <div className="min-h-screen">
      {/* Hero Section - Premium with Summit Logo + Mountain Branding */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary">
        {/* Dark textured background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-black" />
        
        {/* Mountain silhouette effect - subtle background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url(${summitLogo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }} />
        
        {/* Gold radial glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.08)_0%,transparent_40%)]" />
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        {/* E³ watermark - subtle design motif */}
        <div className="absolute bottom-10 right-10 opacity-[0.03] hidden lg:block">
          <img src={e3Logo} alt="" className="w-64 h-auto" aria-hidden="true" />
        </div>
        
        <div className="container relative z-10 py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Content */}
            <div className="space-y-8 text-center lg:text-left">
              {/* E³ Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
                <span className="text-accent font-bold text-lg">E³</span>
                <span className="text-sm font-medium text-primary-foreground/80">The Elevated Experience</span>
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground leading-tight">
                  The Summit Event Center
                </h1>
                <p className="text-2xl md:text-3xl font-light text-accent mb-4">
                  Elevate Every Event
                </p>
                <p className="text-lg md:text-xl text-primary-foreground/70 max-w-xl mx-auto lg:mx-0">
                  A premium venue designed for unforgettable experiences—from private celebrations to large-scale events.
                </p>
              </div>
              
              {/* Hero CTA Row */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <Button size="lg" onClick={() => setShowRequestModal(true)} className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary" data-event="summit_request_open">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Book with Victoria
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>

                  {/* Trust Chip */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/5 border border-primary-foreground/20 rounded-full text-sm font-medium text-primary-foreground/70" aria-label="Response within 24 hours">
                    <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
                    Response within 24 hours
                  </div>
                </div>

                {/* Request Contact Input */}
                <div className="max-w-md mx-auto lg:mx-0">
                  <Label htmlFor="contact-input" className="text-sm text-primary-foreground/70 mb-2 block">
                    Request a Booking (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input id="contact-input" type="text" placeholder="Enter your email or phone number" value={contactInput} onChange={e => setContactInput(e.target.value)} className="bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:border-accent" />
                    <Button variant="outline" onClick={() => setShowRequestModal(true)} className="border-accent text-accent bg-accent/10 hover:bg-accent/20 font-semibold">
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              {/* Trust Line */}
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle className="h-5 w-5 text-accent" />
                <p className="text-primary-foreground/60 text-sm">
                  No obligation — request a proposal and review everything before you commit.
                </p>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>Wapakoneta, Ohio</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>Up to 300 guests</span>
                </div>
              </div>
            </div>

            {/* Right - Summit Logo Prominently Displayed */}
            <div className="flex justify-center lg:justify-end lg:-mt-12 lg:translate-x-6 xl:translate-x-10">
              <div className="relative transform scale-100 md:scale-110 lg:scale-[1.2] xl:scale-[1.32]">
                {/* Gold glow behind logo */}
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
                <img alt="The Summit Event Center - Elevate Every Event" className="relative w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl drop-shadow-2xl object-contain opacity-100" style={{
                maxHeight: "clamp(500px, 75vw, 900px)"
              }} src="/lovable-uploads/790635c3-febc-47a4-83e5-d0723774fd9e.png" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Section transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Anchor Chips - Positioned after hero */}
      <section className="py-6 container">
        <SummitAnchorChips />
      </section>

      {/* The E³ Experience Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              
              <h2 className="text-3xl md:text-4xl font-bold text-black">The E<sup className="text-accent text-lg md:text-xl">3</sup> Experience</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The Summit is built on the E³ standard—an elevated approach to space, service, and execution that transforms events into experiences.
            </p>
            
            {/* E³ Pillars */}
            <div className="grid md:grid-cols-3 gap-6 mt-10">
              {[{
              title: "Elevated Space",
              desc: "Premium finishes and flexible layouts designed for any vision"
            }, {
              title: "Elevated Service",
              desc: "Dedicated coordination from first inquiry to final toast"
            }, {
              title: "Elevated Execution",
              desc: "Every detail managed so you can focus on the moment"
            }].map((pillar, i) => <Card key={i} className="bg-primary/5 border-accent/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-accent font-bold text-2xl mb-2">E<sup className="text-sm">³</sup></div>
                    <h3 className="font-semibold text-lg mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground">{pillar.desc}</p>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </section>

      {/* Section transition divider with E³ motif */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-4">
          <span className="text-accent font-bold text-sm">E³</span>
        </div>
      </div>

      {/* Venue Overview */}
      <section id="highlights" className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Premier Event Venue</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Flexible layouts, premium finishes, and high-capacity spaces designed for weddings, corporate events, celebrations, conferences, and private rentals.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {venueHighlights.map(highlight => {
          const Icon = highlight.icon;
          const isExpanded = expandedHighlight === highlight.id;
          return <Card key={highlight.id} className="shadow-premium hover:shadow-premium-hover transition-all hover:border-accent/30">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-2 text-center">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">{highlight.desc}</p>
                  
                  <Collapsible open={isExpanded} onOpenChange={() => setExpandedHighlight(isExpanded ? null : highlight.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        <span>{isExpanded ? "Hide Details" : "What's Included"}</span>
                        <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", isExpanded && "rotate-180")} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-accent mb-1.5">Included:</p>
                        <ul className="space-y-1">
                          {highlight.included.map((item, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <Check className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                              {item}
                            </li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Available Upgrades:</p>
                        <ul className="space-y-1">
                          {highlight.upgrades.map((item, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <Sparkles className="h-3 w-3 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>)}
                        </ul>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>;
        })}
        </div>

        {/* Signature Moments Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[{
          title: "Grand Entrance",
          bullets: ["Dramatic foyer", "Custom lighting", "Photo-ready backdrop"]
        }, {
          title: "Reception Hall",
          bullets: ["300 guest capacity", "Dance floor", "Stage area"]
        }, {
          title: "Outdoor Terrace",
          bullets: ["Sunset views", "Ceremony space", "Cocktail hour"]
        }, {
          title: "Bridal Suite",
          bullets: ["Private prep space", "Salon ready", "Champagne service"]
        }].map((moment, i) => <Card key={i} className="aspect-square bg-gradient-to-br from-accent/5 to-muted/20 border-accent/10 flex flex-col justify-center hover:border-accent/30 transition-colors">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-sm mb-2">{moment.title}</h4>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {moment.bullets.map((bullet, j) => <li key={j}>{bullet}</li>)}
                </ul>
              </CardContent>
            </Card>)}
        </div>
      </section>

      {/* Event Types */}
      <section id="event-types" className="py-20 bg-muted/20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Types</h2>
            <p className="text-muted-foreground text-lg">Choose a starting point — Victoria will tailor everything around your vision.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {eventTypes.map(type => {
            const Icon = type.icon;
            return <Card key={type.name} className={cn("hover:shadow-premium-hover hover:border-accent/40 transition-all duration-300 shadow-premium group cursor-pointer", "focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2")} onClick={() => handleEventTypeClick(type.id)} role="button" tabIndex={0} onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleEventTypeClick(type.id);
              }
            }} data-event="summit_event_type_click">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                        <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-accent transition-colors">{type.name}</CardTitle>
                    <p className="text-sm text-accent font-medium">{type.tagline}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{type.desc}</p>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>
      </section>

      {/* Section transition divider with E³ motif */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-4">
          <span className="text-accent font-bold text-sm">E³</span>
        </div>
      </div>

      {/* Book Your Event with Victoria */}
      <section id="victoria" className="py-20 bg-primary">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Victoria Info */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-primary-foreground">
                  Book Your Event with Victoria
                </h2>
                <p className="text-accent text-lg font-medium mb-6">
                  Your Personal Event Coordination Specialist
                </p>
                
                <div className="mb-6">
                  <p className="text-sm text-primary-foreground/60 mb-1">Event Coordinator & Venue Booking Specialist</p>
                  <p className="text-primary-foreground/80 font-medium">The Summit Event Center</p>
                </div>
                
                <div className="space-y-4 text-primary-foreground/80 mb-8">
                  <p>
                    Victoria is your direct point of contact for hosting events at The Summit. She works closely with clients to plan, coordinate, and execute events of all sizes—ensuring every detail aligns with the vision, scale, and experience you expect from a premium venue.
                  </p>
                  <p>
                    From first inquiry to event day execution, Victoria makes the booking process seamless, professional, and stress-free.
                  </p>
                </div>
                
                {/* Booking Highlights */}
                <div className="space-y-3 mb-8">
                  {victoriaSpecialties.map((specialty, i) => <div key={i} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-primary-foreground/80">{specialty}</span>
                    </div>)}
                </div>
                
                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" onClick={() => setShowRequestModal(true)} className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all" data-event="summit_victoria_cta_click">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Book with Victoria
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setShowRequestModal(true)} className="border-accent text-accent bg-accent/10 hover:bg-accent/20 font-semibold">
                    Request Event Info
                  </Button>
                </div>
              </div>
              
              {/* Victoria Visual / Placeholder */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Gold accent glow */}
                  <div className="absolute inset-0 bg-accent/10 blur-2xl rounded-full scale-90" />
                  
                  {/* Placeholder silhouette - TODO: Replace with Victoria's headshot when available */}
                  <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-accent/20 to-primary-foreground/5 border-2 border-accent/30 flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <User className="h-24 w-24 text-accent/40 mx-auto mb-3" />
                      <p className="text-primary-foreground/60 text-sm font-medium">Victoria</p>
                      <p className="text-primary-foreground/40 text-xs">Event Coordinator</p>
                    </div>
                  </div>
                  
                  {/* E³ badge */}
                  <div className="absolute -bottom-2 -right-2 bg-primary border border-accent/30 rounded-full px-3 py-1">
                    <span className="text-accent font-bold text-sm">E³</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request to Book Process - Vertical Timeline */}
      <section id="request-section" className="py-20 container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">A White-Glove Planning Process</h2>
            <p className="text-muted-foreground text-lg">Simple steps to your perfect event.</p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-accent/30" aria-hidden="true" />
            
            <div className="space-y-10">
              {processSteps.map((step, i) => <div key={step.title} className="relative flex gap-6">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-accent text-primary text-lg font-bold flex items-center justify-center shadow-gold">
                      {i + 1}
                    </div>
                  </div>
                  <div className="pt-2 max-w-md">
                    <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>)}
            </div>
          </div>

          {/* No obligation microcopy */}
          <p className="text-center text-muted-foreground text-sm mt-10 mb-6">No obligation to proceed</p>

          <div className="text-center">
            <Button onClick={() => setShowRequestModal(true)} size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold shadow-gold" data-event="summit_process_cta_click">
              Book with Victoria
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Section transition divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Event Testimonials */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted for Life's Biggest Moments</h2>
            <p className="text-muted-foreground text-lg">Real experiences from real celebrations</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => <Card key={i} className="shadow-premium relative overflow-hidden hover:shadow-premium-hover transition-shadow">
                <div className="absolute top-4 right-4 text-accent/10">
                  <Quote className="h-16 w-16" aria-hidden="true" />
                </div>
                <CardContent className="pt-8 pb-6 relative">
                  <p className="text-foreground mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full text-sm font-medium text-accent">
                    {testimonial.eventType}
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Section transition divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* FAQ Section */}
      <section id="faq" className="py-20 container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <HelpCircle className="h-6 w-6 text-accent" aria-hidden="true" />
              <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            </div>
            <p className="text-muted-foreground text-lg">Common questions about booking The Summit</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => <AccordionItem key={i} value={`item-${i}`} className="border-b-border/50">
                <AccordionTrigger className="text-left font-medium py-5 text-base hover:no-underline hover:text-accent [&[data-state=open]]:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                  <p className="mb-3">{faq.answer}</p>
                  {faq.showAskLink && <button onClick={() => handleAskCoordinator(`Question about: ${faq.question}`)} className="text-sm text-accent hover:underline inline-flex items-center gap-1">
                      Ask Victoria
                      <ArrowRight className="h-3 w-3" />
                    </button>}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </section>

      {/* Section transition divider with E³ motif */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent">
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-4">
          <span className="text-accent font-bold text-sm">E³</span>
        </div>
      </div>

      {/* Final CTA */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <img src={e3Logo} alt="" className="h-12 w-auto mx-auto mb-6 opacity-60" aria-hidden="true" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
              Get a tailored proposal — Victoria will reply within 24 hours.
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Share your vision and let us create something unforgettable.
            </p>
            
            <Button size="lg" onClick={() => setShowRequestModal(true)} className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all mb-4" data-event="summit_final_cta_click">
              <CalendarDays className="h-5 w-5 mr-2" />
              Book with Victoria
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <p className="text-primary-foreground/60 text-sm">No obligation — review everything before you commit.</p>
          </div>
        </div>
      </section>

      {/* Modals */}
      <SummitRequestModal open={showRequestModal} onOpenChange={setShowRequestModal} prefillEventType={selectedEventType} prefillQuestion={prefillQuestion} />
      <SummitWaitlistModal open={showWaitlistModal} onOpenChange={setShowWaitlistModal} />

      {/* Sticky Mobile CTA */}
      <StickyMobileSummitCTA onRequestClick={() => setShowRequestModal(true)} />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>;
}