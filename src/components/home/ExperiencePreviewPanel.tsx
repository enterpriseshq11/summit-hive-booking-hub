import { Building2, Sparkles, Dumbbell, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const experiences = [
  {
    name: "The Summit",
    tagline: "Premium Events",
    icon: Building2,
    href: "/summit",
    gradient: "from-summit/20 to-summit/5",
    iconColor: "text-summit",
    iconBg: "bg-summit/20",
    delay: "0s",
  },
  {
    name: "The Hive",
    tagline: "Modern Workspaces",
    icon: Building2,
    href: "/coworking",
    gradient: "from-coworking/20 to-coworking/5",
    iconColor: "text-coworking",
    iconBg: "bg-coworking/20",
    delay: "0.1s",
  },
  {
    name: "Restoration",
    tagline: "Luxury Spa",
    icon: Sparkles,
    href: "/spa",
    gradient: "from-spa/20 to-spa/5",
    iconColor: "text-spa",
    iconBg: "bg-spa/20",
    delay: "0.2s",
  },
  {
    name: "Total Fitness",
    tagline: "24/7 Gym",
    icon: Dumbbell,
    href: "/fitness",
    gradient: "from-fitness/20 to-fitness/5",
    iconColor: "text-fitness",
    iconBg: "bg-fitness/20",
    delay: "0.3s",
  },
];

export function ExperiencePreviewPanel() {
  return (
    <div className="relative">
      {/* Decorative glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-transparent to-summit/20 blur-3xl opacity-50" />
      
      {/* Card stack */}
      <div className="relative space-y-3">
        {experiences.map((exp, index) => (
          <Link
            key={exp.name}
            to={exp.href}
            className={`
              block p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20
              hover:bg-white/20 hover:border-white/40 hover:scale-[1.02] hover:-translate-x-1
              transition-all duration-300 group
              opacity-0 animate-fade-in-left
            `}
            style={{ 
              animationDelay: exp.delay,
              animationFillMode: 'forwards'
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl ${exp.iconBg} flex items-center justify-center shrink-0`}>
                <exp.icon className={`h-6 w-6 ${exp.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{exp.name}</p>
                <p className="text-sm text-white/60">{exp.tagline}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
