import { SEOHead } from "@/components/seo";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  MapPin,
  Heart,
  Scissors,
  Sparkles,
  Eye,
  Dumbbell,
  Wrench,
  Hammer,
  Home,
  Building,
  Calendar,
  Coins,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

type Category = "Beauty & spa" | "Fitness" | "Contracting" | "Cleaning";

type Role = {
  title: string;
  category: Category;
  location: string;
  description: string;
  applyUrl: string;
  icon: LucideIcon;
};

const ROLES: Role[] = [
  {
    title: "Massage therapist",
    category: "Beauty & spa",
    location: "Wapakoneta, OH",
    description:
      "Join our wellness team. Multiple modalities welcome. License a plus but not required.",
    applyUrl: "https://api.leadconnectorhq.com/widget/form/vzud34CnRZN0Et5EzIXn",
    icon: Heart,
  },
  {
    title: "Hairstylist",
    category: "Beauty & spa",
    location: "Wapakoneta, OH",
    description:
      "Bring your clients or start fresh. Booth rent and commission options available.",
    applyUrl: "https://go.azenterpriseshq.com/hair-dresser-application",
    icon: Scissors,
  },
  {
    title: "Nail technician",
    category: "Beauty & spa",
    location: "Wapakoneta, OH",
    description: "Manicures, pedicures, nail art — all specialties welcome.",
    applyUrl: "https://go.azenterpriseshq.com/nail-technician-application",
    icon: Sparkles,
  },
  {
    title: "Esthetician",
    category: "Beauty & spa",
    location: "Wapakoneta, OH",
    description: "Skincare, facials, and more. Flexible compensation available.",
    applyUrl: "https://api.leadconnectorhq.com/widget/form/5G6IoLO1DEaulhZWu7W7",
    icon: Eye,
  },
  {
    title: "Personal trainer",
    category: "Fitness",
    location: "Wapakoneta, OH",
    description:
      "Help members hit their goals. Certification a plus. Gym-based role.",
    applyUrl: "https://api.leadconnectorhq.com/widget/form/uf4C0ELWQwLZ9z0GvVAU",
    icon: Dumbbell,
  },
  {
    title: "Contractor",
    category: "Contracting",
    location: "Pikeville, KY",
    description:
      "Skilled trade and general contracting work. Own tools and transportation required.",
    applyUrl: "https://go.azenterpriseshq.com/contractor-application",
    icon: Wrench,
  },
  {
    title: "Cleaner — homes & Airbnbs",
    category: "Cleaning",
    location: "Pikeville, KY",
    description:
      "Residential and Airbnb turnover cleaning. Steady local work for reliable crews.",
    applyUrl: "https://go.azenterpriseshq.com/cleaner-application",
    icon: Home,
  },
  {
    title: "Contractor — General/Handyman",
    category: "Contracting",
    location: "Wapakoneta, OH",
    description:
      "Ongoing interior renovation, repairs, and buildout projects at our downtown commercial building.",
    applyUrl: "https://api.leadconnectorhq.com/widget/form/4xI7soLG4AqiftN9Wb6T",
    icon: Wrench,
  },
  {
    title: "Contractor — Carpenter/Builder",
    category: "Contracting",
    location: "Wapakoneta, OH",
    description:
      "Shed builds and structural buildout projects. Build it right and build it fast.",
    applyUrl: "https://api.leadconnectorhq.com/widget/form/19geuaAqObd5fN2YLoLb",
    icon: Hammer,
  },
  {
    title: "Cleaner — Commercial Building",
    category: "Cleaning",
    location: "Wapakoneta, OH",
    description:
      "Recurring cleaning for our spa, fitness area, event center, and family venue in downtown Wapakoneta.",
    applyUrl: "#",
    icon: Building,
  },
];

