import { Navigate, useParams } from "react-router-dom";
import { SITE_CONFIG } from "@/config/siteConfig";
import { LeadIntakeForm } from "@/components/booking/LeadIntakeForm";
import {
  SUMMIT_FIELDS, SPA_FIELDS, FITNESS_FIELDS, HIVE_FIELDS,
  VOICE_VAULT_FIELDS, ELEVATED_FIELDS, MOBILE_HOMES_FIELDS,
} from "@/config/intakeFormConfigs";

const UNIT_CONFIG: Record<string, {
  businessUnit: string;
  title: string;
  description: string;
  fields: any[];
  brandColor: string;
  contactPhone: string;
  contactEmail: string;
}> = {
  summit: {
    businessUnit: "summit",
    title: "The Summit Event Center",
    description: "Tell us about your event and we'll get back to you within 24 hours.",
    fields: SUMMIT_FIELDS,
    brandColor: "amber",
    contactPhone: SITE_CONFIG.contact.phone,
    contactEmail: SITE_CONFIG.contact.email,
  },
  spa: {
    businessUnit: "spa",
    title: "Restoration Lounge Spa",
    description: "Book your spa experience. We'll confirm your appointment within 24 hours.",
    fields: SPA_FIELDS,
    brandColor: "purple",
    contactPhone: SITE_CONFIG.contact.phone,
    contactEmail: SITE_CONFIG.contact.email,
  },
  fitness: {
    businessUnit: "fitness",
    title: "Zero Gravity Fitness",
    description: "Start your fitness journey. We'll reach out within 24 hours.",
    fields: FITNESS_FIELDS,
    brandColor: "green",
    contactPhone: SITE_CONFIG.contact.phone,
    contactEmail: SITE_CONFIG.contact.email,
  },
  hive: {
    businessUnit: "coworking",
    title: "The Hive Coworking",
    description: "Find your perfect workspace. We'll contact you within 24 hours.",
    fields: HIVE_FIELDS,
    brandColor: "blue",
    contactPhone: SITE_CONFIG.contact.phone,
    contactEmail: SITE_CONFIG.contact.email,
  },
  "voice-vault": {
    businessUnit: "voice_vault",
    title: "Voice Vault Recording Studio",
    description: "Book your studio session. We'll confirm within 24 hours.",
    fields: VOICE_VAULT_FIELDS,
    brandColor: "red",
    contactPhone: SITE_CONFIG.contact.phone,
    contactEmail: SITE_CONFIG.contact.email,
  },
  "elevated-by-elyse": {
    businessUnit: "elevated_by_elyse",
    title: "Elevated by Elyse",
    description: "Elevate your style. We'll be in touch within 24 hours.",
    fields: ELEVATED_FIELDS,
    brandColor: "pink",
    contactPhone: SITE_CONFIG.contact.phone,
    contactEmail: SITE_CONFIG.contact.email,
  },
  "mobile-homes": {
    businessUnit: "mobile_homes",
    title: "A-Z Mobile Home Enterprises",
    description: "Buy, sell, transport, or renovate. We'll be in touch within 24 hours.",
    fields: MOBILE_HOMES_FIELDS,
    brandColor: "emerald",
    contactPhone: SITE_CONFIG.contact.phone,
    contactEmail: SITE_CONFIG.contact.email,
  },
};

export default function IntakePage() {
  const { unit } = useParams<{ unit: string }>();
  // Retired units send people somewhere useful instead of a dead form.
  if (unit === "summit") return <Navigate to="/" replace />;
  if (unit === "spa") return <Navigate to="/spa" replace />;

  const config = unit ? UNIT_CONFIG[unit] : null;

  if (!config) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Form Not Found</h1>
          <p className="text-zinc-400">The requested intake form does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4">
      <div className="max-w-2xl mx-auto mb-6 text-center">
        <div className="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
          <span className="text-amber-400 text-sm font-medium">A-Z Enterprises</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{config.title}</h1>
        <p className="text-zinc-400">{config.description}</p>
      </div>

      <LeadIntakeForm
        businessUnit={config.businessUnit}
        title={`Request info: ${config.title}`}
        description={config.description}
        fields={config.fields}
      />

      <div className="max-w-2xl mx-auto mt-6 text-center text-zinc-500 text-sm space-y-1">
        <p>Questions? Call us at {config.contactPhone} or email {config.contactEmail}</p>
        <p>10 W Auglaize St, Wapakoneta, Ohio 45895</p>
      </div>
    </div>
  );
}