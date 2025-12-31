import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Lock, CheckCircle, TrendingUp, Building2, Dumbbell, Heart, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Promotion } from "@/hooks/usePromotions";
import type { UserPromotion } from "@/hooks/useUserPromotions";
import { getPromotionUserStatus } from "@/hooks/useUserPromotions";

interface PromotionCardEnhancedProps {
  promotion: Promotion & { type?: string; progress_target?: number | null };
  userPromotion?: UserPromotion | null;
  onSelect: (promotion: Promotion) => void;
  isLoggedIn?: boolean;
}

const BUSINESS_ICONS: Record<string, React.ElementType> = {
  coworking: Building2,
  fitness: Dumbbell,
  spa: Heart,
  summit: Briefcase,
};

const STATUS_CONFIG = {
  locked: {
    badge: "Locked",
    badgeClass: "border-muted-foreground/50 text-muted-foreground bg-muted/50",
    ctaText: "Unlock by...",
  },
  in_progress: {
    badge: "In Progress",
    badgeClass: "border-blue-500/50 text-blue-400 bg-blue-500/20",
    ctaText: "Continue",
  },
  eligible: {
    badge: "Eligible",
    badgeClass: "border-gold/50 text-gold bg-gold/20",
    ctaText: "Apply Instantly",
  },
  active: {
    badge: "Active",
    badgeClass: "border-green-500/50 text-green-400 bg-green-500/20",
    ctaText: "View Benefits",
  },
  expired: {
    badge: "Expired",
    badgeClass: "border-muted-foreground/50 text-muted-foreground bg-muted/50",
    ctaText: "No longer available",
  },
  claimed: {
    badge: "Claimed",
    badgeClass: "border-green-500/50 text-green-400 bg-green-500/20",
    ctaText: "View Details",
  },
};

export function PromotionCardEnhanced({
  promotion,
  userPromotion,
  onSelect,
  isLoggedIn = false,
}: PromotionCardEnhancedProps) {
  const isExpired = promotion.status === "expired";
  const { status, isEligible, progress, progressPercent } = getPromotionUserStatus(
    userPromotion,
    promotion.progress_target || null
  );

  const displayStatus = isExpired ? "expired" : (isLoggedIn ? status : "locked");
  const statusConfig = STATUS_CONFIG[displayStatus];

  // Get involved business icons from tags
  const involvedBusinesses = promotion.tags
    .filter((tag) => ["coworking", "fitness", "spa", "summit"].includes(tag.toLowerCase()))
    .slice(0, 4);

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
        group relative overflow-hidden rounded-2xl border 
        ${displayStatus === "eligible" || displayStatus === "active" 
          ? "border-gold/50" 
          : "border-border/50"
        }
        bg-gradient-to-br from-card via-card to-card/80 p-6
        transition-all duration-300 cursor-pointer
        ${isExpired 
          ? "opacity-60 cursor-not-allowed" 
          : "hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10"
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background
      `}
      data-event={`promo_card_click_${promotion.slug}`}
      whileHover={!isExpired ? { y: -4 } : undefined}
    >
      {/* Left accent line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
        displayStatus === "active" || displayStatus === "claimed"
          ? "from-green-500 via-green-500/50 to-transparent"
          : displayStatus === "eligible"
          ? "from-gold via-gold/50 to-transparent"
          : "from-gold/50 via-gold/30 to-transparent"
      }`} />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-transparent" />
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {promotion.badge && !isLoggedIn && (
          <Badge 
            variant="outline" 
            className="border-gold/50 text-gold bg-gold/10 text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {promotion.badge}
          </Badge>
        )}
        
        {isLoggedIn && (
          <Badge variant="outline" className={`text-xs ${statusConfig.badgeClass}`}>
            {displayStatus === "locked" && <Lock className="w-3 h-3 mr-1" />}
            {displayStatus === "in_progress" && <TrendingUp className="w-3 h-3 mr-1" />}
            {(displayStatus === "active" || displayStatus === "claimed") && <CheckCircle className="w-3 h-3 mr-1" />}
            {statusConfig.badge}
          </Badge>
        )}
      </div>

      <div className="relative space-y-4">
        <h3 className="text-xl font-semibold text-foreground group-hover:text-gold transition-colors pr-28">
          {promotion.title}
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {promotion.short_description}
        </p>

        {/* Business Icons */}
        {involvedBusinesses.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Unlocks across:</span>
            <div className="flex gap-2">
              {involvedBusinesses.map((biz) => {
                const Icon = BUSINESS_ICONS[biz.toLowerCase()] || Building2;
                return (
                  <div 
                    key={biz}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      displayStatus === "locked" ? "bg-muted/50" : "bg-gold/20"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${
                      displayStatus === "locked" ? "text-muted-foreground" : "text-gold"
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress Bar (for volume-based promotions) */}
        {isLoggedIn && displayStatus === "in_progress" && promotion.progress_target && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-gold font-medium">
                {progress} of {promotion.progress_target}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {promotion.tags.filter(t => !involvedBusinesses.includes(t)).slice(0, 2).map((tag) => (
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
          <span className={`text-sm font-medium flex items-center gap-2 ${
            isExpired 
              ? "text-muted-foreground" 
              : displayStatus === "eligible" || displayStatus === "active"
              ? "text-gold"
              : "text-foreground"
          }`}>
            {isExpired 
              ? statusConfig.ctaText 
              : isLoggedIn 
              ? statusConfig.ctaText 
              : promotion.primary_cta_label
            }
            {!isExpired && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
