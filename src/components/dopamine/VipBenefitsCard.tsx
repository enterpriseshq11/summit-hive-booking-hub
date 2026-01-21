import { Sparkles, Crown, Ticket, Zap, Lock, Shield, Bell, Gift, TrendingUp, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface VipBenefitsCardProps {
  isVip: boolean;
  onUpgradeClick: () => void;
}

const VIP_BENEFITS = [
  {
    icon: Ticket,
    title: "2 Spins Per Day",
    description: "Get double the daily spins compared to free users.",
  },
  {
    icon: Zap,
    title: "2x Entry Multiplier",
    description: "Every spin counts as two entries toward all giveaways.",
  },
  {
    icon: Gift,
    title: "VIP Only Prizes",
    description: "Access exclusive drawings not available to free members.",
  },
  {
    icon: Bell,
    title: "Priority Notifications",
    description: "VIPs are notified first when they win.",
  },
  {
    icon: TrendingUp,
    title: "VIP Odds Boost",
    description: "VIP entries are weighted higher in select drawings.",
  },
  {
    icon: Shield,
    title: "Streak Protection",
    description: "Miss one day per month without losing your streak.",
  },
];

const COMPARISON_DATA = [
  { feature: "Spins per day", free: "1", vip: "2" },
  { feature: "Entry power", free: "1x", vip: "2x" },
  { feature: "Exclusive prizes", free: false, vip: true },
  { feature: "Odds boost", free: false, vip: true },
];

export function VipBenefitsCard({ isVip, onUpgradeClick }: VipBenefitsCardProps) {
  if (isVip) {
    return (
      <Card className="p-5 bg-gradient-to-br from-primary/20 via-yellow-500/10 to-primary/20 border-primary h-full flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-full">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">VIP Active</h3>
            <p className="text-sm text-primary">All benefits unlocked!</p>
          </div>
          <Badge className="ml-auto bg-primary text-black font-bold">
            <Sparkles className="w-3 h-3 mr-1" />
            VIP
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 flex-1">
          {VIP_BENEFITS.slice(0, 4).map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
              <benefit.icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-zinc-300">{benefit.title}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-primary/30 text-center">
          <p className="text-xs text-zinc-400">Thank you for being a VIP member!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-primary/40 relative overflow-hidden h-full flex flex-col">
      {/* Top Value Statement - DOMINANT */}
      <div className="text-center mb-4">
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 mb-2"
        >
          <Crown className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-black text-white">2x Your Chances</h3>
        </motion.div>
        <p className="text-sm text-zinc-400">VIP members win more often</p>
        <p className="text-xs text-primary/80 mt-1">Most recent winners include VIP members</p>
      </div>

      {/* Benefit Blocks */}
      <div className="space-y-2 flex-1 overflow-y-auto mb-4">
        {VIP_BENEFITS.map((benefit, i) => (
          <div 
            key={i}
            className="flex items-start gap-3 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-primary/30 transition-colors"
          >
            <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
              <benefit.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-white text-sm">{benefit.title}</h4>
              <p className="text-xs text-zinc-500 leading-tight">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Free vs VIP Comparison Strip */}
      <div className="bg-zinc-800/60 rounded-lg p-3 mb-4 border border-zinc-700/50">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 text-center">
          Free vs VIP
        </div>
        <div className="space-y-1">
          {COMPARISON_DATA.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-xs py-1">
              <span className="text-zinc-400">{row.feature}</span>
              <span className="text-center text-zinc-500">
                {typeof row.free === 'boolean' ? (
                  row.free ? <Check className="w-3 h-3 mx-auto text-green-500" /> : <X className="w-3 h-3 mx-auto text-zinc-600" />
                ) : row.free}
              </span>
              <span className="text-center text-primary font-semibold">
                {typeof row.vip === 'boolean' ? (
                  row.vip ? <Check className="w-3 h-3 mx-auto text-primary" /> : <X className="w-3 h-3 mx-auto" />
                ) : row.vip}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-zinc-600 border-t border-zinc-700 pt-1 mt-1">
            <span></span>
            <span className="text-center">Free</span>
            <span className="text-center text-primary">VIP</span>
          </div>
        </div>
      </div>

      {/* Enhanced CTA with Pulse */}
      <div className="space-y-2">
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 0 0 rgba(212, 175, 55, 0)",
              "0 0 0 4px rgba(212, 175, 55, 0.3)",
              "0 0 0 0 rgba(212, 175, 55, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 6 }}
          className="rounded-lg"
        >
          <Button 
            className="w-full bg-gradient-to-r from-primary via-yellow-500 to-primary hover:from-primary/90 hover:via-yellow-400 hover:to-primary/90 text-black font-black text-base py-6 shadow-lg shadow-primary/20"
            onClick={onUpgradeClick}
          >
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Unlock VIP Advantage
              </span>
              <span className="text-xs font-semibold opacity-80">$2.99 per month</span>
            </div>
          </Button>
        </motion.div>
        
        {/* Reassurance Text */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500">
          <span>Cancel anytime</span>
          <span>•</span>
          <span>Less than $0.10/day</span>
        </div>
      </div>
    </Card>
  );
}
