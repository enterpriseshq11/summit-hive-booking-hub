import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mic,
  Video,
  Wifi,
  Lightbulb,
  Shield,
  Users,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Headphones,
  Sliders,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Building2,
  Dumbbell,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Placeholder images for gallery (will be replaced with real photos)
const galleryImages = [
  { id: 1, src: "/placeholder.svg", alt: "Voice Vault Studio - Main Recording Area" },
  { id: 2, src: "/placeholder.svg", alt: "Professional Microphones & Equipment" },
  { id: 3, src: "/placeholder.svg", alt: "Adjustable Studio Lighting Setup" },
  { id: 4, src: "/placeholder.svg", alt: "Comfortable Seating for Guests" },
  { id: 5, src: "/placeholder.svg", alt: "Video Recording Equipment" },
  { id: 6, src: "/placeholder.svg", alt: "Soundproof Environment" },
];

const studioFeatures = [
  { icon: Shield, title: "Fully Soundproof", description: "Professional acoustic isolation" },
  { icon: Mic, title: "Pro Microphones", description: "Studio-grade audio capture" },
  { icon: Sliders, title: "Professional Mixers", description: "Industry-standard equipment" },
  { icon: Video, title: "Video Recording", description: "Multi-camera capability" },
  { icon: Lightbulb, title: "Studio Lighting", description: "Adjustable photo & video lights" },
  { icon: Users, title: "Seats Up to 4", description: "Comfortable guest seating" },
  { icon: Wifi, title: "Fast Wi-Fi", description: "Reliable high-speed internet" },
  { icon: Headphones, title: "On-Staff Editor", description: "Professional editing available" },
];

