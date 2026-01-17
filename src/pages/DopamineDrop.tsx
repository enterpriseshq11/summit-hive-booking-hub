import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Sparkles, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { SpinWheel } from "@/components/dopamine/SpinWheel";
import { EntryTracker } from "@/components/dopamine/EntryTracker";
import { SpinResultModal } from "@/components/dopamine/SpinResultModal";
import { LoginPromptModal } from "@/components/dopamine/LoginPromptModal";
import { HowItWorks } from "@/components/dopamine/HowItWorks";
import { VipBenefitsCard } from "@/components/dopamine/VipBenefitsCard";
import { PastWinners } from "@/components/dopamine/PastWinners";
import { ShareReferral } from "@/components/dopamine/ShareReferral";
import { CrossSellStrip } from "@/components/dopamine/CrossSellStrip";
import { KeyRulesSummary } from "@/components/dopamine/KeyRulesSummary";

const DRAW_DATE = "2026-03-31T23:59:59";

export default function DopamineDrop() {
  const { authUser, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [wheelConfig, setWheelConfig] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const [status, setStatus] = useState({
    spinsRemaining: 0,
    isVip: false,
    streak: 0,
    entryTotals: { general: 0, massage: 0, pt: 0 }
  });

  useEffect(() => {
    const vipParam = searchParams.get("vip");
    if (vipParam === "success" || vipParam === "active") {
      toast.success("Welcome to VIP! 2x spins/day + 2x entries!", { duration: 5000, icon: "🎉" });
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchWheelConfig() {
      const { data } = await supabase.from("wheel_config").select("*").eq("is_active", true).order("segment_index");
      if (data) setWheelConfig(data);
    }
    fetchWheelConfig();
  }, []);

  const fetchStatus = async () => {
    if (!authUser) {
      setStatus({ spinsRemaining: 0, isVip: false, streak: 0, entryTotals: { general: 0, massage: 0, pt: 0 } });
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.functions.invoke("dopamine-status", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (data) {
        const streakValue = typeof data.streak === 'object' ? (data.streak?.current ?? 0) : (data.streak ?? 0);
        setStatus({
          spinsRemaining: data.spins_remaining ?? 0,
          isVip: data.is_vip ?? false,
          streak: streakValue,
          entryTotals: data.entry_totals ?? { general: 0, massage: 0, pt: 0 }
        });
      }
    } catch (error) {
      console.error("Status fetch error:", error);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchStatus();
  }, [authUser, authLoading]);

  const handleSpinClick = async () => {
    if (!authUser) { setShowLoginPrompt(true); return; }
    if (status.spinsRemaining <= 0) { toast.error("No spins remaining today!"); return; }

    setIsSpinning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("dopamine-spin", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (error) throw error;
      setSpinResult(data);
      setTimeout(() => {
        setIsSpinning(false);
        setShowResultModal(true);
        if (data.entry_totals) {
          setStatus(prev => ({ ...prev, spinsRemaining: data.spins_remaining, streak: data.streak, entryTotals: data.entry_totals }));
        }
      }, 5000);
    } catch (error: any) {
      setIsSpinning(false);
      toast.error(error.message || "Spin failed");
    }
  };

  const handleVipUpgrade = async () => {
    if (!authUser) { setShowLoginPrompt(true); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("vip-checkout", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero - Compact */}
      <section className="relative py-4 md:py-6 bg-gradient-to-b from-black via-zinc-900 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.4) 1px, transparent 0)", backgroundSize: "50px 50px" }} />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            SPIN. EARN ENTRIES.<span className="block text-accent">WIN BIG.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-6">
            Every spin earns entries into monthly prize drawings. VIP members earn 2x entries!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleSpinClick} 
              disabled={isSpinning} 
              className="bg-[hsl(45,70%,50%)] hover:bg-[hsl(45,70%,45%)] text-black font-bold text-lg px-8 shadow-lg"
            >
              {isSpinning ? <Sparkles className="w-5 h-5 mr-2 animate-spin" /> : authUser ? <Gift className="w-5 h-5 mr-2" /> : <User className="w-5 h-5 mr-2" />}
              {authUser ? `Spin Now (${status.spinsRemaining} left)` : "Log in to Spin"}
            </Button>
            <Button 
              size="lg" 
              className="border border-accent/50 bg-transparent text-accent hover:bg-accent/20 hover:border-accent" 
              onClick={() => document.getElementById("prizes")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Prizes + Rules<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {!authUser && <p className="text-sm text-zinc-400 mt-3">Free to play. Login required. Winners drawn monthly.</p>}
        </div>
      </section>

      {/* Wheel Section - Centered wheel with responsive card grid below */}
      <section className="py-4 md:py-6 bg-gradient-to-b from-black to-zinc-900/50">
        <div className="container mx-auto px-4">
          {/* Centered Wheel */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 max-w-md mx-auto mb-8">
            <SpinWheel 
              segments={wheelConfig} 
              isSpinning={isSpinning} 
              targetSegment={spinResult?.segment_index} 
              onSpinClick={handleSpinClick}
              canSpin={!!authUser && status.spinsRemaining > 0 && !isSpinning}
            />
            
            {/* Dedicated SPIN button below wheel - Yellow primary styling */}
            <div className="flex flex-col items-center gap-2">
              <Button
                size="lg"
                onClick={handleSpinClick}
                disabled={isSpinning || (authUser && status.spinsRemaining <= 0)}
                className="px-12 py-6 text-xl font-black tracking-wide shadow-lg bg-[hsl(45,70%,50%)] hover:bg-[hsl(45,70%,45%)] text-black disabled:bg-[hsl(45,70%,50%)]/50 disabled:text-black/50"
              >
                {isSpinning
                  ? "Spinning..."
                  : !authUser
                    ? "Log in to Spin"
                    : status.spinsRemaining <= 0
                      ? "No spins remaining"
                      : `Spin (${status.spinsRemaining} left)`}
              </Button>
              {!authUser && (
                <p className="text-sm text-zinc-400">Create a free account to spin daily</p>
              )}
              {authUser && status.spinsRemaining <= 0 && (
                <p className="text-sm text-zinc-400">Come back tomorrow for more spins!</p>
              )}
            </div>
          </motion.div>
          
          {/* Cards grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            <EntryTracker 
              isAuthenticated={!!authUser} 
              isVip={status.isVip} 
              spinsRemaining={status.spinsRemaining} 
              streak={status.streak} 
              entryTotals={status.entryTotals} 
              drawDate={DRAW_DATE} 
              onUpgradeClick={handleVipUpgrade} 
              onLoginClick={() => setShowLoginPrompt(true)} 
            />
            <VipBenefitsCard isVip={status.isVip} onUpgradeClick={handleVipUpgrade} />
            <div className="md:col-span-2 lg:col-span-1">
              <ShareReferral isAuthenticated={!!authUser} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Now below the wheel */}

      {/* [SPIN-06] Enhanced Prizes Section */}
      <section id="prizes" className="py-12 md:py-20 bg-zinc-900/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">This Month's Giveaway Prizes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "💆", title: "Massage Giveaway Winner", desc: "Full massage session at Restoration Spa", value: "Value: $80+", when: "Drawn monthly" },
              { icon: "💪", title: "PT Session Giveaway Winner", desc: "1-hour personal training at Total Fitness", value: "Value: $75+", when: "Drawn monthly" },
              { icon: "🎟️", title: "General Entries Pool", desc: "Entries count toward grand prize drawing", value: "Grand Prize Pool", when: "March 31, 2026" },
              { icon: "🏆", title: "Grand Giveaway", desc: "Major prize package from all A-Z businesses", value: "Value: $500+", when: "March 31, 2026" }
            ].map((prize, i) => (
              <div key={i} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-primary/50 transition-colors">
                <span className="text-4xl mb-3 block">{prize.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{prize.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{prize.desc}</p>
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="border-primary/30 text-primary">{prize.value}</Badge>
                  <span className="text-zinc-500">{prize.when}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* [SPIN-07] Past Winners */}
      <PastWinners />

      {/* [SPIN-08] Rules with Key Summary */}
      <section className="py-12 md:py-16 bg-zinc-900/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Rules & Terms</h2>
          
          {/* Key Rules Summary */}
          <KeyRulesSummary />
          
          {/* Full Rules */}
          <div className="text-muted-foreground text-sm space-y-2">
            <p className="font-semibold text-zinc-400 mb-3">Full Terms:</p>
            <ul className="space-y-2">
              <li>• Spins award entries only. No physical prizes are granted instantly.</li>
              <li>• Free members: 1 spin/day. VIP: 2 spins/day + 2x entries earned.</li>
              <li>• Entries accumulate throughout the month and reset after each drawing.</li>
              <li>• Winners are selected monthly and announced via official channels.</li>
              <li>• VIP prizes require active VIP membership at time of draw.</li>
              <li>• Grand Giveaway drawing: March 31, 2026.</li>
              <li>• Must be 18+ and located in the United States to participate.</li>
              <li>• A-Z Enterprises reserves the right to modify rules with notice.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* [SPIN-10] Cross-Sell CTA Strip */}
      <CrossSellStrip />

      <LoginPromptModal open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
      {/* [SPIN-04] Celebration in SpinResultModal already includes confetti */}
      <SpinResultModal open={showResultModal} onOpenChange={setShowResultModal} result={spinResult} />
    </div>
  );
}
