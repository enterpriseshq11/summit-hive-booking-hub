import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Users, Gift, FileText, ArrowRight, Sparkles, Clock, AlertCircle, Building2, Dumbbell, Star } from "lucide-react";
import type { PromotionData, BusinessType } from "@/data/promotionsData";

interface PromotionDataDetailModalProps {
  promotion: PromotionData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimOffer: (promotion: PromotionData) => void;
}

const BUSINESS_ICONS: Record<BusinessType, React.ComponentType<{ className?: string }>> = {
  summit: Star,
  coworking: Building2,
  spa: Sparkles,
  fitness: Dumbbell,
  giftcards: Gift,
};

const BUSINESS_LABELS: Record<BusinessType, string> = {
  summit: "Summit Events",
  coworking: "Coworking / Office",
  spa: "Spa & Wellness",
  fitness: "Fitness Center",
  giftcards: "Gift Cards",
};

export function PromotionDataDetailModal({
  promotion,
  open,
  onOpenChange,
  onClaimOffer,
}: PromotionDataDetailModalProps) {
  if (!promotion) return null;

  const isExpired = promotion.end_date && new Date(promotion.end_date) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/50"
        data-event="promo_detail_open"
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {promotion.title}
            </DialogTitle>
            <div className="flex gap-2 shrink-0">
              {promotion.badge && (
                <Badge 
                  variant="outline" 
                  className="border-gold/50 text-gold bg-gold/10 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {promotion.badge}
                </Badge>
              )}
              {promotion.is_limited_time && (
                <Badge 
                  variant="outline" 
                  className="border-warning/50 text-warning bg-warning/10 text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Limited
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-muted-foreground">
            {promotion.long_description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Businesses Included */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <Building2 className="w-5 h-5" />
              <h4 className="font-semibold">Businesses Included</h4>
            </div>
            <div className="pl-7 flex flex-wrap gap-3">
              {promotion.businesses_included.map((business) => {
                const Icon = BUSINESS_ICONS[business];
                return (
                  <div 
                    key={business}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/10 border border-gold/20"
                  >
                    <Icon className="w-4 h-4 text-gold" />
                    <span className="text-sm text-foreground">{BUSINESS_LABELS[business]}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <Separator className="bg-border/50" />

          {/* What You Get */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <Gift className="w-5 h-5" />
              <h4 className="font-semibold">What You Get</h4>
            </div>
            <ul className="pl-7 space-y-2">
              {promotion.value_stack.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <Separator className="bg-border/50" />

          {/* Who Qualifies */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <Users className="w-5 h-5" />
              <h4 className="font-semibold">Who Qualifies</h4>
            </div>
            <div className="pl-7">
              <p className="text-sm text-muted-foreground mb-2">
                {promotion.eligibility_description}
              </p>
              <div className="flex flex-wrap gap-2">
                {promotion.eligibility.map((elig) => (
                  <Badge 
                    key={elig}
                    variant="outline" 
                    className="border-border/50 text-muted-foreground text-xs capitalize"
                  >
                    {elig.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          <Separator className="bg-border/50" />

          {/* How to Redeem */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <ArrowRight className="w-5 h-5" />
              <h4 className="font-semibold">How to Redeem</h4>
            </div>
            <div className="pl-7">
              <p className="text-sm text-muted-foreground">
                {promotion.redemption_instructions}
              </p>
              <Badge 
                variant="outline" 
                className="mt-3 border-gold/30 text-gold/80 text-xs capitalize"
              >
                {promotion.redemption_type.replace("_", " ")}
              </Badge>
            </div>
          </section>

          {/* Expiration */}
          {(promotion.start_date || promotion.end_date) && (
            <>
              <Separator className="bg-border/50" />
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-gold">
                  <Clock className="w-5 h-5" />
                  <h4 className="font-semibold">Availability</h4>
                </div>
                <div className="pl-7 text-sm text-muted-foreground">
                  {promotion.start_date && (
                    <p>Starts: {new Date(promotion.start_date).toLocaleDateString()}</p>
                  )}
                  {promotion.end_date && (
                    <p>Expires: {new Date(promotion.end_date).toLocaleDateString()}</p>
                  )}
                </div>
              </section>
            </>
          )}

          <Separator className="bg-border/50" />

          {/* Terms & Fine Print */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <FileText className="w-5 h-5" />
              <h4 className="font-semibold">Terms & Conditions</h4>
            </div>
            <div className="pl-7 space-y-3 text-sm text-muted-foreground">
              <p>{promotion.terms_full}</p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs">{promotion.disclaimer}</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={() => onClaimOffer(promotion)}
              disabled={isExpired}
              className="w-full bg-gold hover:bg-gold/90 text-primary font-semibold"
              size="lg"
              data-event={`promo_cta_${promotion.id}`}
            >
              {isExpired ? "No Longer Available" : promotion.cta_label}
              {!isExpired && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We'll confirm details and next steps within 24 hours.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
