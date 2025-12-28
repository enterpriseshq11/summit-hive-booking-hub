import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { 
  ArrowRight, 
  CalendarDays, 
  Building2, 
  Sparkles, 
  Dumbbell, 
  Gift, 
  MapPin, 
  Phone, 
  Clock,
  CheckCircle2,
  Star,
  Users,
  Zap,
  Shield,
  Heart,
  TrendingUp,
  Check
} from "lucide-react";
import { NextAvailableStrip, ExperiencePreviewPanel, SocialProofSection, FAQSection } from "@/components/home";

const businesses = [
  {
    name: "The Summit",
    tagline: "Elevate Every Event",
    description: "Premier event venue for weddings, corporate events, and celebrations that leave lasting impressions.",
    bestFor: "Weddings • Galas • Corporate",
    bullets: ["Up to 300 guests", "Full catering options", "AV & lighting included"],
    icon: Building2,
    href: "/summit",
    cta: "Plan Your Event",
    colorClass: "summit",
    gradient: "from-summit/20 via-summit/10 to-transparent",
    borderHover: "hover:border-summit/50",
    iconBg: "group-hover:bg-summit",
    glowColor: "group-hover:shadow-summit/30",
    pattern: "bg-[radial-gradient(circle_at_80%_20%,hsl(var(--summit)/0.08)_0%,transparent_50%)]",
  },
  {
    name: "The Hive Coworking",
    tagline: "Where Work Thrives",
    description: "Modern workspaces and private offices with 24/7 access. Your productivity headquarters.",
    bestFor: "Remote Work • Startups • Meetings",
    bullets: ["24/7 access", "High-speed WiFi", "Meeting rooms available"],
    icon: Building2,
    href: "/coworking",
    cta: "Find Your Space",
    colorClass: "coworking",
    gradient: "from-coworking/20 via-coworking/10 to-transparent",
    borderHover: "hover:border-coworking/50",
    iconBg: "group-hover:bg-coworking",
    glowColor: "group-hover:shadow-coworking/30",
    pattern: "bg-[radial-gradient(circle_at_20%_80%,hsl(var(--coworking)/0.08)_0%,transparent_50%)]",
  },
  {
    name: "Restoration Lounge",
    tagline: "Renew & Restore",
    description: "Luxury spa treatments and massage therapy. Escape the everyday and rediscover balance.",
    bestFor: "Massage • Facials • Recovery",
    bullets: ["Licensed therapists", "Premium products", "Private suites"],
    icon: Sparkles,
    href: "/spa",
    cta: "Book Treatment",
    colorClass: "spa",
    gradient: "from-spa/20 via-spa/10 to-transparent",
    borderHover: "hover:border-spa/50",
    iconBg: "group-hover:bg-spa",
    glowColor: "group-hover:shadow-spa/30",
    pattern: "bg-[radial-gradient(circle_at_80%_80%,hsl(var(--spa)/0.08)_0%,transparent_50%)]",
  },
  {
    name: "Total Fitness",
    tagline: "Your Journey Starts Here",
    description: "24/7 gym access with group classes and personal training. Transform your potential.",
    bestFor: "Strength • Cardio • Classes",
    bullets: ["Modern equipment", "Group classes", "Personal training"],
    icon: Dumbbell,
    href: "/fitness",
    cta: "Start Membership",
    colorClass: "fitness",
    gradient: "from-fitness/20 via-fitness/10 to-transparent",
    borderHover: "hover:border-fitness/50",
    iconBg: "group-hover:bg-fitness",
    glowColor: "group-hover:shadow-fitness/30",
    pattern: "bg-[radial-gradient(circle_at_20%_20%,hsl(var(--fitness)/0.08)_0%,transparent_50%)]",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose Your Experience",
    description: "Browse venues, spa, gym, or coworking",
    icon: Star,
  },
  {
    number: "02",
    title: "See Real-Time Availability",
    description: "Find the perfect time that works for you",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Confirm & Pay Deposit",
    description: "Secure your spot with transparent pricing",
    icon: Zap,
  },
  {
    number: "04",
    title: "Show Up — We Handle the Rest",
    description: "Everything's ready when you arrive",
    icon: Heart,
  },
];

