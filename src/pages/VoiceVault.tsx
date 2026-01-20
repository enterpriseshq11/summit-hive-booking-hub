import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mic, Video, Wifi, Lightbulb, Shield, Users, Clock, Star, CheckCircle2, ArrowRight, Calendar, Headphones, Sliders, X, Sparkles, Zap, TrendingUp, Building2, Dumbbell, Gift, Phone, Mail, HelpCircle, Play, Podcast, MessageSquare, Volume2, Award, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import voiceVaultLogo from "@/assets/voice-vault-logo.png";
import { VoiceVaultBookingModal } from "@/components/booking/VoiceVaultBookingModal";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";
import { UnderHeroBookingCard } from "@/components/booking/UnderHeroBookingCard";

// Gallery is currently in "Coming Soon" state - real images to be added
const galleryComingSoon = true;
const studioFeatures = [{
  icon: Shield,
  title: "Fully Soundproof",
  description: "Professional acoustic isolation"
}, {
  icon: Mic,
  title: "Pro Microphones",
  description: "Studio-grade audio capture"
}, {
  icon: Sliders,
  title: "Professional Mixers",
  description: "Industry-standard equipment"
}, {
  icon: Video,
  title: "Video Recording",
  description: "Multi-camera capability"
}, {
  icon: Lightbulb,
  title: "Studio Lighting",
  description: "Adjustable photo & video lights"
}, {
  icon: Users,
  title: "Seats Up to 4",
  description: "Comfortable guest seating"
}, {
  icon: Wifi,
  title: "Fast Wi-Fi",
  description: "Reliable high-speed internet"
}, {
  icon: Headphones,
  title: "On-Staff Editor",
  description: "Professional editing available"
}];

// C2: Use cases for the studio
const useCases = [{
  icon: Podcast,
  title: "Podcasts",
  description: "Launch or grow your podcast with pro-quality audio that stands out."
}, {
  icon: MessageSquare,
  title: "Interviews",
  description: "Record professional interviews with multiple guests in comfort."
}, {
  icon: Play,
  title: "Content Creation",
  description: "YouTube intros, course content, video essays, and more."
}, {
  icon: Volume2,
  title: "Voiceovers",
  description: "Audio ads, narration, audiobooks, and voice acting projects."
}];

// C3: Benefits
const studioBenefits = [{
  icon: Award,
  title: "Professional Audio Quality",
  description: "Broadcast-ready sound that rivals top studios"
}, {
  icon: Zap,
  title: "Easy Setup",
  description: "Walk in and start recording—we handle the tech"
}, {
  icon: Users,
  title: "Comfortable Studio",
  description: "Private, distraction-free environment for focus"
}, {
  icon: Clock,
  title: "Fast Booking & Support",
  description: "Quick scheduling and responsive local team"
}];

