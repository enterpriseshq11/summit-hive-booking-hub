import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { useProviders } from "@/hooks/useProviders";
import { 
  NextAvailableWidget, 
  WaitlistCTA, 
  SpaBookingForm, 
  FloatingHelpDrawer,
  SpaRequestModal,
  SpaWaitlistModal,
  SpaAnchorChips,
  StickyMobileSpaCTA
} from "@/components/booking";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Clock, Heart, ArrowRight, Leaf, Star, 
  CheckCircle, Calendar, FileText, Quote, User,
  Award, ShieldCheck, Wifi, Coffee, Zap, Droplets,
  Sun, Wind, ThermometerSun, Users
} from "lucide-react";

export default function Spa() {
  const { data: business } = useBusinessByType("spa");
  const { data: providers } = useProviders(business?.id);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [preselectedService, setPreselectedService] = useState<"massage" | "recovery" | "wellness" | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleBookingSuccess = (bookingId: string) => {
    setShowBookingForm(false);
  };

  const openRequestModal = (service?: "massage" | "recovery" | "wellness") => {
    setPreselectedService(service || null);
    setShowRequestModal(true);
  };

  const scrollToForm = () => {
    setShowBookingForm(true);
  };

  // Get up to 3 providers for display
  const displayProviders = providers?.slice(0, 3) || [];

  // Anonymized practitioner fallback data
  const fallbackProviders = [
    { name: "Elena M.", title: "Licensed Massage Therapist", specialty: "Deep tissue & sports recovery", years: "8+ years experience" },
    { name: "James C.", title: "Certified Recovery Specialist", specialty: "Cryotherapy & compression", years: "5+ years experience" },
    { name: "Sarah W.", title: "Licensed Esthetician", specialty: "Holistic wellness treatments", years: "10+ years experience" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Black & Gold */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30 mb-8">
              <Sparkles className="h-4 w-4" />
              The Restoration Lounge
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">
              Recovery Designed for Results
            </h1>
            <p className="text-xl md:text-2xl text-accent font-medium mb-4">Expert Care. Premium Experience.</p>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-2xl">
              Professional massage, recovery therapy, and wellness treatments — request your appointment in under 2 minutes.
            </p>
            
            {/* Hero CTAs - Primary + Secondary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <Button 
                size="lg" 
                onClick={() => openRequestModal()}
                className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
                data-event="spa_hero_cta_click"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Book Service
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowWaitlistModal(true)}
                className="border-accent/50 text-primary-foreground hover:bg-accent/10 hover:border-accent"
                data-event="spa_hero_secondary_cta_click"
              >
                <Clock className="h-5 w-5 mr-2" />
                Join Waitlist
              </Button>
            </div>
            
            {/* Trust Badge */}
            <div className="flex items-center gap-2 text-primary-foreground/70 mb-4">
              <CheckCircle className="h-5 w-5 text-accent" aria-hidden="true" />
              <span className="text-sm">No obligation. Response within 24 hours.</span>
            </div>
            
            {/* Micro-trust line */}
            <p className="text-sm text-primary-foreground/50">
              You'll review everything before payment. No surprise fees.
            </p>
          </div>
          
          {/* Hero Feature Chips */}
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              { icon: Heart, label: "Licensed Therapists" },
              { icon: ThermometerSun, label: "Recovery Tech" },
              { icon: Droplets, label: "Premium Products" },
              { icon: Users, label: "Couples Welcome" }
            ].map((chip) => (
              <div 
                key={chip.label} 
                className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full text-sm text-primary-foreground border border-primary-foreground/20"
              >
                <chip.icon className="h-4 w-4 text-accent" />
                {chip.label}
              </div>
            ))}
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} aria-hidden="true" />
      </section>

      {/* Anchor Chips */}
      <section className="py-6 container border-b border-border">
        <SpaAnchorChips />
      </section>

      {/* Next Available Widget - Premium Card Styling */}
      <section className="py-10 container">
        <Card className="max-w-4xl mx-auto shadow-premium border-border relative overflow-hidden">
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-accent" />
              Next Available Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <NextAvailableWidget
              businessType="spa"
              title="Next Available Appointments"
              showPrice={false}
              limit={3}
              onJoinWaitlist={() => setShowWaitlistModal(true)}
              onRequestTour={() => openRequestModal()}
              onAskDayPass={() => {
                const helpBtn = document.querySelector('[data-help-trigger]');
                if (helpBtn instanceof HTMLElement) helpBtn.click();
              }}
              emptyMessage="No openings in the next 14 days"
              emptySubMessage="Request anyway — we'll confirm options within 24 hours, or join the waitlist."
            />
          </CardContent>
        </Card>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

      {/* Services Section */}
      <section id="spa-services" className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Services</h2>
          <p className="text-muted-foreground text-lg">Restore your body and mind — choose your path to recovery</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { 
              name: "Massage Therapy", 
              icon: Heart, 
              tagline: "Release tension. Restore balance.",
              type: "massage" as const,
              badge: "Most Popular",
              benefits: [
                "Deep tissue, Swedish, and sports techniques",
                "Personalized pressure and focus areas",
                "Premium oils and heated treatments"
              ]
            },
            { 
              name: "Recovery Services", 
              icon: Leaf, 
              tagline: "Accelerate your body's natural healing.",
              type: "recovery" as const,
              badge: "Best for Athletes",
              benefits: [
                "Cryotherapy and compression therapy",
                "Infrared sauna and cold plunge",
                "Science-backed recovery protocols"
              ]
            },
            { 
              name: "Wellness Experiences", 
              icon: Star, 
              tagline: "Shared moments of restoration.",
              type: "wellness" as const,
              badge: "Perfect for Couples",
              benefits: [
                "Couples and group sessions",
                "Customized spa day packages",
                "Curated multi-treatment journeys"
              ]
            }
          ].map((service) => (
            <Card 
              key={service.name} 
              className="hover:shadow-gold-lg hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 shadow-premium group cursor-pointer border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 relative overflow-hidden"
              onClick={() => openRequestModal(service.type)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openRequestModal(service.type)}
              data-event={`spa_${service.type}_card_click`}
            >
              {/* Badge */}
              <div className="absolute top-3 right-3">
                <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                  {service.badge}
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:shadow-gold transition-all">
                  <service.icon className="h-7 w-7 text-accent group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{service.name}</CardTitle>
                <p className="text-sm text-accent font-medium">{service.tagline}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {service.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-accent font-medium flex items-center gap-1 group-hover:underline">
                  Book this <ArrowRight className="h-4 w-4" />
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Single section CTA */}
        <div className="text-center mt-10">
          <Button 
            size="lg" 
            onClick={() => openRequestModal()}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
            data-event="spa_services_cta_click"
          >
            Book Service
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            You'll review everything before payment. No surprise fees.
          </p>
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
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Post-treatment care products</li>
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

      {/* Provider Highlights Section */}
      <section id="spa-providers" className="py-14 bg-muted/30">
        <div className="container">
          {/* Meet Your Team trust strip */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Certified & Insured</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border shadow-sm">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">5+ Years Average Experience</span>
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Meet Your Team</h2>
            <p className="text-muted-foreground text-lg">Skilled professionals dedicated to your recovery</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {displayProviders.length > 0 ? (
              displayProviders.map((provider, idx) => {
                const anonymizedNames = ["Elena M.", "James C.", "Sarah W."];
                const displayName = anonymizedNames[idx] || `Provider ${idx + 1}`;
                return (
                  <Card key={provider.id} className="shadow-premium border-border text-center hover:shadow-gold-lg hover:border-accent/30 transition-all">
                    <CardContent className="pt-8 pb-6">
                      <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border-2 border-accent/30">
                        <User className="h-10 w-10 text-accent" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{displayName}</h3>
                      <p className="text-accent text-sm font-medium mb-2">{provider.title || "Therapist"}</p>
                      <Badge variant="outline" className="text-xs mb-3 border-accent/30 text-accent">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                      <p className="text-muted-foreground text-sm">
                        {provider.bio || "Focused on personalized care and lasting results."}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              fallbackProviders.map((provider, idx) => (
                <Card key={idx} className="shadow-premium border-border text-center hover:shadow-gold-lg hover:border-accent/30 transition-all">
                  <CardContent className="pt-8 pb-6">
                    <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border-2 border-accent/30">
                      <User className="h-10 w-10 text-accent" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{provider.name}</h3>
                    <p className="text-accent text-sm font-medium mb-2">{provider.title}</p>
                    <Badge variant="outline" className="text-xs mb-3 border-accent/30 text-accent">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                    <p className="text-muted-foreground text-sm mb-1">{provider.specialty}</p>
                    <p className="text-xs text-muted-foreground/70">{provider.years}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
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
            
            {[
              { step: 1, title: "Select Your Service", desc: "Choose massage, recovery, or wellness — tell us your preferences and goals.", icon: Sparkles },
              { step: 2, title: "Pick Your Time", desc: "Select your preferred date, time, and provider. We'll confirm within 24 hours.", icon: Calendar },
              { step: 3, title: "Review & Confirm", desc: "See all details and pricing before confirming. No surprises, no pressure.", icon: FileText }
            ].map((item) => (
              <div key={item.step} className="relative flex gap-6 pb-8 last:pb-0">
                <div className="relative z-10 h-12 w-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-gold">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground max-w-md leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
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
            {[
              "Local Professionals",
              "Athletes & Performers",
              "Busy Parents",
              "Weekend Warriors",
              "Wellness Seekers"
            ].map((label) => (
              <span key={label} className="text-sm text-muted-foreground">
                {label}
              </span>
            ))}
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
            {[
              {
                quote: "The recovery services here have become essential to my routine. Professional, relaxing, and effective.",
                name: "Alex R.",
                badge: "Massage Therapy"
              },
              {
                quote: "Finally found a spa that understands what real recovery means. The therapists are knowledgeable and attentive.",
                name: "Morgan T.",
                badge: "Recovery Services"
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="bg-primary-foreground/5 border-accent/20 shadow-premium">
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
              </Card>
            ))}
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

      {/* Final CTA Section */}
      <section className="py-14 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary-foreground">Ready to Reset Your Body?</h2>
          <p className="text-primary-foreground/70 mb-6 max-w-2xl mx-auto text-lg">
            Expert care and premium treatments — request your appointment and we'll confirm within 24 hours.
          </p>
          <Button 
            size="lg" 
            onClick={() => openRequestModal()}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
            data-event="spa_final_cta_click"
          >
            Book Service
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-primary-foreground/60 mt-4 max-w-md mx-auto">
            No obligation • Response within 24 hours • You'll review everything before payment
          </p>
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

      {/* Request Modal */}
      <SpaRequestModal 
        open={showRequestModal} 
        onOpenChange={setShowRequestModal}
        preselectedService={preselectedService}
      />

      {/* Waitlist Modal */}
      <SpaWaitlistModal 
        open={showWaitlistModal} 
        onOpenChange={setShowWaitlistModal}
        preselectedService={preselectedService}
      />

      {/* Floating Help Drawer */}
      <FloatingHelpDrawer />

      {/* Sticky Mobile CTA */}
      <StickyMobileSpaCTA onRequestService={() => openRequestModal()} />
    </div>
  );
}
