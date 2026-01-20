import { Link } from "react-router-dom";
import { Building2, Sparkles, Dumbbell, Camera, Mic } from "lucide-react";

// Row 1: The Summit, The Hive, Restoration (3 pills)
const topRow = [
  { name: "The Summit", href: "/summit", icon: Building2 },
  { name: "The Hive", href: "/coworking", icon: Building2 },
  { name: "Restoration", href: "/spa", icon: Sparkles },
];

// Row 2: Total Fitness, 360 Photo Booth, Voice Vault (3 pills)
const bottomRow = [
  { name: "Total Fitness", href: "/fitness", icon: Dumbbell },
  { name: "360 Photo Booth", href: "/360-photo-booth", icon: Camera },
  { name: "Voice Vault", href: "/voice-vault", icon: Mic },
];

const pillClasses = "inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-accent hover:bg-accent/90 text-primary font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-0.5 group shrink-0";

export function ExperienceQuickSelector() {
  return (
    <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-3 lg:ml-0">
      {/* Row 1: 3 pills */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {topRow.map((exp) => (
          <Link key={exp.href} to={exp.href} className={pillClasses}>
            <exp.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary transition-colors" />
            <span className="text-xs sm:text-sm font-semibold text-primary">{exp.name}</span>
          </Link>
        ))}
      </div>
      {/* Row 2: 3 pills */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {bottomRow.map((exp) => (
          <Link key={exp.href} to={exp.href} className={pillClasses}>
            <exp.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary transition-colors" />
            <span className="text-xs sm:text-sm font-semibold text-primary">{exp.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}