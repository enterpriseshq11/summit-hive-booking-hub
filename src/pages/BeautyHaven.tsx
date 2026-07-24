import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo";
import { SITE_CONFIG } from "@/config/siteConfig";
import { Sparkles, Scissors, Calendar, MapPin, Clock, ArrowRight, Star } from "lucide-react";

const BOOKING_URL = "https://highmaintenancebh.glossgenius.com/book";
const NAIL_APPLY_URL = "https://go.azenterpriseshq.com/nail-technician-application";
const HAIR_APPLY_URL = "https://go.azenterpriseshq.com/hair-dresser-application";

/**
 * Afterglow Salon & Spa
 * Tenant of A-Z Enterprises / The Family Hub Landing Zone.
 * Palette: black + gold, with subtle neon-cyan highlights.
 */
export default function BeautyHaven() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white selection:bg-accent/40">
      <SEOHead
        title="Afterglow Salon & Spa | A-Z Enterprises"
        description="Afterglow Salon & Spa — hair, nails and glow-up services inside A-Z Enterprises at The Family Hub Landing Zone in Wapakoneta, Ohio. Booth rentals available."
        canonicalPath="/beauty-haven"
      />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-accent/20">
        {/* Honeycomb wash */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" aria-hidden>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <pattern id="afterglow-honey" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#afterglow-honey)" />
          </svg>
        </div>
        {/* Neon glow */}
        <div
          className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #00E5FF 0%, transparent 70%)" }}
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)" }}
          aria-hidden
        />

        <div className="container relative z-10 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="h-px w-8 bg-accent" />
            <span className="text-xs tracking-[0.3em] uppercase text-accent">
              A-Z Enterprises · Family Hub Landing Zone
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6">
            <span className="block text-white">Afterglow</span>
            <span
              className="block italic"
              style={{
                background: "linear-gradient(90deg, hsl(var(--accent)) 0%, #00E5FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Salon &amp; Spa
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-white/70 mb-8">
            The glow-up floor of the Family Hub. Hair, nails, and quiet-luxury spa moments —
            styled by independent pros who take pride in their chairs.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <span className="px-3 py-1 rounded-full text-xs uppercase tracking-widest bg-accent text-primary font-semibold">
              Now Open
            </span>
            <span className="px-3 py-1 rounded-full text-xs uppercase tracking-widest border border-accent/50 text-accent">
              Appointment Only
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs uppercase tracking-widest border"
              style={{ borderColor: "#00E5FF66", color: "#00E5FF" }}
            >
              Booth Rentals Available
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-primary font-bold shadow-[0_0_30px_hsl(var(--accent)/0.4)] hover:shadow-[0_0_50px_hsl(var(--accent)/0.6)] transition-all"
            >
              <Calendar className="h-5 w-5" />
              Book an Appointment
            </a>
            <a
              href="#hiring"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white hover:border-accent/60 hover:text-accent transition-colors"
            >
              <Scissors className="h-5 w-5" />
              Rent a Booth
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              {SITE_CONFIG.location.street}, 2nd Floor · {SITE_CONFIG.location.city},{" "}
              {SITE_CONFIG.location.stateAbbr} {SITE_CONFIG.location.zip}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              By appointment · 7 days a week
            </span>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Who we are</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              A calm, gold-lit chair inside the busiest building in town.
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Afterglow is the salon and spa floor of A-Z Enterprises — tucked one flight above
              the Family Hub Landing Zone. Drop the kids at the playground, take an hour for
              yourself, and walk out lit from the inside.
            </p>
            <p className="text-white/70 leading-relaxed">
              We're building a roster of independent stylists, nail artists and estheticians who
              work by appointment. No walk-in chaos. No pressure. Just a clean room, a good
              chair, and someone who actually cares about the outcome.
            </p>
          </div>

          <div className="rounded-2xl border border-accent/25 bg-black/40 p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Services on deck</div>
            <ul className="space-y-4">
              {[
                { icon: Scissors, title: "Hair", desc: "Cuts, color, blowouts, event styling." },
                { icon: Sparkles, title: "Nails", desc: "Gel-X, acrylics, pedicures, custom art." },
                { icon: Star, title: "Spa", desc: "Facials, waxing, brow and lash services." },
              ].map((s) => (
                <li key={s.title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                    <s.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-white/60">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-white/40">
              Service menu &amp; pricing set by each independent artist. Book online to see
              what's currently offered.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ BOOK ═══ */}
      <section className="border-y border-accent/20 bg-gradient-to-b from-black to-[#0b0b0b]">
        <div className="container py-20 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Book online</div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Reserve your chair.</h3>
          <p className="max-w-xl mx-auto text-white/70 mb-8">
            Same-day openings when we've got 'em. Deposit required to hold your slot.
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-accent text-primary font-bold shadow-[0_0_30px_hsl(var(--accent)/0.4)] hover:shadow-[0_0_60px_hsl(var(--accent)/0.6)] transition-all"
          >
            Book Now
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* ═══ HIRING ═══ */}
      <section id="hiring" className="container py-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#00E5FF" }}>
              Now hiring
            </div>
            <h3 className="text-3xl md:text-4xl font-bold">Rent a booth at Afterglow.</h3>
          </div>
          <span className="text-sm text-white/50">Wapakoneta, OH</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Nail Technician",
              desc:
                "Bring your book. We provide the room, the lighting, and the walk-through traffic from the Family Hub upstairs.",
              bullets: ["Licensed & insured", "Gel, acrylic or nail art", "Booth rental or commission"],
              href: NAIL_APPLY_URL,
            },
            {
              title: "Hair Stylist",
              desc:
                "Cuts, color, styling — build your clientele in a clean, calm chair with steady foot traffic from the building.",
              bullets: ["Licensed cosmetologist", "Cut, color & styling", "Booth rental or commission"],
              href: HAIR_APPLY_URL,
            },
          ].map((role) => (
            <div
              key={role.title}
              className="group relative rounded-2xl border border-white/10 bg-black/40 p-8 hover:border-accent/50 transition-colors"
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
                style={{ boxShadow: "0 0 40px hsl(var(--accent) / 0.15) inset" }}
                aria-hidden
              />
              <h4 className="text-2xl font-bold mb-2">{role.title}</h4>
              <div className="text-sm mb-4" style={{ color: "#00E5FF" }}>
                Booth Rental Available
              </div>
              <p className="text-white/70 mb-6">{role.desc}</p>
              <ul className="space-y-2 mb-8">
                {role.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href={role.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-primary font-semibold hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)] transition-all"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER STRIP ═══ */}
      <footer className="border-t border-accent/20 bg-black">
        <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div>
            <div className="font-semibold text-white">Afterglow Salon &amp; Spa</div>
            <div>
              {SITE_CONFIG.location.street}, 2nd Floor · {SITE_CONFIG.location.city},{" "}
              {SITE_CONFIG.location.stateAbbr} {SITE_CONFIG.location.zip}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-accent transition-colors">A-Z Enterprises</Link>
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              Book
            </a>
            <a href="#hiring" className="hover:text-accent transition-colors">Careers</a>
          </div>
          <div>{SITE_CONFIG.business.copyright}</div>
        </div>
      </footer>
    </div>
  );
}
