import { Building2, Sparkles, Dumbbell, Camera, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Row 1: The Summit, The Hive, Restoration (3 pills)
const topRow = [
  { type: "summit", name: "The Summit", icon: Building2, route: "/summit" },
  { type: "coworking", name: "The Hive", icon: Building2, route: "/coworking" },
  { type: "spa", name: "Restoration", icon: Sparkles, route: "/spa" },
];

// Row 2: Total Fitness, 360 Photo Booth, Voice Vault (3 pills)
const bottomRow = [
  { type: "fitness", name: "Total Fitness", icon: Dumbbell, route: "/fitness" },
  { type: "photo-booth", name: "360 Photo Booth", icon: Camera, route: "/360-photo-booth" },
  { type: "voice-vault", name: "Voice Vault", icon: Mic, route: "/voice-vault" },
];

export function BookingCategoryPicker() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      {/* Row 1: 3 pills */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {topRow.map((cat) => (
          <button
            key={cat.type}
            onClick={() => navigate(cat.route)}
            className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 bg-[hsl(45,70%,50%)]/80 text-black border-2 border-transparent hover:bg-[hsl(45,70%,45%)] hover:border-black/20"
          >
            <cat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{cat.name}</span>
          </button>
        ))}
      </div>
      {/* Row 2: 3 pills */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {bottomRow.map((cat) => (
          <button
            key={cat.type}
            onClick={() => navigate(cat.route)}
            className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 bg-[hsl(45,70%,50%)]/80 text-black border-2 border-transparent hover:bg-[hsl(45,70%,45%)] hover:border-black/20"
          >
            <cat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
