import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  Users, 
  Share2, 
  Sparkles, 
  Clock, 
  MapPin,
  Heart,
  PartyPopper,
  Building2,
  GraduationCap,
  School,
  Gift,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Phone
} from "lucide-react";
import { SEOHead } from "@/components/seo";
import { PhotoBoothInquiryModal } from "@/components/booking/PhotoBoothInquiryModal";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/config/siteConfig";
import photoBoothLogo from "@/assets/360-photo-booth-logo.png";

const FEATURES = [
  { icon: Camera, text: "360 platform + pro lighting setup" },
  { icon: Users, text: "On-site attendant included" },
  { icon: Sparkles, text: "Slow-motion + boomerang-style clips" },
  { icon: Share2, text: "Instant sharing via QR / text / email" },
  { icon: Sparkles, text: "Custom overlay options (event name/date/logo)" },
  { icon: Clock, text: "Setup + teardown included" },
  { icon: MapPin, text: "Indoor/outdoor (space + weather permitting)" },
];

const PERFECT_FOR = [
  { icon: Heart, label: "Weddings & Receptions" },
  { icon: PartyPopper, label: "Birthdays & Graduation Parties" },
  { icon: Building2, label: "Corporate Events & Grand Openings" },
  { icon: School, label: "School Events & Dances" },
  { icon: Gift, label: "Fundraisers & Community Nights" },
];

const STEPS = [
  { step: 1, title: "Send Your Details", description: "Share your date, event type, and location" },
  { step: 2, title: "We Confirm", description: "We'll confirm availability and lock it in" },
  { step: 3, title: "Guests Step On", description: "Record, share, and enjoy instantly" },
];

const ADDONS = [
  "Custom branded overlay",
  "Red carpet + stanchions",
  "Prop table",
  "Extra hours",
];

const FAQS = [
  { q: "How much space is needed?", a: "We'll confirm the best layout based on your venue. Typically 10x10 feet works well." },
  { q: "Is an attendant included?", a: "Yes! A trained attendant is always on-site to run the booth and assist guests." },
  { q: "How do guests get their videos?", a: "Instantly via QR code, text message, or email, right from the booth." },
  { q: "Can it be set up outdoors?", a: "Yes, weather permitting. We'll discuss the best options for your venue." },
  { q: "How far in advance should I book?", a: "Weekends book fast! We recommend reserving at least 2 to 4 weeks ahead." },
];

