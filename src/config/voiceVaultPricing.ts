/**
 * Voice Vault Pricing Configuration
 * 
 * This file centralizes all pricing for Voice Vault to make it easy to update
 * without code changes. Update these values to change pricing across the app.
 */

export const VOICE_VAULT_PRICING = {
  // Hourly Studio Rental
  hourly: {
    ratePerHour: 45,
    minimumHours: 2,
    stripePriceId: "price_1SlvgcPFNT8K72RI8QHbSSzo", // $45 one-time (per hour, qty = hours)
  },

  // Core Series Package - $1,000 total
  coreSeries: {
    name: "Core Series",
    description: "10-episode podcast package with full production support",
    totalPrice: 1000,
    episodes: 10,
    weeklyPayment: 100,
    weeklyTermWeeks: 10,
    stripePrices: {
      full: "price_1SlvrPPFNT8K72RIFp9bHYT3",      // $1,000 one-time
      weekly: "price_1SlvrRPFNT8K72RITmDjwzVR",   // $100/week recurring
    },
    stripeMetadata: {
      product_type: "core_series",
      term_weeks: 10,
      package_name: "Core Series",
    },
  },

  // White Glove Package - $2,000 total
  whiteGlove: {
    name: "White Glove",
    description: "Full production support with white glove service",
    totalPrice: 2000,
    paymentOptions: {
      // Standard: $100/week for 20 weeks
      standard: {
        weeklyPayment: 100,
        termWeeks: 20,
        stripePriceId: "price_1SlvrUPFNT8K72RImNuQQ3R3",
      },
      // Accelerated: $200/week for 10 weeks
      accelerated: {
        weeklyPayment: 200,
        termWeeks: 10,
        stripePriceId: "price_1SlvrWPFNT8K72RIpNAdCFHP",
      },
    },
    stripePrices: {
      full: "price_1SlvrSPFNT8K72RI5xFYHvwY",     // $2,000 one-time
    },
    stripeMetadata: {
      product_type: "white_glove",
      package_name: "White Glove",
    },
  },
} as const;

// Type for payment plan selection
export type WhiteGlovePaymentOption = "standard" | "accelerated";

// Helper functions
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

export function getPackageDisplayPrice(
  packageType: "core_series" | "white_glove",
  plan: "full" | "weekly",
  whiteGloveOption?: WhiteGlovePaymentOption
): string {
  if (packageType === "core_series") {
    const pkg = VOICE_VAULT_PRICING.coreSeries;
    return plan === "full" 
      ? `$${pkg.totalPrice.toLocaleString()}` 
      : `$${pkg.weeklyPayment}/week for ${pkg.weeklyTermWeeks} weeks`;
  }

  const pkg = VOICE_VAULT_PRICING.whiteGlove;
  if (plan === "full") {
    return `$${pkg.totalPrice.toLocaleString()}`;
  }
  
  const option = pkg.paymentOptions[whiteGloveOption || "standard"];
  return `$${option.weeklyPayment}/week for ${option.termWeeks} weeks`;
}

export function getStripePriceId(
  packageType: "core_series" | "white_glove",
  plan: "full" | "weekly",
  whiteGloveOption?: WhiteGlovePaymentOption
): string {
  if (packageType === "core_series") {
    return plan === "full"
      ? VOICE_VAULT_PRICING.coreSeries.stripePrices.full
      : VOICE_VAULT_PRICING.coreSeries.stripePrices.weekly;
  }

  if (plan === "full") {
    return VOICE_VAULT_PRICING.whiteGlove.stripePrices.full;
  }

  return VOICE_VAULT_PRICING.whiteGlove.paymentOptions[whiteGloveOption || "standard"].stripePriceId;
}

export function getTermWeeks(
  packageType: "core_series" | "white_glove",
  plan: "full" | "weekly",
  whiteGloveOption?: WhiteGlovePaymentOption
): number {
  if (plan === "full") return 0;
  
  if (packageType === "core_series") {
    return VOICE_VAULT_PRICING.coreSeries.weeklyTermWeeks;
  }

  return VOICE_VAULT_PRICING.whiteGlove.paymentOptions[whiteGloveOption || "standard"].termWeeks;
}
