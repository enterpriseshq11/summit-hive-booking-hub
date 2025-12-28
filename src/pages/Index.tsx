import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Heart
} from "lucide-react";

const businesses = [
  {
    name: "The Summit",
    tagline: "Elevate Every Event",
    description: "Premier event venue for weddings, corporate events, and celebrations.",
    bestFor: "Weddings • Galas • Corporate Events",
    capacity: "Up to 300 guests",
    icon: Building2,
    href: "/summit",
    cta: "Plan Your Event",
    accent: "from-amber-500/20 to-orange-500/10",
  },
  {
    name: "The Hive Coworking",
    tagline: "Where Work Thrives",
    description: "Modern workspaces, private offices, and meeting rooms with 24/7 access.",
    bestFor: "Remote Work • Startups • Meetings",
    capacity: "Flexible memberships",
    icon: Building2,
    href: "/coworking",
    cta: "Find Your Space",
    accent: "from-blue-500/20 to-indigo-500/10",
  },
  {
    name: "Restoration Lounge",
    tagline: "Renew & Restore",
    description: "Luxury spa treatments, massage therapy, and recovery services.",
    bestFor: "Massage • Facials • Recovery",
    capacity: "Book anytime",
    icon: Sparkles,
    href: "/spa",
    cta: "Book Treatment",
    accent: "from-purple-500/20 to-pink-500/10",
  },
  {
    name: "Total Fitness",
    tagline: "Your Journey Starts Here",
    description: "24/7 gym access, group classes, and personal training programs.",
    bestFor: "Strength • Cardio • Classes",
    capacity: "Unlimited access",
    icon: Dumbbell,
    href: "/fitness",
    cta: "Start Membership",
    accent: "from-emerald-500/20 to-teal-500/10",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose Your Experience",
    description: "Browse our venues, spa, gym, or coworking spaces",
    icon: Star,
  },
  {
    number: "02",
    title: "Pick Your Time",
    description: "See real-time availability and select what works",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Book Instantly",
    description: "Secure your spot with transparent pricing",
    icon: Zap,
  },
  {
    number: "04",
    title: "Show Up & Enjoy",
    description: "Everything's ready when you arrive",
    icon: Heart,
  },
];

const trustPoints = [
  { icon: Shield, text: "Secure & Transparent Pricing" },
  { icon: Clock, text: "Real-Time Availability" },
  { icon: Users, text: "Trusted by Locals" },
  { icon: CheckCircle2, text: "Book in Minutes" },
];

export default function Index() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background with gradient and subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/50 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.05)_0%,transparent_50%)]" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        
        <div className="container relative">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Location Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary opacity-0 animate-fade-in-down"
              style={{ animationDelay: "0.1s" }}
            >
              <MapPin className="h-4 w-4" />
              Proudly Serving Wapakoneta, Ohio
            </div>
            
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="block">Your Destination</span>
                <span className="block bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                  for Everything
                </span>
              </h1>
              
              <p 
                className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                Events. Workspaces. Wellness. Fitness.
                <span className="block mt-2 font-medium text-foreground">All under one roof. Book in minutes.</span>
              </p>
            </div>
            
            {/* CTAs */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5" 
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
                className="text-lg px-8 py-6 border-2 hover:bg-muted/50 transition-all duration-300" 
                asChild
              >
                <Link to="/gift-cards">
                  <Gift className="h-5 w-5 mr-2" />
                  Give the Gift of Experience
                </Link>
              </Button>
            </div>

            {/* Quick Info Pills */}
            <div 
              className="flex flex-wrap justify-center gap-4 pt-6 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 border text-sm text-muted-foreground shadow-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>Open 7 Days a Week</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 border text-sm text-muted-foreground shadow-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>(419) 555-0100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Band */}
      <section className="py-8 border-y bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {trustPoints.map((point, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 text-muted-foreground opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <point.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{point.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section Header */}
      <section className="pt-20 pb-8 container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Four Unique Experiences
          </h2>
          <p className="text-4xl md:text-5xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            One Destination
          </p>
          <p className="text-lg text-muted-foreground opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            From life's biggest celebrations to everyday wellness, we've got you covered.
          </p>
        </div>
      </section>

      {/* Business Cards - Redesigned */}
      <section className="py-12 container">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {businesses.map((business, index) => (
            <Card 
              key={business.href} 
              className="group relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              {/* Gradient accent background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${business.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="relative p-8">
                <div className="flex flex-col h-full">
                  {/* Icon and Title Row */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <business.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        {business.name}
                      </h3>
                      <p className="text-primary font-semibold text-sm mt-1">
                        {business.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {business.description}
                  </p>

                  {/* Best For Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {business.bestFor}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">
                    {business.capacity}
                  </p>

                  {/* CTA Button */}
                  <Button 
                    asChild 
                    className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-md"
                    variant="outline"
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
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Simple & Seamless
            </h2>
            <p className="text-4xl md:text-5xl font-bold tracking-tight">
              Book in 4 Easy Steps
            </p>
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
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
                )}
                
                {/* Step number */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-background border-2 border-primary/20 shadow-lg mb-6 group-hover:border-primary group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  <step.icon className="h-10 w-10 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
            <Heart className="h-4 w-4" />
            Community First
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            More Than a Business —<br />
            <span className="text-primary">A Wapakoneta Gathering Place</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're your neighbors, here to help you celebrate, work, relax, and grow. 
            Every experience is crafted with our community in mind.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary-foreground)/0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary-foreground)/0.05)_0%,transparent_50%)]" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to Experience More?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
              Your next event, workspace, treatment, or workout is just a few clicks away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                asChild
              >
                <Link to="/booking">
                  Explore & Book Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-6 border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300"
                asChild
              >
                <Link to="/login">
                  Sign In / Register
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-16 bg-muted/50 border-t">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Location</h3>
              <p className="text-sm text-muted-foreground">
                123 Main Street<br />
                Wapakoneta, OH 45895
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Contact</h3>
              <p className="text-sm text-muted-foreground">
                (419) 555-0100<br />
                info@azbookinghub.com
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Hours</h3>
              <p className="text-sm text-muted-foreground">
                Mon-Fri: 6am - 10pm<br />
                Sat-Sun: 7am - 9pm
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
