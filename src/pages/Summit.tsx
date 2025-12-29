import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA, EventRequestForm } from "@/components/booking";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  Star, 
  ArrowRight, 
  Heart, 
  Building2, 
  PartyPopper,
  Utensils,
  Tv,
  Car,
  ImageIcon,
  Quote,
  HelpCircle
} from "lucide-react";

export default function Summit() {
  const navigate = useNavigate();
  const { data: business } = useBusinessByType("summit");
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleSlotSelect = (slot: any) => {
    navigate(`/booking?slot=${slot.id}&business=summit`);
  };

  const handleEventRequestSuccess = (bookingId: string) => {
    setShowRequestForm(false);
    navigate(`/booking/confirmation?id=${bookingId}&pending=true`);
  };

  const eventTypes = [
    { 
      name: "Weddings", 
      tagline: "A seamless, unforgettable celebration",
      desc: "Your perfect day deserves a perfect venue. Full-service packages available.", 
      icon: Heart 
    },
    { 
      name: "Corporate Events", 
      tagline: "Professional events without friction",
      desc: "Professional settings for conferences, meetings, and team celebrations.", 
      icon: Building2 
    },
    { 
      name: "Private Parties", 
      tagline: "Memorable gatherings done right",
      desc: "Birthdays, anniversaries, and life's special moments celebrated in style.", 
      icon: PartyPopper 
    },
  ];

  const processSteps = [
    { 
      title: "Submit Request", 
      desc: "Share your vision, preferred dates, and guest count" 
    },
    { 
      title: "Team Review", 
      desc: "Our event coordinators assess your needs within 24 hours" 
    },
    { 
      title: "Personalized Proposal", 
      desc: "Receive a tailored plan designed for your event" 
    },
    { 
      title: "Confirm & Schedule", 
      desc: "Lock in your date and begin planning your celebration" 
    },
  ];

  const venueHighlights = [
    { icon: Users, title: "Flexible Capacity", desc: "Adaptable spaces for intimate gatherings to grand celebrations" },
    { icon: Utensils, title: "Catering Options", desc: "In-house catering and approved vendor partnerships" },
    { icon: Tv, title: "AV & Technology", desc: "State-of-the-art sound, lighting, and presentation systems" },
    { icon: Car, title: "Convenient Access", desc: "Ample parking and accessible facilities for all guests" },
  ];

  const testimonials = [
    { 
      quote: "The team made our vision come to life. Every detail was handled with care and professionalism.",
      eventType: "Wedding"
    },
    { 
      quote: "A flawless corporate event from start to finish. Our team was impressed with the venue and service.",
      eventType: "Corporate"
    },
  ];

  const faqs = [
    {
      question: "How does booking work?",
      answer: "Submit a request with your event details, and our team will review and respond within 24 hours. We'll work together to understand your vision and create a personalized proposal."
    },
    {
      question: "How does pricing work?",
      answer: "Pricing varies based on event type, guest count, and selected services. You'll receive a personalized proposal after consultation—no commitment required."
    },
    {
      question: "What is your cancellation policy?",
      answer: "We understand plans change. Our team will discuss cancellation terms during the proposal process, ensuring you have clarity before any commitment."
    },
    {
      question: "What's included with the venue?",
      answer: "Our venue packages include the space rental, tables and chairs, basic AV equipment, and dedicated event coordination. Additional services can be customized to your needs."
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30">
                <Star className="h-4 w-4" />
                Premier Event Venue
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">The Summit</h1>
                <p className="text-xl md:text-2xl text-accent font-medium mb-4">Elevate Every Event</p>
                <p className="text-lg text-primary-foreground/70 max-w-xl">
                  {business?.description || "Where Life's Most Important Moments Reach Their Highest Point. Premium venue for weddings, galas, and corporate celebrations."}
                </p>
              </div>
              
              {/* Single Primary CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                    >
                      <CalendarDays className="h-5 w-5 mr-2" />
                      Request Your Event
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Request to Book Your Event</DialogTitle>
                    </DialogHeader>
                    <EventRequestForm onSuccess={handleEventRequestSuccess} />
                  </DialogContent>
                </Dialog>

                {/* Response within 24h Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-accent/40 rounded-full text-sm font-medium text-accent">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Response within 24 hours
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>Wapakoneta, OH</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>Up to 300 guests</span>
                </div>
              </div>
            </div>

            {/* Next Available Widget */}
            <Card className="bg-card shadow-2xl border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-accent" aria-hidden="true" />
                  Next Available Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {business ? (
                  <NextAvailableWidget 
                    businessType="summit"
                    onSlotSelect={handleSlotSelect}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-4">Availability updates momentarily</p>
                )}
                {business && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <WaitlistCTA 
                      businessId={business.id}
                      buttonText="Join Waitlist for Popular Dates"
                      buttonVariant="outline"
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* Event Types */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Types</h2>
          <p className="text-muted-foreground text-lg">Choose your celebration style</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {eventTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card 
                key={type.name} 
                className="hover:shadow-premium-hover hover:border-accent/30 transition-all duration-300 shadow-premium group cursor-pointer"
                onClick={() => {
                  const element = document.getElementById('request-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const element = document.getElementById('request-section');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-accent transition-colors">{type.name}</CardTitle>
                  <p className="text-sm text-accent font-medium">{type.tagline}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{type.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Button 
            size="lg" 
            onClick={() => setShowRequestForm(true)}
            className="bg-accent hover:bg-accent/90 text-primary font-semibold"
          >
            Request Your Event
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Request to Book Process - Vertical Timeline */}
      <section id="request-section" className="py-16 bg-primary">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">Request to Book Process</h2>
              <p className="text-primary-foreground/70 text-lg">Simple steps to your perfect event</p>
            </div>

            {/* Vertical Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-accent/30" aria-hidden="true" />
              
              <div className="space-y-8">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="relative flex gap-6">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-accent text-primary text-lg font-bold flex items-center justify-center shadow-gold">
                        {i + 1}
                      </div>
                    </div>
                    <div className="pt-2">
                      <h3 className="text-lg font-semibold text-primary-foreground mb-1">{step.title}</h3>
                      <p className="text-primary-foreground/70">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* No obligation microcopy */}
            <p className="text-center text-primary-foreground/60 text-sm mt-8 mb-6">No obligation to proceed</p>

            <div className="text-center">
              <Button 
                onClick={() => setShowRequestForm(true)} 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-primary font-semibold"
              >
                Submit Request
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Highlights */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Venue Highlights</h2>
          <p className="text-muted-foreground text-lg">Everything you need for a successful event</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          {venueHighlights.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <Card key={highlight.title} className="text-center shadow-premium hover:shadow-premium-hover transition-all">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground">{highlight.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Image Placeholder Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="aspect-square rounded-lg bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center border border-border"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-2" aria-hidden="true" />
              <span className="text-xs text-muted-foreground/60">Gallery coming soon</span>
            </div>
          ))}
        </div>
      </section>

      {/* Event Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground text-lg">Trusted by events of all sizes</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="shadow-premium">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-accent/40 mb-4" aria-hidden="true" />
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full text-sm font-medium text-accent">
                    {testimonial.eventType}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <HelpCircle className="h-6 w-6 text-accent" aria-hidden="true" />
              <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            </div>
            <p className="text-muted-foreground text-lg">Common questions about booking The Summit</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">Ready to Plan Your Event?</h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Submit a request and our team will be in touch within 24 hours.
            </p>
            
            <Button 
              size="lg" 
              onClick={() => setShowRequestForm(true)}
              className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all mb-4"
            >
              <CalendarDays className="h-5 w-5 mr-2" />
              Request Your Event
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-primary-foreground/60 text-sm">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
                Response within 24 hours
              </span>
              <span className="hidden sm:inline">•</span>
              <span>No obligation</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
