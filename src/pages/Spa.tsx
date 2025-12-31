import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { useProviders } from "@/hooks/useProviders";
import { NextAvailableWidget, WaitlistCTA, SpaBookingForm, FloatingHelpDrawer } from "@/components/booking";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Clock, Heart, ArrowRight, Leaf, Star, 
  CheckCircle, Calendar, FileText, Quote, User,
  Award, ShieldCheck
} from "lucide-react";

export default function Spa() {
  const { data: business } = useBusinessByType("spa");
  const { data: providers } = useProviders(business?.id);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleBookingSuccess = (bookingId: string) => {
    setShowBookingForm(false);
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
              {business?.description || "Professional recovery and restoration services. Expert therapists, premium treatments, and a sanctuary designed for total renewal."}
            </p>
            
            {/* Single CTA + Trust Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button 
                size="lg" 
                onClick={scrollToForm}
                className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Book Service
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <CheckCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                <span className="text-sm">No obligation. Response within 24 hours.</span>
              </div>
            </div>
            
            {/* Micro-trust line */}
            <p className="text-sm text-primary-foreground/50 mt-4">
              You'll review everything before payment. No surprise fees.
            </p>
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} aria-hidden="true" />
      </section>

      {/* Next Available Widget - Tighter spacing */}
      <section className="py-8 container">
        <Card className="max-w-4xl mx-auto shadow-premium border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
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
              onRequestTour={() => scrollToForm()}
              onAskDayPass={() => {
                const helpBtn = document.querySelector('[data-help-trigger]');
                if (helpBtn instanceof HTMLElement) helpBtn.click();
              }}
              emptyMessage="No openings in the next 14 days"
              emptySubMessage="Join the waitlist or book a different service"
            />
          </CardContent>
        </Card>
      </section>

      {/* Services Section - No Pricing, tighter top padding */}
      <section className="py-12 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground text-lg">Restore your body and mind</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { 
              name: "Massage Therapy", 
              icon: Heart, 
              tagline: "Release tension. Restore balance.",
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
              benefits: [
                "Couples and group sessions",
                "Customized spa day packages",
                "Curated multi-treatment journeys"
              ]
            }
          ].map((service) => (
            <Card 
              key={service.name} 
              className="hover:shadow-gold-lg hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 shadow-premium group cursor-pointer border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              onClick={scrollToForm}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && scrollToForm()}
              data-event="spa_service_card_click"
            >
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:shadow-gold transition-all">
                  <service.icon className="h-7 w-7 text-accent group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{service.name}</CardTitle>
                <p className="text-sm text-accent font-medium">{service.tagline}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-accent font-medium mt-4 flex items-center gap-1 group-hover:underline">
                  Book this <ArrowRight className="h-4 w-4" />
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Single section CTA */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={scrollToForm}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
          >
            Book Service
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            You'll review everything before payment. No surprise fees.
          </p>
        </div>
      </section>

      {/* Provider Highlights Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          {/* Meet Your Team trust strip */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Certified & Insured</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">5+ Years Average Experience</span>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Your Team</h2>
            <p className="text-muted-foreground text-lg">Skilled professionals dedicated to your recovery</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {displayProviders.length > 0 ? (
              displayProviders.map((provider, idx) => {
                // Anonymize real provider names
                const anonymizedNames = ["Elena M.", "James C.", "Sarah W."];
                const displayName = anonymizedNames[idx] || `Provider ${idx + 1}`;
                return (
                  <Card key={provider.id} className="shadow-premium border-border text-center hover:shadow-premium-hover transition-all">
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
              // Anonymized fallback providers
              fallbackProviders.map((provider, idx) => (
                <Card key={idx} className="shadow-premium border-border text-center hover:shadow-premium-hover transition-all">
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

      {/* Process Timeline */}
      <section className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Simple steps to your restoration</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Vertical gold line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-accent/30" aria-hidden="true" />
            
            {[
              { step: 1, title: "Select Service", desc: "Choose your treatment type and any enhancements.", icon: Sparkles },
              { step: 2, title: "Choose Time", desc: "Pick your preferred date and provider.", icon: Calendar },
              { step: 3, title: "Confirm Details", desc: "Review everything before finalizing.", icon: FileText }
            ].map((item) => (
              <div key={item.step} className="relative flex gap-6 pb-8 last:pb-0">
                <div className="relative z-10 h-12 w-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-gold">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground max-w-md">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground">
              <span className="text-accent font-medium">No obligation.</span> You'll review everything before payment.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-primary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">What Guests Say</h2>
            <p className="text-primary-foreground/70 text-lg">Real experiences from our community</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
              <Card key={idx} className="bg-primary-foreground/5 border-accent/20">
                <CardContent className="pt-8 pb-6">
                  <Quote className="h-8 w-8 text-accent mb-4" aria-hidden="true" />
                  <p className="text-primary-foreground/90 mb-6 italic">"{testimonial.quote}"</p>
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
      <section className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">Everything you need to know</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-premium border-border">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="booking" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">How does booking work?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Select your preferred service, choose a date and time that works for you, and we'll confirm your appointment. You can request a specific provider or let us match you with the best available therapist.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="after" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">What happens after I request?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    You'll receive a confirmation with all the details. We'll send you any intake forms if required for your service. On the day of your appointment, arrive a few minutes early to settle in.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="waitlist" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-semibold">Can I join a waitlist?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Yes! If your preferred time isn't available, you can join our waitlist and we'll notify you when an opening matches your preferences. Waitlist members get priority access to cancellation openings.
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
                    We understand plans change. You can modify or cancel your appointment with advance notice. Full details will be provided when you book.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">Ready to Reset Your Body?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-2xl mx-auto text-lg">
            Expert care and premium treatments designed to help you feel your best.
          </p>
          <Button 
            size="lg" 
            onClick={scrollToForm}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
            data-event="spa_final_cta_click"
          >
            Book Service
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-primary-foreground/60 mt-4">
            You'll review everything before payment. No surprise fees.
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

      {/* Waitlist Modal */}
      <Dialog open={showWaitlistModal} onOpenChange={setShowWaitlistModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join the Waitlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              We'll notify you the moment an appointment opens up that matches your preferences.
            </p>
            {business?.id && (
              <WaitlistCTA 
                businessId={business.id}
                buttonText="Join Waitlist"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Help Drawer */}
      <FloatingHelpDrawer />
    </div>
  );
}
