import type { Database } from "@/integrations/supabase/types";

export type CrmLeadStatus = Database["public"]["Enums"]["crm_lead_status"];

export const statusLabels: Record<CrmLeadStatus, string> = {
  new: "New Lead",
  contact_attempted: "Contact Attempted",
  contacted: "Contact Attempted", // legacy fallback
  responded: "Responded",
  warm_lead: "Warm Lead",
  qualified: "Warm Lead", // legacy fallback
  hot_lead: "Hot Lead",
  proposal_sent: "Proposal Sent",
  contract_sent: "Contract Sent",
  deposit_pending: "Deposit Pending",
  booked: "Booked",
  won: "Booked", // legacy fallback
  follow_up_needed: "Follow Up Needed",
  no_response: "No Response",
  lost: "Lost",
};

export const statusColors: Record<CrmLeadStatus, string> = {
  new: "bg-zinc-500/20 text-zinc-300 border-zinc-500/50",
  contact_attempted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  responded: "bg-sky-500/20 text-sky-400 border-sky-500/50",
  warm_lead: "bg-orange-400/20 text-orange-300 border-orange-400/50",
  qualified: "bg-orange-400/20 text-orange-300 border-orange-400/50",
  hot_lead: "bg-red-500/20 text-red-400 border-red-500/50",
  proposal_sent: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  contract_sent: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  deposit_pending: "bg-amber-600/20 text-amber-400 border-amber-600/50",
  booked: "bg-green-500/20 text-green-400 border-green-500/50",
  won: "bg-green-500/20 text-green-400 border-green-500/50",
  follow_up_needed: "bg-yellow-600/20 text-yellow-300 border-yellow-600/50",
  no_response: "bg-zinc-600/20 text-zinc-400 border-zinc-600/50",
  lost: "bg-zinc-800/40 text-zinc-500 border-zinc-700/50",
};

/** Pipeline stages in display order (excludes legacy values) */
export const pipelineStages: { status: CrmLeadStatus; label: string; borderColor: string }[] = [
  { status: "new", label: "New Lead", borderColor: "border-zinc-500" },
  { status: "contact_attempted", label: "Contact Attempted", borderColor: "border-yellow-500" },
  { status: "responded", label: "Responded", borderColor: "border-sky-500" },
  { status: "warm_lead", label: "Warm Lead", borderColor: "border-orange-400" },
  { status: "hot_lead", label: "Hot Lead", borderColor: "border-red-500" },
  { status: "proposal_sent", label: "Proposal Sent", borderColor: "border-blue-500" },
  { status: "contract_sent", label: "Contract Sent", borderColor: "border-purple-500" },
  { status: "deposit_pending", label: "Deposit Pending", borderColor: "border-amber-600" },
  { status: "booked", label: "Booked", borderColor: "border-green-500" },
  { status: "follow_up_needed", label: "Follow Up Needed", borderColor: "border-yellow-600" },
  { status: "no_response", label: "No Response", borderColor: "border-zinc-600" },
  { status: "lost", label: "Lost", borderColor: "border-zinc-700" },
];

export const temperatureConfig = {
  cold: { label: "Cold", color: "bg-sky-900/40 text-sky-300 border-sky-700/50", dot: "bg-sky-400" },
  warm: { label: "Warm", color: "bg-orange-900/40 text-orange-300 border-orange-700/50", dot: "bg-orange-400" },
  hot: { label: "Hot", color: "bg-red-900/40 text-red-300 border-red-700/50", dot: "bg-red-400" },
} as const;

export type LeadTemperature = keyof typeof temperatureConfig;

/** Status options for select dropdowns (excludes legacy) */
export const statusSelectOptions = pipelineStages.map((s) => ({
  value: s.status,
  label: s.label,
}));

/** Priority score calculation */
export function calculatePriorityScore(lead: {
  status?: string | null;
  temperature?: string | null;
  follow_up_due?: string | null;
  contact_attempts?: number;
}): number {
  let score = 0;

  // Status-based scoring
  switch (lead.status) {
    case "deposit_pending": score += 15; break;
    case "hot_lead": score += 10; break;
    case "contract_sent": score += 10; break;
    case "proposal_sent": score += 8; break;
    case "warm_lead": score += 6; break;
    case "new": score += 5; break;
    case "responded": score += 5; break;
    case "follow_up_needed": score += 7; break;
    case "no_response": score -= 5; break;
    case "lost": score -= 10; break;
    case "booked": score -= 3; break;
  }

  // Temperature scoring
  if (lead.temperature === "hot") score += 10;
  else if (lead.temperature === "warm") score += 5;

  // Follow-up due today or overdue
  if (lead.follow_up_due) {
    const due = new Date(lead.follow_up_due);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 0) score += 12; // overdue
    else if (diffHours < 24) score += 10; // due today
    else if (diffHours < 72) score += 5; // due soon
  }

  return score;
}

/** Source display labels */
export const sourceLabels: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  walk_in: "Walk-In",
  phone: "Phone Call",
  social_media: "Social Media",
  email: "Email",
  event: "Event",
  other: "Other",
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
};
