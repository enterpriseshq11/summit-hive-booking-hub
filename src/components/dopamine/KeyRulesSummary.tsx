import { Info } from "lucide-react";

export function KeyRulesSummary() {
  const rules = [
    "Free users: 1 spin/day | VIP: 2 spins/day + 2x entries",
    "Entries accumulate all month, reset after each drawing",
    "Must be logged in to spin and earn entries",
    "VIP-only prizes require active membership at draw time",
    "Grand Giveaway: March 31, 2026",
  ];

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 mb-6 border border-zinc-700">
      <h3 className="font-bold text-white flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-primary" />
        Key Rules at a Glance
      </h3>
      <ul className="space-y-2">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
            <span className="text-primary mt-0.5">•</span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}
