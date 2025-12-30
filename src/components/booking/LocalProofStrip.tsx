import { Users } from "lucide-react";

const proofBadges = [
  "Local founders",
  "Remote teams",
  "Professionals",
  "Creators",
];

export function LocalProofStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4">
      <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
        <Users className="h-4 w-4" />
        <span>Trusted by:</span>
      </div>
      {proofBadges.map((badge) => (
        <span
          key={badge}
          className="px-3 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-sm border border-primary-foreground/20"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}
