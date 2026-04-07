import type { FormFieldConfig } from "@/components/booking/LeadIntakeForm";

export const SUMMIT_FIELDS: FormFieldConfig[] = [
  {
    name: "event_type", label: "Event Type", type: "select", required: true,
    options: [
      { value: "wedding", label: "Wedding" },
      { value: "corporate_event", label: "Corporate Event" },
      { value: "birthday_party", label: "Birthday Party" },
      { value: "baby_shower", label: "Baby Shower" },
      { value: "anniversary", label: "Anniversary" },
      { value: "quinceanera", label: "Quinceañera" },
      { value: "graduation", label: "Graduation" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "preferred_date", label: "Preferred Event Date", type: "date", required: true },
  { name: "alternate_date", label: "Alternate Date", type: "date" },
  {
    name: "guest_count", label: "Estimated Guest Count", type: "select", required: true,
    options: [
      { value: "under_50", label: "Under 50" },
      { value: "50_100", label: "50-100" },
      { value: "100_150", label: "100-150" },
      { value: "150_200", label: "150-200" },
      { value: "200_250", label: "200-250" },
      { value: "250_plus", label: "250+" },
    ],
  },
  {
    name: "budget_range", label: "Budget Range", type: "select",
    options: [
      { value: "under_1000", label: "Under $1,000" },
      { value: "1000_2500", label: "$1,000-$2,500" },
      { value: "2500_5000", label: "$2,500-$5,000" },
      { value: "5000_10000", label: "$5,000-$10,000" },
      { value: "10000_plus", label: "$10,000+" },
    ],
  },
  { name: "notes", label: "Additional Notes", type: "textarea", placeholder: "Tell us about your event..." },
  { name: "wants_tour", label: "Would you like a venue tour?", type: "toggle", defaultValue: true, placeholder: "Yes, schedule a tour" },
];

export const SPA_FIELDS: FormFieldConfig[] = [
  {
    name: "service_interest", label: "Service Interest", type: "select", required: true,
    options: [
      { value: "swedish_massage", label: "Swedish Massage" },
      { value: "deep_tissue", label: "Deep Tissue Massage" },
      { value: "hot_stone", label: "Hot Stone Massage" },
      { value: "facial", label: "Facial" },
      { value: "body_wrap", label: "Body Wrap" },
      { value: "couples_massage", label: "Couples Massage" },
      { value: "spa_package", label: "Spa Package" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "preferred_date", label: "Preferred Date", type: "date", required: true },
  { name: "preferred_time", label: "Preferred Time", type: "time" },
  { name: "returning_client", label: "Are you a returning client?", type: "toggle", placeholder: "Yes" },
  { name: "notes", label: "Additional Notes", type: "textarea" },
  { name: "waiver_ack", label: "I acknowledge the spa intake waiver", type: "toggle", required: true, placeholder: "I acknowledge" },
];

export const FITNESS_FIELDS: FormFieldConfig[] = [
  {
    name: "membership_interest", label: "Membership Interest", type: "select", required: true,
    options: [
      { value: "monthly", label: "Monthly Membership" },
      { value: "day_pass", label: "Day Pass" },
      { value: "personal_training", label: "Personal Training Package" },
      { value: "group_classes", label: "Group Classes" },
      { value: "just_looking", label: "Just Looking" },
    ],
  },
  {
    name: "fitness_goals", label: "Fitness Goals", type: "select",
    options: [
      { value: "weight_loss", label: "Weight Loss" },
      { value: "build_muscle", label: "Build Muscle" },
      { value: "improve_endurance", label: "Improve Endurance" },
      { value: "athletic_training", label: "Athletic Training" },
      { value: "general_health", label: "General Health" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "start_date", label: "Preferred Start Date", type: "date" },
  { name: "notes", label: "Additional Notes", type: "textarea" },
];

export const HIVE_FIELDS: FormFieldConfig[] = [
  { name: "company_name", label: "Company Name", type: "text", placeholder: "Optional" },
  {
    name: "office_type", label: "Office Type Interest", type: "select", required: true,
    options: [
      { value: "private_office", label: "Private Office" },
      { value: "executive_suite", label: "Executive Suite" },
      { value: "day_pass", label: "Day Pass Desk" },
      { value: "virtual_office", label: "Virtual Office" },
      { value: "tour_only", label: "Tour Only" },
    ],
  },
  { name: "start_date", label: "Desired Start Date", type: "date" },
  {
    name: "people_count", label: "Number of People", type: "select",
    options: [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5_plus", label: "5+" },
    ],
  },
  { name: "notes", label: "Additional Notes", type: "textarea" },
];

export const VOICE_VAULT_FIELDS: FormFieldConfig[] = [
  {
    name: "session_type", label: "Session Type", type: "select", required: true,
    options: [
      { value: "recording", label: "Recording Session" },
      { value: "mixing_mastering", label: "Mixing and Mastering" },
      { value: "podcast", label: "Podcast Recording" },
      { value: "content_creation", label: "Content Creation" },
      { value: "beat_production", label: "Beat Production" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "preferred_date", label: "Preferred Date", type: "date" },
  {
    name: "session_length", label: "Estimated Session Length", type: "select",
    options: [
      { value: "1_hour", label: "1 hour" },
      { value: "2_hours", label: "2 hours" },
      { value: "3_hours", label: "3 hours" },
      { value: "4_hours", label: "4 hours" },
      { value: "half_day", label: "Half Day" },
      { value: "full_day", label: "Full Day" },
    ],
  },
  { name: "project_description", label: "Project Description", type: "textarea", placeholder: "Tell us about your project..." },
  { name: "first_time", label: "First time at Voice Vault?", type: "toggle", placeholder: "Yes" },
];

export const ELEVATED_FIELDS: FormFieldConfig[] = [
  {
    name: "service_interest", label: "Service Interest", type: "select", required: true,
    options: [
      { value: "bridal_styling", label: "Bridal Styling" },
      { value: "event_styling", label: "Event Styling" },
      { value: "personal_shopping", label: "Personal Shopping" },
      { value: "color_consultation", label: "Color Consultation" },
      { value: "wardrobe_edit", label: "Wardrobe Edit" },
      { value: "style_consultation", label: "Style Consultation" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "preferred_date", label: "Preferred Date", type: "date" },
  { name: "occasion", label: "Occasion or Event Description", type: "textarea", placeholder: "Tell us about the occasion..." },
  {
    name: "budget_range", label: "Budget Range", type: "select",
    options: [
      { value: "under_500", label: "Under $500" },
      { value: "500_1000", label: "$500-$1,000" },
      { value: "1000_2500", label: "$1,000-$2,500" },
      { value: "2500_plus", label: "$2,500+" },
      { value: "prefer_not", label: "Prefer Not to Say" },
    ],
  },
];

export const MOBILE_HOMES_FIELDS: FormFieldConfig[] = [
  {
    name: "interest_type", label: "What are you interested in?", type: "select", required: true,
    options: [
      { value: "buy_home", label: "Buy a Mobile Home" },
      { value: "sell_home", label: "Sell a Mobile Home" },
      { value: "transport", label: "Mobile Home Transport" },
      { value: "renovation", label: "Renovation Services" },
      { value: "lot_rental", label: "Lot Rental" },
      { value: "general_inquiry", label: "General Inquiry" },
    ],
  },
  {
    name: "timeline", label: "Timeline", type: "select", required: true,
    options: [
      { value: "asap", label: "As soon as possible" },
      { value: "1_month", label: "Within 1 month" },
      { value: "1_3_months", label: "1-3 months" },
      { value: "3_6_months", label: "3-6 months" },
      { value: "just_exploring", label: "Just exploring" },
    ],
  },
  {
    name: "budget_range", label: "Budget Range", type: "select",
    options: [
      { value: "under_10k", label: "Under $10,000" },
      { value: "10k_25k", label: "$10,000-$25,000" },
      { value: "25k_50k", label: "$25,000-$50,000" },
      { value: "50k_75k", label: "$50,000-$75,000" },
      { value: "75k_plus", label: "$75,000+" },
      { value: "prefer_not", label: "Prefer Not to Say" },
    ],
  },
  { name: "location", label: "Property Location / City", type: "text", placeholder: "City, State or Address" },
  { name: "notes", label: "Additional Details", type: "textarea", placeholder: "Tell us about your situation..." },
];
