import { Building2, Sparkles, Dumbbell } from "lucide-react";
import type { BusinessType } from "@/types";

interface BookingCategoryPickerProps {
  selectedCategory: BusinessType | "all";
  onCategoryChange: (category: BusinessType | "all") => void;
  onScrollToSection?: (businessType: BusinessType) => void;
}

const categories = [
  { type: "summit" as const, name: "Summit", icon: Building2, color: "summit", label: "Events" },
  { type: "coworking" as const, name: "The Hive", icon: Building2, color: "coworking", label: "Coworking" },
  { type: "spa" as const, name: "Restoration", icon: Sparkles, color: "spa", label: "Spa" },
  { type: "fitness" as const, name: "Total Fitness", icon: Dumbbell, color: "fitness", label: "Fitness" },
];

export function BookingCategoryPicker({
  selectedCategory,
  onCategoryChange,
  onScrollToSection,
}: BookingCategoryPickerProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.type;
        return (
          <button
            key={cat.type}
            onClick={() => {
              onCategoryChange(cat.type);
              onScrollToSection?.(cat.type);
            }}
            className={`
              inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm
              transition-all duration-300
              ${isActive 
                ? "bg-[hsl(45,70%,50%)] text-black border-2 border-black shadow-lg shadow-[hsl(45,70%,50%)]/30" 
                : "bg-[hsl(45,70%,50%)]/80 text-black border-2 border-transparent hover:bg-[hsl(45,70%,45%)] hover:border-black/20"
              }
            `}
          >
            <cat.icon className="h-4 w-4" />
            <span>{cat.name}</span>
            <span className="text-xs opacity-70">({cat.label})</span>
          </button>
        );
      })}
    </div>
  );
}
