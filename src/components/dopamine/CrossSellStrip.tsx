import { Link } from "react-router-dom";
import { Calendar, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CrossSellStrip() {
  const actions = [
    { label: "Book Now", href: "/booking", icon: Calendar },
    { label: "Gift Cards", href: "/gift-cards", icon: Gift },
    { label: "Shop", href: "/shop", icon: ShoppingBag },
    { label: "Book Massage", href: "/spa", icon: Sparkles },
  ];

  return (
    <section className="py-10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-t border-zinc-800">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-white/70 mb-4">
          Ready to experience A-Z Enterprises?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              asChild
              className="bg-[hsl(45,70%,50%)] hover:bg-[hsl(45,70%,45%)] text-black font-semibold shadow-md"
            >
              <Link to={action.href}>
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
