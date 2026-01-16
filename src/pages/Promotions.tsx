import { useState, useMemo } from "react";
import { Gift, Sparkles, Check, ArrowRight, Clock, Shield, BadgeCheck, Layers, Star, Building2, Dumbbell, Mail } from "lucide-react";
import { Button, ButtonPrimary, ButtonSecondary } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PromotionCard,
  PromotionDetailModal,
  PromotionInterestForm,
  PromotionCategoryTabs,
  StickyMobilePromotionsCTA,
  CorporateIntakeModal,
} from "@/components/promotions";
import { usePromotions, type Promotion } from "@/hooks/usePromotions";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { PromotionCategoryTab } from "@/components/promotions/PromotionCategoryTabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CinematicHeroBackground from "@/components/ui/CinematicHeroBackground";

const TRUST_CHIPS = [
  { icon: BadgeCheck, label: "No coupons required" },
  { icon: Clock, label: "Automatic tracking" },
  { icon: Shield, label: "Clear rules" },
  { icon: Check, label: "No surprise fees" },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Choose Offer", description: "Browse bundles and promotions" },
  { step: 2, title: "Qualify", description: "Meet eligibility requirements" },
  { step: 3, title: "Benefits Activate", description: "Start enjoying your perks" },
];

const TESTIMONIALS = [
  {
    quote: "The office bundle gave me access to everything I needed—gym, spa credits, and event discounts. Worth every penny.",
    author: "Executive Member",
    role: "Summit Office Leaseholder"
  },
  {
    quote: "I signed up for the recovery package and it's transformed my training routine. The bundled savings are real.",
    author: "Fitness Enthusiast",
    role: "Performance Bundle Member"
  }
];

// Business icons for cross-business display
const BUSINESS_ICONS = {
  summit: Building2,
  coworking: Building2,
  spa: Sparkles,
  fitness: Dumbbell,
  events: Star,
};

