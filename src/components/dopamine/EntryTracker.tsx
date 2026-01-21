import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Ticket, Lock, Sparkles, Timer, Zap, TrendingUp } from "lucide-react";
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
        <div key={item.label} className="bg-black/40 rounded-lg p-2 border border-zinc-700/50">
          <motion.span 
            key={item.value}
            initial={{ scale: 1.1, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="block text-xl font-bold text-primary"
          >
            {item.value.toString().padStart(2, '0')}
          </motion.span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{item.label}</span>
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
  const maxSpins = isVip ? 2 : 1;
  const streakProgress = Math.min(streak, 7) / 7 * 100; // Cap visual at 7 days

  // Teaser state for logged-out users
  if (!isAuthenticated) {
    return (
      <Card className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-primary/20 relative overflow-hidden h-full flex flex-col">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-zinc-900/70 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="w-10 h-10 text-primary mx-auto mb-3 drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]" strokeWidth={2} />
            <p className="text-white font-bold text-lg mb-1">Track Your Entries</p>
            <p className="text-sm text-zinc-400 mb-4">Log in to spin and see your progress</p>
            <Button onClick={onLoginClick} className="bg-primary hover:bg-primary/90 text-black font-bold px-8">
              Log In to Play
            </Button>
          </div>
        </div>
        
        {/* Teaser content behind blur */}
        <div className="opacity-30">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Your Progress
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
    <Card className="p-5 bg-gradient-to-br from-zinc-900 via-zinc-800/90 to-zinc-900 border-primary/30 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
          <Trophy className="w-5 h-5 text-primary" />
          Your Progress
        </h3>
        {isVip && (
          <Badge className="bg-gradient-to-r from-primary to-yellow-500 text-black font-bold text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            VIP ACTIVE
          </Badge>
        )}
      </div>
      
      <div className="space-y-4 flex-1 flex flex-col">
        {/* DOMINANT: Spins Remaining - Large focal point */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-xl p-4 border border-primary/30 text-center">
          <motion.div 
            key={spinsRemaining}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-5xl font-black text-primary drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            {spinsRemaining}
          </motion.div>
          <div className="text-sm text-zinc-400 mt-1 flex items-center justify-center gap-1">
            <Ticket className="w-4 h-4" />
            Spins Remaining Today
          </div>
          {isVip && (
            <div className="text-xs text-primary mt-1 font-medium">VIP: {maxSpins} spins/day</div>
          )}
        </div>
        
        {/* Streak Visualization with Progress Bar */}
        <div className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400 flex items-center gap-2">
              <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-zinc-600'}`} />
              Current Streak
            </span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-xl text-white">{streak}</span>
              <span className="text-xs text-zinc-500">days</span>
              {streak >= 3 && <span className="text-orange-500 ml-1">🔥</span>}
              {streak >= 7 && <span>🔥</span>}
            </div>
          </div>
          <Progress value={streakProgress} className="h-2 bg-zinc-700" />
          <p className="text-xs text-zinc-500 mt-2">Keep your streak alive to earn bonus entries</p>
        </div>

        {/* Entry Breakdown - Separated rows with strong contrast */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            This Month's Entries
          </div>
          
          {/* General Entries */}
          <div className="flex items-center justify-between py-2 px-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <span className="text-white flex items-center gap-2 text-sm">
              <span className="text-lg">🎟️</span>
              General Entries
            </span>
            <AnimatePresence mode="wait">
              <motion.span 
                key={entryTotals.general}
                initial={{ scale: 1.4, color: "hsl(45, 70%, 50%)" }}
                animate={{ scale: 1, color: "hsl(0, 0%, 100%)" }}
                className="font-bold text-xl"
              >
                {entryTotals.general}
              </motion.span>
            </AnimatePresence>
          </div>
          
          {/* Massage Entries */}
          <div className="flex items-center justify-between py-2 px-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <span className="text-white flex items-center gap-2 text-sm">
              <span className="text-lg">💆</span>
              Massage Drawing
            </span>
            <AnimatePresence mode="wait">
              <motion.span 
                key={entryTotals.massage}
                initial={{ scale: 1.4, color: "hsl(45, 70%, 50%)" }}
                animate={{ scale: 1, color: "hsl(0, 0%, 100%)" }}
                className="font-bold text-xl"
              >
                {entryTotals.massage}
              </motion.span>
            </AnimatePresence>
          </div>
          
          {/* PT Entries */}
          <div className="flex items-center justify-between py-2 px-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <span className="text-white flex items-center gap-2 text-sm">
              <span className="text-lg">💪</span>
              PT Drawing
            </span>
            <AnimatePresence mode="wait">
              <motion.span 
                key={entryTotals.pt}
                initial={{ scale: 1.4, color: "hsl(45, 70%, 50%)" }}
                animate={{ scale: 1, color: "hsl(0, 0%, 100%)" }}
                className="font-bold text-xl"
              >
                {entryTotals.pt}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* ISOLATED: Total Entries - Emphasized */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl p-4 border border-primary/40 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Total Entries</div>
          <motion.div 
            key={totalEntries}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-4xl font-black text-primary drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            {totalEntries}
          </motion.div>
          {isVip && (
            <div className="text-xs text-primary/80 mt-1 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              2x multiplier active
            </div>
          )}
        </div>

        {/* Draw Countdown */}
        <div className="bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            <Timer className="w-3 h-3" />
            Grand Draw Countdown
          </div>
          <CountdownTimer targetDate={drawDate} />
        </div>
      </div>
    </Card>
  );
}
