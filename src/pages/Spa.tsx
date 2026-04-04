import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { useProviders } from "@/hooks/useProviders";
import { NextAvailableWidget, WaitlistCTA, SpaBookingForm, FloatingHelpDrawer, SpaRequestModal, SpaWaitlistModal, SpaAnchorChips, StickyMobileSpaCTA } from "@/components/booking";
import { TherapistDropdown } from "@/components/booking/TherapistDropdown";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Heart, ArrowRight, Leaf, Star, CheckCircle, Calendar, FileText, Quote, User, Award, ShieldCheck, Wifi, Coffee, Zap, Droplets, Sun, Wind, ThermometerSun, Users, Activity, Target, DollarSign, MapPin, Video, Phone } from "lucide-react";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";
import restorationLoungeLogo from "@/assets/restoration-lounge-logo.jpg";
import { SpecialsPopup, SpecialsButton, SpecialsModal } from "@/components/specials";
import { usePublicSpecials } from "@/hooks/useSpecials";
export default function Spa() {
  const navigate = useNavigate();
  const {
    data: business
  } = useBusinessByType("spa");
  const {
    data: providers
  } = useProviders(business?.id);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSpecials, setShowSpecials] = useState(false);
  const { data: spaSpecials = [] } = usePublicSpecials("restoration");
  const [preselectedService, setPreselectedService] = useState<"massage" | "recovery" | "wellness" | null>(null);
  const [bookingContact, setBookingContact] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const handleBookingSuccess = (bookingId: string) => {
    setShowBookingForm(false);
  };
  
  // Navigate to spa booking page
  const goToSpaBooking = () => {
    navigate('/spa');
  };
  
  const openRequestModal = (service?: "massage" | "recovery" | "wellness") => {
    setPreselectedService(service || null);
    setShowRequestModal(true);
  };
  const scrollToForm = () => {
    setShowBookingForm(true);
  };

  // Spa specialties
  const spaSpecialties = [{
    icon: Heart,
    label: "Deep Tissue & Therapeutic Massage"
  }, {
    icon: Activity,
    label: "Recovery & Performance-Based Bodywork"
  }, {
    icon: Zap,
    label: "Muscle Tension, Pain Relief & Mobility Support"
  }, {
    icon: Wind,
    label: "Stress Reduction & Nervous System Reset"
  }, {
    icon: Target,
    label: "Customized Recovery Plans (Not One-Size-Fits-All)"
  }];
  return <div className="min-h-screen">
      {/* Hero Section - Restoration Lounge Logo Centered */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-primary min-h-[70vh] flex items-center">
        {/* Background - dark with subtle gold radial */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08)_0%,transparent_60%)]" />
        
        {/* Honeycomb Watermark Pattern - Left */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -left-20 top-1/4 w-[500px] h-[500px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-left" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-left)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Right */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -right-20 top-1/3 w-[600px] h-[600px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-right" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-right)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Center Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.10]" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-center" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-center)" />
          </svg>
        </div>
        
        <div className="container relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
            {/* Hero Copy - Left Side */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">
                Recovery Designed for Results
              </h1>
              <p className="text-xl md:text-2xl text-accent font-medium mb-4">
                Expert Care. Premium Experience.
              </p>
              <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl">
                Professional recovery, massage therapy, and wellness treatments—professionally delivered by our licensed therapists.
              </p>
              
              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-center md:ml-[7.25rem] lg:ml-0 lg:items-start gap-4 mb-6">
                <TherapistDropdown />
                <Button size="lg" variant="outline" onClick={() => setShowWaitlistModal(true)} className="border-accent text-accent bg-accent/10 hover:bg-accent/20 hover:border-accent font-semibold" data-event="spa_hero_secondary_cta_click">
                  <Clock className="h-5 w-5 mr-2" />
                  Join Waitlist
                </Button>
                <SpecialsButton onClick={() => setShowSpecials(true)} label="View Spa Specials" size="lg" />
              </div>

              {/* Address & Direct Phone */}
              <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>{SITE_CONFIG.location.street}, {SITE_CONFIG.divisions.spa.suite}, {SITE_CONFIG.location.city}, {SITE_CONFIG.location.stateAbbr}</span>
                </div>
                <a href={SITE_CONFIG.divisions.spa.phoneLink} className="flex items-center gap-2 hover:text-accent transition-colors">
                  <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>{SITE_CONFIG.divisions.spa.phone}</span>
                </a>
              </div>
              
              {/* Booking Request Field */}
              <div className="max-w-md mx-auto lg:mx-0 mb-6">
                <div className="bg-background/10 backdrop-blur-sm rounded-lg border border-accent/30 p-4">
                  <Label htmlFor="booking-contact" className="text-sm text-primary-foreground/80 mb-2 block">
                    Request a Booking (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input id="booking-contact" type="text" placeholder="Enter your email or phone number" value={bookingContact} onChange={e => setBookingContact(e.target.value)} className="bg-background/90 border-accent/30 text-foreground placeholder:text-muted-foreground" />
                    <Button onClick={goToSpaBooking} className="bg-accent hover:bg-accent/90 text-primary font-semibold flex-shrink-0">
                      Request
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Trust Badge */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-primary-foreground/70">
                <CheckCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                <span className="text-sm">No obligation. Response within 24 hours.</span>
              </div>
            </div>
            
            {/* Logo - Right Side */}
            <div className="flex-shrink-0 w-full lg:w-1/2 flex justify-center lg:justify-end">
              <img alt="The Hive Restoration Lounge Logo" className="w-full max-w-md lg:max-w-lg object-contain drop-shadow-2xl" style={{
              maxHeight: "clamp(280px, 40vw, 420px)"
            }} src="/lovable-uploads/5509800c-167c-43ec-a79a-bef75a2b447b.png" />
            </div>
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{
        clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
      }} aria-hidden="true" />
      </section>

      {/* Anchor Chips */}
      <section className="py-6 container border-b border-border">
        <SpaAnchorChips />
      </section>

      {/* Services Section */}
      <section id="spa-services" className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Services</h2>
          <p className="text-muted-foreground text-lg">All services default to 60 minutes. Upgrade any service to 90 minutes for +$35.</p>
          <p className="text-sm text-accent mt-2 font-medium">Please arrive 10 minutes early to your appointment.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            { name: "Scalp Stimulation", price: 45 },
            { name: "Infrared Sauna", price: 45 },
            { name: "Yoni Steam", price: 60 },
            { name: "Neck, Back & Shoulders", price: 75 },
            { name: "Trigger Point Release", price: 85 },
            { name: "Radiant Renewal", price: 90 },
            { name: "Total Body Stretch", price: 90 },
            { name: "Hot Stone", price: 100 },
            { name: "Cupping", price: 100 },
            { name: "Deep Tissue", price: 110 },
            { name: "Lymphatic Drainage", price: 120 },
            { name: "Table Thai", price: 120 },
            { name: "Hydrating Sugar Scrub", price: 125 },
            { name: "Mud Detox", price: 150 },
            { name: "Seaweed Body Wrap", price: 150 },
            { name: "Chamomile Body Wrap", price: 150 },
            { name: "Natural Herbal Bath", price: 155 },
            { name: "Cold Plunge Bath", price: 155 },
          ].map((svc) => (
            <Card key={svc.name} className="hover:shadow-gold-lg hover:border-accent/50 transition-all duration-300 shadow-premium group border-2 border-transparent cursor-pointer" onClick={goToSpaBooking} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && goToSpaBooking()}>
              <CardContent className="p-5">
                <h3 className="font-semibold text-base group-hover:text-accent transition-colors mb-3">{svc.name}</h3>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-bold">${svc.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">/ 60 min</span>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    90 min — ${svc.price + 35}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Memberships / Packages */}
        <div className="mt-14 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-2">Memberships & Packages</h3>
          <p className="text-center text-muted-foreground mb-2 text-sm">Valid for one year after purchase. Can be shared with family and friends.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { count: 4, price: 345, perks: ["Includes 1 add-on"] },
              { count: 6, price: 520, perks: ["Includes 3 free add-ons"] },
              { count: 8, price: 690, perks: ["3 free add-ons", "1 cupping session", "1 hot stone session"] },
              { count: 10, price: 850, perks: ["3 free add-ons", "2 cupping sessions", "2 hot stone sessions"] },
            ].map((pkg) => (
              <Card key={pkg.count} className="shadow-premium border-border hover:border-accent/50 transition-all">
                <CardContent className="p-5 text-center">
                  <p className="text-3xl font-bold text-accent">{pkg.count}</p>
                  <p className="text-sm text-muted-foreground mb-2">Massages</p>
                  <p className="text-xl font-bold mb-3">${pkg.price}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {pkg.perks.map((p, i) => (
                      <li key={i} className="flex items-center gap-1.5 justify-center">
                        <CheckCircle className="h-3 w-3 text-accent flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" onClick={goToSpaBooking} className="w-full mt-4 bg-accent hover:bg-accent/90 text-primary font-semibold text-xs">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Add-Ons */}
        <div className="mt-10 max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-3">Add-Ons</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["Energy Boost", "Hot Towel Treatment", "Aromatherapy"].map((addon) => (
              <span key={addon} className="px-4 py-2 bg-accent/10 text-sm font-medium rounded-full border border-accent/20">
                {addon}
              </span>
            ))}
          </div>
        </div>
        
        {/* Single section CTA */}
        <div className="text-center mt-10">
          <TherapistDropdown />
          <p className="text-sm text-muted-foreground mt-3">
            Full payment at checkout. No surprise fees.
          </p>
        </div>
      </section>

      {/* Assisted Stretching Section - Directly under Services */}
      <section id="spa-stretching" className="py-14 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">ASSISTED STRETCHING</h2>
            <p className="text-accent text-lg font-medium max-w-3xl mx-auto">
              Recovery, performance-based assisted stretching for athletes, workers, elders - everyone. 1-on-1 or group sessions.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="shadow-premium border-border">
              <CardContent className="p-8">
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  1-on-1 guided stretch session where a trained practitioner helps move your body through deeper, safer stretches than you can achieve on your own. Going through range of motion designed to improve flexibility, mobility, posture, and recovery.
                </p>

                <ul className="space-y-3 mb-8">
                  {["• Relieves muscle tension", "• Increases flexibility", "• Blends gentle traction, targeted stretching, and mindful breathwork", "• Supports recovery, performance, and everyday posture and comfort"].map((benefit, idx) => <li key={idx} className="text-foreground">
                      {benefit}
                    </li>)}
                </ul>

                <div className="text-center">
                  <Button size="lg" onClick={goToSpaBooking} className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all" data-event="spa_stretching_cta_click">
                    Book Assisted Stretching
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* What's Included section moved below Meet Our Therapist per spec */}


      {/* Meet Our Therapist Section - Single Provider Feature */}
      <section id="spa-providers" className="py-16 bg-muted/30">
        <div className="container">
          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Licensed Professional</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Certified & Insured</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Results-Driven Care</span>
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Meet Our Therapist</h2>
            <p className="text-accent text-lg font-medium">Your Personal Recovery & Restoration Specialist</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-premium border-border overflow-hidden">
              <div className="grid md:grid-cols-3 gap-0">
                {/* Photo Column */}
                <div className="md:col-span-1 bg-accent/5 flex items-center justify-center p-8">
                  {/* TODO: Replace with therapist headshot when available */}
                  <div className="h-48 w-48 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border-4 border-accent/30 shadow-gold">
                    <User className="h-24 w-24 text-accent/60" />
                  </div>
                </div>

                {/* Info Column */}
                <div className="md:col-span-2 p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-1">Nasiya</h3>
                    <p className="text-accent font-medium">Licensed Massage Therapist & Recovery Specialist</p>
                    <p className="text-muted-foreground text-sm">Restoration Lounge Lead Therapist</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-4 mb-6 text-muted-foreground leading-relaxed">
                    <p>
                      Nasiya is the heart of The Restoration Lounge. She specializes in results-driven recovery treatments designed to help clients move better, feel better, and perform at their highest level—whether you're an athlete, professional, or simply someone who takes recovery seriously.
                    </p>
                    <p>
                      Her approach blends clinical expertise with a premium, personalized experience. Every session is intentional, customized, and focused on real outcomes—not cookie-cutter spa treatments.
                    </p>
                  </div>

                  {/* Specialties */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-accent">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {spaSpecialties.map((specialty, idx) => <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-full text-sm border border-accent/20">
                          <specialty.icon className="h-4 w-4 text-accent flex-shrink-0" />
                          <span>{specialty.label}</span>
                        </div>)}
                    </div>
                  </div>

                  {/* Trust paragraph */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-border mb-6">
                    <p className="text-sm text-muted-foreground italic">
                      Clients choose Nasiya because she listens, adapts, and delivers results. This isn't a high-volume spa model—it's focused, hands-on recovery care built around what your body actually needs.
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" onClick={goToSpaBooking} className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all" data-event="spa_therapist_cta_click">
                      Book Now
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setShowPricingModal(true)} className="border-accent text-accent hover:bg-accent/10" data-event="spa_therapist_pricing_click">
                      <DollarSign className="h-5 w-5 mr-2" />
                      View Pricing
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

      {/* Amenities Accordion */}
      <section className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">What's Included</h2>
          <p className="text-muted-foreground text-lg">Premium amenities with every appointment</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-premium border-border">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="environment" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Sun className="h-5 w-5 text-accent" />
                      <span className="font-semibold">Environment & Atmosphere</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Private treatment rooms</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Climate-controlled comfort</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Ambient sound systems</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Aromatherapy options</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="products" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Droplets className="h-5 w-5 text-accent" />
                      <span className="font-semibold">Premium Products</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Organic massage oils</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Hot towel service</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Complimentary refreshments</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="technology" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-accent" />
                      <span className="font-semibold">Recovery Technology</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Infrared sauna access</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Compression therapy devices</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Cold plunge pool</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Cryotherapy chamber</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hospitality" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Coffee className="h-5 w-5 text-accent" />
                      <span className="font-semibold">Hospitality & Comfort</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Relaxation lounge access</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Herbal tea & infused water</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Plush robes & slippers</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Secure storage lockers</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

      {/* Process Timeline */}
      <section id="spa-process" className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground text-lg">Simple steps to your restoration</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Vertical gold line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-accent/30" aria-hidden="true" />
            
            {[{
            step: 1,
            title: "Select Your Service",
            desc: "Choose massage, recovery, or wellness — tell us your preferences and goals.",
            icon: Sparkles
          }, {
            step: 2,
            title: "Pick Your Time",
            desc: "Select your preferred date, time, and provider. We'll confirm within 24 hours.",
            icon: Calendar
          }, {
            step: 3,
            title: "Review & Confirm",
            desc: "See all details and pricing before confirming. No surprises, no pressure.",
            icon: FileText
          }].map(item => <div key={item.step} className="relative flex gap-6 pb-8 last:pb-0">
                <div className="relative z-10 h-12 w-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-gold">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground max-w-md leading-relaxed">{item.desc}</p>
                </div>
              </div>)}
          </div>
          
          <div className="text-center mt-8 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground">
              <span className="text-accent font-medium">No obligation.</span> You'll review everything before payment — no commitment required.
            </p>
          </div>
        </div>
      </section>

      {/* Local Proof Strip */}
      <section className="py-6 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {["Local Professionals", "Athletes & Performers", "Busy Parents", "Weekend Warriors", "Wellness Seekers"].map(label => <span key={label} className="text-sm text-muted-foreground">
                {label}
              </span>)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="spa-testimonials" className="py-14 bg-primary">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary-foreground">What Guests Say</h2>
            <p className="text-primary-foreground/70 text-lg">Real experiences from our community</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[{
            quote: "The recovery services here have become essential to my routine. Professional, relaxing, and effective.",
            name: "Alex R.",
            badge: "Massage Therapy"
          }, {
            quote: "Finally found a spa that understands what real recovery means. The therapists are knowledgeable and attentive.",
            name: "Morgan T.",
            badge: "Recovery Services"
          }].map((testimonial, idx) => <Card key={idx} className="bg-primary-foreground/5 border-accent/20 shadow-premium">
                <CardContent className="pt-8 pb-6">
                  <Quote className="h-8 w-8 text-accent mb-4" aria-hidden="true" />
                  <p className="text-primary-foreground/90 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-foreground font-medium">{testimonial.name}</span>
                      <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <span className="text-xs px-3 py-1 bg-accent/20 text-accent rounded-full">{testimonial.badge}</span>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="spa-faq" className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">Everything you need to know</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-premium border-border">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="booking" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">How does booking work?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Submit a request with your preferred service, date, and time. Our team reviews it and confirms availability within 24 hours. You can request a specific provider or let us match you with the best available therapist.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="after" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">What happens after I request?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    You'll receive a confirmation with all the details including pricing. We'll send any intake forms if required. On appointment day, arrive 5-10 minutes early to relax before your session.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="waitlist" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">Can I join a waitlist?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Absolutely! If your preferred time isn't available, join our waitlist and we'll notify you when an opening matches. Waitlist members get priority access to cancellation openings.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="pricing" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">How does pricing work?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Pricing varies based on service type, appointment length, and selected enhancements. You'll review everything before payment—no commitment required.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="cancellation" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">What's your cancellation policy?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    We understand plans change. You can modify or cancel with advance notice. Full policy details are provided when you book—no hidden fees.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Virtual Tour Section - Coming Soon */}
      <section id="spa-virtual-tour" className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Take a Virtual Tour</h2>
          <p className="text-muted-foreground text-lg">Explore The Restoration Lounge before your visit</p>
        </div>
        <Card className="max-w-4xl mx-auto shadow-premium border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video bg-gradient-to-br from-primary via-primary/95 to-primary/90 flex items-center justify-center relative">
              {/* Honeycomb pattern overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.08]" aria-hidden="true">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="honeycomb-tour" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
                    <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3"/>
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#honeycomb-tour)" />
                </svg>
              </div>
              
              {/* Coming Soon Content */}
              <div className="relative z-10 text-center p-8">
                <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 border-2 border-accent/40 shadow-gold">
                  <Video className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">3D Walkthrough Coming Soon</h3>
                <p className="text-primary-foreground/70 mb-6 max-w-md">
                  Experience The Restoration Lounge in stunning 360° detail. Explore our private treatment rooms, relaxation areas, and premium amenities.
                </p>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" disabled>
                  <MapPin className="h-4 w-4 mr-2" />
                  Virtual Tour (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Final CTA Section */}
      <section className="py-14 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary-foreground">Ready to Reset Your Body?</h2>
          <p className="text-primary-foreground/70 mb-6 max-w-2xl mx-auto text-lg">
            Expert care and premium treatments — book your appointment today.
          </p>
          <div className="flex justify-center">
            <TherapistDropdown />
          </div>
          <p className="text-sm text-primary-foreground/60 mt-4 max-w-md mx-auto">
            No obligation • Response within 24 hours • You'll review everything before payment
          </p>
          <div className="mt-8 pt-6 border-t border-primary-foreground/10 space-y-1">
            <p className="text-sm text-primary-foreground/80 font-medium">{SITE_CONFIG.divisions.spa.name}</p>
            <p className="text-sm text-primary-foreground/60">{SITE_CONFIG.location.street}, {SITE_CONFIG.divisions.spa.suite}</p>
            <p className="text-sm text-primary-foreground/60">{SITE_CONFIG.location.city}, {SITE_CONFIG.location.stateAbbr} {SITE_CONFIG.location.zip}</p>
            <a href={SITE_CONFIG.divisions.spa.phoneLink} className="inline-block text-sm text-accent hover:text-accent/80 transition-colors font-medium mt-1">
              Direct: {SITE_CONFIG.divisions.spa.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Your Spa Experience</DialogTitle>
          </DialogHeader>
          <div ref={formRef}>
            <SpaBookingForm onSuccess={handleBookingSuccess} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Pricing Menu</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">All services default to 60 min. Upgrade any to 90 min for +$35.</p>
          <div className="space-y-2">
            {[
              { name: "Scalp Stimulation", price: 45 },
              { name: "Infrared Sauna", price: 45 },
              { name: "Yoni Steam", price: 60 },
              { name: "Neck, Back & Shoulders", price: 75 },
              { name: "Trigger Point Release", price: 85 },
              { name: "Radiant Renewal", price: 90 },
              { name: "Total Body Stretch", price: 90 },
              { name: "Hot Stone", price: 100 },
              { name: "Cupping", price: 100 },
              { name: "Deep Tissue", price: 110 },
              { name: "Lymphatic Drainage", price: 120 },
              { name: "Table Thai", price: 120 },
              { name: "Hydrating Sugar Scrub", price: 125 },
              { name: "Mud Detox", price: 150 },
              { name: "Seaweed Body Wrap", price: 150 },
              { name: "Chamomile Body Wrap", price: 150 },
              { name: "Natural Herbal Bath", price: 155 },
              { name: "Cold Plunge Bath", price: 155 },
            ].map((svc) => (
              <div key={svc.name} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="font-medium text-sm">{svc.name}</span>
                <div className="text-right text-sm">
                  <span className="font-bold">${svc.price}</span>
                  <span className="text-muted-foreground ml-2">90 min ${svc.price + 35}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t mt-2">
            <h4 className="font-semibold text-sm mb-2">Packages</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>4 Massages — $345 (1 add-on)</p>
              <p>6 Massages — $520 (3 add-ons)</p>
              <p>8 Massages — $690 (3 add-ons, 1 cupping, 1 hot stone)</p>
              <p>10 Massages — $850 (3 add-ons, 2 cupping, 2 hot stone)</p>
            </div>
          </div>
          <div className="pt-3 border-t">
            <h4 className="font-semibold text-sm mb-1">Add-Ons</h4>
            <p className="text-sm text-muted-foreground">Energy Boost • Hot Towel Treatment • Aromatherapy</p>
          </div>
          <Button 
            className="w-full mt-4 bg-accent hover:bg-accent/90 text-primary"
            onClick={() => {
              setShowPricingModal(false);
              goToSpaBooking();
            }}
          >
            Book Now
          </Button>
        </DialogContent>
      </Dialog>

      {/* Request Modal */}
      <SpaRequestModal open={showRequestModal} onOpenChange={setShowRequestModal} preselectedService={preselectedService} />

      {/* Waitlist Modal */}
      <SpaWaitlistModal open={showWaitlistModal} onOpenChange={setShowWaitlistModal} preselectedService={preselectedService} />

      {/* Specials Popup (once per session) + Modal */}
      <SpecialsPopup storageKey="spa" headline="Want to see our current spa specials?" onViewSpecials={() => setShowSpecials(true)} hasSpecials={spaSpecials.length > 0} />
      <SpecialsModal open={showSpecials} onOpenChange={setShowSpecials} title="Restoration Lounge Specials" specials={spaSpecials} />

      {/* Floating Help Drawer */}
      <FloatingHelpDrawer businessType="spa" phoneNumber={SITE_CONFIG.divisions.spa.phone} email={SITE_CONFIG.contact.email} />

      {/* Sticky Mobile CTA */}
      <StickyMobileSpaCTA onRequestService={goToSpaBooking} />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>;
}