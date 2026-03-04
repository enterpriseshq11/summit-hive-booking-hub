// Centralized site configuration - Single source of truth for contact info and business details

export const SITE_CONFIG = {
  // Contact Information — Front desk / building-level
  contact: {
    phone: "(419) 909-8442",
    phoneFormatted: "(419) 909-8442",
    phoneLink: "tel:+14199098442",
    email: "info@az-enterprises.com",
    emailLink: "mailto:info@az-enterprises.com",
  },

  // Division-specific suite addresses and direct phone numbers
  divisions: {
    spa: {
      name: "Restoration Lounge Spa",
      suite: "Suite A",
      phone: "(419) 820-9566",
      phoneLink: "tel:+14198209566",
    },
    fitness: {
      name: "A-Z Total Fitness",
      suite: "Suite B",
      phone: "(419) 839-3668",
      phoneLink: "tel:+14198393668",
    },
    summit: {
      name: "The Summit Event Center",
      suite: "Suite C",
      phone: "(419) 848-0434",
      phoneLink: "tel:+14198480434",
    },
    coworking: {
      name: "The Hive Co-Working Space",
      suite: "Suite D",
      phone: "(419) 909-3765",
      phoneLink: "tel:+14199093765",
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