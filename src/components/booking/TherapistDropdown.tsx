import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles, User } from "lucide-react";

// Scalable therapist config - add new therapists here
export interface Therapist {
  id: string;
  name: string;
  subtitle?: string;
  route: string;
  available: boolean;
}

export const THERAPISTS: Therapist[] = [
  {
    id: "lindsey",
    name: "Lindsey",
    subtitle: "Licensed Massage Therapist",
    route: "/book-with-lindsey",
    available: true,
  },
  // Add more therapists here as they join:
  // {
  //   id: "new-therapist",
  //   name: "New Therapist Name",
  //   subtitle: "Massage Therapist",
  //   route: "/book-with-new-therapist",
  //   available: true,
  // },
];

interface TherapistDropdownProps {
  className?: string;
}

export function TherapistDropdown({ className }: TherapistDropdownProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const availableTherapists = THERAPISTS.filter((t) => t.available);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (therapist: Therapist) => {
    setIsOpen(false);
    navigate(therapist.route);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        ref={buttonRef}
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all"
        data-event="spa_hero_book_massage_click"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Sparkles className="h-5 w-5 mr-2" />
        Book Massage
        <ChevronDown
          className={`h-4 w-4 ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-full min-w-[200px] z-50 rounded-lg border-2 border-accent/50 bg-primary shadow-gold-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
        >
          {availableTherapists.map((therapist) => (
            <button
              key={therapist.id}
              onClick={() => handleSelect(therapist)}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-accent/20 transition-colors border-b border-accent/20 last:border-b-0 focus:outline-none focus:bg-accent/20"
              role="option"
            >
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-primary-foreground font-semibold">
                  {therapist.name}
                </span>
                {therapist.subtitle && (
                  <span className="block text-xs text-primary-foreground/60">
                    {therapist.subtitle}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
