import { Link } from "react-router-dom";
import { Calendar, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CrossSellStrip() {
  const actions = [
    { label: "Book Now", href: "/book", icon: Calendar },
    { label: "Gift Cards", href: "/gift-cards", icon: Gift },
    { label: "Shop", href: "/shop", icon: ShoppingBag },
    { label: "Book Massage", href: "/spa", icon: Sparkles },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-black via-zinc-900 to-black border-t border-primary/20">
      <div className="container mx-auto px-4">
        <p className="text-center text-lg font-semibold text-white mb-6">
          Ready to experience A-Z Enterprises?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              asChild
              className="border border-primary/50 bg-primary/10 text-primary hover:bg-primary hover:text-black font-medium"
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
