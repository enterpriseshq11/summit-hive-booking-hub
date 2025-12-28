import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { useNextAvailable } from "@/hooks/useAvailability";
import type { BusinessType } from "@/types";

interface NextAvailableWidgetProps {
  businessType?: BusinessType;
  title?: string;
  showPrice?: boolean;
  limit?: number;
  onSlotSelect?: (slot: any) => void;
}

export function NextAvailableWidget({
  businessType,
  title = "Next Available",
  showPrice = true,
  limit = 3,
  onSlotSelect,
}: NextAvailableWidgetProps) {
  const { data: slots, isLoading, error } = useNextAvailable(businessType);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error || !slots || slots.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
          No availability at this time
        </div>
      </div>
    );
  }

  const displaySlots = slots.slice(0, limit);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      
      <div className="space-y-2">
        {displaySlots.map((slot) => {
          const startDate = new Date(slot.start_time);
          const isToday = startDate.toDateString() === new Date().toDateString();
          const isTomorrow = startDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

          const dateLabel = isToday
            ? "Today"
            : isTomorrow
            ? "Tomorrow"
            : startDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

          const timeLabel = startDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <button
              key={slot.id}
              onClick={() => onSlotSelect?.(slot)}
              className="w-full flex items-center justify-between p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{dateLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{timeLabel}</span>
                </div>
              </div>
              {showPrice && slot.base_price > 0 && (
                <div className="text-sm font-semibold">
                  ${slot.base_price.toFixed(0)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link to={businessType ? `/${businessType}` : "/booking"}>
          View All Availability
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
}
