import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronUp } from "lucide-react";

interface StickyBookingBarProps {
  selectedBusiness?: string;
  selectedDate?: string;
  onSearchClick: () => void;
  heroRef: React.RefObject<HTMLElement>;
}

export function StickyBookingBar({
  selectedBusiness,
  selectedDate,
  onSearchClick,
  heroRef,
}: StickyBookingBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setIsVisible(heroBottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroRef]);

  if (!isVisible) return null;

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div 
      className="fixed top-16 left-0 right-0 z-40 bg-primary/95 backdrop-blur-sm border-b border-accent/20 shadow-lg transform transition-transform duration-300"
      role="region"
      aria-label="Quick booking bar"
    >
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedBusiness && (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 shrink-0">
                {selectedBusiness}
              </Badge>
            )}
            {formattedDate && (
              <span className="text-sm text-primary-foreground/70 truncate">
                {formattedDate}
              </span>
            )}
            {!selectedBusiness && !formattedDate && (
              <span className="text-sm text-primary-foreground/60">
                Select a service and date to search
              </span>
            )}
          </div>
          <Button
            onClick={onSearchClick}
            size="sm"
            className="bg-accent hover:bg-accent/90 text-primary font-semibold shrink-0"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
            <ChevronUp className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
