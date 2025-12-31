import { useState, useMemo } from "react";
import { Gift, Sparkles, Check, ArrowRight, Clock, Shield, BadgeCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout";
import {
  PromotionCard,
  PromotionDetailModal,
  PromotionInterestForm,
  PromotionCategoryTabs,
  PromotionFilters,
  PromotionTerms,
  StickyMobilePromotionsCTA,
  CorporateIntakeModal,
} from "@/components/promotions";
import { usePromotions, type Promotion, type PromotionCategory } from "@/hooks/usePromotions";
import { useNavigate } from "react-router-dom";

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

export default function Promotions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PromotionCategory | "terms">("signature");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);
  const [preselectedOffer, setPreselectedOffer] = useState<Promotion | null>(null);

  const { data: promotions = [], isLoading } = usePromotions();

  const filteredPromotions = useMemo(() => {
    if (activeTab === "terms") return [];
    
    let filtered = promotions.filter((p) => p.category === activeTab);
    
    if (activeFilter !== "all") {
      filtered = filtered.filter((p) => 
        p.tags?.includes(activeFilter) || 
        (activeFilter === "limited" && p.badge?.toLowerCase().includes("limited"))
      );
    }
    
    return filtered;
  }, [promotions, activeTab, activeFilter]);

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

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[150px] opacity-30" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <Badge variant="outline" className="mb-6 border-gold/50 text-gold bg-gold/10 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-2" />
            Premium Perks
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Member Exclusives
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Premium bundles and limited-time advantages across coworking, fitness, spa, and events—built to reward members who do more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              size="lg"
              onClick={scrollToOffers}
              className="bg-gold hover:bg-gold/90 text-primary-foreground font-semibold px-8"
              data-event="promo_hero_cta_view_offers"
            >
              <Gift className="w-4 h-4 mr-2" />
              View Offers
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

          <p className="text-sm text-muted-foreground">
            No coupons. Clear rules. Benefits activate fast.
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

      <div id="offers-section">
        <PromotionCategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

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

      <section className="py-12 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          {activeTab === "terms" ? (
            <PromotionTerms />
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {activeTab === "signature" && "Signature Bundles"}
                  {activeTab === "monthly" && "Monthly Promotions"}
                  {activeTab === "vault" && "Package Vault"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {activeTab === "signature" && "High-value cross-business packages designed to multiply your membership."}
                  {activeTab === "monthly" && "Limited windows. High-value perks. Built for momentum."}
                  {activeTab === "vault" && "Pre-built bundles for couples, teams, weddings, and founders—request one and we'll confirm details within 24 hours."}
                </p>
              </div>

              <PromotionFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : filteredPromotions.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPromotions.map((promotion) => (
                    <PromotionCard
                      key={promotion.id}
                      promotion={promotion}
                      onSelect={handleSelectPromotion}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No offers match your current filters.</p>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveFilter("all")}
                    className="mt-4 text-gold hover:text-gold/80"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <section id="interest-form" className="py-16 bg-muted/30">
        <div className="max-w-2xl mx-auto px-4">
          <PromotionInterestForm preselectedOffer={preselectedOffer} />
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <section className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-br from-muted/50 via-card to-muted/30 border border-border/50">
            <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-gold via-gold/50 to-transparent rounded-full" />
            
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Want a custom bundle built for you?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Tell us what you want to combine and we'll build the best-value package.
            </p>
            <Button
              size="lg"
              onClick={() => document.getElementById("interest-form")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-gold hover:bg-gold/90 text-primary-foreground font-semibold px-8"
              data-event="promo_footer_cta_custom_bundle"
            >
              Request a Custom Bundle
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
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
    </MainLayout>
  );
}
