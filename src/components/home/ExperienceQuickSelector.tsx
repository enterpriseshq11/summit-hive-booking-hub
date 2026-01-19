import { Link } from "react-router-dom";
import { Building2, Sparkles, Dumbbell } from "lucide-react";

const experiences = [
  { name: "The Summit", href: "/summit", icon: Building2, color: "summit" },
  { name: "The Hive", href: "/coworking", icon: Building2, color: "coworking" },
  { name: "Restoration", href: "/spa", icon: Sparkles, color: "spa" },
  { name: "Total Fitness", href: "/fitness", icon: Dumbbell, color: "fitness" },
];

export function ExperienceQuickSelector() {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto sm:max-w-none sm:mx-0 sm:flex sm:flex-wrap lg:flex-nowrap sm:justify-center lg:justify-start">
      {experiences.map((exp) => (
        <Link
          key={exp.href}
          to={exp.href}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent hover:bg-accent/90 text-primary font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-0.5 group shrink-0"
        >
          <exp.icon className="h-4 w-4 text-primary transition-colors" />
          <span className="text-sm font-semibold text-primary">
            {exp.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
