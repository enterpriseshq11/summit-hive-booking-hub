import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Users, HelpCircle, MessageSquare } from "lucide-react";

interface SpaAnchorChipsProps {
  className?: string;
}

export function SpaAnchorChips({ className = "" }: SpaAnchorChipsProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const chips = [
    { id: "spa-services", label: "Services", icon: Heart },
    { id: "spa-providers", label: "Our Team", icon: Users },
    { id: "spa-process", label: "How It Works", icon: Sparkles },
    { id: "spa-testimonials", label: "Reviews", icon: MessageSquare },
    { id: "spa-faq", label: "FAQ", icon: HelpCircle }
  ];

  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className}`}>
      {chips.map((chip) => (
        <Button
          key={chip.id}
          variant="outline"
          size="sm"
          onClick={() => scrollToSection(chip.id)}
          className="rounded-full border-accent/30 hover:border-accent hover:bg-accent/10 text-sm"
        >
          <chip.icon className="h-4 w-4 mr-1.5 text-accent" />
          {chip.label}
        </Button>
      ))}
    </div>
  );
}
