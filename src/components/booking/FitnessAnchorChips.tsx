import { Button } from "@/components/ui/button";
import { Dumbbell, Users, Zap, MessageSquare, HelpCircle } from "lucide-react";

interface FitnessAnchorChipsProps {
  className?: string;
}

export function FitnessAnchorChips({ className = "" }: FitnessAnchorChipsProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const chips = [
    { id: "fitness-memberships", label: "Memberships", icon: Dumbbell },
    { id: "fitness-why", label: "Why Us", icon: Zap },
    { id: "fitness-process", label: "How It Works", icon: Users },
    { id: "fitness-testimonials", label: "Results", icon: MessageSquare },
    { id: "fitness-faq", label: "FAQ", icon: HelpCircle }
  ];

  return (
    <nav className={`flex flex-wrap justify-center gap-2 ${className}`} aria-label="Page sections">
      {chips.map((chip) => (
        <Button
          key={chip.id}
          variant="outline"
          size="sm"
          onClick={() => scrollToSection(chip.id)}
          className="rounded-full border-accent/30 hover:border-accent hover:bg-accent/10 text-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-label={`Jump to ${chip.label} section`}
        >
          <chip.icon className="h-4 w-4 mr-1.5 text-accent" aria-hidden="true" />
          {chip.label}
        </Button>
      ))}
    </nav>
  );
}
