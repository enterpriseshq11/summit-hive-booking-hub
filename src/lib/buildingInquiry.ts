import { supabase } from "@/integrations/supabase/client";

/**
 * Inquiries from /build, /spa, and /gym.
 *
 * Writes one row to public.leads (signed-out insert is allowed by its existing policy).
 * Deliberately does NOT use the lead-intake edge function, because that function fires
 * the GoHighLevel webhook, creates GHL contacts, and sends email. This path sends nothing
 * to anyone. Staff see these rows in Admin, Leads and Waitlists.
 */

export const LANES = [
  { value: "personal_training", label: "Personal training" },
  { value: "office_suite", label: "Office or suite" },
  { value: "wellness_services", label: "Wellness or services" },
  { value: "kids_classes", label: "Classes or programs for kids" },
  { value: "retail_shop", label: "Retail or a shop" },
  { value: "partner_sponsor", label: "Partner or sponsor" },
  { value: "other", label: "Something else" },
] as const;

export const START_WINDOWS = [
  { value: "now", label: "Ready now" },
  { value: "one_to_three_months", label: "In 1 to 3 months" },
  { value: "exploring", label: "Just exploring" },
] as const;

export const CONSENT_TEXT =
  "Yes, A-Z Enterprises can call, text, or email me about space in the building. Message and data rates may apply. Reply STOP to opt out of texts.";

export const SPA_CONSENT_TEXT =
  "Yes, A-Z Enterprises can call, text, or email me about The Spa. Message and data rates may apply. Reply STOP to opt out of texts.";

export const GYM_CONSENT_TEXT =
  "Yes, A-Z Enterprises can call, text, or email me about Zero Gravity Fitness. Message and data rates may apply. Reply STOP to opt out of texts.";

/** What a gym visitor is interested in. Prices are display copy only; nothing is charged here. */
export const GYM_OPTIONS = [
  { value: "with_kids", label: "With my kids, $4 gym add-on" },
  { value: "day_pass", label: "Gym day pass, $9" },
  { value: "member_7_9", label: "Membership, 7 AM to 9 PM, $65 a month" },
  { value: "member_24_7", label: "Membership, 24/7, $89 a month" },
  { value: "not_sure", label: "Not sure yet" },
] as const;

export type InquiryKind = "build" | "spa" | "gym";

const CONSENT_BY_KIND: Record<InquiryKind, string> = { build: CONSENT_TEXT, spa: SPA_CONSENT_TEXT, gym: GYM_CONSENT_TEXT };
export const consentTextFor = (kind: InquiryKind) => CONSENT_BY_KIND[kind];

export interface InquiryInput {
  kind: InquiryKind;
  fullName: string;
  businessName?: string;
  phone: string;
  email: string;
  lane?: string;
  startWindow?: string;
  message?: string;
  consent: boolean;
}

export type InquiryErrors = Partial<Record<"fullName" | "phone" | "email" | "lane" | "startWindow" | "message" | "consent" | "businessName", string>>;

export function phoneDigits(raw: string) {
  let d = (raw || "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateInquiry(i: InquiryInput): InquiryErrors {
  const e: InquiryErrors = {};
  const name = i.fullName.trim();
  if (name.length < 2 || name.length > 80) e.fullName = "Enter your full name.";
  if ((i.businessName || "").length > 120) e.businessName = "Keep the business name under 120 characters.";
  const digits = phoneDigits(i.phone);
  if (i.kind !== "spa" || i.phone.trim()) {
    if (digits.length !== 10) e.phone = "Enter a 10-digit phone number.";
  }
  if (!EMAIL_RE.test(i.email.trim())) e.email = "Enter a valid email address.";
  if (i.kind === "build") {
    if (!LANES.some((l) => l.value === i.lane)) e.lane = "Pick what you want to do here.";
    if (!START_WINDOWS.some((s) => s.value === i.startWindow)) e.startWindow = "Pick when you want to start.";
  }
  if (i.kind === "gym" && !GYM_OPTIONS.some((g) => g.value === i.lane)) e.lane = "Pick the option that fits you.";
  if ((i.message || "").length > 1000) e.message = "Keep it under 1,000 characters.";
  if (!i.consent) e.consent = "Check the box so we can reach you.";
  return e;
}

async function resolveBusinessId(kind: InquiryKind): Promise<string | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, type")
    .in("type", ["coworking", "spa", "fitness"])
    .eq("is_active", true);
  if (error || !data) return null;
  const rows = data as { id: string; type: string }[];
  const spa = rows.find((r) => r.type === "spa");
  const hive = rows.find((r) => r.type === "coworking");
  const gym = rows.find((r) => r.type === "fitness");
  if (kind === "spa") return (spa ?? hive)?.id ?? null;
  if (kind === "gym") return (gym ?? hive)?.id ?? null;
  return (hive ?? spa)?.id ?? null;
}

export async function submitInquiry(i: InquiryInput): Promise<{ ok: true } | { ok: false; reason: string }> {
  const businessId = await resolveBusinessId(i.kind);
  if (!businessId) return { ok: false, reason: "lookup" };

  const parts = i.fullName.trim().split(/\s+/);
  const first = parts.shift() || i.fullName.trim();
  const last = parts.join(" ") || null;
  const lane = LANES.find((l) => l.value === i.lane)?.label;
  const gymPick = GYM_OPTIONS.find((g) => g.value === i.lane)?.label;
  const start = START_WINDOWS.find((s) => s.value === i.startWindow)?.label;
  const stamp = new Date().toISOString();

  const notes = [
    i.kind === "build" ? "Building inquiry from /build" : i.kind === "gym" ? "Gym list signup from /gym" : "Spa notify request from /spa",
    i.kind === "build" && lane ? `Wants to: ${lane}` : null,
    i.kind === "gym" && gymPick ? `Interested in: ${gymPick}` : null,
    start ? `Start: ${start}` : null,
    i.message?.trim() ? `Needs: ${i.message.trim()}` : null,
    `Consent: yes, ${stamp}. "${consentTextFor(i.kind)}"`,
  ]
    .filter(Boolean)
    .join("\n");

  const digits = phoneDigits(i.phone);
  const { error } = await supabase.from("leads").insert({
    business_id: businessId,
    first_name: first.slice(0, 80),
    last_name: last ? last.slice(0, 80) : null,
    email: i.email.trim().toLowerCase(),
    phone: digits || null,
    company_name: i.businessName?.trim() ? i.businessName.trim().slice(0, 120) : null,
    event_type: i.kind === "build" ? lane ?? null : i.kind === "gym" ? gymPick ?? "gym_list" : "spa_notify",
    source: i.kind === "build" ? "build_page" : i.kind === "gym" ? "gym_page" : "spa_page",
    notes,
  });
  if (error) return { ok: false, reason: "insert" };
  return { ok: true };
}
