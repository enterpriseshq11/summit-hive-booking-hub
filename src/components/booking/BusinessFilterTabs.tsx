import { Button } from "@/components/ui/button";
import { Building2, Sparkles, Dumbbell } from "lucide-react";
import type { BusinessType } from "@/types";

interface BusinessFilterTabsProps {
  activeFilter: BusinessType | "all";
  onFilterChange: (filter: BusinessType | "all") => void;
}

const filters: { value: BusinessType | "all"; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
  { value: "all", label: "All" },
  { value: "summit", label: "Summit", icon: Building2 },
  { value: "coworking", label: "Hive", icon: Building2 },
  { value: "spa", label: "Restoration", icon: Sparkles },
  { value: "fitness", label: "Fitness", icon: Dumbbell },
];

export function BusinessFilterTabs({ activeFilter, onFilterChange }: BusinessFilterTabsProps) {
  return (
    <div 
      className="flex flex-wrap gap-2 justify-center mb-8"
      role="tablist"
      aria-label="Filter by business type"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        const Icon = filter.icon;
        
        return (
          <Button
            key={filter.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            role="tab"
            aria-selected={isActive}
            data-event="booking_filter_click"
            data-filter={filter.value}
            className={`
              transition-all duration-200
              ${isActive 
                ? "bg-accent text-primary border-accent shadow-md" 
                : "border-border/50 hover:border-accent/50 hover:bg-accent/5"
              }
            `}
          >
            {Icon && <Icon className="h-4 w-4 mr-1.5" />}
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
