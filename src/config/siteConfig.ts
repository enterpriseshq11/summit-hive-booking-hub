// Centralized site configuration - Single source of truth for contact info and business details

export const SITE_CONFIG = {
  // Contact Information. Front desk / building-level
  contact: {
    phone: "(419) 909-6031",
    phoneFormatted: "(419) 909-6031",
    phoneLink: "tel:+14199096031",
    email: "dylan@a-zenterpriseshq.com",
    emailLink: "mailto:dylan@a-zenterpriseshq.com",
  },
  // Division-specific contact (suite addresses + direct lines)
  divisions: {
    spa: {
      name: "The Spa",
      suite: "Suite A",
      phone: "(419) 909-6031",
      phoneLink: "tel:+14199096031",
    },
    fitness: {
      name: "Zero Gravity Fitness",
      suite: "Suite B",
      phone: "(419) 909-6031",
      phoneLink: "tel:+14199096031",
    },
    summit: {
      name: "The Summit Event Center", // retired, not used on any public page
      suite: "Suite C",
      phone: "(419) 909-6031",
      phoneLink: "tel:+14199096031",
    },
    coworking: {
      name: "The Hive Coworking",
      suite: "Suite D",
      phone: "(419) 909-6031",
      phoneLink: "tel:+14199096031",
    },
    voiceVault: {
      name: "Voice Vault Recording Studio",
      suite: "Suite Z",
      phone: "(419) 909-6031",
      phoneLink: "tel:+14199096031",
    },
  },
  
  // Location (REQUIRES CLIENT CONFIRMATION FOR ADDRESS)
  location: {
    city: "Wapakoneta",
    state: "Ohio",
    stateAbbr: "OH",
    // TODO: Replace with actual address once confirmed by client
    street: "10 W Auglaize St",
    full: "10 W Auglaize St, Wapakoneta, Ohio 45895",
    zip: "45895",
  },
  
  // Operating Hours. Each business carries its own hours. Nothing building-wide is published.
  hours: {
    days: "Call for hours",
    time: "Call for hours",
    range: "Hours vary by business. Call for hours.",
    shortDays: "Call for hours",
  },
  
  // Business Info
  business: {
    name: "A-Z Enterprises",
    tagline: "Built by a family. Built for downtown Wapak.",
    copyright: `© ${new Date().getFullYear()} A-Z Enterprises. All rights reserved.`,
  },
  
  // Capacity Info
  capacity: {
    summit: {
      max: 300,
      description: "Up to 300 guests",
    },
  },
} as const;