const CATEGORY_STYLES: Record<Category, { bg: string; text: string }> = {
  "Beauty & spa": { bg: "#FBEAF0", text: "#72243E" },
  Fitness: { bg: "#E1F5EE", text: "#085041" },
  Contracting: { bg: "#FAEEDA", text: "#633806" },
  Cleaning: { bg: "#E6F1FB", text: "#0C447C" },
};

const FILTERS: ("All" | Category)[] = [
  "All",
  "Beauty & spa",
  "Fitness",
  "Contracting",
  "Cleaning",
];

const WHY_CARDS = [
  {
    title: "Flexible scheduling",
    body: "Full-time, part-time, and contract positions available.",
    icon: Calendar,
  },
  {
    title: "Competitive pay",
    body: "Employee pay, commission, or booth/chair rent — your choice.",
    icon: Coins,
  },
  {
    title: "Community first",
    body: "We hire locally and invest in the people on our team.",
    icon: Users,
  },
  {
    title: "Room to grow",
    body: "We're expanding — and we promote from within.",
    icon: TrendingUp,
  },
];

export default function Careers() {
  const [filter, setFilter] = useState<"All" | Category>("All");
  const visibleRoles =
    filter === "All" ? ROLES : ROLES.filter((r) => r.category === filter);

  const scrollToRoles = () => {
    document
      .getElementById("open-positions")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SEOHead
        title="Careers at A-Z Enterprises | Join Our Team"
        description="Now hiring in Wapakoneta, OH and Pikeville, KY. Explore open positions across beauty & spa, fitness, contracting, and cleaning."
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section
          style={{ backgroundColor: "#1a1a1a" }}
          className="py-16 md:py-20"
        >
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <p
                className="uppercase tracking-widest text-xs font-medium mb-3"
                style={{ color: "#C9982A" }}
              >
                Now hiring
              </p>
              <h1 className="text-3xl md:text-5xl font-semibold mb-5 text-white leading-tight">
                Build your career with A-Z Enterprises
              </h1>
              <p className="text-base md:text-lg text-white/70 mb-8 max-w-xl mx-auto">
                Join a growing team rooted in Wapakoneta and Pikeville. We value
                reliability, skill, and people who take pride in their work.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={scrollToRoles}
                  className="px-6 py-3 rounded-md font-medium text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#C9982A", color: "#1a1a1a" }}
                >
                  View open positions
                </button>
                <Link
                  to="/about"
                  className="px-6 py-3 rounded-md font-medium text-sm border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  Learn about us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why join us */}
        <section className="py-14 container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {WHY_CARDS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="rounded-lg border bg-card p-5"
                >
                  <Icon
                    className="h-5 w-5 mb-3"
                    style={{ color: "#C9982A" }}
                  />
                  <h3 className="font-medium text-sm mb-1">{c.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {c.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Open positions */}
        <section id="open-positions" className="pb-16">
          <div className="container max-w-5xl">
            <p className="uppercase tracking-wider text-xs font-medium text-muted-foreground mb-4">
              Open positions — {ROLES.length} roles
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {visibleRoles.map((role) => {
                const style = CATEGORY_STYLES[role.category];
                const Icon = role.icon;
                return (
                  <div
                    key={role.title}
                    className="rounded-lg border bg-card p-4 md:p-5 flex items-center gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1">{role.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: style.bg,
                            color: style.text,
                          }}
                        >
                          {role.category}
                        </span>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {role.location}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block">
                        {role.description}
                      </p>
                    </div>
                    <a
                      href={role.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#1a1a1a", color: "#fff" }}
                    >
                      Apply →
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          style={{ backgroundColor: "#1a1a1a" }}
          className="py-14"
        >
          <div className="container text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
              Ready to apply?
            </h2>
            <p className="text-white/70 text-sm mb-5">
              Click any role above to go directly to the application form. Takes
              about 5 minutes.
            </p>
            <p style={{ color: "#C9982A" }} className="text-sm font-medium">
              For general inquiries only: careers@a-zenterpriseshq.com
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
