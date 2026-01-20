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
      {/* Mobile: vertical stack, Tablet/Desktop: flex wrap */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 w-full sm:w-auto">
        {categories.map((cat) => (
          <button
            key={cat.type}
            onClick={() => navigate(cat.route)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-[hsl(45,70%,50%)]/80 text-black border-2 border-transparent hover:bg-[hsl(45,70%,45%)] hover:border-black/20 w-full sm:w-auto"
          >
            <cat.icon className="h-4 w-4" />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
