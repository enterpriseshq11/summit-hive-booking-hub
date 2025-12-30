import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyMobileSummitCTAProps {
  onRequestClick: () => void;
}

export function StickyMobileSummitCTA({ onRequestClick }: StickyMobileSummitCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercent > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-primary/95 backdrop-blur-sm border-t border-accent/20",
        "transform transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
          <Clock className="h-4 w-4 text-accent" />
          <span>24h response</span>
        </div>
        <Button 
          onClick={onRequestClick}
          className="bg-accent hover:bg-accent/90 text-primary font-semibold shadow-gold"
          data-event="summit_sticky_cta_click"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Request Event
        </Button>
      </div>
    </div>
  );
}