export default function Promotions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PromotionCategoryTab>("all");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);
  const [preselectedOffer, setPreselectedOffer] = useState<Promotion | null>(null);
  const [promoEmail, setPromoEmail] = useState("");

  const { data: promotions = [], isLoading } = usePromotions();

  // Filter promotions based on the new category tabs
  const filteredPromotions = useMemo(() => {
    if (activeTab === "all") return promotions;
    
    return promotions.filter((p) => {
      switch (activeTab) {
        case "office":
          return p.tags?.some(t => ["office", "coworking", "summit"].includes(t.toLowerCase()));
        case "spa":
          return p.tags?.some(t => ["spa", "wellness", "massage", "recovery"].includes(t.toLowerCase()));
        case "fitness":
          return p.tags?.some(t => ["fitness", "gym", "training"].includes(t.toLowerCase()));
        case "bundles":
          return p.category === "signature" || p.tags?.includes("bundle");
        case "limited":
          return p.badge?.toLowerCase().includes("limited") || p.end_date;
        default:
          return true;
      }
    });
  }, [promotions, activeTab]);

  const handleSelectPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsDetailModalOpen(true);
  };

  const handleStartOffer = (promotion: Promotion) => {
    setIsDetailModalOpen(false);
    
    if (promotion.slug === "corporate-vip") {
      setIsCorporateModalOpen(true);
      return;
    }

    if (promotion.primary_cta_action === "route_to_page" && promotion.primary_cta_target) {
      navigate(`${promotion.primary_cta_target}?promo=${promotion.slug}`);
      return;
    }

    setPreselectedOffer(promotion);
    setTimeout(() => {
      document.getElementById("interest-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const scrollToOffers = () => {
    document.getElementById("offers-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePromoEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoEmail) {
      toast.success("You're on the list! We'll notify you of new offers.");
      setPromoEmail("");
    }
  };

  // Dynamic hero content based on user state
  const heroHeadline = user 
    ? "Your Member-Only Advantages" 
    : "More Value. More Results. One Ecosystem.";
  
  const heroCTA = user 
    ? "View My Eligible Promotions" 
    : "Explore Current Offers";

  return (
    <>
      {/* Hero Section - Enhanced with animated glow */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden bg-primary">
        {/* Cinematic Hero Background */}
        <CinematicHeroBackground />
        
        {/* Animated glow effect */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[180px] opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(43 74% 49%) 0%, transparent 70%)" }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <Badge variant="outline" className="mb-6 border-gold/50 text-gold bg-gold/10 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-2" />
            Promotions
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="block text-white">More Value. More Results.</span>
            <span className="block text-accent">One Ecosystem.</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Exclusive bundles and limited-time offers designed to help you get more from A-Z Enterprises.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              size="lg"
              onClick={scrollToOffers}
              className="bg-gold hover:bg-gold/90 text-primary font-semibold px-8"
              data-event="promo_hero_cta_view_offers"
            >
              <Gift className="w-4 h-4 mr-2" />
              {heroCTA}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("interest-form")?.scrollIntoView({ behavior: "smooth" })}
              className="border-gold/50 text-gold hover:bg-gold/10"
              data-event="promo_hero_cta_custom_bundle"
            >
              Request Custom Bundle
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/60">
            No surprise fees. Clear eligibility. Benefits apply instantly when qualified.
          </p>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* How It Works Strip */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0 shadow-lg shadow-gold/10">
                  <span className="text-gold font-bold">{step.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Category Tabs */}
      <div id="offers-section">
        <PromotionCategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Trust Chips */}
      <div className="bg-muted/20 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6">
            {TRUST_CHIPS.map((chip) => (
              <div key={chip.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <chip.icon className="w-4 h-4 text-gold/70" />
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      <section className="py-12 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {activeTab === "all" && "All Offers"}
              {activeTab === "office" && "Office & Coworking Promotions"}
              {activeTab === "spa" && "Spa & Wellness Specials"}
              {activeTab === "fitness" && "Fitness Deals"}
              {activeTab === "bundles" && "Cross-Business Bundles"}
              {activeTab === "limited" && "Limited-Time Offers"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {activeTab === "all" && "Browse all available promotions and packages."}
              {activeTab === "office" && "Maximize your workspace investment with exclusive member perks."}
              {activeTab === "spa" && "Recovery, relaxation, and wellness bundles for optimal self-care."}
              {activeTab === "fitness" && "Training packages and gym membership enhancements."}
              {activeTab === "bundles" && "High-value packages that combine multiple businesses for maximum savings."}
              {activeTab === "limited" && "Time-sensitive offers—available for a limited window only."}
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : filteredPromotions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  onSelect={handleSelectPromotion}
                />
              ))}
            </div>
          ) : (
            // Premium Empty State
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                New offers rotate monthly
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Our promotions are carefully curated and refresh regularly. Join our promo list to be first to know when new offers drop.
              </p>
              <form onSubmit={handlePromoEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={promoEmail}
                  onChange={(e) => setPromoEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="bg-gold hover:bg-gold/90 text-primary font-semibold">
                  <Mail className="w-4 h-4 mr-2" />
                  Join Promo List
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Testimonials Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            What Members Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-2xl bg-card border border-border/50"
              >
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-gold via-gold/50 to-transparent rounded-full" />
                <blockquote className="text-foreground mb-4 pl-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="pl-4">
                  <p className="text-sm font-medium text-gold">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Interest Form */}
      <section id="interest-form" className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4">
          <PromotionInterestForm preselectedOffer={preselectedOffer} />
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Final CTA */}
      <section className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-muted/50 via-card to-muted/30 border border-border/50">
            <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-gold via-gold/50 to-transparent rounded-full" />
            
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Find the Right Package for You
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Tell us what you want to combine and we'll build the best-value package.
            </p>
            <Button
              size="lg"
              onClick={() => document.getElementById("interest-form")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-gold hover:bg-gold/90 text-primary font-semibold px-8"
              data-event="promo_footer_cta_custom_bundle"
            >
              Request a Custom Bundle
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-muted/20 border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Offers rotate monthly and may be modified at any time. Benefits apply based on eligibility criteria for each promotion.
          </p>
        </div>
      </section>

      <PromotionDetailModal
        promotion={selectedPromotion}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onStartOffer={handleStartOffer}
      />

      <CorporateIntakeModal
        open={isCorporateModalOpen}
        onOpenChange={setIsCorporateModalOpen}
      />

      <StickyMobilePromotionsCTA onOpenOffers={scrollToOffers} />
    </>
  );
}
