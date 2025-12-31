import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { 
  NextAvailableWidget, 
  MembershipSignupForm,
  FloatingHelpDrawer,
  FitnessJoinModal,
  FitnessOrientationModal,
  FitnessWaitlistModal,
  FitnessAnchorChips,
  StickyMobileFitnessCTA
} from "@/components/booking";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, Check, Users, ArrowRight, Clock, Zap, Heart, Trophy, 
  ChevronRight, Quote, Shield, CheckCircle, Calendar, Target,
  Award, ShieldCheck, Flame, User, Waves, Coffee
} from "lucide-react";

export default function Fitness() {
  const { data: business } = useBusinessByType("fitness");
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showOrientationModal, setShowOrientationModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [preselectedPlan, setPreselectedPlan] = useState<"essential" | "performance" | "elite" | null>(null);

  const membershipTiers = [
    {
      name: "Essential",
      tagline: "Start your journey",
      type: "essential" as const,
      badge: "Best for Beginners",
      features: [
        "24/7 gym access — train on your schedule",
        "Full equipment floor access",
        "Locker room & shower facilities",
        "Free equipment orientation session"
      ]
    },
    {
      name: "Performance",
      tagline: "Elevate your training",
      type: "performance" as const,
      badge: "Most Popular",
      highlighted: true,
      features: [
        "Everything in Essential",
        "Unlimited group fitness classes",
        "Sauna & steam room access",
        "One guest pass per month"
      ]
    },
    {
      name: "Elite",
      tagline: "Unlimited potential",
      type: "elite" as const,
      badge: "Best Value",
      features: [
        "Everything in Performance",
        "Spa & recovery service discounts",
        "Priority class booking",
        "Unlimited guest access"
      ]
    }
  ];

  // Fallback trainer data
  const trainers = [
    { name: "Marcus T.", title: "Head Trainer", specialty: "Strength & Conditioning", years: "12+ years" },
    { name: "Jessica R.", title: "Fitness Coach", specialty: "Weight Loss & Nutrition", years: "8+ years" },
    { name: "David K.", title: "Performance Coach", specialty: "Athletic Training", years: "10+ years" }
  ];

  const openJoinModal = (plan?: "essential" | "performance" | "elite") => {
    setPreselectedPlan(plan || null);
    setShowJoinModal(true);
  };

  const handleMembershipSuccess = (membershipId: string) => {
    setShowMembershipForm(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Black & Gold */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30 mb-8">
              <Dumbbell className="h-4 w-4" />
              Total Fitness by A-Z
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">
              Your Transformation Starts Here
            </h1>
            <p className="text-xl md:text-2xl text-accent font-medium mb-4">24/7 Access. Expert Guidance. Real Results.</p>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-2xl">
              State-of-the-art equipment, certified trainers, and a supportive community — join now and start training in under 2 minutes.
            </p>
            
            {/* Hero CTAs - Primary + Secondary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <Button 
                size="lg" 
                onClick={() => openJoinModal()}
                className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
                data-event="fitness_hero_cta_click"
              >
                <Dumbbell className="h-5 w-5 mr-2" />
                Join Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowOrientationModal(true)}
                className="border-accent/50 text-primary-foreground hover:bg-accent/10 hover:border-accent"
                data-event="fitness_hero_orientation_click"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Orientation
              </Button>
            </div>
            
            {/* Trust Badge */}
            <div className="flex items-center gap-2 text-primary-foreground/70 mb-4">
              <Shield className="h-5 w-5 text-accent" aria-hidden="true" />
              <span className="text-sm">No contracts. Review everything before payment.</span>
            </div>
            
            {/* Micro-trust line */}
            <p className="text-sm text-primary-foreground/50">
              Cancel anytime • No hidden fees • Response within 24 hours
            </p>
          </div>
          
          {/* Hero Feature Chips */}
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              { icon: Clock, label: "24/7 Access" },
              { icon: Award, label: "Certified Trainers" },
              { icon: Waves, label: "Recovery Included" },
              { icon: Shield, label: "No Contracts" }
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
        <FitnessAnchorChips />
      </section>

      {/* Next Available Widget - Premium Card Styling */}
      <section className="py-10 container">
        <Card className="max-w-4xl mx-auto shadow-premium border-border relative overflow-hidden">
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-accent" />
              Next Available Orientations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <NextAvailableWidget
              businessType="fitness"
              title="Next Available Orientations"
              showPrice={false}
              limit={3}
              onJoinWaitlist={() => setShowWaitlistModal(true)}
              onRequestTour={() => setShowOrientationModal(true)}
              onAskDayPass={() => openJoinModal()}
              emptyMessage="No orientation slots in the next 14 days"
              emptySubMessage="Join anyway — we'll schedule your orientation within 24 hours, or join the waitlist."
            />
          </CardContent>
        </Card>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

      {/* Membership Tiers Section */}
      <section id="fitness-memberships" className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Membership Options</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find the membership that fits your goals — all plans include 24/7 access and expert support.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {membershipTiers.map((tier) => (
            <Card 
              key={tier.name} 
              onClick={() => openJoinModal(tier.type)}
              className={`cursor-pointer hover:shadow-gold-lg hover:-translate-y-1 transition-all duration-300 shadow-premium group border-2 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                tier.highlighted 
                  ? "border-accent" 
                  : "border-transparent hover:border-accent/50"
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openJoinModal(tier.type)}
              data-event={`fitness_${tier.type}_card_click`}
            >
              {/* Badge */}
              <div className="absolute top-3 right-3">
                <Badge className={`text-xs ${
                  tier.highlighted 
                    ? "bg-accent text-primary" 
                    : "bg-accent/20 text-accent border-accent/30"
                }`}>
                  {tier.badge}
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:shadow-gold transition-all">
                  {tier.type === "essential" && <Dumbbell className="h-7 w-7 text-accent group-hover:text-primary transition-colors" />}
                  {tier.type === "performance" && <Zap className="h-7 w-7 text-accent group-hover:text-primary transition-colors" />}
                  {tier.type === "elite" && <Trophy className="h-7 w-7 text-accent group-hover:text-primary transition-colors" />}
                </div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{tier.name}</CardTitle>
                <p className="text-accent font-medium">{tier.tagline}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-muted-foreground text-sm">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-accent font-medium flex items-center gap-1 group-hover:underline">
                  Get started <ArrowRight className="h-4 w-4" />
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Single section CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => openJoinModal()}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
            data-event="fitness_memberships_cta_click"
          >
            <Dumbbell className="h-5 w-5 mr-2" />
            Start Membership
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            No contracts • Review everything before payment • Cancel anytime
          </p>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

      {/* What's Included Amenities Accordion */}
      <section className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">What's Included</h2>
          <p className="text-muted-foreground text-lg">Premium amenities with every membership</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-premium border-border">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="equipment" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Dumbbell className="h-5 w-5 text-accent" />
                      <span className="font-semibold">Equipment & Training Floor</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Full free weight section</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Cardio machines (treadmills, bikes, ellipticals)</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Resistance machines</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Functional training area</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="classes" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-accent" />
                      <span className="font-semibold">Group Fitness Classes</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Strength & conditioning</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> HIIT & cardio</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Yoga & flexibility</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Cycling & spin</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="recovery" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-accent" />
                      <span className="font-semibold">Recovery & Wellness</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Sauna access</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Steam room</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Stretching area</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Spa service discounts (Elite)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="staff" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-accent" />
                      <span className="font-semibold">Staff & Support</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Certified personal trainers</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Free orientation session</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Equipment guidance</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Goal-setting support</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Total Fitness */}
      <section id="fitness-why" className="py-14 bg-primary">
        <div className="container">
          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full border border-primary-foreground/20">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">Certified Trainers</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full border border-primary-foreground/20">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">10+ Years Serving Wapakoneta</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full border border-primary-foreground/20">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">Clean & Safe Environment</span>
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary-foreground">Why Total Fitness</h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              More than a gym — a complete fitness experience designed around your goals.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Clock, title: "24/7 Access", description: "Train on your schedule, day or night — no restrictions" },
              { icon: Zap, title: "Modern Equipment", description: "State-of-the-art machines and full free weight section" },
              { icon: Users, title: "Expert Staff", description: "Certified trainers ready to guide your journey" },
              { icon: Heart, title: "Recovery Focus", description: "Sauna, steam, and integrated recovery amenities" }
            ].map((benefit) => (
              <Card key={benefit.title} className="bg-primary-foreground/5 border-primary-foreground/10 hover:border-accent/30 hover:shadow-gold transition-all">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 shadow-gold">
                    <benefit.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-primary-foreground mb-2">{benefit.title}</h3>
                  <p className="text-primary-foreground/60 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

      {/* Trainer Highlights */}
      <section className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Meet Your Coaches</h2>
          <p className="text-muted-foreground text-lg">Certified professionals dedicated to your success</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {trainers.map((trainer, idx) => (
            <Card key={idx} className="shadow-premium border-border text-center hover:shadow-gold-lg hover:border-accent/30 transition-all">
              <CardContent className="pt-8 pb-6">
                <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border-2 border-accent/30">
                  <User className="h-10 w-10 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{trainer.name}</h3>
                <p className="text-accent text-sm font-medium mb-2">{trainer.title}</p>
                <Badge variant="outline" className="text-xs mb-3 border-accent/30 text-accent">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Certified
                </Badge>
                <p className="text-muted-foreground text-sm mb-1">{trainer.specialty}</p>
                <p className="text-xs text-muted-foreground/70">{trainer.years}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process Timeline */}
      <section id="fitness-process" className="py-14 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Getting started is simple — we'll guide you every step of the way.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-accent/30" aria-hidden="true" />
              
              {[
                { step: "1", title: "Choose Your Membership", description: "Select the plan that matches your fitness goals. No commitment — review everything before payment.", icon: Target },
                { step: "2", title: "Complete Your Profile", description: "Tell us about yourself so we can personalize your experience and schedule your free orientation.", icon: Calendar },
                { step: "3", title: "Start Training", description: "Get oriented with our facility, meet the team, and begin your transformation with full support.", icon: Flame }
              ].map((item) => (
                <div key={item.step} className="relative flex gap-6 pb-8 last:pb-0">
                  <div className="relative z-10 h-12 w-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-gold">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground max-w-md leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-sm text-muted-foreground">
                <span className="text-accent font-medium">No obligation.</span> Cancel anytime — no contracts, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Proof Strip */}
      <section className="py-6 bg-background border-y border-border">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Busy Professionals",
              "Athletes",
              "Parents",
              "Beginners",
              "Seniors"
            ].map((label) => (
              <span key={label} className="text-sm text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="fitness-testimonials" className="py-14 bg-primary">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary-foreground">Member Stories</h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              Real results from real members in our community.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                quote: "The 24/7 access completely changed my routine. I can finally work out when it fits my schedule, not the other way around.",
                name: "Ryan M.",
                badge: "Performance Member"
              },
              {
                quote: "The staff here actually cares about your progress. They remember your name and check in on your goals regularly.",
                name: "Sarah K.",
                badge: "Elite Member"
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
      <section id="fitness-faq" className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Common Questions</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about membership.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-premium border-border">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="getting-started" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="text-left font-semibold">How do I get started?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Click "Join Now" to begin. You'll select your membership, complete a brief profile, and schedule your free orientation. Our team will guide you through everything — no experience required.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="commitment" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="text-left font-semibold">Is there a long-term commitment?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    No long-term contracts required. All memberships are month-to-month with the flexibility to cancel anytime. We believe in earning your business every month.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="classes" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="text-left font-semibold">What classes are available?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    We offer strength training, HIIT, yoga, cycling, and more. Performance and Elite members have unlimited class access. Check our schedule for current offerings — new classes added regularly.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="guests" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="text-left font-semibold">Can I bring guests?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Yes! Performance members get one guest pass per month. Elite members enjoy unlimited guest access. Guests must sign a waiver and be accompanied by the member.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="pricing" className="border border-border rounded-lg px-6 data-[state=open]:border-accent/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="text-left font-semibold">How does pricing work?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Pricing varies based on service type, appointment length, and selected enhancements. You'll review everything before payment—no commitment required.
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
          <Trophy className="h-12 w-12 text-accent mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary-foreground">Ready to Transform?</h2>
          <p className="text-primary-foreground/70 mb-6 max-w-2xl mx-auto text-lg">
            Take the first step toward your fitness goals — join now and start training within 24 hours.
          </p>
          <Button 
            size="lg" 
            onClick={() => openJoinModal()}
            className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
            data-event="fitness_final_cta_click"
          >
            <Dumbbell className="h-5 w-5 mr-2" />
            Join Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-primary-foreground/60 mt-4 max-w-md mx-auto">
            No contracts • Cancel anytime • Review everything before payment
          </p>
        </div>
      </section>

      {/* Legacy Membership Form Dialog */}
      <Dialog open={showMembershipForm} onOpenChange={setShowMembershipForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Start Your Fitness Journey</DialogTitle>
          </DialogHeader>
          <MembershipSignupForm onSuccess={handleMembershipSuccess} />
        </DialogContent>
      </Dialog>

      {/* Join Modal */}
      <FitnessJoinModal 
        open={showJoinModal} 
        onOpenChange={setShowJoinModal}
        preselectedPlan={preselectedPlan}
      />

      {/* Orientation Modal */}
      <FitnessOrientationModal 
        open={showOrientationModal} 
        onOpenChange={setShowOrientationModal}
      />

      {/* Waitlist Modal */}
      <FitnessWaitlistModal 
        open={showWaitlistModal} 
        onOpenChange={setShowWaitlistModal}
        preselectedPlan={preselectedPlan}
      />

      {/* Floating Help Drawer */}
      <FloatingHelpDrawer />

      {/* Sticky Mobile CTA */}
      <StickyMobileFitnessCTA onJoinNow={() => openJoinModal()} />
    </div>
  );
}
