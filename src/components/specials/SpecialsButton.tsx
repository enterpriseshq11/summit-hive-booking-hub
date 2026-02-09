import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecialsButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export function SpecialsButton({ onClick, label = "View Current Specials", className, size = "default" }: SpecialsButtonProps) {
  return (
    <Button
      size={size}
      onClick={onClick}
      className={cn(
        "bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all",
        className
      )}
      data-event="specials_button_click"
    >
      <Sparkles className="h-5 w-5 mr-2" />
      {label}
    </Button>
  );
}
