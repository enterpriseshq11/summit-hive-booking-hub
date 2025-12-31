import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Users, Gift, FileText, ArrowRight, Sparkles } from "lucide-react";
import type { Promotion } from "@/hooks/usePromotions";

interface PromotionDetailModalProps {
  promotion: Promotion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartOffer: (promotion: Promotion) => void;
}

export function PromotionDetailModal({
  promotion,
  open,
  onOpenChange,
  onStartOffer,
}: PromotionDetailModalProps) {
  if (!promotion) return null;

  const isExpired = promotion.status === "expired";
  const benefits = Array.isArray(promotion.benefits) ? promotion.benefits : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/50"
        data-event={`promo_modal_view_${promotion.slug}`}
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {promotion.title}
            </DialogTitle>
            {promotion.badge && (
              <Badge 
                variant="outline" 
                className="border-gold/50 text-gold bg-gold/10 text-xs shrink-0"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {promotion.badge}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-muted-foreground">
            {promotion.long_description || promotion.short_description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Who Qualifies */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <Users className="w-5 h-5" />
              <h4 className="font-semibold">Who Qualifies</h4>
            </div>
            <div className="pl-7 space-y-2 text-sm text-muted-foreground">
              {promotion.eligibility_rules && Object.keys(promotion.eligibility_rules).length > 0 ? (
                <ul className="space-y-1">
                  {(promotion.eligibility_rules as Record<string, unknown>).requires_membership && (
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      Active membership required
                    </li>
                  )}
                  {(promotion.eligibility_rules as Record<string, unknown>).new_members_only && (
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      New members only (first 30 days)
                    </li>
                  )}
                  {(promotion.eligibility_rules as Record<string, unknown>).corporate_only && (
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      Corporate accounts only
                    </li>
                  )}
                  {(promotion.eligibility_rules as Record<string, unknown>).booking_required && (
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      Advance booking required
                    </li>
                  )}
                </ul>
              ) : (
                <p>Open to all members and guests.</p>
              )}
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
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <Separator className="bg-border/50" />

          {/* Fine Print */}
          {promotion.limits_fine_print && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-gold">
                <FileText className="w-5 h-5" />
                <h4 className="font-semibold">Fine Print</h4>
              </div>
              <p className="pl-7 text-sm text-muted-foreground">
                {promotion.limits_fine_print}
              </p>
            </section>
          )}

          {/* CTA */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={() => onStartOffer(promotion)}
              disabled={isExpired}
              className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold"
              size="lg"
              data-event={`promo_cta_${promotion.slug}`}
            >
              {isExpired ? "No Longer Available" : promotion.primary_cta_label}
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
