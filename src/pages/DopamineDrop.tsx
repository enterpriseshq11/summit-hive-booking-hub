import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Sparkles, Calendar, ChevronRight, User, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { SpinWheel } from "@/components/dopamine/SpinWheel";
import { EntryTracker } from "@/components/dopamine/EntryTracker";
import { SpinResultModal } from "@/components/dopamine/SpinResultModal";
import { LoginPromptModal } from "@/components/dopamine/LoginPromptModal";

const DRAW_DATE = "2026-03-31T23:59:59";

export default function DopamineDrop() {
  const { authUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
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
      window.history.replaceState({}, "", "/dopamine-drop");
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
        setStatus({
          spinsRemaining: data.spins_remaining ?? 0,
          isVip: data.is_vip ?? false,
          streak: data.streak ?? 0,
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
      {/* Hero */}
      <section className="relative py-12 md:py-20 bg-gradient-to-b from-black via-zinc-900 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.4) 1px, transparent 0)", backgroundSize: "50px 50px" }} />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30"><Calendar className="w-3 h-3 mr-1" />Monthly Drawings + Grand Giveaway: March 31, 2026</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">SPIN. EARN ENTRIES.<span className="block text-primary">WIN BIG.</span></h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-8">Every spin earns entries into monthly prize drawings. VIP members earn 2x entries!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleSpinClick} disabled={isSpinning} className="bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-400 text-black font-bold text-lg px-8">
              {isSpinning ? <Sparkles className="w-5 h-5 mr-2 animate-spin" /> : authUser ? <Gift className="w-5 h-5 mr-2" /> : <User className="w-5 h-5 mr-2" />}
              {authUser ? `Spin Now (${status.spinsRemaining} left)` : "Log in to Spin"}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => document.getElementById("prizes")?.scrollIntoView({ behavior: "smooth" })}>View Prizes + Rules<ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
          {!authUser && <p className="text-sm text-zinc-400 mt-3">Free to play. Login required. Winners drawn monthly.</p>}
        </div>
      </section>

      {/* Wheel + Tracker */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
              <SpinWheel segments={wheelConfig} isSpinning={isSpinning} targetSegment={spinResult?.segment_index} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <EntryTracker isAuthenticated={!!authUser} isVip={status.isVip} spinsRemaining={status.spinsRemaining} streak={status.streak} entryTotals={status.entryTotals} drawDate={DRAW_DATE} onUpgradeClick={handleVipUpgrade} onLoginClick={() => setShowLoginPrompt(true)} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section id="prizes" className="py-12 md:py-20 bg-zinc-900/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">This Month's Giveaway Prizes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[{ icon: "💆", title: "Massage Giveaway Winner", desc: "Earn entries by spinning. One winner selected monthly." },
              { icon: "💪", title: "PT Session Giveaway Winner", desc: "Entries accumulate all month. Winner drawn live." },
              { icon: "🎟️", title: "General Entries", desc: "Win +1 or +2 entries on most spins for grand drawing." },
              { icon: "🏆", title: "Grand Giveaway: March 31", desc: "All entries count toward the big prize drawing!" }
            ].map((prize, i) => (
              <div key={i} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                <span className="text-4xl mb-3 block">{prize.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{prize.title}</h3>
                <p className="text-muted-foreground text-sm">{prize.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Rules & Terms</h2>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>• Spins award entries only. No physical prizes are granted instantly.</li>
            <li>• Free members: 1 spin/day. VIP: 2 spins/day + 2x entries earned.</li>
            <li>• Entries accumulate throughout the month and reset after each drawing.</li>
            <li>• Winners are selected monthly and announced via official channels.</li>
            <li>• VIP prizes require active VIP membership at time of draw.</li>
            <li>• Grand Giveaway drawing: March 31, 2026.</li>
          </ul>
        </div>
      </section>

      <LoginPromptModal open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
      <SpinResultModal open={showResultModal} onOpenChange={setShowResultModal} result={spinResult} />
    </div>
  );
}
