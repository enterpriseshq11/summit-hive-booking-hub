import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Dumbbell,
  Camera,
  Mic,
  Moon,
  Scissors,
  Sparkles,
  Home as HomeIcon,
  Phone,
  Clock,
} from "lucide-react";
import { FAQSection, FloatingHelpCTA, GiftCardStrip, WhatsIncludedStrip, PreFooterCTA, SocialProofSection } from "@/components/home";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";

type Tile = {
  name: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

const TILES: Tile[] = [
  {
    name: "A-Z Total Fitness",
    description: "Personal training and classes.",
    cta: "Learn More",
    href: "/fitness",
    icon: Dumbbell,
  },
  {
    name: "Afterglow Salon & Spa",
    description: "Hair, nails, and glow-up services inside the building.",
    cta: "Book Now",
    href: "/beauty-haven",
    icon: Scissors,
  },
  {
    name: "The Hive Co-working Space",
    description: "Private and shared workspace in downtown Wapakoneta.",
    cta: "Learn More",
    href: "/the-hive",
    icon: Building2,
  },
  {
    name: "The Voice Vault",
    description: "Recording studio. Book studio time.",
    cta: "Book Studio Time",
    href: "/book-voice-vault",
    icon: Mic,
  },
  {
    name: "The 360 Photo Booth",
    description: "360 photo booth rentals for any event.",
    cta: "Book a Rental",
    href: "/360-photo-booth/book",
    icon: Camera,
  },
  {
    name: "Elevated by Elyse",
    description: "", // Rose pulls from owner before publish
    cta: "Learn More",
    href: "/shop/elevated-by-elyse",
    icon: Sparkles,
  },
  {
    name: "A-Z Mobile Home Management",
    description: "Mobile home sales and management.",
    cta: "View Homes",
    href: "https://a-zconnecthq.com",
    external: true,
    icon: HomeIcon,
  },
  {
    name: "The Family Hub Landing Zone",
    description: "Coming soon. A family destination in downtown Wapakoneta.",
    cta: "Learn More",
    href: "/family-hub",
    icon: Moon,
  },
];

export default function Index() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ========== HERO ========== */}
      <section className="relative pt-16 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,hsl(var(--accent)/0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.08)_0%,transparent_60%)]" />

        {/* Honeycomb watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.10]" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
            <pattern id="honeycomb-home" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#honeycomb-home)" />
          </svg>
        </div>

        <div className="container relative z-10 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-accent mb-5 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            A-Z Enterprises · Downtown Wapakoneta
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.05] opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            One Building.
            <br />
            One Destination.
            <br />
            <span className="text-accent">Limitless Experiences.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/60 max-w-3xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            Downtown Wapakoneta's home for fitness, beauty, coworking, recording, photo booth rentals, family fun, and more, all under one roof.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <button
              onClick={() => scrollToSection("experiences")}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-lg bg-accent text-primary hover:bg-accent/90 transition-colors"
            >
              View Experiences
              <ArrowRight className="h-5 w-5" />
            </button>
            <a
              href={SITE_CONFIG.contact.phoneLink}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Check Availability
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50 opacity-0 animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{SITE_CONFIG.hours.shortDays}</span>
            </div>
            <a href={SITE_CONFIG.contact.phoneLink} className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
              <Phone className="h-4 w-4" />
              <span>{SITE_CONFIG.contact.phone}</span>
            </a>
            <span>10 W Auglaize St, Wapakoneta, OH 45895</span>
          </div>
        </div>
      </section>

      {/* ========== DESTINATION GRID ========== */}
      <section id="experiences" className="scroll-mt-20 bg-primary py-16 md:py-24 border-t border-white/5">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              The Destination
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Every Experience, <span className="text-accent">All in One Place</span>
            </h2>
            <p className="text-base md:text-lg text-white/60">
              Eight businesses operating under A-Z Enterprises. Pick where you want to land.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {TILES.map((tile) => {
              const Icon = tile.icon;
              const cardClass =
                "group relative flex flex-col h-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 transition-all duration-300 hover:border-accent/60 hover:bg-white/[0.05] hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10";

              const inner = (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 mb-4 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">{tile.name}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-6 flex-1 min-h-[2.5rem]">
                    {tile.description || <span className="italic text-white/30">Description coming soon.</span>}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all">
                    {tile.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </>
              );

              return tile.external ? (
                <a key={tile.name} href={tile.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                  {inner}
                </a>
              ) : (
                <Link key={tile.name} to={tile.href} className={cardClass}>
                  {inner}
                </Link>
              );
            })}
          </div>

          <p className="text-center text-xs text-white/30 italic mt-10 max-w-2xl mx-auto">
            Images shown are AI-generated vision of the experience we are working on building.
          </p>
        </div>
      </section>

      <SocialProofSection />
      <WhatsIncludedStrip />
      <GiftCardStrip />

      <div id="faq" className="scroll-mt-20">
        <FAQSection />
      </div>

      <PreFooterCTA />

      <FloatingHelpCTA />
      <ScrollToTopButton />
    </div>
  );
}
