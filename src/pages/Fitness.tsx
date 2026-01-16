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
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";
import CinematicHeroBackground from "@/components/ui/CinematicHeroBackground";

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
      {/* Hero Section - 2-Column Layout with Animation */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        {/* Cinematic Hero Background */}
        <CinematicHeroBackground />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Copy */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30 mb-8">
                <Dumbbell className="h-4 w-4" />
                Total Fitness by A-Z
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="block text-white">Train on Your Schedule</span>
                <span className="block text-accent">Get Real Results</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-xl">
                24/7 access, expert coaching, and a community that actually notices when you show up.
              </p>
              
              {/* Hero CTAs - Primary (Dominant) + Secondary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Button 
                  size="lg" 
                  onClick={() => openJoinModal()}
                  className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all text-lg px-10 py-7"
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
                  className="border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 hover:border-primary-foreground/50 font-medium"
                  data-event="fitness_hero_orientation_click"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Orientation
                </Button>
              </div>
              
              {/* Microcopy under primary CTA */}
              <p className="text-sm text-primary-foreground/60 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                No contracts • Cancel anytime • Local team support
              </p>
              
              {/* Tertiary text link */}
              <a 
                href="#fitness-memberships" 
                className="text-sm text-accent hover:underline inline-flex items-center gap-1 animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              >
                See Memberships <ChevronRight className="h-3 w-3" />
              </a>
              
              {/* Trust Chips - 3 quick badges */}
              <div className="flex flex-wrap gap-3 mt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                {[
                  { icon: Clock, label: "24/7 Access" },
                  { icon: Users, label: "Coach Support" },
                  { icon: Shield, label: "No Contracts" }
                ].map((chip) => (
                  <div 
                    key={chip.label} 
                    className="flex items-center gap-2 px-4 py-2 bg-accent/15 rounded-full text-sm font-medium text-accent border border-accent/30"
                  >
                    <chip.icon className="h-4 w-4" />
                    {chip.label}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Column - Visual */}
            <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {/* Placeholder for gym photo/video - using styled container */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
                {/* Decorative gym-themed visual */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="h-24 w-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Dumbbell className="h-12 w-12 text-accent" />
                    </div>
                    <p className="text-primary-foreground/60 text-lg font-medium">Your Training Journey Starts Here</p>
                    <p className="text-accent text-sm mt-2">State-of-the-art facility</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 h-20 w-20 rounded-full bg-accent/10 blur-xl" />
                <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full bg-accent/15 blur-lg" />
              </div>
              
              {/* Floating stat cards */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-premium animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Members Active</p>
                    <p className="text-lg font-bold text-foreground">200+</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-premium animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Certified Trainers</p>
                    <p className="text-lg font-bold text-foreground">5+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} aria-hidden="true" />
      </section>

      {/* Anchor Chips */}
      <section className="py-6 container border-b border-border">
        <FitnessAnchorChips />
      </section>

      {/* Next Available Orientations - Reframed for Demand */}
      <section id="fitness-orientations" className="py-10 container">
        <Card className="max-w-4xl mx-auto shadow-premium border-border relative overflow-hidden">
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-accent" />
                Next Available Orientations
              </CardTitle>
              <span className="text-xs text-muted-foreground">Updated today</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* High demand banner - shown when availability is limited */}
            <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20 mb-6">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-accent" />
                <span className="font-semibold text-foreground">High demand</span>
              </div>
              <span className="text-muted-foreground">— orientations scheduled within 24 hours</span>
            </div>
            
            {/* Reassurance line */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>Most members start within 1–2 days</span>
            </div>
            
            <NextAvailableWidget
              businessType="fitness"
              title="Next Available Orientations"
              showPrice={false}
              limit={3}
              onJoinWaitlist={() => setShowWaitlistModal(true)}
              onRequestTour={() => setShowOrientationModal(true)}
              onAskDayPass={() => openJoinModal()}
              emptyMessage="All upcoming slots are filled"
              emptySubMessage="High demand! Request your orientation and we'll confirm within 24 hours."
            />
            
            {/* Primary action for requesting orientation */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button 
                  onClick={() => setShowOrientationModal(true)}
                  className="bg-accent hover:bg-accent/90 text-primary font-bold"
                  data-event="fitness_orientation_request_click"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Next Available Orientation
                </Button>
                <span className="text-sm text-muted-foreground">We'll confirm by text or email.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

      {/* Membership Tiers Section */}
      <section id="fitness-memberships" className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="block text-foreground">Choose Your</span>
            <span className="block text-accent">Membership</span>
          </h2>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="block text-foreground">What's</span>
            <span className="block text-accent">Included</span>
          </h2>
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

      {/* Why Members Stay - Emotional Benefits */}
      <section id="fitness-why" className="py-14 bg-primary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary-foreground">Why Members Stay</h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              More than equipment. It's about how you feel when you walk through our doors.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { 
                icon: Clock, 
                title: "24/7 Access", 
                headline: "Your life doesn't fit gym hours.",
                description: "Train at 5am before work or 11pm after the kids are asleep. We're always open."
              },
              { 
                icon: Users, 
                title: "Expert Staff", 
                headline: "You're never just another membership.",
                description: "Our team knows your name, your goals, and what you're working toward."
              },
              { 
                icon: Heart, 
                title: "Recovery Focus", 
                headline: "Train hard. Recover smarter.",
                description: "Sauna, steam room, and recovery amenities to keep you performing at your best."
              },
              { 
                icon: Award, 
                title: "Community", 
                headline: "The kind of place that notices when you show up.",
                description: "Members cheer each other on. Staff celebrates your wins. You belong here."
              }
            ].map((benefit) => (
              <Card key={benefit.title} className="bg-primary-foreground/5 border-primary-foreground/10 hover:border-accent/30 hover:shadow-gold transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 shadow-gold">
                      <benefit.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-foreground text-lg">{benefit.title}</h3>
                      <p className="text-accent font-medium mb-2">{benefit.headline}</p>
                      <p className="text-primary-foreground/60 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />

      {/* Meet Your Coaches - With Personality & Micro-CTAs */}
      <section className="py-14 container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Meet Your Coaches</h2>
          <p className="text-muted-foreground text-lg">The people who'll help you reach your goals</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { 
              name: "Marcus T.", 
              title: "Head Trainer", 
              style: "Motivating & no-nonsense",
              specialty: ["Strength", "Conditioning", "Athletics"],
              years: "12+ years",
              loves: "Helping members hit PRs they didn't think possible"
            },
            { 
              name: "Jessica R.", 
              title: "Fitness Coach", 
              style: "Supportive & form-focused",
              specialty: ["Weight Loss", "Nutrition", "Beginners"],
              years: "8+ years",
              loves: "Building confidence in first-time gym members"
            },
            { 
              name: "David K.", 
              title: "Performance Coach", 
              style: "High-energy, accountability-driven",
              specialty: ["HIIT", "Mobility", "Endurance"],
              years: "10+ years",
              loves: "Designing programs that fit busy schedules"
            }
          ].map((coach, idx) => (
            <Card 
              key={idx} 
              className="shadow-premium border-border group hover:shadow-gold-lg hover:border-accent/30 transition-all overflow-hidden"
            >
              <CardContent className="pt-8 pb-6 text-center">
                {/* Photo placeholder */}
                <div className="h-24 w-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border-2 border-accent/30 group-hover:border-accent transition-colors">
                  <User className="h-12 w-12 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{coach.name}</h3>
                <p className="text-accent text-sm font-medium mb-1">{coach.title}</p>
                <p className="text-muted-foreground text-sm italic mb-3">"{coach.style}"</p>
                
                {/* Specialty tags */}
                <div className="flex flex-wrap justify-center gap-1 mb-4">
                  {coach.specialty.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-accent/30 text-accent">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Hover reveal */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-muted-foreground mb-4 h-0 group-hover:h-auto overflow-hidden">
                  <p className="pt-2 border-t border-border mt-2">
                    <span className="text-accent font-medium">What I love:</span> {coach.loves}
                  </p>
                </div>
                
                {/* Micro-CTA */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowOrientationModal(true)}
                  className="border-accent/30 text-accent hover:bg-accent hover:text-primary transition-colors"
                >
                  Ask a Coach
                </Button>
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

      {/* Member Stories - Real Members, Real Results */}
      <section id="fitness-testimonials" className="py-14 bg-primary">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary-foreground">Real Members. Real Results.</h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              Stories from people just like you.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: "The 24/7 access completely changed my routine. I can finally work out when it fits my schedule, not the other way around.",
                name: "Ryan M.",
                duration: "1 year strong",
                goals: ["Busy Parent", "Strength"]
              },
              {
                quote: "The staff here actually cares about your progress. They remember your name and check in on your goals regularly.",
                name: "Sarah K.",
                duration: "6 months in",
                goals: ["Weight Loss", "Confidence"]
              },
              {
                quote: "I was intimidated to join a gym at 55. The coaches made me feel welcome from day one. Now I can't imagine life without it.",
                name: "Linda T.",
                duration: "8 months in",
                goals: ["Mobility", "Senior Fitness"]
              },
              {
                quote: "As a shift worker, finding a gym that's actually open when I need it was a game changer. Plus the sauna is perfect after a long night.",
                name: "Marcus D.",
                duration: "2 years strong",
                goals: ["Shift Worker", "Recovery"]
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="bg-primary-foreground/5 border-accent/20 shadow-premium">
                <CardContent className="pt-8 pb-6">
                  <Quote className="h-8 w-8 text-accent mb-4" aria-hidden="true" />
                  <p className="text-primary-foreground/90 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  
                  {/* Goal tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {testimonial.goals.map((goal) => (
                      <Badge key={goal} variant="outline" className="text-xs border-accent/30 text-accent">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-foreground font-medium">{testimonial.name}</span>
                      <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <span className="text-xs px-3 py-1 bg-accent/20 text-accent rounded-full">{testimonial.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Read more link */}
          <div className="text-center mt-8">
            <a href="#" className="text-accent hover:underline inline-flex items-center gap-1 text-sm">
              Read more stories <ChevronRight className="h-3 w-3" />
            </a>
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

      {/* Strong Emotional Close - Final CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08)_0%,transparent_70%)]" />
        
        <div className="container relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <Heart className="h-12 w-12 text-accent mx-auto mb-6" aria-hidden="true" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
              This isn't just a gym. It's where habits change.
            </h2>
            <p className="text-primary-foreground/70 mb-8 text-lg leading-relaxed">
              Start with a plan that fits your life — and a team that keeps you moving forward.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button 
                size="lg" 
                onClick={() => openJoinModal()}
                className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all text-lg px-10 py-7"
                data-event="fitness_final_cta_click"
              >
                <Dumbbell className="h-5 w-5 mr-2" />
                Join Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowOrientationModal(true)}
                className="border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 hover:border-primary-foreground/50 font-medium"
                data-event="fitness_final_orientation_click"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Orientation
              </Button>
            </div>
            
            {/* Trust line */}
            <p className="text-sm text-primary-foreground/60">
              No contracts • Cancel anytime • Local team support
            </p>
          </div>
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
      <FloatingHelpDrawer 
        businessType="fitness"
        phoneNumber={SITE_CONFIG.contact.phone}
        email={SITE_CONFIG.contact.email}
      />

      {/* Sticky Mobile CTA */}
      <StickyMobileFitnessCTA onJoinNow={() => openJoinModal()} />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
