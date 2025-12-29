import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { useNextAvailable } from "@/hooks/useAvailability";
import type { BusinessType } from "@/types";

interface NextAvailableWidgetProps {
  businessType?: BusinessType;
  title?: string;
  showPrice?: boolean;
  limit?: number;
  onSlotSelect?: (slot: any) => void;
  lookAheadDays?: number;
}

export function NextAvailableWidget({
  businessType,
  title = "Next Available",
  showPrice = true,
  limit = 3,
  onSlotSelect,
  lookAheadDays = 14,
}: NextAvailableWidgetProps) {
  const { data: slots, isLoading, error, refetch, isFetching } = useNextAvailable(businessType);

  // STATE 1: Loading
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Finding next openings…
        </div>
        {Array.from({ length: Math.min(limit, 2) }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // STATE 2: Error
  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          {title}
        </div>
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-border rounded-lg bg-muted/10">
          <AlertCircle className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">
            Unable to load availability
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-2 text-accent hover:text-accent hover:bg-accent/10"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // STATE 3: Fully Booked (no slots)
  if (!slots || slots.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          {title}
        </div>
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-border rounded-lg bg-muted/10">
          <Calendar className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">
            No openings in the next {lookAheadDays} days
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Join the waitlist to be notified
          </p>
        </div>
      </div>
    );
  }

  // STATE 4: Available slots
  const displaySlots = slots.slice(0, limit);
  const slotsCount = slots.length;
  const showFewSlots = slotsCount < 4;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          {title}
        </div>
        <Badge variant="outline" className="text-xs text-accent border-accent/30 bg-transparent">
          {showFewSlots ? "Few Slots" : `${slotsCount}+ available`}
        </Badge>
      </div>
      
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
              className="w-full flex items-center justify-between p-3 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-sm font-medium group-hover:text-primary transition-colors">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{timeLabel}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showPrice && slot.base_price > 0 && (
                  <Badge variant="secondary" className="font-semibold">
                    ${slot.base_price.toFixed(0)}
                  </Badge>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
