// Centralized site configuration - Single source of truth for contact info and business details

export const SITE_CONFIG = {
  // Contact Information — Front desk / building-level
  contact: {
    phone: "(567) 429-9924",
    phoneFormatted: "(567) 429-9924",
    phoneLink: "tel:+15674299924",
    email: "dylan@a-zenterpriseshq.com",
    emailLink: "mailto:dylan@a-zenterpriseshq.com",
  },
  // Division-specific contact (suite addresses + direct lines)
  divisions: {
    spa: {
      name: "Restoration Lounge Spa",
      suite: "Suite A",
      phone: "(567) 429-9924",
      phoneLink: "tel:+15674299924",
    },
    fitness: {
      name: "A-Z Total Fitness",
      suite: "Suite B",
      phone: "(567) 429-9924",
      phoneLink: "tel:+15674299924",
    },
    summit: {
      name: "The Summit Event Center",
      suite: "Suite C",
      phone: "(567) 429-9924",
      phoneLink: "tel:+15674299924",
    },
    coworking: {
      name: "The Hive Co-Working Space",
      suite: "Suite D",
      phone: "(567) 429-9924",
      phoneLink: "tel:+15674299924",
    },
    voiceVault: {
      name: "Voice Vault Podcast Studio",
      suite: "Suite Z",
      phone: "(567) 429-9924",
      phoneLink: "tel:+15674299924",
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
  
  // Operating Hours
  hours: {
    days: "7 Days a Week",
    time: "6:00 AM – 10:00 PM",
    range: "7 days a week, 6:00 AM – 10:00 PM",
    shortDays: "Open 7 Days",
  },
  
  // Business Info
  business: {
    name: "A-Z Enterprises",
    tagline: "One Call, We Handle It All",
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