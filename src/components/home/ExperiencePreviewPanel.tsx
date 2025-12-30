import { useState } from "react";
import { Building2, Sparkles, Dumbbell, ChevronRight } from "lucide-react";
import { QuickBookModal } from "./QuickBookModal";
import type { BusinessType } from "@/types";

const experiences: {
  type: BusinessType;
  name: string;
  tagline: string;
  icon: typeof Building2;
  gradient: string;
  iconColor: string;
  iconBg: string;
  delay: string;
}[] = [
  {
    type: "summit",
    name: "The Summit",
    tagline: "Premium Event Venue",
    icon: Building2,
    gradient: "from-summit/20 to-summit/5",
    iconColor: "text-summit",
    iconBg: "bg-summit/20",
    delay: "0s",
  },
  {
    type: "coworking",
    name: "The Hive",
    tagline: "Private Offices + Coworking",
    icon: Building2,
    gradient: "from-coworking/20 to-coworking/5",
    iconColor: "text-coworking",
    iconBg: "bg-coworking/20",
    delay: "0.1s",
  },
  {
    type: "spa",
    name: "Restoration",
    tagline: "Recovery + Spa Treatments",
    icon: Sparkles,
    gradient: "from-spa/20 to-spa/5",
    iconColor: "text-spa",
    iconBg: "bg-spa/20",
    delay: "0.2s",
  },
  {
    type: "fitness",
    name: "Total Fitness",
    tagline: "24/7 Gym + Coaching",
    icon: Dumbbell,
    gradient: "from-fitness/20 to-fitness/5",
    iconColor: "text-fitness",
    iconBg: "bg-fitness/20",
    delay: "0.3s",
  },
];

export function ExperiencePreviewPanel() {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessType | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <div className="relative">
        {/* Decorative glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-transparent to-summit/20 blur-3xl opacity-50" />
        
        {/* Card stack */}
        <div className="relative space-y-3">
          {experiences.map((exp, index) => (
            <button
              key={exp.name}
              onClick={() => {
                setSelectedBusiness(exp.type);
                setActiveIndex(index);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedBusiness(exp.type);
                  setActiveIndex(index);
                }
              }}
              className={`
                w-full text-left p-4 rounded-xl backdrop-blur-md border
                transition-all duration-300 group
                opacity-0 animate-fade-in-left
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
                ${activeIndex === index 
                  ? 'bg-white/25 border-accent scale-[1.02] -translate-x-1' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-[1.02] hover:-translate-x-1'
                }
              `}
              style={{ 
                animationDelay: exp.delay,
                animationFillMode: 'forwards'
              }}
              aria-label={`Quick book ${exp.name} - ${exp.tagline}`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  activeIndex === index ? 'bg-accent/30' : exp.iconBg
                }`}>
                  <exp.icon className={`h-6 w-6 ${activeIndex === index ? 'text-accent' : exp.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{exp.name}</p>
                  <p className="text-sm text-white/60">{exp.tagline}</p>
                </div>
                <ChevronRight className={`h-5 w-5 shrink-0 transition-all ${
                  activeIndex === index 
                    ? 'text-accent translate-x-1' 
                    : 'text-white/40 group-hover:text-white group-hover:translate-x-1'
                }`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Book Modal */}
      <QuickBookModal 
        isOpen={selectedBusiness !== null}
        onClose={() => {
          setSelectedBusiness(null);
          setActiveIndex(null);
        }}
        preselectedBusiness={selectedBusiness ?? undefined}
      />
    </>
  );
}
