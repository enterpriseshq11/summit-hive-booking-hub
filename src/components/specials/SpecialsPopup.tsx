import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SpecialsPopupProps {
  /** Unique key for sessionStorage (e.g., "spa" or "hive") */
  storageKey: string;
  headline: string;
  onViewSpecials: () => void;
  /** If no active specials, don't show the popup */
  hasSpecials?: boolean;
}

export function SpecialsPopup({ storageKey, headline, onViewSpecials, hasSpecials = true }: SpecialsPopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasSpecials) return;
    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, [storageKey, hasSpecials]);

  const dismiss = () => {
    setOpen(false);
  };

  const handleView = () => {
    setOpen(false);
    onViewSpecials();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <span className="text-lg">{headline}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleView}
            className="bg-accent hover:bg-accent/90 text-primary font-bold"
          >
            Yes, show me the specials
          </Button>
          <Button
            variant="ghost"
            onClick={dismiss}
            className="text-muted-foreground"
          >
            No thanks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
