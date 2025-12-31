import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Promotion } from "@/hooks/usePromotions";

interface PromotionCardProps {
  promotion: Promotion;
  onSelect: (promotion: Promotion) => void;
}

export function PromotionCard({ promotion, onSelect }: PromotionCardProps) {
  const isExpired = promotion.status === "expired";

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
        transition-all duration-300 cursor-pointer
        ${isExpired ? "opacity-60 cursor-not-allowed" : "hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10"}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background
      `}
      data-event={`promo_card_click_${promotion.slug}`}
      whileHover={!isExpired ? { y: -4 } : undefined}
    >
      {/* Left accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold/50 to-transparent" />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-transparent" />
      </div>

      {/* Badge */}
      {promotion.badge && (
        <Badge 
          variant="outline" 
          className="absolute top-4 right-4 border-gold/50 text-gold bg-gold/10 text-xs"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {promotion.badge}
        </Badge>
      )}

      {/* Expired badge */}
      {isExpired && (
        <Badge 
          variant="outline" 
          className="absolute top-4 right-4 border-muted-foreground/50 text-muted-foreground bg-muted/50 text-xs"
        >
          Expired
        </Badge>
      )}

      <div className="relative space-y-4">
        <h3 className="text-xl font-semibold text-foreground group-hover:text-gold transition-colors pr-24">
          {promotion.title}
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {promotion.short_description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {promotion.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground capitalize"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between pt-2">
          <span className={`text-sm font-medium ${isExpired ? "text-muted-foreground" : "text-gold"} flex items-center gap-2`}>
            {isExpired ? "No longer available" : promotion.primary_cta_label}
            {!isExpired && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
