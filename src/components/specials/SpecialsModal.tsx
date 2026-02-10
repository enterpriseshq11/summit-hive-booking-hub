import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
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

  const handleAction = (special: Special) => {
    if (onSpecialAction) {
      onSpecialAction(special);
      onOpenChange(false);
      return;
    }

    // Build destination with query params
    const route = special.destination_route || special.cta_link || "";
    if (!route) {
      onOpenChange(false);
      return;
    }

    const separator = route.includes("?") ? "&" : "?";
    let fullRoute = route;

    if (special.action_type === "apply_promo" && special.promo_code) {
      fullRoute = `${route}${separator}promo=${encodeURIComponent(special.promo_code)}&specialId=${special.id}&specialTitle=${encodeURIComponent(special.title)}`;
      // Also store in sessionStorage for checkout auto-apply
      sessionStorage.setItem("az_promo_code", special.promo_code);
      sessionStorage.setItem("az_promo_special_id", special.id);
    } else {
      fullRoute = `${route}${separator}specialId=${special.id}&specialTitle=${encodeURIComponent(special.title)}`;
    }

    onOpenChange(false);
    navigate(fullRoute);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <div className="flex gap-1 flex-shrink-0">
                  {special.badge && (
                    <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                      {special.badge}
                    </Badge>
                  )}
                  {special.promo_code && (
                    <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                      <Tag className="h-3 w-3 mr-1" />
                      {special.promo_code}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{special.description}</p>
              {special.terms && (
                <p className="text-xs text-muted-foreground italic">{special.terms}</p>
              )}
              <Button
                size="sm"
                onClick={() => handleAction(special)}
                className="bg-accent hover:bg-accent/90 text-primary font-semibold"
              >
                {special.cta_label}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}