import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo";
import { SITE_CONFIG } from "@/config/siteConfig";
import {
  Sparkles,
  Scissors,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Heart,
  Gift,
  ShieldCheck,
} from "lucide-react";

const BOOKING_URL = SITE_CONFIG.contact.phoneLink;
const NAIL_APPLY_URL = "https://go.azenterpriseshq.com/nail-technician-application";
const HAIR_APPLY_URL = "https://go.azenterpriseshq.com/hair-dresser-application";

/**
 * Afterglow Salon & Spa
 * Customer-first landing page. Booth-rental info is a small strip at the bottom.
 */
export default function BeautyHaven() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white selection:bg-accent/40">
      <SEOHead
        title="Afterglow Salon & Spa | Book Hair, Nails & Spa in Wapakoneta"
        description="Book hair, nails, facials and spa services at Afterglow Salon & Spa inside The Family Hub Landing Zone in Wapakoneta, Ohio. Appointments 7 days a week."
        canonicalPath="/beauty-haven"
      />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-accent/20">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" aria-hidden>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <pattern id="afterglow-honey" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
              <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#afterglow-honey)" />
          </svg>
        </div>
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
            Hair, nails and spa services in a calm, gold-lit chair — one flight above the
            Family Hub Landing Zone. Drop the kids at the playground, take an hour for
            yourself, and walk out glowing.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <span className="px-3 py-1 rounded-full text-xs uppercase tracking-widest bg-accent text-primary font-semibold">
              Now Booking
            </span>
            <span className="px-3 py-1 rounded-full text-xs uppercase tracking-widest border border-accent/50 text-accent">
              Appointment Only · 7 Days
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs uppercase tracking-widest border"
              style={{ borderColor: "#00E5FF66", color: "#00E5FF" }}
            >
              Gift Cards Available
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
              href="#services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white hover:border-accent/60 hover:text-accent transition-colors"
            >
              <Sparkles className="h-5 w-5" />
              View Services
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

      {/* ═══ SERVICES ═══ */}
      <section id="services" className="container py-20">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">What we do</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Services on the menu.
          </h2>
          <p className="text-white/70">
            Pricing and availability set by each artist. Pick a service, pick a time, and
            we'll take care of the rest.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Scissors,
              title: "Hair",
              items: ["Cuts & trims", "Color & highlights", "Blowouts", "Event & bridal styling"],
            },
            {
              icon: Sparkles,
              title: "Nails",
              items: ["Gel-X & acrylics", "Manicures", "Pedicures", "Custom nail art"],
            },
            {
              icon: Star,
              title: "Spa",
              items: ["Facials", "Waxing", "Brow shaping & tint", "Lash lift & extensions"],
            },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-white/10 bg-black/40 p-8 hover:border-accent/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center mb-5">
                <s.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
              <ul className="space-y-2 mb-6">
                {s.items.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {i}
                  </li>
                ))}
              </ul>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
              >
                Book {s.title}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ WHY AFTERGLOW ═══ */}
      <section className="border-y border-accent/20 bg-gradient-to-b from-black to-[#0b0b0b]">
        <div className="container py-20">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Why Afterglow</div>
            <h2 className="text-3xl md:text-4xl font-bold">
              A quieter kind of salon.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: "Kids downstairs",
                desc: "Family Hub Landing Zone is one floor below. Drop off, glow up.",
              },
              {
                icon: Clock,
                title: "On time, every time",
                desc: "Appointment-only means no waiting rooms and no walk-in chaos.",
              },
              {
                icon: ShieldCheck,
                title: "Licensed pros",
                desc: "Every stylist and tech is licensed, insured and vetted.",
              },
              {
                icon: Gift,
                title: "Gift cards",
                desc: "The easiest 'thank you' or birthday gift in Wapakoneta.",
              },
            ].map((f) => (
              <div key={f.title} className="text-center md:text-left">
                <div className="h-11 w-11 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="font-semibold text-lg mb-2">{f.title}</div>
                <p className="text-sm text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">How to book</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Three steps to your chair.
            </h2>
            <ol className="space-y-6">
              {[
                { n: "1", t: "Pick a service", d: "Hair, nails or spa — browse what's live on the booking page." },
                { n: "2", t: "Choose your time", d: "Same-day slots when we have them. Deposit holds your spot." },
                { n: "3", t: "Show up & glow up", d: "Second floor of A-Z Enterprises, above the Family Hub." },
              ].map((step) => (
                <li key={step.n} className="flex gap-5">
                  <div className="h-10 w-10 rounded-full border border-accent text-accent flex items-center justify-center font-bold flex-shrink-0">
                    {step.n}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{step.t}</div>
                    <div className="text-white/60">{step.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-accent/25 bg-black/40 p-8 md:p-10 text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Book online</div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Reserve your chair.</h3>
            <p className="text-white/70 mb-8">
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
            <div className="mt-6 text-xs text-white/40">
              Prefer to talk to a person? Call {SITE_CONFIG.contact.phone}.
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STYLIST STRIP (small, at the end) ═══ */}
      <section id="hiring" className="border-t border-white/10 bg-black">
        <div className="container py-10">
          <div className="rounded-xl border border-white/10 bg-black/60 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: "#00E5FF" }}>
                For stylists & nail techs
              </div>
              <div className="font-semibold text-white">
                Licensed pro? We rent chairs at Afterglow.
              </div>
              <p className="text-sm text-white/50 mt-1">
                Steady walk-through traffic from the Family Hub. Booth rental or commission.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={HAIR_APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:border-accent hover:text-accent transition-colors text-sm"
              >
                Hair Stylist
              </a>
              <a
                href={NAIL_APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:border-accent hover:text-accent transition-colors text-sm"
              >
                Nail Technician
              </a>
            </div>
          </div>
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
            <a href="#hiring" className="hover:text-accent transition-colors">Stylists</a>
          </div>
          <div>{SITE_CONFIG.business.copyright}</div>
        </div>
      </footer>
    </div>
  );
}
