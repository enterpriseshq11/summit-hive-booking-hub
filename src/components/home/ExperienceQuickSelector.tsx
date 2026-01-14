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
    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
      {experiences.map((exp) => (
        <Link
          key={exp.href}
          to={exp.href}
          className={`
            inline-flex items-center gap-2 px-4 py-2.5 rounded-full
            bg-white/10 border border-white/20 
            hover:bg-white/20 hover:border-accent/50 hover:scale-105
            transition-all duration-300 group
          `}
        >
          <exp.icon className={`h-4 w-4 text-${exp.color} group-hover:text-accent transition-colors`} />
          <span className="text-sm font-medium text-white/90 group-hover:text-white">
            {exp.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
