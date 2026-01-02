import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Lock, Sparkles, Trophy, Calendar, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { SpinWheel } from "@/components/dopamine/SpinWheel";
import { PrizeGrid } from "@/components/dopamine/PrizeGrid";
import { ClaimModal } from "@/components/dopamine/ClaimModal";
import { VipLockedModal } from "@/components/dopamine/VipLockedModal";
import { LoginPromptModal } from "@/components/dopamine/LoginPromptModal";

const GIVEAWAY_DATE = "March 31, 2026";

export default function DopamineDrop() {
  const { authUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState<any>(null);
  const [segments, setSegments] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showVipLockedModal, setShowVipLockedModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check for VIP success from checkout
  useEffect(() => {
    const vipParam = searchParams.get("vip");
    if (vipParam === "success" || vipParam === "active") {
      toast.success("Welcome to VIP! You now have 2 spins per day and access to exclusive prizes.", {
        duration: 5000,
        icon: "🎉"
      });
      fetchStatus();
      // Clean up URL
      window.history.replaceState({}, "", "/dopamine-drop");
    }
  }, [searchParams]);

  // Fetch wheel segments
  useEffect(() => {
    async function fetchSegments() {
      const { data } = await supabase
        .from("wheel_segments")
        .select(`
          segment_index,
          prize_id,
          prizes (id, name, description, access_level, booking_url)
        `)
        .order("segment_index");
      if (data) setSegments(data);
    }
    fetchSegments();
  }, []);

  // Fetch user status
  const fetchStatus = async () => {
    if (!authUser) {
      setStatus({ is_authenticated: false, is_vip: false, spins_remaining: 0 });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await supabase.functions.invoke("dopamine-status", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      setStatus(data);
    } catch (error) {
      console.error("Status fetch error:", error);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchStatus();
  }, [authUser, authLoading]);

  const handleSpinClick = async () => {
    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }

    if (status?.spins_remaining <= 0) {
      toast.error("No spins remaining today. Come back tomorrow!");
      return;
    }

    setIsSpinning(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("dopamine-spin", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (error) throw error;
      
      setSpinResult(data);
      
      // Wait for wheel animation
      setTimeout(() => {
        setIsSpinning(false);
        if (data.is_vip_locked_hit) {
          setShowVipLockedModal(true);
        } else {
          setShowClaimModal(true);
        }
        fetchStatus();
      }, 4000);
      
    } catch (error: any) {
      setIsSpinning(false);
      toast.error(error.message || "Spin failed");
    }
  };

  const handleVipUpgrade = async () => {
    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("vip-checkout", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
    }
  };

  return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-black via-zinc-900 to-background overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }} />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Calendar className="w-3 h-3 mr-1" />
                Grand Giveaway: {GIVEAWAY_DATE}
              </Badge>
              
              <h1 
                className="text-4xl md:text-6xl font-bold text-white mb-4" 
                data-event={authUser ? "dopamine_drop_view" : "view_dopamine_drop_logged_out"}
              >
                SPIN THE WHEEL.
                <span className="block text-primary">WIN SOMETHING REAL.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-zinc-300 mb-8">
                Everyone can spin — VIP members unlock the 3 biggest prizes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={handleSpinClick}
                  disabled={isSpinning}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8"
                  data-event={authUser ? "spin_attempt" : "login_to_spin_click"}
                >
                  {isSpinning ? (
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  ) : authUser ? (
                    <Gift className="w-5 h-5 mr-2" />
                  ) : (
                    <User className="w-5 h-5 mr-2" />
                  )}
                  {authUser 
                    ? (status?.is_vip 
                        ? `Spin the Wheel (${status?.spins_remaining ?? 0} left)` 
                        : "Spin the Wheel")
                    : "Log in to Spin"}
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => document.getElementById("prizes")?.scrollIntoView({ behavior: "smooth" })}
                  className="border-zinc-600 text-white hover:bg-zinc-800"
                >
                  View Prizes + Rules
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {/* Microcopy for logged-out users */}
              {!authUser && (
                <p className="text-sm text-zinc-400 mt-3">
                  Free to play. Login required to spin.
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Wheel + Status Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Wheel */}
              <div className="flex justify-center">
                <SpinWheel 
                  segments={segments} 
                  isSpinning={isSpinning}
                  targetSegment={spinResult?.segment_index}
                />
              </div>

              {/* Status Card */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Your Status
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Spins remaining today</span>
                    <span className="font-bold text-lg">{status?.spins_remaining ?? 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Account</span>
                    <Badge 
                      variant={status?.is_vip ? "default" : "secondary"}
                      className={status?.is_vip ? "bg-primary text-primary-foreground" : ""}
                    >
                      {status?.is_vip ? "✨ VIP Active" : "Free"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Giveaway Tickets</span>
                    <span className="font-bold">{status?.tickets?.total ?? 0}</span>
                  </div>

                  {!status?.is_vip && (
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4 text-primary" />
                        VIP unlocks 3 exclusive prizes
                      </div>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={handleVipUpgrade}
                        data-event="vip_upgrade_click"
                      >
                        Upgrade to VIP — $2.99/mo
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => navigate("/vip")}
                      >
                        View VIP Perks
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Prize Grid */}
        <section id="prizes" className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">All Prizes</h2>
            <PrizeGrid segments={segments} isVip={status?.is_vip} />
          </div>
        </section>

        {/* Rules */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Rules & Terms</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• Login required to spin.</li>
              <li>• Free members: 1 spin/day. VIP: 2 spins/day.</li>
              <li>• Prizes are limited and may be substituted with equal or greater value.</li>
              <li>• VIP prizes require VIP membership at time of winning.</li>
              <li>• Fraudulent entries are disqualified.</li>
              <li>• Grand Giveaway drawing: {GIVEAWAY_DATE}. Winner announced on website and social channels.</li>
              <li>• By participating, you consent to receive prize-related and promotional messages.</li>
            </ul>
            <p className="mt-6 text-sm text-muted-foreground text-center">
              <a href="/terms/dopamine-drop" className="underline hover:text-primary">Full Terms & Conditions</a>
            </p>
          </div>
        </section>

        {/* Modals */}
        <LoginPromptModal 
          open={showLoginPrompt} 
          onOpenChange={setShowLoginPrompt} 
        />
        
        <VipLockedModal 
          open={showVipLockedModal} 
          onOpenChange={setShowVipLockedModal}
          onUpgrade={handleVipUpgrade}
        />
        
        <ClaimModal
          open={showClaimModal}
          onOpenChange={setShowClaimModal}
          spinResult={spinResult}
          onClaimed={() => {
            setShowClaimModal(false);
            fetchStatus();
          }}
        />
      </div>
  );
}
