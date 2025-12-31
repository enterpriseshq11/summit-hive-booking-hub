import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Building2, Dumbbell, Star, Clock, Check, Users, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PromotionData, BusinessType } from "@/data/promotionsData";

interface PromotionDataCardProps {
  promotion: PromotionData;
  onSelect: (promotion: PromotionData) => void;
}

// Business icons mapping
const BUSINESS_ICONS: Record<BusinessType, React.ComponentType<{ className?: string }>> = {
  summit: Star,
  coworking: Building2,
  spa: Sparkles,
  fitness: Dumbbell,
  giftcards: Gift,
};

const BUSINESS_LABELS: Record<BusinessType, string> = {
  summit: "Summit",
  coworking: "Office",
  spa: "Spa",
  fitness: "Fitness",
  giftcards: "Gift Cards",
};

export function PromotionDataCard({ promotion, onSelect }: PromotionDataCardProps) {
  const isExpired = promotion.end_date && new Date(promotion.end_date) < new Date();

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Open offer details: ${promotion.title}`}
      onClick={() => !isExpired && onSelect(promotion)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isExpired) onSelect(promotion);
        }
      }}
      className={`
        group relative overflow-hidden rounded-2xl border border-border/50 
        bg-gradient-to-br from-card via-card to-card/80 p-6
        transition-all duration-300 cursor-pointer h-full flex flex-col
        ${isExpired ? "opacity-60 cursor-not-allowed" : "hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10"}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background
      `}
      data-event={`promo_card_click_${promotion.id}`}
      whileHover={!isExpired ? { y: -4 } : undefined}
    >
      {/* Left accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold/50 to-transparent" />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-transparent" />
      </div>

      {/* Badge area */}
      <div className="flex items-start justify-between gap-2 mb-4" data-event="promo_card_view">
        <div className="flex flex-wrap gap-2">
          {promotion.badge && !isExpired && (
            <Badge 
              variant="outline" 
              className="border-gold/50 text-gold bg-gold/10 text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {promotion.badge}
            </Badge>
          )}
          {promotion.is_limited_time && !isExpired && (
            <Badge 
              variant="outline" 
              className="border-warning/50 text-warning bg-warning/10 text-xs"
            >
              <Clock className="w-3 h-3 mr-1" />
              Limited Time
            </Badge>
          )}
        </div>
        {isExpired && (
          <Badge 
            variant="outline" 
            className="border-muted-foreground/50 text-muted-foreground bg-muted/50 text-xs"
          >
            Expired
          </Badge>
        )}
      </div>

      <div className="relative flex-1 flex flex-col space-y-4">
        <h3 className="text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
          {promotion.title}
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {promotion.short_description}
        </p>

        {/* Value Stack - What You Get Preview */}
        {promotion.value_stack.length > 0 && (
          <div className="space-y-1.5">
            {promotion.value_stack.slice(0, 3).map((benefit, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
            {promotion.value_stack.length > 3 && (
              <p className="text-xs text-gold pl-6">+{promotion.value_stack.length - 3} more benefits</p>
            )}
          </div>
        )}

        {/* Cross-Business Icon Row */}
        {promotion.businesses_included.length > 0 && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-muted-foreground">Includes:</span>
            <div className="flex gap-2">
              {promotion.businesses_included.map((business) => {
                const Icon = BUSINESS_ICONS[business];
                if (!Icon) return null;
                return (
                  <div 
                    key={business}
                    className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center"
                    title={BUSINESS_LABELS[business]}
                  >
                    <Icon className="w-4 h-4 text-gold" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Eligibility Tags */}
        {promotion.eligibility.length > 0 && promotion.eligibility[0] !== "all" && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            {promotion.eligibility.map((elig) => (
              <span 
                key={elig}
                className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground capitalize"
              >
                {elig.replace("_", " ")}
              </span>
            ))}
          </div>
        )}

        {/* Terms short */}
        <p className="text-xs text-muted-foreground/70 mt-auto pt-2">
          {promotion.terms_short}
        </p>

        {/* CTA row */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
          <span className={`text-sm font-medium ${isExpired ? "text-muted-foreground" : "text-gold"} flex items-center gap-2`}>
            {isExpired ? "No longer available" : "View Offer Details"}
            {!isExpired && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
