import { Sparkles, Crown, Ticket, Zap, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VipBenefitsCardProps {
  isVip: boolean;
  onUpgradeClick: () => void;
}

export function VipBenefitsCard({ isVip, onUpgradeClick }: VipBenefitsCardProps) {
  if (isVip) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/20 via-yellow-500/10 to-primary/20 border-primary h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-bold text-white text-lg">VIP Member</h3>
            <p className="text-sm text-primary">All benefits active!</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li className="flex items-center gap-2"><Ticket className="w-4 h-4 text-primary" /> 2 spins per day</li>
          <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> 2x entry multiplier</li>
          <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> VIP-only prizes</li>
        </ul>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-primary/30 relative overflow-hidden h-full flex flex-col">
      <Badge className="absolute top-3 right-3 bg-[hsl(45,70%,50%)] hover:bg-[hsl(45,70%,45%)] text-black font-semibold border-0 cursor-pointer" onClick={onUpgradeClick}>
        <Lock className="w-3 h-3 mr-1" />
        UNLOCK
      </Badge>
      
      <div className="flex items-center gap-3 mb-4">
        <Crown className="w-8 h-8 text-primary/70" />
        <div>
          <h3 className="font-bold text-white text-lg">VIP Benefits</h3>
          <p className="text-sm text-muted-foreground">$2.99/month</p>
        </div>
      </div>
      
      <ul className="space-y-2 text-sm text-zinc-400 mb-4 flex-1">
        <li className="flex items-center gap-2"><Ticket className="w-4 h-4 text-primary/60" /> 2 spins per day (vs 1)</li>
        <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary/60" /> 2x entry multiplier</li>
        <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary/60" /> Unlock VIP-only prizes</li>
        <li className="flex items-center gap-2"><Crown className="w-4 h-4 text-primary/60" /> Priority winner notifications</li>
      </ul>
      
      <Button 
        className="w-full bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-400 text-black font-bold"
        onClick={onUpgradeClick}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Become VIP — $2.99/mo
      </Button>
    </Card>
  );
}
