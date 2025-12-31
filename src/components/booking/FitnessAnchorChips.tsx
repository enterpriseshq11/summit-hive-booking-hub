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
