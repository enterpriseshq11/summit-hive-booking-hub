// Specials data for each business division
// Easy to update without touching page components

export interface Special {
  id: string;
  title: string;
  description: string;
  badge?: string;
  ctaLabel: string;
  ctaRoute?: string; // optional route to navigate
}

export const SUMMIT_SPECIALS: Special[] = [
  {
    id: "grad-parties",
    title: "Graduation Party Packages",
    description: "Celebrate your grad's big day at The Summit. Customizable packages for groups of all sizes.",
    badge: "Popular",
    ctaLabel: "Request Info",
  },
  {
    id: "baby-showers",
    title: "Baby Shower Events",
    description: "A beautiful, stress-free baby shower experience. Full event coordination included.",
    badge: "New",
    ctaLabel: "Request Info",
  },
  {
    id: "corporate-holiday",
    title: "Corporate & Holiday Parties",
    description: "Book your team celebration or holiday event at a premium venue with full-service support.",
    ctaLabel: "Request Info",
  },
];

export const SPA_SPECIALS: Special[] = [
  {
    id: "bogo-massage",
    title: "Buy One, Get One Free Massage",
    description: "Book a massage and get your second one free. Use promo code BOGOMASSAGE at checkout.",
    badge: "BOGO",
    ctaLabel: "Book a Massage",
    ctaRoute: "/spa",
  },
  {
    id: "couples-reset",
    title: "Couples Reset Bundle",
    description: "Couples massage + Summit date-night add-on discount for the perfect evening together.",
    badge: "Couples",
    ctaLabel: "Learn More",
    ctaRoute: "/promotions",
  },
  {
    id: "first-responder-spa",
    title: "Local Hero Discount",
    description: "Exclusive spa discounts for military, first responders, healthcare workers, and teachers.",
    badge: "Thank You",
    ctaLabel: "Claim Discount",
    ctaRoute: "/promotions",
  },
];

export const HIVE_SPECIALS: Special[] = [
  {
    id: "move-in-boost",
    title: "Office Move-In Boost",
    description: "Sign a new private office lease and unlock fitness, spa, and event perks automatically.",
    badge: "Featured",
    ctaLabel: "Learn More",
    ctaRoute: "/promotions",
  },
  {
    id: "coworking-summit-credit",
    title: "Coworking + Summit Credit",
    description: "Active coworking members receive Summit booking credit for events.",
    badge: "Member Perk",
    ctaLabel: "Claim Credit",
    ctaRoute: "/promotions",
  },
  {
    id: "executive-wellness",
    title: "Executive Wellness Bundle",
    description: "Office renters get monthly spa discounts + priority booking across all services.",
    badge: "Executive",
    ctaLabel: "Learn More",
    ctaRoute: "/promotions",
  },
];
