import { Gift, MapPin, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const anchorItems = [
  { id: "amounts", label: "Amounts", icon: Gift },
  { id: "redeem-anywhere", label: "Redeem Anywhere", icon: MapPin },
  { id: "how-it-works", label: "How It Works", icon: Sparkles },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

export function GiftCardAnchorChips() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="flex flex-wrap justify-center gap-2 py-4" aria-label="Page sections">
      {anchorItems.map((item) => (
        <Button
          key={item.id}
          variant="outline"
          size="sm"
          onClick={() => scrollToSection(item.id)}
          className="rounded-full border-accent/30 hover:border-accent hover:bg-accent/10 gap-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          data-event={`giftcard_anchor_${item.id}`}
          aria-label={`Jump to ${item.label} section`}
        >
          <item.icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {item.label}
        </Button>
      ))}
    </nav>
  );
}
