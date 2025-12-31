import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import type { PromotionData } from "@/data/promotionsData";
import { useSubmitPromotionLead } from "@/hooks/usePromotions";

interface PromotionClaimModalProps {
  promotion: PromotionData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOCATIONS = [
  { value: "downtown", label: "Downtown Location" },
  { value: "midtown", label: "Midtown Location" },
  { value: "uptown", label: "Uptown Location" },
  { value: "flexible", label: "Flexible / No Preference" },
];

const BUSINESS_OPTIONS = [
  { value: "summit", label: "Summit Events" },
  { value: "coworking", label: "Coworking / Office" },
  { value: "spa", label: "Spa & Wellness" },
  { value: "fitness", label: "Fitness Center" },
  { value: "undecided", label: "Not Sure Yet" },
];

export function PromotionClaimModal({ promotion, open, onOpenChange }: PromotionClaimModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    firstBusiness: "",
  });

  const submitLead = useSubmitPromotionLead();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promotion) return;

    try {
      await submitLead.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        offer_id: promotion.id,
        offer_title_snapshot: promotion.title,
        business_interest: formData.firstBusiness ? [formData.firstBusiness] : [],
        notes: `Preferred location: ${formData.location}`,
        preferred_contact_method: "email",
        lead_type: "promo_claim",
      });
      
      setStep("success");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setStep("form");
      setFormData({ name: "", email: "", phone: "", location: "", firstBusiness: "" });
    }, 300);
  };

  if (!promotion) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-lg bg-card border-border/50"
        data-event={step === "form" ? "promo_claim_open" : "promo_claim_success"}
      >
        {step === "form" ? (
          <>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                Claim: {promotion.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {promotion.redemption_instructions}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label htmlFor="claim-name">Full Name *</Label>
                <Input
                  id="claim-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your full name"
                  required
                  data-event="promo_claim_field_name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-email">Email Address *</Label>
                <Input
                  id="claim-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="you@example.com"
                  required
                  data-event="promo_claim_field_email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-phone">Phone Number (Optional)</Label>
                <Input
                  id="claim-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  data-event="promo_claim_field_phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-location">Preferred Location *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleInputChange("location", value)}
                  required
                >
                  <SelectTrigger id="claim-location" data-event="promo_claim_field_location">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-business">Which business do you want to use first? *</Label>
                <Select
                  value={formData.firstBusiness}
                  onValueChange={(value) => handleInputChange("firstBusiness", value)}
                  required
                >
                  <SelectTrigger id="claim-business" data-event="promo_claim_field_business">
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_OPTIONS.filter(opt => 
                      promotion.businesses_included.includes(opt.value as any) || opt.value === "undecided"
                    ).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitLead.isPending || !formData.name || !formData.email || !formData.location || !formData.firstBusiness}
                  className="w-full bg-gold hover:bg-gold/90 text-primary font-semibold"
                  size="lg"
                  data-event="promo_claim_submit"
                >
                  {submitLead.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      Claim This Offer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By claiming, you agree to receive communications about this offer.
              </p>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-gold" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Offer Claimed!</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We'll confirm your {promotion.title} benefits within 24 hours.
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-3">
              <h4 className="font-semibold text-foreground text-sm">What happens next:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold text-xs font-bold">1</span>
                  </span>
                  Check your email for confirmation
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold text-xs font-bold">2</span>
                  </span>
                  Our team will verify eligibility (if required)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold text-xs font-bold">3</span>
                  </span>
                  Benefits will be applied to your account
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gold text-xs font-bold">4</span>
                  </span>
                  Start enjoying your perks!
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleClose}
                className="w-full bg-gold hover:bg-gold/90 text-primary font-semibold"
              >
                Done
              </Button>
              <p className="text-xs text-muted-foreground">
                Questions? Contact us at <span className="text-gold">info@azenterprises.com</span>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
