import { Building2, Sparkles, Dumbbell, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Categories in exact required order for display
const categories = [
  { type: "summit", name: "The Summit", icon: Building2, route: "/summit" },
  { type: "coworking", name: "The Hive", icon: Building2, route: "/coworking" },
  { type: "spa", name: "Restoration", icon: Sparkles, route: "/spa" },
  { type: "fitness", name: "Total Fitness", icon: Dumbbell, route: "/fitness" },
  { type: "photo-booth", name: "360 Photo Booth", icon: Camera, route: "/360-photo-booth" },
];

export function BookingCategoryPicker() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Mobile: 2-row grid (2 on top, 3 on bottom), Tablet/Desktop: flex wrap */}
      <div className="grid grid-cols-2 gap-3 w-full sm:hidden">
        {/* Row 1: First 2 pills */}
        {categories.slice(0, 2).map((cat) => (
          <button
            key={cat.type}
            onClick={() => navigate(cat.route)}
            className="inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-[hsl(45,70%,50%)]/80 text-black border-2 border-transparent hover:bg-[hsl(45,70%,45%)] hover:border-black/20"
          >
            <cat.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{cat.name}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 w-full sm:hidden">
        {/* Row 2: Last 3 pills */}
        {categories.slice(2).map((cat) => (
          <button
            key={cat.type}
            onClick={() => navigate(cat.route)}
            className="inline-flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl font-semibold text-xs transition-all duration-300 bg-[hsl(45,70%,50%)]/80 text-black border-2 border-transparent hover:bg-[hsl(45,70%,45%)] hover:border-black/20"
          >
            <cat.icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{cat.name}</span>
          </button>
        ))}
      </div>
      {/* Tablet/Desktop: horizontal flex wrap */}
      <div className="hidden sm:flex sm:flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat.type}
            onClick={() => navigate(cat.route)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-[hsl(45,70%,50%)]/80 text-black border-2 border-transparent hover:bg-[hsl(45,70%,45%)] hover:border-black/20"
          >
            <cat.icon className="h-4 w-4" />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
