import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PromotionCategory } from "@/hooks/usePromotions";

interface Tab {
  id: PromotionCategory | "terms";
  label: string;
}

const TABS: Tab[] = [
  { id: "signature", label: "Signature Bundles" },
  { id: "monthly", label: "Monthly Promotions" },
  { id: "vault", label: "Package Vault" },
  { id: "terms", label: "Terms" },
];

interface PromotionCategoryTabsProps {
  activeTab: PromotionCategory | "terms";
  onTabChange: (tab: PromotionCategory | "terms") => void;
}

export function PromotionCategoryTabs({ activeTab, onTabChange }: PromotionCategoryTabsProps) {
  const [isSticky, setIsSticky] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
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

  return (
    <>
      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-px" />
      
      <div
        ref={tabsRef}
        className={`
          sticky top-0 z-40 transition-all duration-300
          ${isSticky ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm" : ""}
        `}
      >
        <div className="max-w-5xl mx-auto px-4">
          <nav 
            role="tablist" 
            aria-label="Promotion categories"
            className="flex gap-1 overflow-x-auto py-4 scrollbar-hide"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg
                  transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 
                  focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  ${activeTab === tab.id 
                    ? "text-gold" 
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
                data-event={`promo_view_category_${tab.id}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
