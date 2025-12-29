import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowRight, AlertCircle, Zap } from "lucide-react";
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
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Zap className="h-4 w-4" />
          {title}
        </div>
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !slots || slots.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Zap className="h-4 w-4" />
          {title}
        </div>
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-border rounded-lg bg-muted/10">
          <Clock className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">
            Fully booked today
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            More times available tomorrow
          </p>
        </div>
      </div>
    );
  }

  const displaySlots = slots.slice(0, limit);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {title}
        </div>
        <Badge variant="outline" className="text-xs text-accent border-accent/30">
          {slots.length}+ available
        </Badge>
      </div>
      
      <div className="space-y-2">
        {displaySlots.map((slot, index) => {
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
