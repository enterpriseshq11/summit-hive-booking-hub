import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, Filter, Clock, CalendarX, CalendarOff } from "lucide-react";

interface AvailabilityHelpModalProps {
  onResetFilters?: () => void;
  triggerClassName?: string;
}

export function AvailabilityHelpModal({ 
  onResetFilters,
  triggerClassName,
}: AvailabilityHelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onResetFilters?.();
    setIsOpen(false);
  };

  const reasons = [
    {
      icon: Filter,
      title: "Missing selection",
      description: "Make sure you've selected both a service and a date before searching.",
    },
    {
      icon: CalendarOff,
      title: "No availability",
      description: "All slots may be booked for this date. Try a different day or join the waitlist.",
    },
    {
      icon: CalendarX,
      title: "Date out of range",
      description: "Bookings may only be available within a certain advance window. Check a closer date.",
    },
    {
      icon: Clock,
      title: "Business closed",
      description: "Some services are only available during specific hours or may be closed on certain days.",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors ${triggerClassName}`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Why can't I see times?</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Why can't I see available times?</DialogTitle>
          <DialogDescription>
            There are a few reasons why slots might not appear:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {reasons.map((reason, index) => (
            <div key={index} className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <reason.icon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">{reason.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
          <Button
            onClick={handleReset}
            className="flex-1 bg-accent hover:bg-accent/90 text-primary"
          >
            Reset Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
