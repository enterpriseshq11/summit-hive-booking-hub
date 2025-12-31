import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Dumbbell } from "lucide-react";

interface StickyMobileFitnessCTAProps {
  onJoinNow: () => void;
  phoneNumber?: string;
}

export function StickyMobileFitnessCTA({ 
  onJoinNow, 
  phoneNumber = "tel:+15551234567" 
}: StickyMobileFitnessCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = window.innerHeight * 0.3;
      setIsVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/95 backdrop-blur-md border-t border-border shadow-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            onClick={onJoinNow}
            className="flex-1 bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold"
            data-event="fitness_mobile_sticky_cta_click"
          >
            <Dumbbell className="h-4 w-4 mr-2" />
            Join Now
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
            className="border-accent/30 hover:border-accent hover:bg-accent/10"
          >
            <a href={phoneNumber} aria-label="Call us">
              <Phone className="h-4 w-4 text-accent" />
            </a>
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          No contracts • Cancel anytime
        </p>
      </div>
    </div>
  );
}
