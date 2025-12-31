import { Badge } from "@/components/ui/badge";
import { FILTER_OPTIONS } from "@/data/promotionsData";

interface PromotionFilterChipsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function PromotionFilterChips({ activeFilter, onFilterChange }: PromotionFilterChipsProps) {
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
          data-event={`promo_filter_click_${filter.id}`}
        >
          {filter.label}
        </Badge>
      ))}
    </div>
  );
}
