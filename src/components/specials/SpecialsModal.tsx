import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SpecialClaimForm } from "./SpecialClaimForm";
import type { Special } from "@/hooks/useSpecials";

interface SpecialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  specials: Special[];
  onSpecialAction?: (special: Special) => void;
}

export function SpecialsModal({ open, onOpenChange, title, specials, onSpecialAction }: SpecialsModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleAction = (special: Special) => {
    const actionType = special.action_type || "route_only";

    // Promo code flow: store code, navigate, show toast
    if (actionType === "apply_promo" && special.promo_code) {
      sessionStorage.setItem("az_promo_code", special.promo_code);
      toast({ title: `Promo code ${special.promo_code} applied!`, description: "It will be auto-filled at checkout." });
      if (special.cta_link) navigate(special.cta_link);
      onOpenChange(false);
      return;
    }

    // Request form flow: show inline form
    if (actionType === "request_form") {
      setClaimingId(special.id);
      return;
    }

    // Route flow (default / route_only): navigate or call custom handler
    if (onSpecialAction) {
      onSpecialAction(special);
    } else if (special.cta_link) {
      navigate(special.cta_link);
    }
    onOpenChange(false);
  };

  // Reset claiming state when modal closes
  const handleOpenChange = (v: boolean) => {
    if (!v) setClaimingId(null);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-accent" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {specials.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No specials at this time.</p>
          ) : specials.map((special) => (
            <div
              key={special.id}
              className="rounded-lg border border-accent/20 bg-accent/5 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">{special.title}</h3>
                {special.badge && (
                  <Badge className="bg-accent/20 text-accent border-accent/30 text-xs flex-shrink-0">
                    {special.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{special.description}</p>

              {claimingId === special.id ? (
                <SpecialClaimForm specialId={special.id} specialTitle={special.title} businessUnit={special.business_unit} />
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleAction(special)}
                  className="bg-accent hover:bg-accent/90 text-primary font-semibold"
                >
                  {special.cta_label}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
