import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
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
    } else if (special.cta_link) {
      navigate(special.cta_link);
    }
    onOpenChange(false);
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
                {special.badge && (
                  <Badge className="bg-accent/20 text-accent border-accent/30 text-xs flex-shrink-0">
                    {special.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{special.description}</p>
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
