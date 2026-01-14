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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[hsl(45,70%,50%)] hover:bg-[hsl(45,70%,45%)] border-2 border-transparent hover:border-black/20 text-black font-semibold transition-all duration-300 hover:scale-105"
        >
          <exp.icon className="h-4 w-4" />
          <span className="text-sm">
            {exp.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
