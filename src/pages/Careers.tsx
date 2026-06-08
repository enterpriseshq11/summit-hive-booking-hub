import { SEOHead } from "@/components/seo";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

type Category = "Beauty & spa" | "Fitness" | "Contracting" | "Cleaning";

type Role = {
  title: string;
  category: Category;
  location: string;
  description: string;
  applyUrl: string;
};

const ROLES: Role[] = [
  {
    title: "Massage therapist",
    category: "Beauty & spa",
    location: "Wapakoneta, OH",
    description:
      "Join our wellness team. Multiple modalities welcome. License a plus but not required.",
    applyUrl: "#",
  },
  {
    title: "Hairstylist",
    category: "Beauty & spa",
    location: "Wapakoneta, OH",
    description:
      "Bring your clients or start fresh. Booth rent and commission options available.",
    applyUrl: "#",
  },
  {
    title: "Nail technician",
    category: "Beauty & spa",
    location: "Wapakoneta, OH",
    description: "Manicures, pedicures, nail art — all specialties welcome.",
    applyUrl: "#",
  },
  {
    title: "Esthetician",
    category: "Beauty & spa",
    location: "Wapakoneta, OH",
    description: "Skincare, facials, and more. Flexible compensation available.",
    applyUrl: "#",
  },
  {
    title: "Personal trainer",
    category: "Fitness",
    location: "Wapakoneta, OH",
    description:
      "Help members hit their goals. Certification a plus. Gym-based role.",
    applyUrl: "#",
  },
  {
    title: "Contractor",
    category: "Contracting",
    location: "Pikeville, KY",
    description:
      "Skilled trade and general contracting work. Own tools and transportation required.",
    applyUrl: "#",
  },
  {
    title: "Cleaner — homes & Airbnbs",
    category: "Cleaning",
    location: "Pikeville, KY",
    description:
      "Residential and Airbnb turnover cleaning. Steady local work for reliable crews.",
    applyUrl: "#",
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
  },
  {
    title: "Competitive pay",
    body: "Employee pay, commission, or booth/chair rent — your choice.",
  },
  {
    title: "Community first",
    body: "We hire locally and invest in the people on our team.",
  },
  {
    title: "Room to grow",
    body: "We're expanding — and we promote from within.",
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
        <section style={{ backgroundColor: "#1a1a1a" }} className="py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <p
                className="uppercase tracking-widest text-sm font-semibold mb-4"
                style={{ color: "#C9982A" }}
              >
                Now hiring
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Build your career with A-Z Enterprises
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">
                Join a growing team rooted in Wapakoneta and Pikeville. We value
                reliability, skill, and people who take pride in their work.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={scrollToRoles}
                  className="px-6 py-3 rounded-md font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#C9982A", color: "#1a1a1a" }}
                >
                  View open positions
                </button>
                <Link
                  to="/about"
                  className="px-6 py-3 rounded-md font-semibold border-2 border-white text-white hover:bg-white hover:text-[#1a1a1a] transition-colors"
                >
                  Learn about us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why join us */}
        <section className="py-16 container">
          <h2 className="text-3xl font-bold text-center mb-12">Why join us</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {WHY_CARDS.map((c) => (
              <div
                key={c.title}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
                <p className="text-muted-foreground text-sm">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open positions */}
        <section id="open-positions" className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-2">
              Open positions
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              {ROLES.length} roles
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {visibleRoles.map((role) => {
                const style = CATEGORY_STYLES[role.category];
                return (
                  <div
                    key={role.title}
                    className="rounded-lg border bg-card p-6 shadow-sm flex flex-col"
                  >
                    <div className="mb-3">
                      <span
                        className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                        }}
                      >
                        {role.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{role.location}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5 flex-1">
                      {role.description}
                    </p>
                    <Button
                      asChild
                      className="self-start"
                      style={{ backgroundColor: "#1a1a1a", color: "#fff" }}
                    >
                      <a
                        href={role.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply →
                      </a>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ backgroundColor: "#1a1a1a" }} className="py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to apply?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-4">
              Click any role above to go directly to the application form. Takes
              about 5 minutes.
            </p>
            <p style={{ color: "#C9982A" }} className="font-medium">
              For general inquiries only: careers@a-zenterpriseshq.com
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
