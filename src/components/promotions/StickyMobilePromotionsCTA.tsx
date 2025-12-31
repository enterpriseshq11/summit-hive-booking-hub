import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

interface StickyMobilePromotionsCTAProps {
  onOpenOffers: () => void;
}

export function StickyMobilePromotionsCTA({ onOpenOffers }: StickyMobilePromotionsCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setIsVisible(scrollPercent > 0.3);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-md border-t border-border/50 md:hidden"
        >
          <Button
            onClick={onOpenOffers}
            className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold"
            size="lg"
            data-event="promo_sticky_cta_click"
          >
            <Gift className="w-4 h-4 mr-2" />
            View Offers
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
