import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

interface StickyMobileGiftCardCTAProps {
  onBuyClick: () => void;
  selectedAmount?: number | null;
}

export function StickyMobileGiftCardCTA({ onBuyClick, selectedAmount }: StickyMobileGiftCardCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercentage > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-sm border-t border-border p-4 animate-slide-in-bottom">
      <Button
        className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold h-12 gap-2"
        onClick={onBuyClick}
        data-event="giftcard_sticky_cta_click"
      >
        <Gift className="h-5 w-5" />
        {selectedAmount ? `Buy $${selectedAmount} Gift Card` : "Buy Gift Card"}
      </Button>
    </div>
  );
}
