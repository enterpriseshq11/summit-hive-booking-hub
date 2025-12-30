import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

interface StickyMobileHiveCTAProps {
  onRequestClick: () => void;
  phoneNumber?: string;
}

export function StickyMobileHiveCTA({ onRequestClick, phoneNumber = "4195551234" }: StickyMobileHiveCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const triggerPoint = windowHeight * 0.3;
      setIsVisible(scrollPosition > triggerPoint);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-primary/95 backdrop-blur-sm border-t border-accent/20 p-3 animate-in slide-in-from-bottom duration-300">
      <div className="flex gap-2">
        <Button
          onClick={onRequestClick}
          className="flex-1 bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold"
          data-event="hive_sticky_request_click"
        >
          Request Workspace
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-accent/50 text-accent hover:bg-accent/10"
          asChild
        >
          <a href={`tel:${phoneNumber}`} aria-label="Call us">
            <Phone className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
