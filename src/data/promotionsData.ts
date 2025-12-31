// Promotions Data Model - Source of Truth
// All promotions render from this model

export type BusinessType = "summit" | "coworking" | "spa" | "fitness" | "giftcards";
export type PromotionCategory = "all" | "office" | "spa" | "fitness" | "bundles" | "limited";
export type EligibilityType = "new" | "existing" | "member" | "office_renter" | "all" | "first_responder" | "corporate";
export type RedemptionType = "code" | "auto_applied" | "claim_to_email" | "claim_to_account";

export interface PromotionData {
  id: string;
  title: string;
  category: PromotionCategory;
  businesses_included: BusinessType[];
  value_stack: string[];
  eligibility: EligibilityType[];
  eligibility_description: string;
  redemption_type: RedemptionType;
  redemption_instructions: string;
  start_date: string | null;
  end_date: string | null;
  is_featured: boolean;
  is_limited_time: boolean;
  short_description: string;
  long_description: string;
  terms_short: string;
  terms_full: string;
  disclaimer: string;
  badge?: string;
  tags: string[];
  cta_label: string;
  sort_order: number;
}

// The 8 Required Cross-Business Bundle Promotions
export const PROMOTIONS_DATA: PromotionData[] = [
  // 1. Office Move-In Boost (January)
  {
    id: "office-move-in-boost",
    title: "Office Move-In Boost",
    category: "bundles",
    businesses_included: ["coworking", "summit", "fitness", "spa"],
    value_stack: [
      "50% off 1 Summit event booking (up to $500 value)",
      "2 additional gym memberships for 30 days",
      "1 complimentary Spa recovery add-on",
      "Priority move-in support"
    ],
    eligibility: ["new", "office_renter"],
    eligibility_description: "New office leases signed in January only",
    redemption_type: "claim_to_account",
    redemption_instructions: "Claim this offer below. Our team will apply benefits to your account within 24 hours of lease confirmation.",
    start_date: "2025-01-01",
    end_date: "2025-01-31",
    is_featured: true,
    is_limited_time: true,
    short_description: "Rent any private office in January and unlock fitness, spa, and event perks automatically.",
    long_description: "Start the year strong with our most comprehensive office package. When you sign a new private office lease in January, you'll receive premium cross-business benefits designed to support your productivity, wellness, and networking.",
    terms_short: "New office leases only. Benefits activate upon lease confirmation.",
    terms_full: "This offer applies to new private office leases signed between January 1-31, 2025. The 50% Summit event discount applies to a single booking up to $500 in value. Gym memberships are valid for 30 days from activation and are non-transferable. Spa recovery add-on must be redeemed within 60 days. Benefits cannot be combined with other offers. Subject to availability.",
    disclaimer: "Non-cash value. Non-transferable. One offer per lease agreement.",
    badge: "January Exclusive",
    tags: ["office", "coworking", "bundle", "new", "limited"],
    cta_label: "Claim Offer",
    sort_order: 1
  },

  // 2. 3 Massages = Gym Access
  {
    id: "massage-gym-bundle",
    title: "3 Massages = Gym Access",
    category: "bundles",
    businesses_included: ["spa", "fitness"],
    value_stack: [
      "Book 3 massages in January",
      "Receive 30-day gym membership included",
      "Full access to all fitness equipment",
      "Locker room and amenities included"
    ],
    eligibility: ["all"],
    eligibility_description: "Available to all guests and members",
    redemption_type: "auto_applied",
    redemption_instructions: "Book your third massage and your gym access will be automatically activated. You'll receive confirmation via email with your start date.",
    start_date: "2025-01-01",
    end_date: "2025-01-31",
    is_featured: true,
    is_limited_time: true,
    short_description: "Book 3 massages in January → 30-day gym membership included.",
    long_description: "Recovery and performance go hand in hand. Complete three massage bookings in January and we'll unlock a full 30-day gym membership—on us. Train hard, recover smarter.",
    terms_short: "Single person, non-transferable. January bookings only.",
    terms_full: "All three massage appointments must be booked and completed within January 2025. Gym membership activates upon completion of the third massage and is valid for 30 consecutive days. Membership is for the individual who booked the massages only and cannot be transferred. Cannot be combined with existing gym memberships.",
    disclaimer: "Non-cash value. Non-transferable. One redemption per person.",
    badge: "January Exclusive",
    tags: ["spa", "fitness", "bundle", "limited", "wellness"],
    cta_label: "Book First Massage",
    sort_order: 2
  },

  // 3. Coworking + Summit Credit
  {
    id: "coworking-summit-credit",
    title: "Coworking + Summit Credit",
    category: "bundles",
    businesses_included: ["coworking", "summit"],
    value_stack: [
      "Any coworking membership",
      "$___ Summit booking credit [REQUIRES CONFIRMATION]",
      "Priority event scheduling",
      "Member networking access"
    ],
    eligibility: ["member"],
    eligibility_description: "Active coworking members only",
    redemption_type: "claim_to_email",
    redemption_instructions: "Claim below and we'll send your Summit credit code via email within 24 hours. Apply the code when booking your next event.",
    start_date: null,
    end_date: null,
    is_featured: false,
    is_limited_time: false,
    short_description: "Any coworking membership unlocks Summit booking credit for your events.",
    long_description: "Your workspace investment opens doors beyond the office. As a coworking member, you receive exclusive Summit event credits to host clients, celebrate milestones, or expand your network in our premium event spaces.",
    terms_short: "Active coworking membership required. Credit valid for 90 days.",
    terms_full: "Summit credit is available to active coworking members in good standing. Credit must be applied within 90 days of claim and is valid for a single booking. Cannot be combined with other Summit discounts or promotions. Credit has no cash value and unused portions will not be refunded.",
    disclaimer: "No cash value. Credit expires 90 days from activation.",
    badge: "Member Perk",
    tags: ["office", "coworking", "summit", "member"],
    cta_label: "Claim Credit",
    sort_order: 3
  },

  // 4. Fitness Starter Pack + Spa Recovery
  {
    id: "fitness-starter-spa",
    title: "Fitness Starter Pack + Spa Recovery",
    category: "bundles",
    businesses_included: ["fitness", "spa"],
    value_stack: [
      "New gym membership signup",
      "1 discounted recovery session (sauna/steam)",
      "Complimentary fitness assessment",
      "Wellness orientation included"
    ],
    eligibility: ["new"],
    eligibility_description: "New gym members only",
    redemption_type: "claim_to_account",
    redemption_instructions: "Sign up for gym membership and claim this offer. Your recovery session discount will be added to your account automatically.",
    start_date: null,
    end_date: null,
    is_featured: true,
    is_limited_time: false,
    short_description: "New gym member → 1 discounted recovery session (sauna/steam/etc.)",
    long_description: "Start your fitness journey the right way. New members receive a discounted spa recovery session to help you recover from those first intense workouts. Because sustainable fitness starts with proper recovery.",
    terms_short: "New members only. Recovery session must be booked within 30 days.",
    terms_full: "This offer is available to new gym members who have not held a membership in the past 12 months. Discounted recovery session must be booked within 30 days of membership activation. Session options include sauna, steam room, or cold plunge (subject to availability). Cannot be combined with other new member offers.",
    disclaimer: "One per household. Recovery session subject to availability.",
    badge: "New Member",
    tags: ["fitness", "spa", "new", "wellness", "recovery"],
    cta_label: "Join & Claim",
    sort_order: 4
  },

  // 5. Couples Reset Bundle
  {
    id: "couples-reset-bundle",
    title: "Couples Reset Bundle",
    category: "bundles",
    businesses_included: ["spa", "summit"],
    value_stack: [
      "Couples massage session",
      "Summit date-night add-on discount",
      "Private lounge access",
      "Champagne service available"
    ],
    eligibility: ["all"],
    eligibility_description: "Available to all guests booking for two",
    redemption_type: "claim_to_email",
    redemption_instructions: "Claim this offer and receive booking instructions via email. Mention 'Couples Reset' when scheduling your spa appointment.",
    start_date: null,
    end_date: null,
    is_featured: false,
    is_limited_time: false,
    short_description: "Couples massage + Summit date-night add-on discount for the perfect evening.",
    long_description: "Reconnect and recharge together. Book a couples massage and receive exclusive discounts on Summit event add-ons—perfect for an anniversary, celebration, or just because. Create an unforgettable experience.",
    terms_short: "Booking for two required. Add-on discounts valid 30 days.",
    terms_full: "Couples massage must be booked for two people. Summit date-night add-on discount applies to select enhancements (champagne service, private lounge access, dessert packages) and is valid for 30 days from couples massage completion. Advance booking required. Subject to availability.",
    disclaimer: "Cannot be combined with other spa promotions.",
    badge: "Couples",
    tags: ["spa", "summit", "couples", "date-night"],
    cta_label: "Plan Your Evening",
    sort_order: 5
  },

  // 6. Executive Wellness Bundle
  {
    id: "executive-wellness-bundle",
    title: "Executive Wellness Bundle",
    category: "bundles",
    businesses_included: ["coworking", "spa", "fitness"],
    value_stack: [
      "Office renter exclusive",
      "Monthly spa discount on select services",
      "Priority booking lane (48hr advance access)",
      "Dedicated wellness concierge",
      "Quarterly health assessments"
    ],
    eligibility: ["office_renter"],
    eligibility_description: "Private office leaseholders only",
    redemption_type: "claim_to_account",
    redemption_instructions: "Claim to activate Executive Wellness on your account. Benefits begin immediately and renew monthly with your lease.",
    start_date: null,
    end_date: null,
    is_featured: true,
    is_limited_time: false,
    short_description: "Office renter → monthly spa discount + priority booking lane across all services.",
    long_description: "Leadership demands peak performance. As an office leaseholder, you gain exclusive access to our Executive Wellness program—designed for professionals who understand that personal health drives business success.",
    terms_short: "Active office lease required. Benefits renew monthly.",
    terms_full: "Executive Wellness Bundle is available to active private office leaseholders. Monthly spa discount applies to select services and is subject to availability. Priority booking provides 48-hour advance access to new appointment slots. Benefits continue while lease is active and in good standing. Wellness concierge available during business hours.",
    disclaimer: "Benefits tied to active lease status. Non-transferable.",
    badge: "Featured",
    tags: ["office", "spa", "fitness", "executive", "bundle", "member"],
    cta_label: "Activate Benefits",
    sort_order: 6
  },

  // 7. Gift Card Booster
  {
    id: "gift-card-booster",
    title: "Gift Card Booster",
    category: "limited",
    businesses_included: ["giftcards"],
    value_stack: [
      "Purchase $200 gift card",
      "Receive bonus $25 value",
      "Valid across all businesses",
      "Never expires"
    ],
    eligibility: ["all"],
    eligibility_description: "Available to all purchasers",
    redemption_type: "code",
    redemption_instructions: "Purchase a $200 gift card and receive a separate $25 bonus code via email. Both codes work across all A-Z Enterprises businesses.",
    start_date: "2025-01-01",
    end_date: "2025-01-31",
    is_featured: false,
    is_limited_time: true,
    short_description: "Buy $200 gift card → get bonus $25 value. Give the gift of wellness.",
    long_description: "Make your gift go further. Purchase a $200 gift card this month and receive a bonus $25 value—that's $225 worth of experiences across spa, fitness, events, and more. Perfect for birthdays, holidays, or showing appreciation.",
    terms_short: "Limit 3 per customer. Bonus issued separately.",
    terms_full: "Bonus $25 value is issued as a separate code and delivered via email within 24 hours of purchase. Limit 3 gift card purchases per customer during promotion period. Gift cards and bonus codes are valid across all A-Z Enterprises businesses. Gift cards never expire. Bonus codes expire 12 months from issue date.",
    disclaimer: "Gift cards have no cash value. Cannot be redeemed for cash.",
    badge: "January Exclusive",
    tags: ["giftcards", "limited", "bonus"],
    cta_label: "Buy Gift Card",
    sort_order: 7
  },

  // 8. Local Hero / First Responder
  {
    id: "local-hero-discount",
    title: "Local Hero Appreciation",
    category: "bundles",
    businesses_included: ["spa", "fitness"],
    value_stack: [
      "Exclusive discount on spa services",
      "Reduced gym membership rates",
      "Free fitness assessment",
      "Dedicated scheduling priority"
    ],
    eligibility: ["first_responder"],
    eligibility_description: "Military, first responders, healthcare workers, and teachers (ID required)",
    redemption_type: "claim_to_account",
    redemption_instructions: "Claim this offer and bring valid ID (military, first responder badge, hospital ID, or teacher credentials) on your first visit. Discount will be applied to your account after verification.",
    start_date: null,
    end_date: null,
    is_featured: false,
    is_limited_time: false,
    short_description: "Exclusive discounts for military, first responders, healthcare workers, and teachers.",
    long_description: "Thank you for your service. We're proud to offer exclusive savings to those who serve our community. Present valid ID to unlock ongoing discounts across our spa and fitness services—our small way of saying thanks.",
    terms_short: "Valid ID required at each visit. Discounts apply to individual only.",
    terms_full: "Local Hero discount is available to active and retired military, police, fire, EMT, nurses, doctors, and K-12 teachers. Valid government-issued ID, badge, or credentials must be presented at first visit for account verification. Discount applies to the verified individual only and cannot be shared. Discount applies to standard pricing and cannot be combined with other offers.",
    disclaimer: "ID verification required. Individual use only. Non-transferable.",
    badge: "Thank You",
    tags: ["spa", "fitness", "first_responder", "healthcare", "military"],
    cta_label: "Claim Your Discount",
    sort_order: 8
  }
];

