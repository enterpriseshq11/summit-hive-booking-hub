import { Link } from "react-router-dom";
import { Calendar, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/button";

export function CrossSellStrip() {
  const actions = [
    { label: "Book Now", href: "/book", icon: Calendar },
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
            <ButtonPrimary
              key={action.label}
              asChild
              size="sm"
              showArrow={false}
            >
              <Link to={action.href}>
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </Link>
            </ButtonPrimary>
          ))}
        </div>
      </div>
    </section>
  );
}
