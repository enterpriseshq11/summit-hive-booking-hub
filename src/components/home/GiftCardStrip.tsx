import { Link } from "react-router-dom";
import { Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GiftCardStrip() {
  return (
    <section className="py-12 bg-primary text-primary-foreground">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <Gift className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary-foreground">Give the Gift of Experience</h3>
              <p className="text-sm text-primary-foreground/60">
                Perfect for any occasion — events, spa days, fitness, or coworking.
              </p>
            </div>
          </div>
          <Button 
            asChild 
            className="bg-accent hover:bg-accent/90 text-primary font-semibold shrink-0"
          >
            <Link to="/gift-cards" className="flex items-center gap-2">
              Shop Gift Cards
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
