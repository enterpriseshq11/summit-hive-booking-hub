import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Gift, Dumbbell, Sparkles, Building, CreditCard, Trophy } from "lucide-react";

interface PrizeGridProps {
  segments: any[];
  isVip?: boolean;
}

const PRIZE_ICONS: Record<string, any> = {
  "personal training": Dumbbell,
  "massage": Sparkles,
  "coworking": Building,
  "credit": CreditCard,
  "giveaway": Trophy,
  "default": Gift,
};

function getPrizeIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(PRIZE_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return PRIZE_ICONS.default;
}

export function PrizeGrid({ segments, isVip }: PrizeGridProps) {
  const publicPrizes = segments.filter(s => s.prizes?.access_level === "public");
  const vipPrizes = segments.filter(s => s.prizes?.access_level === "vip");

  return (
    <div className="space-y-8">
      {/* Public Prizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Available to Everyone
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicPrizes.map((seg) => {
            const prize = seg.prizes;
            const Icon = getPrizeIcon(prize?.name || "");
            
            return (
              <Card 
                key={seg.segment_index} 
                className="p-4 hover:border-primary/50 transition-colors"
                data-event="promo_card_view"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{prize?.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {prize?.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* VIP Prizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          VIP Exclusive
          <Badge variant="outline" className="ml-2 border-primary/50 text-primary">
            Unlock for $2.99/mo
          </Badge>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vipPrizes.map((seg) => {
            const prize = seg.prizes;
            const Icon = getPrizeIcon(prize?.name || "");
            const isLocked = !isVip;
            
            return (
              <Card 
                key={seg.segment_index} 
                className={`p-4 relative overflow-hidden ${
                  isLocked 
                    ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" 
                    : "border-primary hover:shadow-lg hover:shadow-primary/20"
                }`}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Lock className="w-3 h-3 mr-1" />
                      VIP ONLY
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isLocked ? "bg-primary/5" : "bg-primary/20"}`}>
                    <Icon className={`w-5 h-5 ${isLocked ? "text-primary/50" : "text-primary"}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${isLocked ? "text-muted-foreground" : ""}`}>
                      {prize?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {prize?.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
