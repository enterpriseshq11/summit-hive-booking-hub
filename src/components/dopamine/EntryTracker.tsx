import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Calendar, Ticket, Lock, Sparkles, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EntryTrackerProps {
  isAuthenticated: boolean;
  isVip: boolean;
  spinsRemaining: number;
  streak: number;
  entryTotals: {
    general: number;
    massage: number;
    pt: number;
  };
  drawDate: string;
  onUpgradeClick: () => void;
  onLoginClick: () => void;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Mins", value: timeLeft.minutes },
        { label: "Secs", value: timeLeft.seconds }
      ].map((item) => (
        <div key={item.label} className="bg-zinc-800/50 rounded-lg p-2">
          <motion.span 
            key={item.value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="block text-xl font-bold text-primary"
          >
            {item.value.toString().padStart(2, '0')}
          </motion.span>
          <span className="text-[10px] text-muted-foreground uppercase">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function EntryTracker({
  isAuthenticated,
  isVip,
  spinsRemaining,
  streak,
  entryTotals,
  drawDate,
  onUpgradeClick,
  onLoginClick
}: EntryTrackerProps) {
  const totalEntries = entryTotals.general + entryTotals.massage + entryTotals.pt;

  // Teaser state for logged-out users
  if (!isAuthenticated) {
    return (
      <Card className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-primary/20 relative overflow-hidden">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-zinc-900/60 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="w-8 h-8 text-primary mx-auto mb-3 drop-shadow-[0_0_6px_rgba(212,175,55,0.8)]" strokeWidth={2.5} />
            <p className="text-white font-semibold mb-2">Track Your Entries</p>
            <p className="text-sm text-muted-foreground mb-4">Log in to spin and see your entry totals</p>
            <Button onClick={onLoginClick} className="bg-[hsl(45,70%,50%)] hover:bg-[hsl(45,70%,45%)] text-black font-semibold">
              Log In to Play
            </Button>
          </div>
        </div>
        
        {/* Teaser content behind blur */}
        <div className="opacity-50">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Your Entry Tracker
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span>General Entries</span>
              <span>--</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Massage Entries</span>
              <span>--</span>
            </div>
            <div className="flex justify-between py-2">
              <span>PT Entries</span>
              <span>--</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-primary/20">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
        <Trophy className="w-5 h-5 text-primary" />
        Your Entry Tracker
        {isVip && (
          <Badge className="ml-auto bg-gradient-to-r from-primary to-yellow-500 text-black">
            <Sparkles className="w-3 h-3 mr-1" />
            VIP
          </Badge>
        )}
      </h3>
      
      <div className="space-y-4">
        {/* Spins Remaining */}
        <div className="flex justify-between items-center py-2 border-b border-zinc-700">
          <span className="text-muted-foreground flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Spins remaining today
          </span>
          <span className="font-bold text-xl text-white">{spinsRemaining}</span>
        </div>
        
        {/* Streak */}
        <div className="flex justify-between items-center py-2 border-b border-zinc-700">
          <span className="text-muted-foreground flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Current Streak
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-white">{streak}</span>
            <span className="text-xs text-muted-foreground">days</span>
            {streak >= 3 && <span className="text-orange-500">🔥</span>}
          </div>
        </div>

        {/* Entry Totals */}
        <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
            This Month's Entries
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white flex items-center gap-2">
              🎟️ General Entries
            </span>
            <motion.span 
              key={entryTotals.general}
              initial={{ scale: 1.3, color: "#D4AF37" }}
              animate={{ scale: 1, color: "#ffffff" }}
              className="font-bold text-lg"
            >
              {entryTotals.general}
            </motion.span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white flex items-center gap-2">
              💆 Massage Drawing
            </span>
            <motion.span 
              key={entryTotals.massage}
              initial={{ scale: 1.3, color: "#D4AF37" }}
              animate={{ scale: 1, color: "#ffffff" }}
              className="font-bold text-lg"
            >
              {entryTotals.massage}
            </motion.span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white flex items-center gap-2">
              💪 PT Drawing
            </span>
            <motion.span 
              key={entryTotals.pt}
              initial={{ scale: 1.3, color: "#D4AF37" }}
              animate={{ scale: 1, color: "#ffffff" }}
              className="font-bold text-lg"
            >
              {entryTotals.pt}
            </motion.span>
          </div>

          <div className="border-t border-zinc-700 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-primary font-semibold">Total Entries</span>
              <span className="font-bold text-2xl text-primary">{totalEntries}</span>
            </div>
          </div>
        </div>

        {/* Draw Countdown */}
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            <Timer className="w-4 h-4" />
            Next Draw
          </div>
          <CountdownTimer targetDate={drawDate} />
        </div>

        {/* VIP Upsell */}
        {!isVip && (
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-primary" />
              VIP = 2x spins/day + 2x entries earned
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-400 text-black font-bold"
              onClick={onUpgradeClick}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to VIP — $2.99/mo
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
