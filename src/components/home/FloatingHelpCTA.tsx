import { useState, forwardRef } from "react";
import { HelpCircle, Phone, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FloatingHelpCTA = forwardRef<HTMLDivElement>(function FloatingHelpCTA(_, ref) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <div 
          className="bg-card border border-border rounded-2xl shadow-2xl p-4 animate-fade-in min-w-[200px]"
          role="dialog"
          aria-label="Contact options"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Need Help?</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setIsExpanded(false)}
              aria-label="Close help menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <a 
              href="tel:+14195550100"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <Phone className="h-4 w-4 text-accent" />
              <span>(419) 555-0100</span>
            </a>
            <a 
              href="mailto:info@azbookinghub.com"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <Mail className="h-4 w-4 text-accent" />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full h-14 px-5 bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 gap-2"
          aria-label="Get help"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="font-medium">Need Help?</span>
        </Button>
      )}
    </div>
  );
});
