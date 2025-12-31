import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePromotions, type Promotion } from "@/hooks/usePromotions";

interface ContextualPromotionBannerProps {
  context: "spa" | "fitness" | "coworking" | "summit" | "booking_confirmation";
  bookingType?: string;
  onDismiss?: () => void;
  className?: string;
}

const CONTEXTUAL_MESSAGES: Record<string, () => string> = {
  spa: () => "Members who book 3 spa sessions unlock complimentary fitness access.",
  fitness: () => "Office members receive 2 complimentary fitness memberships.",
  coworking: () => "Office members unlock exclusive spa and fitness benefits.",
  summit: () => "Event bookings can be bundled with spa packages.",
  booking_confirmation: () => "You're 2 visits away from unlocking new benefits.",
};

export function ContextualPromotionBanner({
  context,
  bookingType,
  onDismiss,
  className = "",
}: ContextualPromotionBannerProps) {
  const navigate = useNavigate();
  const { data: promotions = [] } = usePromotions({ status: "active" });
  const [dismissed, setDismissed] = useState(false);
  const [relevantPromo, setRelevantPromo] = useState<Promotion | null>(null);

  useEffect(() => {
    // Find a relevant promotion based on context
    const promo = promotions.find((p) => {
      const tags = p.tags.map((t) => t.toLowerCase());
      return tags.includes(context) || 
             (context === "booking_confirmation" && tags.includes(bookingType?.toLowerCase() || ""));
    });
    setRelevantPromo(promo || promotions[0] || null);
  }, [promotions, context, bookingType]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleViewPromotion = () => {
    if (relevantPromo) {
      navigate(`/promotions?view=${relevantPromo.slug}`);
    } else {
      navigate("/promotions");
    }
  };

  if (dismissed || !relevantPromo) return null;

  const message = CONTEXTUAL_MESSAGES[context]?.() || 
    "Discover member-exclusive bundles and benefits.";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 via-card to-gold/5 p-4 ${className}`}
        data-event={`contextual_promo_view_${context}`}
      >
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                View all member exclusives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleViewPromotion}
              className="bg-gold hover:bg-gold/90 text-primary-foreground"
              data-event={`contextual_promo_click_${context}`}
            >
              View Promotion
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDismiss}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
