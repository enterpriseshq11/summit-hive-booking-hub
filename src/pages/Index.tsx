import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, Sparkles, Dumbbell, Phone, Clock, Check, Camera, Mic, Moon, Rocket, Users } from "lucide-react";
import { SocialProofSection, FAQSection, FloatingHelpCTA, GiftCardStrip, WhatsIncludedStrip, PreFooterCTA } from "@/components/home";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";

const businesses = [{
  name: "The Summit",
  tagline: "Premium Event Venue",
  description: "Premier event venue for weddings, corporate events, and celebrations that leave lasting impressions.",
  bestFor: "Weddings • Galas • Corporate",
  bullets: ["Up to 300 guests", "Full catering options", "AV & lighting included"],
  fastFacts: ["Holds up to 300 guests", "Average booking: 2-3 weeks ahead", "Top feature: Full-service coordination"],
  icon: Building2,
  href: "/summit",
  colorClass: "summit"
}, {
  name: "The Hive Coworking",
  tagline: "Private Offices + Coworking",
  description: "Modern workspaces and private offices with 24/7 access. Your productivity headquarters.",
  bestFor: "Remote Work • Startups • Meetings",
  bullets: ["24/7 access", "High-speed WiFi", "Meeting rooms available"],
  fastFacts: ["24/7 keycard access", "Day passes available", "Top feature: Private offices"],
  icon: Building2,
  href: "/coworking",
  colorClass: "coworking"
}, {
  name: "Restoration Lounge",
  tagline: "Recovery + Spa Treatments",
  description: "Luxury spa treatments and massage therapy. Escape the everyday and rediscover balance.",
  bestFor: "Massage • Facials • Recovery",
  bullets: ["Licensed therapists", "Premium products", "Private suites"],
  fastFacts: ["Licensed therapists", "Usually book 1-2 days ahead", "Top feature: Private suites"],
  icon: Sparkles,
  href: "/spa",
  colorClass: "spa"
}, {
  name: "Total Fitness",
  tagline: "24/7 Gym + Coaching",
  description: "24/7 gym access with group classes and personal training. Transform your potential.",
  bestFor: "Strength • Cardio • Classes",
  bullets: ["Modern equipment", "Group classes", "Personal training"],
  fastFacts: ["Open 24/7", "Flexible memberships", "Top feature: Personal training"],
  icon: Dumbbell,
  href: "/fitness",
  colorClass: "fitness"
}, {
  name: "Voice Vault Studio",
  tagline: "Recording + Podcasting",
  description: "Professional recording studio for music, podcasts, and voiceovers. Studio-quality sound, easy booking.",
  bestFor: "Music • Podcasts • Voiceovers",
  bullets: ["Soundproofed rooms", "Pro-grade equipment", "Hourly booking"],
  fastFacts: ["Hourly sessions available", "Book same-day or ahead", "Top feature: Pro-grade acoustics"],
  icon: Mic,
  href: "/voice-vault",
  colorClass: "studio"
}, {
  name: "360 Photo Booth",
  tagline: "Immersive Event Add-On",
  description: "Capture unforgettable moments with our 360 photo booth. Perfect for events, parties, and brand activations.",
  bestFor: "Parties • Events • Brand Activations",
  bullets: ["Instant video sharing", "Custom overlays", "On-site setup"],
  fastFacts: ["Add-on for any event", "Instant digital delivery", "Top feature: Custom branded overlays"],
  icon: Camera,
  href: "/photo-booth",
  colorClass: "photobooth"
}];
export default function Index() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <div className="min-h-screen overflow-hidden">
      {/* ========== LANDING ZONE HERO ========== */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />

        {/* Twinkling stars */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[
            { top: "12%", left: "8%", size: 2.1, delay: "0s" },
            { top: "20%", left: "22%", size: 1.05, delay: "0.6s" },
            { top: "8%", left: "38%", size: 1.575, delay: "1.2s" },
            { top: "28%", left: "55%", size: 1.05, delay: "0.3s" },
            { top: "15%", left: "72%", size: 2.1, delay: "1.8s" },
            { top: "35%", left: "88%", size: 1.575, delay: "0.9s" },
            { top: "55%", left: "6%", size: 1.05, delay: "1.5s" },
            { top: "70%", left: "18%", size: 2.1, delay: "0.4s" },
            { top: "82%", left: "32%", size: 1.05, delay: "2.1s" },
            { top: "65%", left: "48%", size: 1.575, delay: "1.1s" },
            { top: "78%", left: "62%", size: 1.05, delay: "0.7s" },
            { top: "60%", left: "78%", size: 2.1, delay: "1.6s" },
            { top: "88%", left: "92%", size: 1.575, delay: "0.2s" },
            { top: "45%", left: "12%", size: 1.05, delay: "2.4s" },
            { top: "50%", left: "92%", size: 1.575, delay: "1.9s" },
            { top: "5%", left: "60%", size: 1.05, delay: "2.7s" },
            { top: "92%", left: "50%", size: 2.1, delay: "0.5s" },
            { top: "40%", left: "40%", size: 1.05, delay: "1.3s" },
          ].map((s, i) => (
            <span
              key={i}
              className="star-twinkle absolute rounded-full bg-accent"
              style={{
                top: s.top,
                left: s.left,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: s.delay,
                boxShadow: `0 0 ${s.size * 4}px hsl(var(--accent))`,
              }}
            />
          ))}
        </div>

        <div className="container relative z-10 text-center">
          {/* Big Moon Icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
            <Moon className="h-10 w-10 text-accent" strokeWidth={1.5} />
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            We Found the Moon.
            <br />
            <span className="text-accent">Now Giving Families a Place to Land.</span>
          </h1>

          {/* Subhead */}
          <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            The newest addition to A-Z Enterprises. <span className="font-bold text-slate-50">OPENING SOON</span> in downtown Wapakoneta.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href="https://go.thelandingzoneohio.com/the-family-hub-landing-zone---reserve-your-membership-page?utm_source=azenterprises&utm_medium=website&utm_campaign=landing_zone_waitlist&utm_content=homepage_hero"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-lg bg-accent text-primary hover:bg-accent/90 transition-colors"
            >
              Join the Waitlist
              <ArrowRight className="h-5 w-5" />
            </a>

            <button
              onClick={() => scrollToSection('experiences')}
              className="text-sm text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
            >
              Discover all A-Z businesses ↓
            </button>
          </div>
        </div>
      </section>

      {/* Hero Section - Premium Black & Gold */}
      <section className="relative pt-4 pb-20 md:pt-6 md:pb-28 lg:pt-8 lg:pb-36 overflow-hidden bg-primary">
        {/* Solid dark background with radial spotlight behind H1 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,hsl(var(--accent)/0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.08)_0%,transparent_60%)]" />
        
        {/* Reduced intensity grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Honeycomb Watermark Pattern - Left */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -left-20 top-1/4 w-[500px] h-[500px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-home-left" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-home-left)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Right */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" aria-hidden="true">
          <svg className="absolute -right-20 top-1/3 w-[600px] h-[600px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-home-right" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" />
              <polygon points="10,17.32 20,22.32 20,32.32 10,37.32 0,32.32 0,22.32" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-home-right)" />
          </svg>
        </div>
        
        {/* Honeycomb Watermark Pattern - Center Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.10]" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-home-center" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-home-center)" />
          </svg>
        </div>
        
        {/* Faint grain texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
      }} />
        
        {/* One-time gold shimmer sweep - cinematic on load */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent -translate-x-full animate-[shimmer-sweep_2s_ease-out_0.5s_forwards]" />
        </div>
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-4">
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl font-bold tracking-tight text-white opacity-0 animate-fade-in-up leading-[1.1]" style={{
                animationDelay: "0.2s"
              }}>
                  <span className="block">One destination.</span>
                  <span className="block mt-1">Every experience.</span>
                  <span className="block mt-1 text-accent">
                    All in Wapakoneta.
                  </span>
                </h1>
                
                {/* Gold accent divider */}
                <div className="hidden lg:block w-24 h-1 bg-gradient-to-r from-accent to-accent/50 opacity-0 animate-fade-in" style={{
                animationDelay: "0.4s"
              }} />
              </div>

              {/* ========== Pill Buttons (single row) ========== */}
              <div className="flex flex-nowrap justify-center lg:justify-start gap-3 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
                <button onClick={() => scrollToSection('availability')} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white/90 transition-colors whitespace-nowrap">
                  Check Availability
                </button>
                <button onClick={() => scrollToSection('experiences')} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white/90 transition-colors whitespace-nowrap">
                  View Experiences
                </button>
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  Open 7 Days
                </span>
                <button onClick={() => scrollToSection('faq')} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white/90 transition-colors whitespace-nowrap">
                  FAQ
                </button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 opacity-0 animate-fade-in" style={{
              animationDelay: "0.7s"
            }}>
                <a href={SITE_CONFIG.contact.phoneLink} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>{SITE_CONFIG.contact.phone}</span>
                </a>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Clock className="h-4 w-4" />
                  <span>{SITE_CONFIG.hours.shortDays}</span>
                </div>
              </div>

              {/* Google Map */}
              <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-2xl opacity-0 animate-fade-in" style={{ animationDelay: "0.85s" }}>
                <iframe
                  title="A-Z Enterprises Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3047.5!2d-84.2005!3d40.5686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883f5e1a1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2s10%20W%20Auglaize%20St%2C%20Wapakoneta%2C%20OH%2045895!5e0!3m2!1sen!1sus!4v1700000000000"
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
              <p className="text-center lg:text-left text-xs text-white/40 mt-1">10 W Auglaize St, Wapakoneta, Ohio 45895</p>
            </div>

            {/* Right Column - Promotions & Quick Access */}
            <div className="hidden lg:flex flex-col gap-3 opacity-0 animate-fade-in-left" style={{
            animationDelay: "0.5s"
          }}>
              {/* Featured Deal Card. Family Hub Landing Zone */}
              <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/[0.08] to-white/[0.02] backdrop-blur-sm p-5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                  <Moon className="h-3.5 w-3.5" /> Now Building
                </span>
                <h3 className="text-base font-bold text-white mb-1.5">The Family Hub Landing Zone</h3>
                <p className="text-sm text-white/60 mb-3">Opening soon in downtown Wapakoneta. Founding families get first access. join the waitlist.</p>
                <a
                  href="https://go.thelandingzoneohio.com/the-family-hub-landing-zone---reserve-your-membership-page?utm_source=azenterprises&utm_medium=website&utm_campaign=landing_zone_waitlist&utm_content=featured_card"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                >
                  Join the Waitlist <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Quick Access Links */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-3">Quick Access</h3>
                <div className="space-y-2.5">
                  <Link to="/summit" className="flex items-center justify-between text-sm text-white/70 hover:text-accent transition-colors group">
                    <span>Book an Event</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link to="/fitness" className="flex items-center justify-between text-sm text-white/70 hover:text-accent transition-colors group">
                    <span>Explore Memberships</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link to="/voice-vault" className="flex items-center justify-between text-sm text-white/70 hover:text-accent transition-colors group">
                    <span>Reserve Studio Time</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link to="/spa" className="flex items-center justify-between text-sm text-white/70 hover:text-accent transition-colors group">
                    <span>Book a Spa Service</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </section>



      {/* ========== LANDING ZONE STORY MINI-SECTION ========== */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-28">
        {/* Star field background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lz-stars" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="14" r="1" fill="hsl(var(--accent))" opacity="0.6" />
                <circle cx="48" cy="36" r="0.8" fill="hsl(var(--accent))" opacity="0.4" />
                <circle cx="68" cy="10" r="1.2" fill="hsl(var(--accent))" opacity="0.5" />
                <circle cx="22" cy="60" r="0.7" fill="white" opacity="0.3" />
                <circle cx="58" cy="68" r="0.9" fill="hsl(var(--accent))" opacity="0.35" />
                <circle cx="36" cy="6" r="0.6" fill="white" opacity="0.25" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lz-stars)" />
          </svg>
        </div>

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10">
          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 border border-accent/30">
              <Moon className="h-8 w-8 text-accent animate-[pulse_3s_ease-in-out_infinite]" strokeWidth={1.5} />
            </div>
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Coming 2026 · Downtown Wapakoneta
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
              The Family Hub <span className="text-accent">Landing Zone</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              From the first city on the moon to the next chapter for our families.
            </p>
          </div>

          {/* Timeline */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="grid md:grid-cols-3 gap-8 md:gap-4 relative">
              {/* Connecting line - desktop only */}
              <div className="hidden md:block absolute top-[28px] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-accent/20 via-accent/60 to-accent/20" />

              {[
                { year: "1969", text: "57 years ago. Man lands on the moon. Neil Armstrong walks on lunar soil. and Wapakoneta becomes The First City on the Moon." },
                { year: "2024", text: "A-Z Enterprises plants its flag in downtown Wapakoneta, building a family of businesses rooted in this hometown." },
                { year: "2026", text: "The Family Hub Landing Zone opens its doors. A safe place for families to land, gather, and grow." },
              ].map((item, i) => (
                <div key={item.year} className="relative text-center">
                  {/* Dot */}
                  <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary border-2 border-accent">
                    <div className="h-3 w-3 rounded-full bg-accent" />
                  </div>
                  {/* Year */}
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-3 tracking-tight">
                    {item.year}
                  </div>
                  {/* Text */}
                  <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-xs mx-auto">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Two callouts */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            {/* Founding Families */}
            <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 border border-accent/30">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-accent/80 mb-1.5">
                    Limited Spots
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">Founding Families</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Be one of our first families. Founding members lock in lifetime perks, early access, and a permanent seat at the table.
                  </p>
                </div>
              </div>
            </div>

            {/* 3-to-6 Drop-off Window */}
            <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 border border-accent/30">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-accent/80 mb-1.5">
                    Mon–Fri · 3 PM to 6 PM
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">After-School Drop-off Window</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    A supervised place for kids to land between school and home. Homework, snacks, activities. and parents get peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="https://thelandingzoneohio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base md:text-lg font-semibold rounded-lg bg-accent text-primary hover:bg-accent/90 transition-all hover:scale-[1.02]"
            >
              <Rocket className="h-5 w-5" />
              Explore The Family Hub
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="mt-4 text-xs text-white/40">
              Visit thelandingzoneohio.com to learn more and join the waitlist.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Testimonials, Trust Strip, Guarantees */}
      <SocialProofSection />

      {/* Experience Section - Dark background */}
      <section id="experiences" className="pt-16 pb-16 scroll-mt-20 bg-primary">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-primary-foreground opacity-0 animate-fade-in-up" style={{
            animationDelay: "0.2s"
          }}>
              One <span className="text-accent">Destination</span>
            </h2>
            <p className="text-lg text-primary-foreground/60 opacity-0 animate-fade-in-up" style={{
            animationDelay: "0.3s"
          }}>
              From life's biggest celebrations to everyday wellness, we've got you covered.
            </p>
          </div>

        {/* Featured Landing Zone Card */}
        <a
          href="https://go.thelandingzoneohio.com/the-family-hub-landing-zone---reserve-your-membership-page?utm_source=azenterprises&utm_medium=website&utm_campaign=landing_zone_waitlist&utm_content=featured_card"
          target="_blank"
          rel="noopener noreferrer"
          className="group block max-w-6xl mx-auto mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
          aria-label="The Family Hub Landing Zone - New Coming Soon"
        >
          <div className="relative overflow-hidden rounded-xl border-2 border-accent/60 bg-primary p-8 md:p-10 transition-all duration-500 hover:border-accent hover:shadow-gold-lg hover:-translate-y-1">
            {/* Star field background */}
            <div className="absolute inset-0 opacity-40" aria-hidden="true">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="stars" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="12" r="1" fill="hsl(var(--accent))" opacity="0.6" />
                    <circle cx="35" cy="28" r="0.8" fill="hsl(var(--accent))" opacity="0.4" />
                    <circle cx="50" cy="8" r="1.2" fill="hsl(var(--accent))" opacity="0.5" />
                    <circle cx="18" cy="45" r="0.7" fill="white" opacity="0.3" />
                    <circle cx="45" cy="52" r="0.9" fill="hsl(var(--accent))" opacity="0.35" />
                    <circle cx="28" cy="5" r="0.6" fill="white" opacity="0.25" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#stars)" />
              </svg>
            </div>

            {/* Radial glow behind moon */}
            <div className="absolute top-1/2 left-8 md:left-12 -translate-y-1/2 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

            {/* NEW badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-primary text-xs font-bold uppercase tracking-wider">
                NEW
                <span className="w-1 h-1 rounded-full bg-primary/60" />
                COMING SOON
              </span>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
              {/* Animated Moon Icon */}
              <div className="shrink-0 flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-accent/10 border border-accent/30">
                <Moon className="h-10 w-10 md:h-12 md:w-12 text-accent animate-[pulse_3s_ease-in-out_infinite]" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                  The Family Hub Landing Zone
                </h3>
                <p className="text-base md:text-lg text-white/70 mb-1">
                  A new family destination coming to downtown Wapakoneta.
                </p>
                <p className="text-sm text-accent/80 font-medium">
                  Part of the A-Z Enterprises family.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 text-accent font-semibold group-hover:translate-x-1 transition-transform">
                <span>Join the Waitlist</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </a>

        {/* Business Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {businesses.map((business, index) => <Link key={business.href} to={business.href} className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl" role="link" aria-label={`Learn more about ${business.name} - ${business.tagline}`}>
              <Card className="relative overflow-hidden border border-border bg-card hover:border-accent/40 transition-all duration-500 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 opacity-0 animate-fade-in-up h-full" style={{
            animationDelay: `${0.1 * (index + 1)}s`
          }}>
                {/* Subtle gold glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="relative p-8">
                  <div className="flex flex-col h-full">
                    {/* Icon and Title Row */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-all duration-300">
                        <business.icon className="h-7 w-7 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold tracking-tight text-foreground">
                            {business.name}
                          </h3>
                        </div>
                        <p className="font-medium text-sm text-accent/80">
                          {business.tagline}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                      {business.description}
                    </p>

                    {/* Fast Facts - HOMEPAGE-04 */}
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50 mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Fast Facts</p>
                      <ul className="space-y-1">
                        {business.fastFacts.map((fact, i) => <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-accent shrink-0" />
                            <span>{fact}</span>
                          </li>)}
                      </ul>
                    </div>

                    {/* Best for line */}
                    <p className="text-xs text-muted-foreground mt-auto">
                      Best for: {business.bestFor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>)}
        </div>

        {/* Single section CTA */}
        <div className="text-center mt-12">
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-primary font-semibold">
            <Link to="/booking" className="flex items-center gap-2">
              Explore All Experiences
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        </div>
      </section>

      {/* HOMEPAGE-05: What's Included at A-Z Icon Row */}
      <WhatsIncludedStrip />

      {/* Gift Cards Strip */}
      <GiftCardStrip />


      {/* HOMEPAGE-07: FAQ Section - Enhanced with high-intent questions */}
      <div id="faq" className="scroll-mt-20">
        <FAQSection />
      </div>


      {/* HOMEPAGE-10: Pre-Footer CTA Strip */}
      <PreFooterCTA />


      {/* Floating Help CTA */}
      <FloatingHelpCTA />
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>;
}