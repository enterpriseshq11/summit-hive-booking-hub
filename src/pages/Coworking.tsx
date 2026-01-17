import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { 
  NextAvailableWidget, 
  CoworkingRequestModal,
  ScheduleTourModal,
  HiveWaitlistModal,
  StickyMobileHiveCTA,
  CoworkingAnchorChips,
  PlanComparisonTable,
  AmenitiesAccordion,
  LocalProofStrip,
  FloatingHelpDrawer,
} from "@/components/booking";
import { 
  Building2, Wifi, Coffee, Users, MapPin, ArrowRight, Check, 
  RefreshCw, Quote, Clock, Zap, Shield, Heart, Briefcase,
  MessageSquare, CalendarCheck, Rocket, AlertCircle, Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";
import { SEOHead, jsonLdSchemas } from "@/components/seo";
import theHiveLogo from "@/assets/the-hive-logo-final.png";

export default function Coworking() {
  const navigate = useNavigate();
  const { data: business, isLoading: businessLoading } = useBusinessByType("coworking");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [selectedWorkspaceType, setSelectedWorkspaceType] = useState<string | null>(null);

  const openRequestModal = (workspaceType?: string) => {
    setSelectedWorkspaceType(workspaceType || null);
    setShowRequestModal(true);
  };

  const workspaceOptions = [
    { 
      name: "Private Office", 
      icon: Building2,
      tagline: "A lockable, professional office for teams and founders who need focus and credibility.",
      bestFor: "Best for Teams",
      benefits: [
        "Secure, lockable workspace",
        "Professional business address",
        "Priority booking for meeting rooms"
      ],
    },
    { 
      name: "Dedicated Desk", 
      icon: Briefcase,
      tagline: "Your reserved desk in a high-performing environment — show up and get to work.",
      bestFor: "Best Value",
      benefits: [
        "Reserved spot in collaborative space",
        "Personal storage included",
        "Community networking events"
      ],
    },
    { 
      name: "Day Pass", 
      icon: Zap,
      tagline: "Work here for the day — faster Wi-Fi, quieter space, better results.",
      bestFor: "Most Flexible",
      benefits: [
        "Flexible access on your schedule",
        "All amenities included",
        "No long-term commitment"
      ],
    }
  ];

  const whyTheHiveCards = [
    { icon: Zap, title: "Flexibility", copy: "Work on your terms. Scale up or down as your needs change—no rigid contracts." },
    { icon: Users, title: "Community", copy: "Surround yourself with driven professionals. Collaboration happens naturally here." },
    { icon: Shield, title: "Productivity", copy: "Purpose-built environments that eliminate distractions and amplify your output." },
    { icon: Heart, title: "Convenience", copy: "Everything handled for you. Just show up, plug in, and get to work." }
  ];

  const processSteps = [
    { icon: MessageSquare, title: "Request Your Workspace", description: "Tell us what you need. Private office, dedicated desk, or flexible access—we'll take it from there." },
    { icon: CalendarCheck, title: "We Confirm Options", description: "We'll review availability and send you a personalized proposal. You'll review everything before payment." },
    { icon: Rocket, title: "Start Working", description: "Once confirmed, you're in. No obligation to proceed until you're ready." }
  ];

  const testimonials = [
    { quote: "Finally, a workspace that matches the way I work. The environment is professional, the community is supportive, and everything just works.", name: "Jordan M.", badge: "Private Office", verified: true },
    { quote: "I was tired of coffee shops and home distractions. This space gave me the structure and focus I needed to take my work seriously.", name: "Megan L.", badge: "Dedicated Desk", verified: true },
    { quote: "The flexibility is perfect for my schedule. I can drop in when I need focused work time, and the amenities make it worth every visit.", name: "Chris W.", badge: "Day Pass", verified: true }
  ];

  const faqs = [
    { question: "How does requesting a workspace work?", answer: "Simply click 'Request Workspace' and tell us what you're looking for. We'll review your request and get back to you within 24 hours with availability and options. There's no commitment until you decide to proceed." },
    { question: "Do I have to commit right away?", answer: "Not at all. You'll receive a personalized proposal first, and you can take your time to decide. There's no obligation until you're ready to move forward. You'll review everything before any payment is required." },
    { question: "What about guests and meeting room access?", answer: "All members can bring guests and book meeting rooms. Private office members get priority booking, while dedicated desk and day pass holders have standard access. Guest policies vary by membership type." },
    { question: "How does pricing work?", answer: "Pricing varies based on workspace type and selected services. You'll receive a personalized proposal after consultation—no commitment required." },
    { question: "What if I need to cancel or change my plan?", answer: "We understand needs change. Our team will work with you on transitions. Specific terms depend on your agreement type and will be clearly outlined in your proposal." }
  ];

  return (
    <>
      <SEOHead
        title="Private Offices & Coworking in Wapakoneta"
        description="The Hive by A-Z offers private offices, dedicated desks, and flexible day passes in Wapakoneta, Ohio. High-speed internet, coffee bar, and professional environment. Request workspace access today."
        canonicalPath="/coworking"
        jsonLd={jsonLdSchemas.coworkingSpace()}
      />
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Honeycomb Watermark Pattern - Left */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -left-20 top-1/4 w-[500px] h-[500px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-left-hive" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-left-hive)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Right */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -right-20 top-1/3 w-[600px] h-[600px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-right-hive" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-right-hive)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Center Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.10]" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-center-hive" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-center-hive)" />
          </svg>
        </div>
        
        <div className="container relative z-10 px-4 lg:px-6">
          <div className="grid lg:grid-cols-[minmax(280px,420px)_1fr_auto] gap-6 lg:gap-8 items-center">
            {/* Logo - Left Side (hidden on mobile, pushed left) */}
            <div className="hidden lg:flex items-center justify-start -ml-4 xl:-ml-8">
              <img 
                src={theHiveLogo} 
                alt="The Hive by A-Z Logo" 
                className="w-80 xl:w-96 2xl:w-[420px] max-w-none h-auto object-contain drop-shadow-2xl brightness-110 saturate-[1.3]"
              />
            </div>
            
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30">
                <Building2 className="h-4 w-4" />
                The Hive Coworking
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground leading-tight">
                  Private Offices & Flexible Workspaces in Wapakoneta
                </h1>
                <p className="text-lg text-primary-foreground/70 max-w-xl">
                  Private offices, dedicated desks, and day passes — request access in under 2 minutes.
                </p>
              </div>
              
              {/* CTA Row with Secondary */}
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <Button 
                  size="lg" 
                  onClick={() => openRequestModal()}
                  className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
                  data-event="hive_request_workspace_click"
                >
                  Request Workspace
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setShowTourModal(true)}
                  className="border-accent text-accent bg-accent/10 hover:bg-accent/20 hover:border-accent font-semibold"
                  data-event="hive_schedule_tour_click"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule a Tour
                </Button>
              </div>

              {/* Trust Chip */}
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-primary-foreground/80" aria-hidden="true">
                <Check className="h-4 w-4 text-accent" />
                No obligation. Local team response within 24 hours. No payment until confirmed.
              </div>

              {/* Amenities Strip - Enhanced Pills */}
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto sm:mx-0 sm:max-w-none sm:inline-flex sm:flex-wrap">
                {[
                  { icon: Wifi, label: "High-Speed Internet" },
                  { icon: Coffee, label: "Coffee Bar" },
                  { icon: Clock, label: "Flexible Access" },
                  { icon: MapPin, label: "Prime Location" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-accent/10 rounded-full border border-accent/30 sm:justify-start">
                    <item.icon className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    <span className="text-xs font-medium text-accent whitespace-nowrap">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Anchor Chips - Section Links */}
              <div className="-mt-2 sm:mt-0">
                <CoworkingAnchorChips />
              </div>
            </div>

            {/* Availability Card - Premium Styled */}
            <Card className="bg-card/95 shadow-2xl border-accent/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-accent via-accent/80 to-accent" />
              <CardHeader className="border-b border-border p-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Zap className="h-5 w-5 text-accent" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
                      onSlotSelect={() => openRequestModal()}
                      emptyMessage="No instant openings shown — request access anyway and we'll confirm options within 24 hours."
                      emptySubMessage="Or join the waitlist and we'll notify you the moment space opens up."
                      onJoinWaitlist={() => setShowWaitlistModal(true)}
                      onRequestTour={() => setShowTourModal(true)}
                      onAskDayPass={() => openRequestModal("Day Pass")}
                    />
                    <div className="mt-6 pt-6 border-t border-border flex gap-3">
                      <Button 
                        onClick={() => openRequestModal()}
                        className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                      >
                        Request Access
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowWaitlistModal(true)}
                        className="flex-1"
                      >
                        Join Waitlist
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <span>Availability temporarily unavailable</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Section Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Workspace Options Section */}
      <section className="py-20 container" id="workspaces">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Workspace Options</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Choose your setup — all options include high-speed Wi-Fi, coffee bar access, and a professional environment.
          </p>
          <Button asChild variant="outline" className="gap-2">
            <a href="/#/coworking/offices">
              <Building2 className="h-4 w-4" />
              Browse Available Offices
            </a>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {workspaceOptions.map((workspace) => {
            const IconComponent = workspace.icon;
            return (
              <Card 
                key={workspace.name} 
                onClick={() => openRequestModal(workspace.name)}
                className="cursor-pointer hover:shadow-premium-hover hover:border-accent/50 hover:-translate-y-1 transition-all duration-300 shadow-premium group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openRequestModal(workspace.name)}
              >
                {/* Best For Tag */}
                <div className="absolute top-4 right-4">
                  <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full font-medium">
                    {workspace.bestFor}
                  </span>
                </div>
                <CardHeader className="pt-8">
                  <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 group-hover:shadow-gold transition-all">
                    <IconComponent className="h-7 w-7 text-accent" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-accent transition-colors">{workspace.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-2">{workspace.tagline}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {workspace.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-1 text-sm text-accent font-medium group-hover:gap-2 transition-all">
                    Select <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Plan Comparison Table */}
        <div className="max-w-4xl mx-auto mt-12">
          <PlanComparisonTable />
        </div>
      </section>

      {/* Section Transition */}
      <div className="h-16 bg-gradient-to-b from-background to-muted/30" />

      {/* Why The Hive Section */}
      <section className="py-20 bg-muted/30" id="why-hive">
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

      {/* Amenities Section */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-lg">A complete work environment, ready when you are.</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <AmenitiesAccordion onBookMeetingRoom={() => navigate('/booking?business=coworking')} />
        </div>
      </section>

      {/* Section Transition */}
      <div className="h-16 bg-gradient-to-b from-background to-background" />

      {/* Process Timeline Section */}
      <section className="py-20 container" id="how-it-works">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Three simple steps to your new workspace.</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-px bg-accent/30" aria-hidden="true" />
            <div className="space-y-10">
              {processSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.title} className="relative flex gap-6">
                    <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-gold">
                      <IconComponent className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="font-semibold text-lg mb-2">
                        <span className="text-accent mr-2">{index + 1}.</span>
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed max-w-lg">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section Transition to Dark */}
      <div className="h-16 bg-gradient-to-b from-background to-primary" />

      {/* Testimonials Section */}
      <section className="py-20 bg-primary" id="testimonials">
        <div className="container">
          <LocalProofStrip />
          <div className="text-center mb-12 mt-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">What Members Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border shadow-lg">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-accent/50 mb-4" aria-hidden="true" />
                  <p className="text-foreground mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{testimonial.name}</span>
                      {testimonial.verified && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20">
                          <Check className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
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

      {/* Section Transition */}
      <div className="h-16 bg-gradient-to-b from-primary to-background" />

      {/* FAQ Section */}
      <section className="py-20 container" id="faq">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 shadow-lg">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border border-border rounded-lg px-4 data-[state=open]:border-accent/50 bg-background"
                >
                  <AccordionTrigger className="hover:no-underline py-4 text-base [&[data-state=open]>svg]:text-accent">
                    <span className="text-left font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Get Access to The Hive — We'll Confirm Options Within 24 Hours
          </h2>
          <Button 
            size="lg"
            onClick={() => openRequestModal()}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
            data-event="hive_final_cta_click"
          >
            Request Workspace
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-primary-foreground/70 mt-4 text-sm">
            No obligation • Local team response within 24 hours • No payment until confirmed
          </p>
        </div>
      </section>

      {/* Modals */}
      <CoworkingRequestModal 
        open={showRequestModal} 
        onOpenChange={setShowRequestModal}
        preselectedType={selectedWorkspaceType || undefined}
      />
      <ScheduleTourModal 
        open={showTourModal} 
        onOpenChange={setShowTourModal}
        businessType="coworking"
      />
      <HiveWaitlistModal 
        open={showWaitlistModal} 
        onOpenChange={setShowWaitlistModal}
      />

      {/* Sticky Mobile CTA */}
      <StickyMobileHiveCTA onRequestClick={() => openRequestModal()} />

      {/* Floating Help */}
      <FloatingHelpDrawer 
        businessType="coworking"
        phoneNumber={SITE_CONFIG.contact.phone}
        email={SITE_CONFIG.contact.email}
      />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
    </>
  );
}
