// Centralized site configuration - Single source of truth for contact info and business details

export const SITE_CONFIG = {
  // Contact Information (REQUIRES CLIENT CONFIRMATION FOR FINAL VALUES)
  contact: {
    phone: "567-379-6340",
    phoneFormatted: "(567) 379-6340",
    phoneLink: "tel:+15673796340",
    email: "info@az-enterprises.com",
    emailLink: "mailto:info@az-enterprises.com",
  },
  
  // Location (REQUIRES CLIENT CONFIRMATION FOR ADDRESS)
  location: {
    city: "Wapakoneta",
    state: "Ohio",
    stateAbbr: "OH",
    // TODO: Replace with actual address once confirmed by client
    street: "Wapakoneta, OH",
    full: "Wapakoneta, Ohio",
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