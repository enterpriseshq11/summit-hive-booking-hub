import { Badge } from "@/components/ui/badge";

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "office", label: "Office" },
  { id: "fitness", label: "Fitness" },
  { id: "spa", label: "Spa" },
  { id: "summit", label: "Summit" },
  { id: "new", label: "New Members" },
  { id: "limited", label: "Limited Time" },
];

interface PromotionFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function PromotionFilters({ activeFilter, onFilterChange }: PromotionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 py-4">
      {FILTER_OPTIONS.map((filter) => (
        <Badge
          key={filter.id}
          variant="outline"
          role="button"
          tabIndex={0}
          onClick={() => onFilterChange(filter.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onFilterChange(filter.id);
            }
          }}
          className={`
            cursor-pointer transition-all duration-200 px-3 py-1.5
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold
            ${activeFilter === filter.id
              ? "bg-gold/20 border-gold text-gold"
              : "border-border/50 text-muted-foreground hover:border-gold/50 hover:text-foreground"
            }
          `}
        >
          {filter.label}
        </Badge>
      ))}
    </div>
  );
}