const stats = [
  { value: 2500, suffix: "+", label: "Happy Customers" },
  { value: 150, suffix: "+", label: "Events Hosted" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 4, suffix: "", label: "Unique Experiences" },
];

const proofChips = [
  { icon: Zap, text: "Book in Minutes" },
  { icon: Clock, text: "Real-Time Availability" },
  { icon: MapPin, text: "Local Destination" },
  { icon: Shield, text: "Secure Checkout" },
];

function AnimatedCounter({ value, suffix, delay }: { value: number; suffix: string; delay: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(counter);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(counter);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isVisible, value, delay]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-foreground">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function Index() {
  const scrollToExperiences = () => {
    document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - 2-Column Premium Layout */}
      <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden bg-primary">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--summit)/0.1)_0%,transparent_50%)]" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-summit/8 rounded-full blur-[120px] animate-float" style={{ animationDelay: "1.5s" }} />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Location Badge */}
              <div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white opacity-0 animate-fade-in-down"
                style={{ animationDelay: "0.1s" }}
              >
                <MapPin className="h-4 w-4 text-accent" />
                Proudly Serving Wapakoneta, Ohio
              </div>
              
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white opacity-0 animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <span className="block">Your Destination</span>
                  <span className="block mt-2 bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent bg-300% animate-gradient-shift">
                    for Everything
                  </span>
                </h1>
                
                <p 
                  className="text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-0 animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  Events. Workspaces. Wellness. Fitness.
                  <span className="block mt-2 font-semibold text-white">All under one roof. Book in minutes.</span>
                </p>
              </div>
              
              {/* CTAs - Bold and Prominent */}
              <div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-7 bg-accent hover:bg-accent/90 text-primary font-bold shadow-2xl shadow-accent/40 hover:shadow-accent/60 transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-glow-pulse" 
                  asChild
                >
                  <Link to="/booking">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Start Booking
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-10 py-7 border-2 border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                  onClick={scrollToExperiences}
                >
                  Explore Experiences
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* Proof Chips */}
              <div 
                className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4 opacity-0 animate-fade-in"
                style={{ animationDelay: "0.8s" }}
              >
                {proofChips.map((chip, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/80 backdrop-blur-sm"
                  >
                    <chip.icon className="h-4 w-4 text-accent" />
                    <span>{chip.text}</span>
                  </div>
                ))}
              </div>

              {/* Contact Pills */}
              <div 
                className="flex flex-wrap justify-center lg:justify-start gap-4 opacity-0 animate-fade-in"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Phone className="h-4 w-4" />
                  <span>(419) 555-0100</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="h-4 w-4" />
                  <span>Open 7 Days</span>
                </div>
              </div>
            </div>

            {/* Right Column - Experience Preview Panel */}
            <div 
              className="hidden lg:block opacity-0 animate-fade-in-left"
              style={{ animationDelay: "0.5s" }}
            >
              <ExperiencePreviewPanel />
            </div>
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* Next Available Strip - Live Availability */}
      <NextAvailableStrip />

      {/* Stats Section - The "WOW" Moment */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center space-y-2"
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} delay={index * 150} />
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section - Testimonials, Partners, Guarantees */}
      <SocialProofSection />

      {/* Experience Section Header */}
      <section id="experiences" className="pt-24 pb-12 container scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-semibold text-accent mb-6 opacity-0 animate-fade-in-up" 
            style={{ animationDelay: "0.1s" }}
          >
            <Sparkles className="h-4 w-4" />
            Four Unique Experiences
          </div>
          <h2 
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in-up" 
            style={{ animationDelay: "0.2s" }}
          >
            One <span className="text-accent">Destination</span>
          </h2>
          <p 
            className="text-lg text-muted-foreground opacity-0 animate-fade-in-up" 
            style={{ animationDelay: "0.3s" }}
          >
            From life's biggest celebrations to everyday wellness, we've got you covered.
          </p>
        </div>
      </section>

      {/* Business Cards - Product-Style */}
      <section className="py-12 pb-24 container">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {businesses.map((business, index) => (
            <Card 
              key={business.href} 
              className={`group relative overflow-hidden border-2 ${business.borderHover} transition-all duration-500 hover:shadow-2xl ${business.glowColor} hover:-translate-y-2 opacity-0 animate-fade-in-up bg-card`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              {/* Gradient accent background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${business.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Pattern overlay */}
              <div className={`absolute inset-0 ${business.pattern} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Spotlight effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent)/0.1)_0%,transparent_50%)]" />
              
              <CardContent className="relative p-8">
                <div className="flex flex-col h-full">
                  {/* Icon and Title Row */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`h-16 w-16 rounded-2xl bg-muted flex items-center justify-center ${business.iconBg} group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                      <business.icon className="h-8 w-8 text-foreground group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold tracking-tight">
                        {business.name}
                      </h3>
                      <p className={`font-semibold text-sm mt-1 text-${business.colorClass}`}>
                        {business.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Best For Tag */}
                  <div className="mb-3">
                    <span className={`text-xs font-semibold bg-${business.colorClass}/10 text-${business.colorClass} px-3 py-1.5 rounded-full`}>
                      Best for: {business.bestFor}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {business.description}
                  </p>

                  {/* 3 Bullet Highlights */}
                  <ul className="space-y-2 mb-6">
                    {business.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className={`h-4 w-4 text-${business.colorClass} shrink-0`} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button - Bold */}
                  <Button 
                    asChild 
                    className={`w-full mt-auto font-semibold transition-all duration-300 shadow-lg group-hover:shadow-xl bg-primary text-primary-foreground hover:bg-primary/90`}
                    size="lg"
                  >
                    <Link to={business.href} className="flex items-center justify-center gap-2">
                      {business.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gift Cards CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="font-semibold">
            <Link to="/gift-cards" className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Give the Gift of Experience
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-28 relative overflow-hidden">
        {/* Diagonal background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08)_0%,transparent_70%)]" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white mb-6">
              <Zap className="h-4 w-4 text-accent" />
              Simple & Seamless
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Book in <span className="text-accent">4 Easy Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative text-center group opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.15 * (index + 1)}s` }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent/50 to-accent/20" />
                )}
                
                {/* Step card */}
                <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6 group-hover:bg-white/20 group-hover:border-accent/50 group-hover:-translate-y-2 transition-all duration-300 shadow-xl">
                  <step.icon className="h-12 w-12 text-accent" />
                  <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-accent text-primary text-sm font-bold flex items-center justify-center shadow-lg shadow-accent/30">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
                <p className="text-sm text-white/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 0)" }} />
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section - Maximum Impact */}
      <section className="relative py-28 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent to-accent/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.2)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Ready to Experience More?
            </h2>
            <p className="text-xl text-primary/70 mb-8 max-w-xl mx-auto">
              Your next event, workspace, treatment, or workout is just a few clicks away.
            </p>
            
            {/* Trust line */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-primary/60">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Secure checkout
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Real-time availability
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Local destination
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-12 py-7 bg-primary text-primary-foreground font-bold shadow-2xl hover:shadow-3xl hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link to="/booking">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Start Booking Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-12 py-7 border-2 border-primary/30 text-primary bg-transparent hover:bg-primary/10 transition-all duration-300 font-semibold"
                onClick={scrollToExperiences}
              >
                Explore Experiences
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold mb-2 text-lg">Location</h3>
              <p className="text-sm text-white/70">
                123 Main Street<br />
                Wapakoneta, OH 45895
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold mb-2 text-lg">Contact</h3>
              <p className="text-sm text-white/70">
                (419) 555-0100<br />
                info@azbookinghub.com
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold mb-2 text-lg">Hours</h3>
              <p className="text-sm text-white/70">
                Monday - Sunday<br />
                6:00 AM - 10:00 PM
              </p>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/50">
              © 2024 A-Z Enterprises. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
