import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  ChevronDown,
  ChevronUp,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUserPromotions, type UserPromotion, useClaimPromotion } from "@/hooks/useUserPromotions";
import { usePromotions, type Promotion } from "@/hooks/usePromotions";

interface PromotionItemProps {
  userPromotion?: UserPromotion;
  promotion: Promotion & { type?: string; progress_target?: number | null };
  onClaim?: (promotionId: string) => void;
  isClaiming?: boolean;
}

function PromotionItem({ userPromotion, promotion, onClaim, isClaiming }: PromotionItemProps) {
  const status = userPromotion?.status || "locked";
  const progress = userPromotion?.progress || 0;
  const progressTarget = promotion.progress_target || 0;
  const progressPercent = progressTarget > 0 ? Math.min((progress / progressTarget) * 100, 100) : 0;

  const statusConfig = {
    locked: { icon: Lock, color: "text-muted-foreground", bg: "bg-muted/50" },
    in_progress: { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/20" },
    eligible: { icon: Sparkles, color: "text-gold", bg: "bg-gold/20" },
    active: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" },
    claimed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" },
    expired: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/50" },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-gold/30 transition-colors">
      <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
        <StatusIcon className={`w-5 h-5 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-foreground truncate">{promotion.title}</h4>
          <Badge 
            variant="outline" 
            className={`shrink-0 text-xs capitalize ${
              status === "active" || status === "claimed" 
                ? "border-green-500/50 text-green-400" 
                : status === "eligible"
                ? "border-gold/50 text-gold"
                : "border-border text-muted-foreground"
            }`}
          >
            {status.replace("_", " ")}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {promotion.short_description}
        </p>

        {/* Progress bar for in-progress promotions */}
        {status === "in_progress" && progressTarget > 0 && (
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-gold font-medium">{progress} / {progressTarget}</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Expiration info */}
        {userPromotion?.expires_at && (
          <p className="text-xs text-muted-foreground">
            Expires: {new Date(userPromotion.expires_at).toLocaleDateString()}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          {status === "eligible" && onClaim && (
            <Button
              size="sm"
              onClick={() => onClaim(promotion.id)}
              disabled={isClaiming}
              className="bg-gold hover:bg-gold/90 text-primary-foreground"
            >
              Apply Benefits
            </Button>
          )}
          {status === "in_progress" && (
            <Button size="sm" variant="outline" asChild className="border-gold/30 text-gold hover:bg-gold/10">
              <Link to={`/promotions?view=${promotion.slug}`}>
                Continue
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          )}
          {(status === "active" || status === "claimed") && (
            <Button size="sm" variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <Link to={`/promotions?view=${promotion.slug}`}>
                View Details
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AccountPromotionsDashboard() {
  const { data: userPromotions = [], isLoading: loadingUserPromos } = useUserPromotions();
  const { data: allPromotions = [], isLoading: loadingPromos } = usePromotions();
  const claimPromotion = useClaimPromotion();
  const [expiredOpen, setExpiredOpen] = useState(false);

  const isLoading = loadingUserPromos || loadingPromos;

  // Categorize user promotions
  const activePromotions = userPromotions.filter((up) => 
    up.status === "active" || up.status === "claimed"
  );
  const inProgressPromotions = userPromotions.filter((up) => 
    up.status === "in_progress"
  );
  const eligiblePromotions = userPromotions.filter((up) => 
    up.status === "eligible"
  );
  const expiredPromotions = userPromotions.filter((up) => 
    up.status === "expired"
  );

  // Get available promotions user hasn't started yet
  const userPromoIds = new Set(userPromotions.map((up) => up.promotion_id));
  const availablePromotions = allPromotions.filter(
    (p) => !userPromoIds.has(p.id) && p.status === "active"
  );

  const handleClaim = (promotionId: string) => {
    claimPromotion.mutate(promotionId);
  };

  const getPromotionDetails = (up: UserPromotion): Promotion & { type?: string; progress_target?: number | null } => {
    const promo = allPromotions.find((p) => p.id === up.promotion_id);
    return promo as Promotion & { type?: string; progress_target?: number | null } || {
      id: up.promotion_id,
      title: up.promotions?.title || "Unknown Promotion",
      slug: up.promotions?.slug || "",
      category: (up.promotions?.category || "signature") as "signature" | "monthly" | "vault",
      status: "active" as const,
      short_description: up.promotions?.short_description || "",
      benefits: up.promotions?.benefits as string[] || [],
      tags: [],
      sort_order: 0,
      badge: null,
      primary_cta_label: up.promotions?.primary_cta_label || "View Details",
      primary_cta_action: "open_modal" as const,
      primary_cta_target: null,
      start_date: null,
      end_date: null,
      long_description: null,
      eligibility_rules: {},
      limits_fine_print: null,
      created_at: "",
      updated_at: "",
      type: up.promotions?.type,
      progress_target: up.promotions?.progress_target,
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const hasPromotions = userPromotions.length > 0 || availablePromotions.length > 0;

  return (
    <div className="space-y-6">
      {/* Active Promotions */}
      {activePromotions.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Active Promotions
            </CardTitle>
            <CardDescription>Benefits currently applied to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activePromotions.map((up) => (
              <PromotionItem
                key={up.id}
                userPromotion={up}
                promotion={getPromotionDetails(up)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* In Progress */}
      {inProgressPromotions.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Progress-Based Offers
            </CardTitle>
            <CardDescription>Complete requirements to unlock benefits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressPromotions.map((up) => (
              <PromotionItem
                key={up.id}
                userPromotion={up}
                promotion={getPromotionDetails(up)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Eligible but Unclaimed */}
      {eligiblePromotions.length > 0 && (
        <Card className="bg-card border-gold/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              Ready to Claim
            </CardTitle>
            <CardDescription>You're eligible for these benefits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {eligiblePromotions.map((up) => (
              <PromotionItem
                key={up.id}
                userPromotion={up}
                promotion={getPromotionDetails(up)}
                onClaim={handleClaim}
                isClaiming={claimPromotion.isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Promotions */}
      {availablePromotions.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-foreground">Discover More</CardTitle>
            <CardDescription>Promotions you haven't started yet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {availablePromotions.slice(0, 3).map((promo) => (
                <Link
                  key={promo.id}
                  to={`/promotions?view=${promo.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-gold/30 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-foreground group-hover:text-gold transition-colors">
                      {promo.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{promo.badge || promo.category}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            {availablePromotions.length > 3 && (
              <Button variant="ghost" asChild className="w-full mt-4 text-gold hover:text-gold/80">
                <Link to="/promotions">
                  View All Promotions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expired (Collapsed) */}
      {expiredPromotions.length > 0 && (
        <Collapsible open={expiredOpen} onOpenChange={setExpiredOpen}>
          <Card className="bg-card border-border">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Expired ({expiredPromotions.length})
                    </CardTitle>
                  </div>
                  {expiredOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 pt-0">
                {expiredPromotions.map((up) => (
                  <PromotionItem
                    key={up.id}
                    userPromotion={up}
                    promotion={getPromotionDetails(up)}
                  />
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Empty State */}
      {!hasPromotions && (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <p className="text-muted-foreground mb-2">No promotions yet</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Explore our member exclusives to unlock premium bundles and benefits across all A-Z businesses.
            </p>
            <Button asChild className="bg-gold hover:bg-gold/90 text-primary-foreground">
              <Link to="/promotions">
                Explore Promotions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
