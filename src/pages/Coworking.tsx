import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA, LeaseSignupForm } from "@/components/booking";
import { 
  Building2, Wifi, Coffee, Users, MapPin, ArrowRight, Check, 
  RefreshCw, Quote, Clock, Zap, Shield, Heart, Briefcase,
  MessageSquare, CalendarCheck, Rocket, AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Coworking() {
  const navigate = useNavigate();
  const { data: business, isLoading: businessLoading } = useBusinessByType("coworking");
  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [selectedWorkspaceType, setSelectedWorkspaceType] = useState<string | null>(null);

  const scrollToRequest = () => {
    setShowLeaseForm(true);
  };

  const handleCardClick = (workspaceType: string) => {
    setSelectedWorkspaceType(workspaceType);
    setShowLeaseForm(true);
  };

  const handleLeaseSuccess = () => {
    setShowLeaseForm(false);
    setSelectedWorkspaceType(null);
  };

  const workspaceOptions = [
    { 
      name: "Private Office", 
      icon: Building2,
      tagline: "Your own space to lead, create, and grow.",
      benefits: [
        "Secure, lockable workspace",
        "Professional business address",
        "Priority booking for meeting rooms"
      ],
      trustLine: "Simple request → quick confirmation."
    },
    { 
      name: "Dedicated Desk", 
      icon: Briefcase,
      tagline: "A permanent home for your most focused work.",
      benefits: [
        "Reserved spot in collaborative space",
        "Personal storage included",
        "Community networking events"
      ],
      trustLine: "Simple request → quick confirmation."
    },
    { 
      name: "Day Pass", 
      icon: Zap,
      tagline: "Drop in when inspiration strikes.",
      benefits: [
        "Flexible access on your schedule",
        "All amenities included",
        "No long-term commitment"
      ],
      trustLine: "Simple request → quick confirmation."
    }
  ];

  const whyTheHiveCards = [
    {
      icon: Zap,
      title: "Flexibility",
      copy: "Work on your terms. Scale up or down as your needs change—no rigid contracts."
    },
    {
      icon: Users,
      title: "Community",
      copy: "Surround yourself with driven professionals. Collaboration happens naturally here."
    },
    {
      icon: Shield,
      title: "Productivity",
      copy: "Purpose-built environments that eliminate distractions and amplify your output."
    },
    {
      icon: Heart,
      title: "Convenience",
      copy: "Everything handled for you. Just show up, plug in, and get to work."
    }
  ];

  const processSteps = [
    {
      icon: MessageSquare,
      title: "Request Your Workspace",
      description: "Tell us what you need. Private office, dedicated desk, or flexible access—we'll take it from there."
    },
    {
      icon: CalendarCheck,
      title: "We Confirm Options",
      description: "We'll review availability and send you a personalized proposal. You'll review everything before payment."
    },
    {
      icon: Rocket,
      title: "Start Working",
      description: "Once confirmed, you're in. No obligation to proceed until you're ready."
    }
  ];

  const testimonials = [
    {
      quote: "Finally, a workspace that matches the way I work. The environment is professional, the community is supportive, and everything just works.",
      name: "Jordan M.",
      badge: "Private Office"
    },
    {
      quote: "I was tired of coffee shops and home distractions. This space gave me the structure and focus I needed to take my work seriously.",
      name: "Member",
      badge: "Dedicated Desk"
    }
  ];

  const faqs = [
    {
      question: "How does requesting a workspace work?",
      answer: "Simply click 'Request Workspace' and tell us what you're looking for. We'll review your request and get back to you within 24 hours with availability and options."
    },
    {
      question: "Do I have to commit right away?",
      answer: "Not at all. You'll receive a personalized proposal first, and you can take your time to decide. There's no obligation until you're ready to move forward."
    },
    {
      question: "What's included?",
      answer: "All workspaces include high-speed internet, access to common areas, coffee and refreshments, and professional amenities. Specific inclusions vary by workspace type and will be detailed in your proposal."
    },
    {
      question: "How does pricing work?",
      answer: "Pricing varies based on workspace type and selected services. You'll receive a personalized proposal after consultation—no commitment required."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30">
                <Building2 className="h-4 w-4" />
                The Hive Coworking
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground leading-tight">
                  A Premium Workspace Built for Focus
                </h1>
                <p className="text-lg text-primary-foreground/70 max-w-xl">
                  Private offices, desks, and day passes—request in minutes.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Button 
                  size="lg" 
                  onClick={scrollToRequest}
                  className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
                >
                  Request Workspace
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-primary-foreground/80" aria-hidden="true">
                  <Check className="h-4 w-4 text-accent" />
                  No obligation. Response within 24 hours.
                </div>
              </div>

              {/* Amenities Strip */}
              <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-accent/20 rounded">
                    <Wifi className="h-4 w-4 text-accent" />
                  </div>
                  <span>High-Speed Internet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-accent/20 rounded">
                    <Coffee className="h-4 w-4 text-accent" />
                  </div>
                  <span>Coffee Bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-accent/20 rounded">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <span>Flexible Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-accent/20 rounded">
                    <MapPin className="h-4 w-4 text-accent" />
                  </div>
                  <span>Prime Location</span>
                </div>
              </div>
            </div>

            {/* Next Available Widget */}
            <Card className="bg-card shadow-2xl border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {businessLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : business ? (
                  <>
                    <NextAvailableWidget 
                      businessType="coworking"
                      title="Available Spaces"
                      onSlotSelect={() => scrollToRequest()}
                    />
                    <div className="mt-6 pt-6 border-t border-border">
                      <WaitlistCTA 
                        businessId={business.id}
                        buttonText="Notify me when available"
                        buttonVariant="outline"
                        className="w-full"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <span>Availability temporarily unavailable</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* Workspace Options Section */}
      <section className="py-20 container" id="workspaces">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Workspace Options</h2>
          <p className="text-muted-foreground text-lg">Flexible solutions for every work style</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {workspaceOptions.map((workspace) => {
            const IconComponent = workspace.icon;
            return (
              <Card 
                key={workspace.name} 
                onClick={() => handleCardClick(workspace.name)}
                className="cursor-pointer hover:shadow-premium-hover hover:border-accent/30 transition-all duration-300 shadow-premium group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(workspace.name)}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                    <IconComponent className="h-6 w-6 text-accent" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-accent transition-colors">{workspace.name}</CardTitle>
                  <p className="text-accent font-medium">{workspace.tagline}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {workspace.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground/70 italic">{workspace.trustLine}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Section CTA */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={scrollToRequest}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
          >
            Request Workspace
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            We'll confirm availability and options before payment.
          </p>
        </div>
      </section>

      {/* Why The Hive Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why The Hive</h2>
            <p className="text-muted-foreground text-lg">Designed for people who take work seriously.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {whyTheHiveCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Card key={card.title} className="bg-card border-border hover:border-accent/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-accent" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.copy}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Three simple steps to your new workspace.</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-accent/30" aria-hidden="true" />
            
            <div className="space-y-8">
              {processSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.title} className="relative flex gap-6">
                    <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-gold">
                      <IconComponent className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-semibold text-lg mb-1">
                        <span className="text-accent mr-2">{index + 1}.</span>
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">What Members Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-accent mb-4" aria-hidden="true" />
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{testimonial.name}</span>
                    <span className="text-xs px-3 py-1 bg-accent/20 text-accent rounded-full">
                      {testimonial.badge}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50"
              >
                <AccordionTrigger className="hover:no-underline py-4 [&[data-state=open]>svg]:text-accent">
                  <span className="text-left font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
            Ready for a better place to work?
          </h2>
          <Button 
            size="lg"
            onClick={scrollToRequest}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
          >
            Request Workspace
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-primary-foreground/70 mt-4">
            No obligation. Response within 24 hours.
          </p>
        </div>
      </section>

      {/* Lease Form Dialog */}
      <Dialog open={showLeaseForm} onOpenChange={setShowLeaseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Your Workspace</DialogTitle>
          </DialogHeader>
          <LeaseSignupForm onSuccess={handleLeaseSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
