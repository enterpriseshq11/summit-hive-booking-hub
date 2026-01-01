import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Crown } from "lucide-react";

interface VipLockedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

export function VipLockedModal({ open, onOpenChange, onUpgrade }: VipLockedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Lock className="w-5 h-5" />
            You landed on a VIP prize 🔒
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            VIP unlocks the 3 biggest prizes on the wheel + extra spins every day.
          </p>

          <div className="p-4 bg-primary/10 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">VIP Benefits</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                2 spins per day (vs 1 for free)
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                Access to 3 exclusive high-value prizes
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                10x giveaway entries on mega prize
              </li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => {
                onOpenChange(false);
                onUpgrade();
              }}
              data-event="vip_checkout_started"
            >
              Unlock VIP — $2.99/month
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
