import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Building2,
  Dumbbell,
  Gift,
  Phone,
  Mail,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import voiceVaultLogo from "@/assets/voice-vault-logo.png";

// Gallery is currently in "Coming Soon" state - real images to be added
const galleryComingSoon = true;

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

const faqItems = [
  {
    question: "Do I need any experience to use the Voice Vault?",
    answer: "Not at all! Our studio is designed for all skill levels. We provide a quick orientation before your first session, and our staff is available to help you get set up. The equipment is professional but user-friendly."
  },
  {
    question: "Can I bring guests for my podcast?",
    answer: "Yes! The Voice Vault comfortably seats up to 4 people, making it perfect for interviews, co-hosted shows, or panel discussions. All guests have access to professional microphones."
  },
  {
    question: "What happens if I miss a weekly payment?",
    answer: "We understand life happens. If you miss a payment, editing services and content delivery may pause until resolved. Your recordings remain safe, and we'll work with you to get back on track. Full content ownership transfers only after all payments are complete."
  },
  {
    question: "Can I use my own equipment?",
    answer: "You're welcome to bring your own equipment if you prefer, but our professional-grade gear is included in your booking. Most clients find our setup exceeds their needs."
  },
  {
    question: "How quickly can I get started?",
    answer: "Hourly bookings can often be scheduled within a few days, depending on availability. For podcast packages, we'll set up a brief consultation to align on your goals, then get you recording within a week."
  },
];

export default function VoiceVault() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const scrollToPackages = () => {
    document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    setBookingModalOpen(false);
    setTimeout(() => {
      document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleBookingClick = () => {
    setBookingModalOpen(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      toast.success("Request submitted! We'll contact you within 24 hours.");
      setContactForm({ name: "", email: "", phone: "", message: "" });
      setSubmitting(false);
    }, 1000);
  };

  // Set document title for SEO
  useEffect(() => {
    document.title = "Voice Vault by The Hive | Professional Podcast & Recording Studio";
  }, []);

  // Handle hash scroll on mount
  useEffect(() => {
    const hash = window.location.hash.replace("#/voice-vault", "");
    if (hash === "#packages") {
      setTimeout(() => {
        document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
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
            {/* Logo */}
            <div className="mb-6">
              <img 
                src={voiceVaultLogo} 
                alt="The Voice Vault by A-Z" 
                className="h-32 md:h-40 mx-auto object-contain"
              />
            </div>
            
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
                onClick={handleBookingClick}
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

            {/* Terms agreement line */}
            <p className="mt-6 text-sm text-primary-foreground/60">
              By booking, you agree to the{" "}
              <button
                onClick={() => setTermsOpen(true)}
                className="underline hover:text-accent transition-colors"
              >
                Studio & Content Terms
              </button>
              .
            </p>
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
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                      onClick={handleBookingClick}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Studio Time
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      By booking, you agree to the{" "}
                      <button
                        onClick={() => setTermsOpen(true)}
                        className="underline hover:text-accent transition-colors"
                      >
                        Studio & Content Terms
                      </button>
                    </p>
                  </div>
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
                  onClick={handleBookingClick}
                >
                  Start My Podcast
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Full content ownership released after payment completion.{" "}
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="underline hover:text-accent transition-colors"
                  >
                    View Terms
                  </button>
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
                  onClick={handleBookingClick}
                >
                  White-Glove Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Full content ownership released after payment completion.{" "}
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="underline hover:text-accent transition-colors"
                  >
                    View Terms
                  </button>
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

      {/* CONTACT / REQUEST CALL SECTION */}
      <section id="contact-form" className="py-16 bg-secondary/30 scroll-mt-20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Not Ready to Book? Let's Talk
              </h2>
              <p className="text-muted-foreground">
                Have questions about our packages or studio? Request a call and we'll walk you through everything.
              </p>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">What are you interested in?</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your podcast idea or recording needs..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Phone className="w-5 h-5 mr-2" />
                        Request a Call
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We'll respond within 24 hours.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FINANCING EXPLAINER */}
      <section className="py-16 bg-background">
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
      <section className="py-16 bg-secondary/30">
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

      {/* MEDIA GALLERY - COMING SOON */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Inside the Voice Vault
            </h2>
            <p className="text-muted-foreground">
              See the space where your content comes to life.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-card border-2 border-accent/30">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <Video className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Gallery Coming Soon
                </h3>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  We're putting the finishing touches on our studio photos and videos. Want to see the space in person?
                </p>
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  onClick={handleBookingClick}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Request a Tour
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <HelpCircle className="w-6 h-6 text-accent" />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Frequently Asked Questions
                </h2>
              </div>
              <p className="text-muted-foreground">
                Have questions? We've got answers.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-card border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-accent">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

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
                onClick={handleBookingClick}
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

            <p className="mt-6 text-sm text-primary-foreground/60">
              By booking, you agree to the{" "}
              <button
                onClick={() => setTermsOpen(true)}
                className="underline hover:text-accent transition-colors"
              >
                Studio & Content Terms
              </button>
              .
            </p>
          </div>
        </div>
      </section>

      {/* BOOKING COMING SOON MODAL */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-accent" />
              Booking Coming Soon
            </DialogTitle>
            <DialogDescription>
              Our online booking system is being finalized. In the meantime, let us help you get started!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              To book studio time or discuss podcast packages:
            </p>
            
            <div className="space-y-3">
              <a
                href="tel:+15673796340"
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <Phone className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">Call Us</p>
                  <p className="text-sm text-muted-foreground">567-379-6340</p>
                </div>
              </a>
              
              <a
                href="mailto:info@az-enterprises.com?subject=Voice Vault Booking Inquiry"
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <Mail className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">Email Us</p>
                  <p className="text-sm text-muted-foreground">info@az-enterprises.com</p>
                </div>
              </a>
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                onClick={scrollToContact}
              >
                Request a Booking
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Fill out our quick form and we'll get back to you within 24 hours.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              <p className="text-muted-foreground">
                If payments stop: editing services may pause, content delivery may pause, and ownership rights remain with Voice Vault until resolved.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">6. Liability</h3>
              <p className="text-muted-foreground">
                Voice Vault is not responsible for: lost data due to client error, content quality impacted by client performance, or third-party platform issues (YouTube, Spotify, etc.).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">7. Agreement Acceptance</h3>
              <p className="text-muted-foreground">
                Booking studio time or purchasing a package constitutes agreement to these terms.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              onClick={() => setTermsOpen(false)}
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