// Filter options for the promotions page
export const FILTER_OPTIONS = [
  { id: "all", label: "All Offers" },
  { id: "limited-time", label: "Limited-Time", filterFn: (p: PromotionData) => p.is_limited_time },
  { id: "best-value", label: "Best Value", filterFn: (p: PromotionData) => p.is_featured },
  { id: "new-member", label: "New Member", filterFn: (p: PromotionData) => p.eligibility.includes("new") },
  { id: "office-renter", label: "Office Renter", filterFn: (p: PromotionData) => p.eligibility.includes("office_renter") },
  { id: "giftable", label: "Giftable", filterFn: (p: PromotionData) => p.businesses_included.includes("giftcards") || p.tags.includes("gift") },
];

// Helper function to get promotions by category
export function getPromotionsByCategory(category: PromotionCategory): PromotionData[] {
  if (category === "all") return PROMOTIONS_DATA;
  return PROMOTIONS_DATA.filter(p => p.category === category || p.tags.includes(category));
}

// Helper function to filter promotions
export function filterPromotions(
  promotions: PromotionData[],
  category: PromotionCategory,
  filter: string
): PromotionData[] {
  let result = category === "all" 
    ? promotions 
    : promotions.filter(p => p.category === category || p.tags.includes(category));
  
  if (filter && filter !== "all") {
    const filterOption = FILTER_OPTIONS.find(f => f.id === filter);
    if (filterOption?.filterFn) {
      result = result.filter(filterOption.filterFn);
    }
  }
  
  return result.sort((a, b) => a.sort_order - b.sort_order);
}