// D3: Testimonials
const testimonials = [{
  name: "Marcus T.",
  role: "Podcast Host",
  quote: "I went from recording in my closet to sounding like a pro. The Voice Vault team made it so easy.",
  verified: true
}, {
  name: "Sarah K.",
  role: "Business Coach",
  quote: "Finally, a studio that understands creators. Book, record, leave. They handle the rest.",
  verified: true
}, {
  name: "DJ Mike",
  role: "Content Creator",
  quote: "The equipment is top-tier and the space is clean. Worth every dollar.",
  verified: true
}];
const faqItems = [{
  question: "Do I need any experience to use the Voice Vault?",
  answer: "Not at all! Our studio is designed for all skill levels. We provide a quick orientation before your first session, and our staff is available to help you get set up. The equipment is professional but user-friendly."
}, {
  question: "Can I bring guests for my podcast?",
  answer: "Yes! The Voice Vault comfortably seats up to 4 people, making it perfect for interviews, co-hosted shows, or panel discussions. All guests have access to professional microphones."
}, {
  question: "What happens if I miss a weekly payment?",
  answer: "We understand life happens. If you miss a payment, editing services and content delivery may pause until resolved. Your recordings remain safe, and we'll work with you to get back on track. Full content ownership transfers only after all payments are complete."
}, {
  question: "Can I use my own equipment?",
  answer: "You're welcome to bring your own equipment if you prefer, but our professional-grade gear is included in your booking. Most clients find our setup exceeds their needs."
}, {
  question: "How quickly can I get started?",
  answer: "Hourly bookings can often be scheduled within a few days, depending on availability. For podcast packages, we'll set up a brief consultation to align on your goals, then get you recording within a week."
}];
export default function VoiceVault() {
  const [searchParams] = useSearchParams();
  const [termsOpen, setTermsOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState<"hourly" | "core_series" | "white_glove">("hourly");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Handle success/cancelled URL params from Stripe
  useEffect(() => {
    const booking = searchParams.get("booking");
    const pkg = searchParams.get("package");
    if (booking === "success" || pkg === "success") {
      toast.success("Payment successful! We'll be in touch soon to confirm your booking.");
    } else if (booking === "cancelled" || pkg === "cancelled") {
      toast.info("Payment was cancelled. You can try again anytime.");
    }
  }, [searchParams]);
  const scrollToPackages = () => {
    document.getElementById("packages")?.scrollIntoView({
      behavior: "smooth"
    });
  };
  const scrollToContact = () => {
    setBookingModalOpen(false);
    setTimeout(() => {
      document.getElementById("contact-form")?.scrollIntoView({
        behavior: "smooth"
      });
    }, 100);
  };
  const openBooking = (type: "hourly" | "core_series" | "white_glove" = "hourly") => {
    setBookingType(type);
    setBookingModalOpen(true);
  };
  const handleBookingClick = () => openBooking("hourly");
  const handleCoreSeriesClick = () => openBooking("core_series");
  const handleWhiteGloveClick = () => openBooking("white_glove");
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Request submitted! We'll contact you within 24 hours.");
      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
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
        document.getElementById("packages")?.scrollIntoView({
          behavior: "smooth"
        });
      }, 100);
    }
  }, []);
  return <div className="min-h-screen">
      {/* HERO SECTION - A1/A3: Improved hierarchy and depth */}
      <section className="relative min-h-[75vh] flex items-center bg-primary text-primary-foreground overflow-hidden">
        {/* Gold spotlight effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,hsl(var(--accent)/0.2)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.15)_0%,transparent_50%)]" />
        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:80px_80px]" />
        
        {/* Logo Watermark Pattern Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.25]"
          style={{
            backgroundImage: `url('/lovable-uploads/18ea10b5-e374-479a-964b-a6d42bfac671.png')`,
            backgroundSize: '180px 180px',
            backgroundRepeat: 'repeat',
            filter: 'blur(0.3px)',
          }}
        />
        
        {/* Dark overlay for content readability */}
        <div className="absolute inset-0 bg-primary/40" />

        <div className="container relative z-10 py-12 lg:py-16">
          <div className="max-w-3xl mx-auto text-center relative" style={{ paddingTop: '280px' }}>
            {/* Logo with glow - ABSOLUTE POSITIONED, ENLARGED, HIGHER */}
            <div 
              className="absolute left-1/2 z-20"
              style={{ 
                transform: 'translateX(-50%)',
                top: '-70px',
              }}
            >
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150" />
              <img 
                alt="The Voice Vault by A-Z" 
                className="relative object-contain" 
                src="/lovable-uploads/18ea10b5-e374-479a-964b-a6d42bfac671.png"
                style={{
                  height: '420px',
                  width: '420px',
                }}
              />
            </div>
            
            {/* A3: Clear headline hierarchy - pulled up tight under logo */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight" style={{ marginTop: '-60px' }}>
              <span className="text-gold-gradient">Voice Vault</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl font-medium mt-2 text-primary-foreground/90">
                by The Hive
              </span>
            </h1>
            
            {/* C1: Clear explanation */}
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-3 max-w-2xl mx-auto font-medium">
              A fully soundproof, professional podcast & recording studio
            </p>
            <p className="text-base md:text-lg text-primary-foreground/70 mb-6 max-w-xl mx-auto">
              Designed for creators, professionals, and artists who want broadcast-quality audio without the hassle.
            </p>
            
            <p className="text-xl md:text-2xl font-semibold text-accent mb-10">
              Walk in. Record. Walk out. We handle the rest.
            </p>

            {/* D1: Prominent, consistent CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold text-lg px-10 h-14 shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-shadow" onClick={handleBookingClick}>
                <Calendar className="w-5 h-5 mr-2" />
                Reserve Studio
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent bg-accent/10 hover:bg-accent/20 hover:border-accent font-semibold text-lg px-8 h-14" onClick={scrollToPackages}>
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Packages
              </Button>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {[{
              icon: Shield,
              label: "Soundproof Studio"
            }, {
              icon: Mic,
              label: "Pro Equipment"
            }, {
              icon: Clock,
              label: "Flexible Booking"
            }].map(chip => <div key={chip.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/5 border border-primary-foreground/10 text-sm text-primary-foreground/80">
                  <chip.icon className="h-4 w-4 text-accent" />
                  {chip.label}
                </div>)}
            </div>

            <p className="text-sm text-primary-foreground/60">
              By booking, you agree to the{" "}
              <button onClick={() => setTermsOpen(true)} className="underline text-accent hover:text-accent/80 transition-colors font-medium">
                Studio & Content Terms
              </button>
              .
            </p>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Under-hero booking module (inline entry; full wizard is in the booking UI) */}
      <UnderHeroBookingCard
        title="Reserve Studio Time"
        icon={<Calendar className="h-5 w-5 text-accent" />}
        description="Select a booking type and complete checkout to reserve."
      >
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => openBooking("hourly")}
              className="text-left rounded-lg border border-border hover:border-accent/50 transition-colors p-4"
            >
              <p className="font-semibold text-foreground">Hourly Rental</p>
              <p className="mt-1 text-sm text-muted-foreground">Pick a date/time and reserve.</p>
            </button>
            <button
              type="button"
              onClick={() => openBooking("core_series")}
              className="text-left rounded-lg border border-border hover:border-accent/50 transition-colors p-4"
            >
              <p className="font-semibold text-foreground">Core Series</p>
              <p className="mt-1 text-sm text-muted-foreground">Recurring package option.</p>
            </button>
            <button
              type="button"
              onClick={() => openBooking("white_glove")}
              className="text-left rounded-lg border border-border hover:border-accent/50 transition-colors p-4"
            >
              <p className="font-semibold text-foreground">White Glove</p>
              <p className="mt-1 text-sm text-muted-foreground">Full production support.</p>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => openBooking("hourly")}
              className="bg-accent hover:bg-accent/90 text-primary font-semibold"
            >
              Start Booking
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={scrollToPackages}
              className="border-accent/30 text-accent hover:bg-accent/10"
            >
              See Packages
            </Button>
          </div>
        </div>
      </UnderHeroBookingCard>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* C1/C2: WHAT IS VOICE VAULT + WHO IT'S FOR - A2: Normalized spacing */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 font-medium">
                Professional Recording Studio
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your Professional Recording Space
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Located inside The Hive coworking space, Voice Vault is a purpose-built, fully soundproof recording environment. Whether you're launching a podcast, recording interviews, creating voiceovers, or producing professional content — this is your space.
              </p>
            </div>
            
            {/* C1: Who it's for */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {["Podcasters", "Business Owners", "Creators", "Artists", "Interviewers", "Voice Actors", "Coaches", "Educators"].map(user => <div key={user} className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-accent/5 border border-accent/20 hover:border-accent/40 hover:bg-accent/10 transition-all">
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{user}</span>
                </div>)}
            </div>

            {/* C2: Use Cases */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map(useCase => <Card key={useCase.title} className="bg-card border-border hover:border-accent/40 hover:shadow-gold-lg transition-all group">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mx-auto mb-4 transition-colors">
                      <useCase.icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* C3: BENEFITS - A2: Normalized spacing */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Voice Vault
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to create professional content, without the complexity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {studioBenefits.map(benefit => <Card key={benefit.title} className="bg-card border-border text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* D2: MID-PAGE CONVERSION BLOCK */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/10 border-accent/30 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                      Ready to Start Recording?
                    </h2>
                    <p className="text-primary-foreground/80 mb-6">
                      Book your studio session today. Everything you need is included.
                    </p>
                    <ul className="space-y-3 mb-6">
                      {["Fully soundproof studio", "Professional microphones & mixers", "Video recording capability", "Seats up to 4 guests", "On-staff editing available"].map(item => <li key={item} className="flex items-center gap-3 text-primary-foreground/90">
                          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                          {item}
                        </li>)}
                    </ul>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="inline-block bg-primary/50 rounded-2xl p-6 border border-accent/30">
                      <p className="text-sm text-primary-foreground/70 mb-1">Starting at</p>
                      <p className="text-5xl font-bold text-accent mb-1">$45</p>
                      <p className="text-primary-foreground/70 mb-4">per hour</p>
                      <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold px-8 h-12 w-full shadow-gold-lg" onClick={handleBookingClick}>
                        Reserve Studio
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <p className="text-xs text-primary-foreground/60 mt-3">2-hour minimum</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* STUDIO FEATURES - A2: Normalized spacing */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade equipment and a distraction-free environment — all included.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {studioFeatures.map(feature => <Card key={feature.title} className="bg-card border-border hover:border-accent/40 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* HOURLY STUDIO RENTAL - A2: Normalized spacing */}
      <section id="hourly-rental" className="py-20 bg-muted/30 scroll-mt-20">
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
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold h-12 shadow-gold-lg" onClick={handleBookingClick}>
                      <Calendar className="w-5 h-5 mr-2" />
                      Reserve Studio
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      By booking, you agree to the{" "}
                      <button onClick={() => setTermsOpen(true)} className="underline hover:text-accent transition-colors">
                        Studio & Content Terms
                      </button>
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="bg-muted/50 rounded-lg p-4 border border-border">
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

      {/* WHY MOST PODCASTS FAIL */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why Most Podcasts Fail
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-6">
              Most podcasts fail because people stop showing up. The Voice Vault is built around <span className="text-accent font-semibold">consistency</span>, not just equipment.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent/20 border border-accent/30">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="font-medium text-accent">You don't rent gear. You commit to publishing.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* PODCAST PACKAGES - A2: Normalized spacing */}
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
            <Card className="relative bg-card border-2 border-accent/50 overflow-hidden hover:shadow-gold-lg transition-shadow">
              <div className="absolute top-4 right-4">
                <Badge className="bg-accent text-primary font-semibold">
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
                  <div className="text-4xl font-bold text-accent mb-1">$1,000</div>
                  <p className="text-sm text-muted-foreground">Or $100/week for 10 weeks</p>
                </div>

                <ul className="space-y-3">
                  {["10 professionally recorded episodes", "Full studio access & equipment", "Basic editing & audio cleanup", "Episode exports ready to publish", "Weekly recording schedule"].map(feature => <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>)}
                </ul>

                <Button className="w-full bg-accent hover:bg-accent/90 text-primary font-bold h-12" onClick={handleCoreSeriesClick}>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* WHITE GLOVE PACKAGE */}
            <Card className="relative bg-card border-2 border-border overflow-hidden hover:border-accent/40 hover:shadow-gold-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Voice Vault White Glove
                </CardTitle>
                <CardDescription className="text-accent font-medium text-base">
                  Full production support — we do it all.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center py-4 border-y border-border">
                  <div className="text-4xl font-bold text-accent mb-1">$2,000</div>
                  <p className="text-sm text-muted-foreground">Or flexible weekly plans</p>
                </div>

                <ul className="space-y-3">
                  {["Everything in Core Series", "Advanced editing & sound design", "Custom intro/outro creation", "Show notes & descriptions", "Platform upload assistance", "Marketing asset creation"].map(feature => <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>)}
                </ul>

                <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-primary font-bold h-12" onClick={handleWhiteGloveClick}>
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* D3: TESTIMONIALS */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Creators Are Saying
            </h2>
            <p className="text-muted-foreground">
              Real feedback from real Voice Vault users.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => <Card key={index} className="bg-card border-border hover:border-accent/40 transition-colors">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-accent/30 mb-4" />
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                    {testimonial.verified && <Badge variant="outline" className="border-accent/30 text-accent text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>}
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* WEEKLY PAYMENT EXPLAINED */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Weekly Payments Work
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              We believe in making quality accessible. That's why we offer structured, transparent payment plans.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-lg p-5 border border-border">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="font-medium text-foreground">Weekly payments</p>
                <p className="text-xs text-muted-foreground">Predictable & manageable</p>
              </div>
              <div className="bg-card rounded-lg p-5 border border-border">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="font-medium text-foreground">Record while paying</p>
                <p className="text-xs text-muted-foreground">Start creating immediately</p>
              </div>
              <div className="bg-card rounded-lg p-5 border border-border">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="font-medium text-foreground">Early payoff option</p>
                <p className="text-xs text-muted-foreground">Finish faster if you want</p>
              </div>
              <div className="bg-card rounded-lg p-5 border border-border">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="font-medium text-foreground">Rights on completion</p>
                <p className="text-xs text-muted-foreground">Full ownership once paid</p>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-accent/30 max-w-lg mx-auto">
              <p className="text-foreground font-medium mb-2">No long-term contracts.</p>
              <p className="text-foreground font-medium mb-2">No upfront production costs.</p>
              <p className="text-foreground font-medium">You pay weekly while you record.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* CROSS-BUSINESS DISCOUNTS */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Member & Partner Benefits
              </h2>
              <p className="text-muted-foreground">
                Part of the A-Z Enterprises ecosystem? You may already have access to exclusive studio benefits.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-card border-border hover:border-accent/40 transition-colors">
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

              <Card className="bg-card border-border hover:border-accent/40 transition-colors">
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

              <Card className="bg-card border-border hover:border-accent/40 transition-colors">
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

              <Card className="bg-card border-border hover:border-accent/40 transition-colors">
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

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* MEDIA GALLERY - COMING SOON */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
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
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold" onClick={handleBookingClick}>
                  <Calendar className="w-5 h-5 mr-2" />
                  Request a Tour
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* FAQ SECTION */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
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

            <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-4">
              {faqItems.map((item, index) => <AccordionItem key={index} value={`faq-${index}`} className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-accent py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* FINAL CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Podcast Without the Hassle
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Book studio time or choose a package — either way, you'll be creating in no time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold text-lg px-10 h-14 shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-shadow" onClick={handleBookingClick}>
                <Calendar className="w-5 h-5 mr-2" />
                Reserve Studio
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent bg-accent/10 hover:bg-accent/20 font-semibold text-lg px-8 h-14" onClick={scrollToPackages}>
                See Availability
              </Button>
            </div>

            <p className="text-sm text-primary-foreground/60">
              By booking, you agree to the{" "}
              <button onClick={() => setTermsOpen(true)} className="underline hover:text-accent transition-colors">
                Studio & Content Terms
              </button>
              .
            </p>
          </div>
        </div>
      </section>

      {/* BOOKING MODAL */}
      <VoiceVaultBookingModal open={bookingModalOpen} onOpenChange={setBookingModalOpen} initialType={bookingType} />

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
            <Button className="w-full bg-accent hover:bg-accent/90 text-primary font-bold" onClick={() => setTermsOpen(false)}>
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>;
}