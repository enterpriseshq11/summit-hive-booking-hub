import { Check, Crown, Gift, Sparkles, Trophy, Zap, Calendar, Shield } from "lucide-react";
import { Button, ButtonPrimary, ButtonSecondary } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CinematicHeroBackground from "@/components/ui/CinematicHeroBackground";

const GIVEAWAY_DATE = "March 31, 2026";

const VIP_PERKS = [
  {
    icon: Gift,
    title: "Unlock 3 VIP-Only Prizes",
    description: "Access exclusive prizes worth up to $500+ that free users can't win"
  },
  {
    icon: Zap,
    title: "2 Spins Per Day",
    description: "Double your daily chances to win — free users only get 1 spin"
  },
  {
    icon: Trophy,
    title: "Better Giveaway Odds",
    description: "VIP prize segment includes 10x giveaway tickets vs 1x for standard"
  },
  {
    icon: Sparkles,
    title: "Priority Prize Fulfillment",
    description: "VIP claims are processed and verified first"
  },
  {
    icon: Calendar,
    title: "Monthly Bonus Tickets",
    description: "Earn bonus giveaway tickets just for being a VIP member"
  },
  {
    icon: Shield,
    title: "Cancel Anytime",
    description: "No commitment — cancel your subscription whenever you want"
  }
];

export default function Vip() {
  const { authUser } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!authUser) {
      navigate("/login?redirect=/vip");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("vip-checkout", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 md:py-32 bg-primary overflow-hidden">
          {/* Cinematic Hero Background */}
          <CinematicHeroBackground />
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              VIP Dopamine Club
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="block text-white">UNLOCK THE</span>
              <span className="block text-accent">BIGGEST PRIZES</span>
            </h1>
            
            <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
              VIP members have exclusive access to 3 premium prize segments worth $100–$500+ 
              plus double the daily spins.
            </p>

            <div className="flex flex-col items-center gap-4">
              <ButtonPrimary 
                size="lg"
                onClick={handleSubscribe}
                icon={<Crown className="w-5 h-5" />}
                data-event="vip_checkout_started"
              >
                Join VIP — $2.99/month
              </ButtonPrimary>
              <p className="text-sm text-zinc-400">Cancel anytime. No long-term commitment.</p>
            </div>
          </div>
        </section>

        {/* Perks Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="block text-foreground">VIP Member</span>
              <span className="block text-accent">Benefits</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {VIP_PERKS.map((perk, index) => (
                <Card key={index} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <perk.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{perk.title}</h3>
                  <p className="text-muted-foreground text-sm">{perk.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="block text-foreground">Free vs</span>
              <span className="block text-accent">VIP</span>
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="font-medium">Feature</div>
                <div className="text-center font-medium">Free</div>
                <div className="text-center font-medium text-primary">VIP</div>
              </div>
              
              {[
                { feature: "Daily Spins", free: "1", vip: "2" },
                { feature: "Public Prizes", free: "✓", vip: "✓" },
                { feature: "VIP-Only Prizes", free: "✗", vip: "✓" },
                { feature: "Standard Giveaway Entry", free: "1x", vip: "1x" },
                { feature: "Mega Giveaway Entry", free: "✗", vip: "10x" },
                { feature: "Priority Support", free: "✗", vip: "✓" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 py-3 border-b border-border">
                  <div className="text-muted-foreground">{row.feature}</div>
                  <div className="text-center">{row.free}</div>
                  <div className="text-center text-primary font-medium">{row.vip}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grand Giveaway */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Trophy className="w-3 h-3 mr-1" />
              Grand Giveaway
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Drawing: {GIVEAWAY_DATE}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Every spin earns you tickets. VIP members can win 10x tickets with the Mega Giveaway Entry prize.
            </p>
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={handleSubscribe}
            >
              Join VIP Now
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {[
                {
                  q: "How do I cancel my VIP subscription?",
                  a: "You can cancel anytime from your Account page. Your VIP benefits remain active until the end of your billing period."
                },
                {
                  q: "What happens to my giveaway tickets if I cancel?",
                  a: "All tickets you've earned remain valid for the Grand Giveaway drawing regardless of your subscription status."
                },
                {
                  q: "Can I upgrade mid-month?",
                  a: "Yes! Your VIP benefits activate immediately and you get access to all VIP prize segments right away."
                },
                {
                  q: "What are the VIP-only prizes worth?",
                  a: "VIP prizes range from $100 to $500+ in value, including premium spa packages, extended gym memberships, and event credits."
                }
              ].map((faq, i) => (
                <div key={i} className="border-b border-border pb-4">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Win Big?</h2>
            <p className="text-muted-foreground mb-8">Join VIP today and unlock exclusive prizes.</p>
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-10"
              onClick={handleSubscribe}
            >
              <Crown className="w-5 h-5 mr-2" />
              Join VIP — $2.99/month
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}