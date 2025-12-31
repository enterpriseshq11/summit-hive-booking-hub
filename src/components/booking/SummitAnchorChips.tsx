import { Button } from "@/components/ui/button";
import { Heart, Sparkles, HelpCircle } from "lucide-react";

const ANCHORS = [
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
            className="rounded-full border-accent/30 text-primary-foreground/80 hover:bg-accent/20 hover:text-primary-foreground hover:border-accent/50 bg-transparent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
