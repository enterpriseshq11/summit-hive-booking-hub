import { useState, useEffect } from "react";
import { AlertCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReleaseSlotHold } from "@/hooks/useAvailability";

interface SlotHoldBannerProps {
  holdId: string;
  expiresAt: string;
  resourceName?: string;
  onExpire?: () => void;
  onRelease?: () => void;
}

export function SlotHoldBanner({
  holdId,
  expiresAt,
  resourceName,
  onExpire,
  onRelease,
}: SlotHoldBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const releaseHold = useReleaseSlotHold();

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining <= 0 && !isExpired) {
        setIsExpired(true);
        onExpire?.();
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isExpired, onExpire]);

  const handleRelease = async () => {
    try {
      await releaseHold.mutateAsync(holdId);
      onRelease?.();
    } catch (error) {
      console.error("Failed to release hold:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isExpired) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">Your hold has expired</p>
            <p className="text-sm text-muted-foreground">
              This slot may no longer be available. Please select a new time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isUrgent = timeRemaining < 120; // Less than 2 minutes

  return (
    <div
      className={`rounded-lg p-4 ${
        isUrgent
          ? "bg-warning/10 border border-warning/30"
          : "bg-primary/5 border border-primary/20"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center h-10 w-10 rounded-full ${
              isUrgent ? "bg-warning/20" : "bg-primary/10"
            }`}
          >
            <Clock
              className={`h-5 w-5 ${isUrgent ? "text-warning animate-pulse" : "text-primary"}`}
            />
          </div>
          <div>
            <p className="font-medium">
              Reserved for you for{" "}
              <span className={`font-bold ${isUrgent ? "text-warning" : "text-primary"}`}>
                {formatTime(timeRemaining)}
              </span>
            </p>
            {resourceName && (
              <p className="text-sm text-muted-foreground">{resourceName}</p>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRelease}
          disabled={releaseHold.isPending}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Release hold</span>
        </Button>
      </div>

      {isUrgent && (
        <p className="text-sm text-muted-foreground mt-2 ml-[52px]">
          Complete your booking soon to keep this time slot.
        </p>
      )}
    </div>
  );
}