export default function PhotoBooth() {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <>
      <SEOHead
        title="360 Photo Booth Rentals | A-Z Enterprises"
        description="Turn your event into a VIP experience with slow-motion, share-ready 360 videos. Attendant included, instant sharing, perfect for weddings, parties, and corporate events."
      />

      {/* Hero Section - 2-column layout matching Spa/Coworking/Fitness */}
      <section className="relative min-h-[70vh] flex items-center bg-gradient-to-b from-primary via-primary to-primary/95 text-primary-foreground overflow-hidden">
        {/* Base radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        
        {/* 360 Orbit Rings Watermark */}
        <div 
          className="absolute inset-0 pointer-events-none z-[1]" 
          aria-hidden="true"
          style={{
            background: `
              radial-gradient(circle at 70% 45%, transparent 0px, transparent 120px, rgba(212,175,55,0.08) 121px, rgba(212,175,55,0.08) 122px, transparent 123px, transparent 100%),
              radial-gradient(circle at 70% 45%, transparent 0px, transparent 220px, rgba(212,175,55,0.06) 221px, rgba(212,175,55,0.06) 222px, transparent 223px, transparent 100%),
              radial-gradient(circle at 70% 45%, transparent 0px, transparent 320px, rgba(212,175,55,0.05) 321px, rgba(212,175,55,0.05) 322px, transparent 323px, transparent 100%),
              radial-gradient(circle at 30% 55%, transparent 0px, transparent 160px, rgba(212,175,55,0.05) 161px, rgba(212,175,55,0.05) 162px, transparent 163px, transparent 100%),
              radial-gradient(circle at 30% 55%, transparent 0px, transparent 280px, rgba(212,175,55,0.04) 281px, rgba(212,175,55,0.04) 282px, transparent 283px, transparent 100%),
              radial-gradient(circle at 50% 100%, transparent 0px, transparent 200px, rgba(212,175,55,0.04) 201px, rgba(212,175,55,0.04) 202px, transparent 203px, transparent 100%)
            `
          }}
        />
        
        {/* Subtle animated glow pulse on center ring */}
        <div 
          className="absolute inset-0 pointer-events-none z-[1] animate-pulse" 
          aria-hidden="true"
          style={{
            animationDuration: '4s',
            background: `
              radial-gradient(circle at 70% 45%, transparent 0px, transparent 218px, rgba(212,175,55,0.03) 220px, rgba(212,175,55,0.03) 224px, transparent 226px, transparent 100%)
            `
          }}
        />
        
        <div className="container relative z-[2] py-16 lg:py-24">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-[clamp(24px,4vw,64px)]">
            {/* Left Column - Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent font-medium text-sm mb-6">
                <Camera className="h-4 w-4" />
                Event Entertainment
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gold-gradient">
                360 Photo Booth Rentals
              </h1>

              <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-2xl lg:max-w-xl">
                Turn your event into a VIP experience with slow-motion, share-ready 360 videos your guests will love.
              </p>

              {/* Quick bullets */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10">
                {["Attendant included", "Instant sharing (QR/text/email)", "Perfect for weddings, parties, corporate events"].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  className="bg-accent text-primary hover:bg-accent/90 font-semibold px-8 py-6 text-lg shadow-lg shadow-accent/30"
                  onClick={() => setInquiryOpen(true)}
                >
                  Inquire Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent/30 text-accent hover:bg-accent/10 font-semibold px-8 py-6 text-lg"
                  onClick={() => setInquiryOpen(true)}
                >
                  Check Availability
                </Button>
              </div>
            </div>

            {/* Right Column - Logo */}
            <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
              <img 
                src={photoBoothLogo} 
                alt="360 Photo Booth Logo" 
                className="w-full object-contain drop-shadow-2xl"
                style={{
                  maxWidth: "520px",
                  width: "min(520px, 42vw)",
                  height: "auto"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">What You Get</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="border-border/50 bg-card hover:border-accent/30 transition-colors">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{feature.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Perfect For</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {PERFECT_FOR.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 rounded-full bg-accent/10 border border-accent/20"
                >
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-16 w-16 rounded-full bg-accent text-primary font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">Optional Add-Ons</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {ADDONS.map((addon, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium"
              >
                {addon}
              </span>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-6 text-sm">
            Ask about add-ons when you inquire
          </p>
        </div>
      </section>

      {/* Gallery Placeholder */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Gallery</h2>
          <p className="text-muted-foreground mb-6">
            Gallery coming soon. Request a demo clip when you inquire.
          </p>
          <Button
            variant="outline"
            className="border-accent/30 text-accent hover:bg-accent/10"
            onClick={() => setInquiryOpen(true)}
          >
            Request Demo Clip
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
                >
                  {faq.q}
                  {expandedFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gold-gradient">
            Ready to Book the 360 Photo Booth?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Weekends fill up fast. Send us your date and we'll confirm availability within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-accent text-primary hover:bg-accent/90 font-semibold px-10 py-6 text-lg shadow-lg shadow-accent/30"
              onClick={() => setInquiryOpen(true)}
            >
              Inquire Now
            </Button>
            <a
              href={SITE_CONFIG.contact.phoneLink}
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium"
            >
              <Phone className="h-5 w-5" />
              {SITE_CONFIG.contact.phoneFormatted}
            </a>
          </div>
        </div>
      </section>

      {/* Inquiry Modal */}
      <PhotoBoothInquiryModal
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        source="website"
      />
    </>
  );
}
