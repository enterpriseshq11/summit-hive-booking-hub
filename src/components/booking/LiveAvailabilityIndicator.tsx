import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveAvailabilityIndicatorProps {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function LiveAvailabilityIndicator({
  isLoading,
  isError,
  onRetry,
}: LiveAvailabilityIndicatorProps) {
  // Error state
  if (isError) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-destructive/20 rounded-full text-sm font-semibold text-destructive border border-destructive/30">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 border border-current"></span>
        </span>
        <span>Availability temporarily unavailable</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-6 px-2 text-xs hover:bg-destructive/20 text-destructive"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
        </span>
        <span>Checking live availability…</span>
      </div>
    );
  }

  // Success state
  return (
    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30">
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
      </span>
      <span>Live availability</span>
    </div>
  );
}