export default function VoiceVault() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const scrollToPackages = () => {
    document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBooking = () => {
    document.getElementById("hourly-rental")?.scrollIntoView({ behavior: "smooth" });
  };

  // Set document title for SEO
  useEffect(() => {
    document.title = "Voice Vault by The Hive | Professional Podcast & Recording Studio";
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center bg-primary text-primary-foreground overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/95" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/50 blur-3xl" />
        </div>

        <div className="container relative z-10 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 hover:bg-accent/30">
              <Mic className="w-3 h-3 mr-1" />
              Inside The Hive Coworking
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              <span className="text-gold-gradient">Voice Vault</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl font-medium mt-2 text-primary-foreground/90">
                by The Hive
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-4 max-w-2xl mx-auto">
              A fully soundproof, professional podcast & recording studio — designed for creators, professionals, and artists.
            </p>
            
            <p className="text-xl md:text-2xl font-semibold text-accent mb-10">
              Walk in. Record. Walk out. We handle the rest.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6"
                onClick={scrollToBooking}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book the Studio
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 font-semibold text-lg px-8 py-6"
                onClick={scrollToPackages}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Podcast Packages
              </Button>
            </div>
          </div>
        </div>

        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* WHAT IS VOICE VAULT */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Your Professional Recording Space
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Located inside The Hive coworking space, Voice Vault is a purpose-built, fully soundproof recording environment. Whether you're launching a podcast, recording interviews, creating voiceovers, or producing professional content — this is your space.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {["Podcasters", "Business Owners", "Creators", "Artists", "Interviewers", "Voice Actors", "Coaches", "Educators"].map((user) => (
                <div
                  key={user}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">{user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STUDIO FEATURES */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade equipment and a distraction-free environment — all included.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {studioFeatures.map((feature) => (
              <Card key={feature.title} className="bg-card border-border hover:border-accent/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOURLY STUDIO RENTAL */}
      <section id="hourly-rental" className="py-20 bg-background scroll-mt-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-2 border-accent/30 overflow-hidden">
              <div className="bg-primary text-primary-foreground p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Hourly Studio Rental</h2>
                    <p className="text-primary-foreground/80">Full equipment access • Studio use included</p>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-4xl md:text-5xl font-bold text-accent">$45</div>
                    <div className="text-primary-foreground/70">per hour</div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="w-5 h-5 text-accent" />
                      <span className="font-medium">2-hour minimum</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <span>All equipment included</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <span>Full studio access</span>
                    </div>
                  </div>
                  
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Studio Time
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Equipment Responsibility:</strong> Clients are responsible for proper use of all equipment. Damage caused by misuse or negligence may result in repair or replacement charges.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* WHY MOST PODCASTS FAIL - PRICE ANCHOR */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why Most Podcasts Fail
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-6">
              Most podcasts fail because people stop showing up. The Voice Vault is built around <span className="text-accent font-semibold">consistency</span>, not just equipment.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="font-medium text-accent">You don't rent gear. You commit to publishing.</span>
            </div>
          </div>
        </div>
      </section>

      {/* PODCAST PACKAGES */}
      <section id="packages" className="py-20 bg-background scroll-mt-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Podcast Packages — Built for Consistency
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the level of support that fits your style. Both packages are designed to get you publishing regularly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* CORE SERIES PACKAGE */}
            <Card className="relative bg-card border-2 border-accent/50 overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-accent text-accent-foreground font-semibold">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Voice Vault Core Series
                </CardTitle>
                <CardDescription className="text-accent font-medium text-base">
                  Walk in. Record. Walk out.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center py-4 border-y border-border">
                  <div className="text-5xl font-bold text-accent">$100</div>
                  <div className="text-lg text-muted-foreground">/ week</div>
                  <div className="mt-2 text-sm text-foreground">
                    10 episodes • $1,000 total
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">Multi-episode podcast series</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">You record independently</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">Editing handled by Voice Vault</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">Record while you pay</span>
                  </li>
                </ul>

                <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    <span className="font-medium text-foreground">Financing:</span> $100/week for 10 weeks
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Start My Podcast
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Full content ownership released after payment completion
                </p>
              </CardContent>
            </Card>

            {/* WHITE GLOVE PACKAGE */}
            <Card className="relative bg-card border-2 border-border overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="font-semibold">
                  <Zap className="w-3 h-3 mr-1" />
                  Best Value
                </Badge>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Voice Vault White Glove
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium text-base">
                  We handle everything.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center py-4 border-y border-border">
                  <div className="text-lg text-muted-foreground mb-1">From</div>
                  <div className="text-5xl font-bold text-foreground">$100</div>
                  <div className="text-lg text-muted-foreground">/ week</div>
                  <div className="mt-2 text-sm text-foreground">
                    $2,000 total • Faster payoff options available
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">Fully done-for-you podcast experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">Recording + editing + polish</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">Zero editing stress</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground">Early payoff possible</span>
                  </li>
                </ul>

                <div className="bg-secondary/50 rounded-lg p-3 border border-border space-y-1">
                  <p className="text-sm text-muted-foreground text-center">
                    <span className="font-medium text-foreground">Flexible Financing:</span>
                  </p>
                  <p className="text-xs text-center text-muted-foreground">
                    $100/week for 20 weeks <span className="mx-1">or</span> $200/week for 10 weeks
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <span>Saves time</span>
                  <span className="text-accent">•</span>
                  <span>Zero editing</span>
                  <span className="text-accent">•</span>
                  <span>Zero stress</span>
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent/10 font-semibold"
                >
                  White-Glove Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Full content ownership released after payment completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* PRICE DECOY COMPARISON */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-secondary/30 border-border opacity-75">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-muted-foreground">
                    Traditional Podcast Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive" />
                    <span>Equipment: $2,500+</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive" />
                    <span>Editing software: $300/year</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive" />
                    <span>Learning curve: months</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive" />
                    <span>Consistency: unreliable</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-accent/5 border-accent/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-accent">
                    Voice Vault
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>One space</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>One workflow</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>One weekly commitment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>Results guaranteed</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FINANCING EXPLAINER */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Simple, Transparent Financing
            </h2>
            <p className="text-muted-foreground mb-8">
              We've designed our payment structure to make professional podcast production accessible — without complicated contracts or hidden fees.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-lg p-4 border border-border">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Weekly payments</p>
                <p className="text-xs text-muted-foreground">Predictable & manageable</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Record while paying</p>
                <p className="text-xs text-muted-foreground">Start creating immediately</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Early payoff option</p>
                <p className="text-xs text-muted-foreground">Finish faster if you want</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Rights on completion</p>
                <p className="text-xs text-muted-foreground">Full ownership once paid</p>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-accent/30">
              <p className="text-foreground font-medium mb-2">No long-term contracts.</p>
              <p className="text-foreground font-medium mb-2">No upfront production costs.</p>
              <p className="text-foreground font-medium">You pay weekly while you record.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CROSS-BUSINESS DISCOUNTS */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Member & Partner Benefits
              </h2>
              <p className="text-muted-foreground">
                Part of the A-Z Enterprises ecosystem? You may already have access to exclusive studio benefits.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Hive Office Renters</h3>
                    <p className="text-sm text-muted-foreground">Discounted studio rates for coworking members</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Event Center Clients</h3>
                    <p className="text-sm text-muted-foreground">Promotional studio access for Summit bookings</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Gym & Spa Members</h3>
                    <p className="text-sm text-muted-foreground">Special offers for wellness community</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Youth & Kids Content</h3>
                    <p className="text-sm text-muted-foreground">Discounts for family-friendly productions</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* MEDIA GALLERY */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Inside the Voice Vault
            </h2>
            <p className="text-muted-foreground">
              See the space where your content comes to life.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => {
                  setCurrentImageIndex(index);
                  setGalleryOpen(true);
                }}
                className="aspect-video relative rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-accent transition-all group"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-primary-foreground font-medium text-sm">View</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl bg-primary border-primary-foreground/20">
          <div className="relative">
            <img
              src={galleryImages[currentImageIndex].src}
              alt={galleryImages[currentImageIndex].alt}
              className="w-full h-auto rounded-lg"
            />
            <p className="text-center text-primary-foreground/80 mt-4 text-sm">
              {galleryImages[currentImageIndex].alt}
            </p>
            
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-primary-foreground" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-primary-foreground" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentImageIndex ? "bg-accent" : "bg-primary-foreground/30"
                )}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* FINAL CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Podcast Without the Hassle
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Book studio time or choose a package — either way, you'll be creating in no time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6"
                onClick={scrollToBooking}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book the Voice Vault
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-lg px-8 py-6"
                onClick={() => setTermsOpen(true)}
              >
                View Studio Terms
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE TERMS MODAL */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Voice Vault Service Terms</DialogTitle>
            <DialogDescription>
              Please review these terms before booking studio time or purchasing a package.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4 text-sm">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Studio Use</h3>
              <p className="text-muted-foreground">
                The Voice Vault is a professionally equipped recording studio. Clients agree to use all equipment responsibly and follow posted studio guidelines.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong className="text-foreground">Damage caused by misuse or negligence may result in repair or replacement charges.</strong>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Recording & Editing Services</h3>
              <p className="text-muted-foreground">
                Clients may record content independently or as part of a packaged service. Editing services, when included, are performed by Voice Vault staff or approved contractors. Turnaround times may vary based on volume and package type.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Payments & Financing</h3>
              <p className="text-muted-foreground">
                Some services are offered with weekly payment options for convenience. Clients may record sessions while payments are active. All payments must be completed in full before final content ownership is released. Early payoff options may be available.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Content Ownership & Rights</h3>
              <p className="text-muted-foreground mb-2">
                <strong className="text-foreground">Until all payments are completed in full:</strong>
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Recorded content remains the property of Voice Vault by The Hive</li>
                <li>Content may not be redistributed, monetized, or published without permission</li>
              </ul>
              <p className="text-muted-foreground mt-3 mb-2">
                <strong className="text-foreground">Once payment is completed:</strong>
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Full ownership and usage rights transfer to the client</li>
                <li>No ongoing royalties or restrictions apply</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">5. Missed Payments</h3>
              <p className="text-muted-foreground">If payments stop:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mt-1">
                <li>Editing services may pause</li>
                <li>Content delivery may pause</li>
                <li>Ownership rights remain with Voice Vault until resolved</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">6. Liability</h3>
              <p className="text-muted-foreground">Voice Vault is not responsible for:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mt-1">
                <li>Lost data due to client error</li>
                <li>Content quality impacted by client performance</li>
                <li>Third-party platform issues (YouTube, Spotify, etc.)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">7. Agreement Acceptance</h3>
              <p className="text-muted-foreground">
                Booking studio time or purchasing a package constitutes agreement to these terms.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Button onClick={() => setTermsOpen(false)} className="w-full">
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
