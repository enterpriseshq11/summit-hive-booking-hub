import { ArrowRight, Moon, Rocket, Users, Clock } from "lucide-react";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SEOHead } from "@/components/seo";

const WAITLIST_URL = "https://go.thelandingzoneohio.com/join-the-family-hub-landing-zone-waitlist";
const SITE_URL = "https://thelandingzoneohio.com";

export default function FamilyHub() {
  return (
    <div className="min-h-screen overflow-hidden bg-primary">
      <SEOHead
        title="The Family Hub Landing Zone | A-Z Enterprises"
        description="A new family destination coming soon to downtown Wapakoneta. Join the waitlist and learn about Founding Families."
      />

      {/* ========== HERO: We Found the Moon ========== */}
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
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
            <Moon className="h-10 w-10 text-accent" strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            We Found the Moon.
            <br />
            <span className="text-accent">Now Giving Families a Place to Land.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            The newest addition to A-Z Enterprises. <span className="font-bold text-slate-50">OPENING SOON</span> in downtown Wapakoneta.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href={WAITLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-lg bg-accent text-primary hover:bg-accent/90 transition-colors"
            >
              Join the Waitlist
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="text-xs text-white/40 italic max-w-md">
              Images shown are AI-generated vision of the experience we are working on building.
            </p>
          </div>
        </div>
      </section>

      {/* ========== MOON TIMELINE STORY ========== */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-28 border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10">
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

          <div className="max-w-5xl mx-auto mb-16">
            <div className="grid md:grid-cols-3 gap-8 md:gap-4 relative">
              <div className="hidden md:block absolute top-[28px] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-accent/20 via-accent/60 to-accent/20" />
              {[
                { year: "1969", text: "57 years ago. Man lands on the moon. Neil Armstrong walks on lunar soil. and Wapakoneta becomes The First City on the Moon." },
                { year: "2024", text: "A-Z Enterprises plants its flag in downtown Wapakoneta, building a family of businesses rooted in this hometown." },
                { year: "2026", text: "The Family Hub Landing Zone opens its doors. A safe place for families to land, gather, and grow." },
              ].map((item) => (
                <div key={item.year} className="relative text-center">
                  <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary border-2 border-accent">
                    <div className="h-3 w-3 rounded-full bg-accent" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-3 tracking-tight">{item.year}</div>
                  <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-xs mx-auto">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Two callouts */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 border border-accent/30">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-accent/80 mb-1.5">Limited Spots</span>
                  <h3 className="text-xl font-bold text-white mb-2">Founding Families</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Be one of our first families. Founding members lock in lifetime perks, early access, and a permanent seat at the table.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 border border-accent/30">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-accent/80 mb-1.5">Mon–Fri · 3 PM to 6 PM</span>
                  <h3 className="text-xl font-bold text-white mb-2">After-School Drop-off Window</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    A supervised place for kids to land between school and home. Homework, snacks, activities. and parents get peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href={SITE_URL}
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

      <ScrollToTopButton />
    </div>
  );
}
