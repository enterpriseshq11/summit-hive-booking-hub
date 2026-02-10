import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Sparkles, Dumbbell, Layers, Clock, Gift, Mic, Camera } from "lucide-react";

// Updated category types to include all business units + specials scoped mode
export type PromotionCategoryTab = "all" | "office" | "spa" | "fitness" | "voice_vault" | "photo_booth_360" | "bundles" | "limited";

interface Tab {
  id: PromotionCategoryTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: "all", label: "All Offers", icon: Gift },
  { id: "office", label: "Office & Coworking", icon: Building2 },
  { id: "spa", label: "Spa & Wellness", icon: Sparkles },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "voice_vault", label: "Voice Vault", icon: Mic },
  { id: "photo_booth_360", label: "360 Photo Booth", icon: Camera },
  { id: "bundles", label: "Bundles", icon: Layers },
  { id: "limited", label: "Limited-Time", icon: Clock },
];

interface PromotionCategoryTabsProps {
  activeTab: PromotionCategoryTab;
  onTabChange: (tab: PromotionCategoryTab) => void;
  /** When true, only show unit-specific tabs (hide bundles/limited/all) */
  scopedMode?: boolean;
}

export function PromotionCategoryTabs({ activeTab, onTabChange, scopedMode }: PromotionCategoryTabsProps) {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const visibleTabs = scopedMode
    ? TABS.filter(t => !["all", "bundles", "limited"].includes(t.id))
    : TABS;

  return (
    <>
      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-px" />
      
      <div
        className={`
          sticky top-0 z-40 transition-all duration-300
          ${isSticky ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm" : "bg-muted/30"}
        `}
      >
        <div className="max-w-6xl mx-auto px-4">
          <nav 
            role="tablist" 
            aria-label="Promotion categories"
            className="flex gap-1 overflow-x-auto py-3 scrollbar-hide"
          >
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg
                    transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 
                    focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background
                    ${activeTab === tab.id 
                      ? "text-gold bg-gold/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                  data-event={`promo_view_category_${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
