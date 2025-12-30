import { Button } from "@/components/ui/button";
import { Calendar, Building2, Shield, HelpCircle } from "lucide-react";

interface BookingSectionAnchorProps {
  className?: string;
}

const anchors = [
  { id: "availability", label: "Availability", icon: Calendar },
  { id: "businesses", label: "Businesses", icon: Building2 },
  { id: "trust", label: "Trust", icon: Shield },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

export function BookingSectionAnchor({ className }: BookingSectionAnchorProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {anchors.map((anchor) => {
        const Icon = anchor.icon;
        return (
          <Button
            key={anchor.id}
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection(anchor.id)}
            className="text-primary-foreground/60 hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <Icon className="h-3.5 w-3.5 mr-1.5" />
            {anchor.label}
          </Button>
        );
      })}
    </div>
  );
}
