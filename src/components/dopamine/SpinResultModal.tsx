import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, PartyPopper, Frown, Ticket } from "lucide-react";
import { ConfettiEffect } from "./ConfettiEffect";

interface SpinResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: {
    is_miss: boolean;
    label: string;
    icon: string;
    entries_awarded: number;
    entry_type: string | null;
    streak: number;
    streak_bonus_awarded: number;
    is_vip: boolean;
    vip_multiplier: number;
  } | null;
}

export function SpinResultModal({ open, onOpenChange, result }: SpinResultModalProps) {
  if (!result) return null;

  const isMiss = result.is_miss;
  const isSmallWin = !isMiss && result.entries_awarded <= 2;
  const isBigWin = !isMiss && result.entries_awarded > 2;

  const getTitle = () => {
    if (isMiss) return "So Close...";
    if (isBigWin) return "JACKPOT!";
    return "You're In!";
  };

  const getMessage = () => {
    if (isMiss) {
      const missMessages = [
        "Almost had it! Come back tomorrow for another shot.",
        "Not today... but your luck could change tomorrow!",
        "So close! Try again tomorrow.",
        "The wheel is unpredictable. See you tomorrow!"
      ];
      return missMessages[Math.floor(Math.random() * missMessages.length)];
    }

    let msg = "";
    if (result.entry_type === "massage") {
      msg = `You just earned ${result.entries_awarded} entries into the Massage Drawing!`;
    } else if (result.entry_type === "pt") {
      msg = `You just earned ${result.entries_awarded} entries into the Personal Training Drawing!`;
    } else {
      msg = `You just earned ${result.entries_awarded} entries for this month's draw!`;
    }

    if (result.streak_bonus_awarded > 0) {
      msg += ` PLUS ${result.streak_bonus_awarded} bonus entries for your ${result.streak}-day streak! 🔥`;
    }

    return msg;
  };

  return (
    <>
      <ConfettiEffect 
        isActive={open} 
        type={isMiss ? "miss" : isBigWin ? "big_win" : "small_win"} 
      />
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-primary/30 text-white">
          <DialogHeader>
            <DialogTitle className="sr-only">{getTitle()}</DialogTitle>
          </DialogHeader>

          <div className="text-center py-6">
            {/* Result Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className={`text-7xl mb-4 ${isMiss ? "grayscale" : ""}`}
            >
              {result.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-3xl font-black mb-2 ${
                isMiss ? "text-zinc-400" : isBigWin ? "text-primary" : "text-white"
              }`}
            >
              {getTitle()}
            </motion.h2>

            {/* Result label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <Badge 
                variant={isMiss ? "secondary" : "default"}
                className={`text-lg px-4 py-1 ${!isMiss ? "bg-primary text-black" : ""}`}
              >
                {result.label}
              </Badge>
            </motion.div>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-6 px-4"
            >
              {getMessage()}
            </motion.p>

            {/* Entries breakdown for wins */}
            {!isMiss && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-zinc-800/50 rounded-lg p-4 mb-6 mx-4"
              >
                <div className="flex items-center justify-center gap-3">
                  <Ticket className="w-6 h-6 text-primary" />
                  <span className="text-3xl font-bold text-primary">
                    +{result.entries_awarded + result.streak_bonus_awarded}
                  </span>
                  <span className="text-muted-foreground">entries</span>
                </div>
                
                {result.is_vip && result.vip_multiplier > 1 && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-sm text-primary">
                    <Sparkles className="w-4 h-4" />
                    VIP {result.vip_multiplier}x multiplier applied!
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Button */}
            <Button
              onClick={() => onOpenChange(false)}
              className={`w-full max-w-xs ${
                isMiss 
                  ? "bg-zinc-700 hover:bg-zinc-600" 
                  : "bg-primary hover:bg-primary/90 text-black"
              }`}
            >
              {isMiss ? (
                <>
                  <Frown className="w-4 h-4 mr-2" />
                  Try Again Tomorrow
                </>
              ) : (
                <>
                  <PartyPopper className="w-4 h-4 mr-2" />
                  Awesome!
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
