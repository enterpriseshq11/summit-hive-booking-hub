import { Button } from "@/components/ui/button";
import { Heart, Sparkles, HelpCircle, Camera } from "lucide-react";

const ANCHORS = [
  { id: "360-photo-booth", label: "360 Photo Booth", icon: Camera },
  { id: "event-types", label: "Event Types", icon: Heart },
  { id: "highlights", label: "Highlights", icon: Sparkles },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

export function SummitAnchorChips() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="flex flex-wrap gap-2 justify-center" aria-label="Page sections">
      {ANCHORS.map((anchor) => {
        const Icon = anchor.icon;
        return (
          <Button
            key={anchor.id}
            variant="outline"
            size="sm"
            onClick={() => scrollToSection(anchor.id)}
            className="rounded-full border-accent/30 bg-accent/10 text-foreground hover:bg-accent/20 hover:border-accent transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            aria-label={`Jump to ${anchor.label} section`}
          >
            <Icon className="h-3.5 w-3.5 mr-1.5 text-accent" aria-hidden="true" />
            {anchor.label}
          </Button>
        );
      })}
    </nav>
  );
}
