import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles, User, Loader2 } from "lucide-react";
import { useActiveSpaWorkers } from "@/hooks/useSpaWorkers";

// Scalable therapist config - now pulled from database
export interface Therapist {
  id: string;
  name: string;
  subtitle?: string;
  route: string;
  available: boolean;
}

// Static fallback for Lindsey (always available as spa_lead)
const LINDSEY_FALLBACK: Therapist = {
  id: "lindsey",
  name: "Lindsey",
  subtitle: "Licensed Massage Therapist",
  route: "/book-with-lindsey#availability-calendar",
  available: true,
};

interface TherapistDropdownProps {
  className?: string;
}

export function TherapistDropdown({ className }: TherapistDropdownProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: spaWorkers = [], isLoading } = useActiveSpaWorkers();

  // Build therapist list from database + always include Lindsey
  const therapists: Therapist[] = [
    LINDSEY_FALLBACK,
    ...spaWorkers
      .filter(w => w.display_name.toLowerCase() !== "lindsey") // Avoid duplicate Lindsey
      .map(w => ({
        id: w.id,
        name: w.display_name,
        subtitle: "Massage Therapist",
        route: `/book-spa?therapist=${w.id}#availability-calendar`,
        available: true,
      })),
  ];

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
    
    // After navigation, scroll to the anchor if present
    setTimeout(() => {
      const hash = therapist.route.split('#')[1];
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
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
          {isLoading ? (
            <div className="px-4 py-3 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            </div>
          ) : (
            therapists.map((therapist) => (
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
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Export static list for backwards compatibility
export const THERAPISTS: Therapist[] = [LINDSEY_FALLBACK];
