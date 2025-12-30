import { Link } from "react-router-dom";
import { Building2, Sparkles, Dumbbell, Zap, ArrowRight, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNextAvailable } from "@/hooks/useAvailability";
import type { BusinessType } from "@/types";

interface BusinessConfig {
  type: BusinessType;
  name: string;
  icon: typeof Building2;
  href: string;
  colorClass: string;
  iconBg: string;
}

const businesses: BusinessConfig[] = [
  {
    type: "summit",
    name: "The Summit",
    icon: Building2,
    href: "/summit",
    colorClass: "summit",
    iconBg: "bg-summit/10",
  },
  {
    type: "coworking",
    name: "The Hive",
    icon: Building2,
    href: "/coworking",
    colorClass: "coworking",
    iconBg: "bg-coworking/10",
  },
  {
    type: "spa",
    name: "Restoration",
    icon: Sparkles,
    href: "/spa",
    colorClass: "spa",
    iconBg: "bg-spa/10",
  },
  {
    type: "fitness",
    name: "Total Fitness",
    icon: Dumbbell,
    href: "/fitness",
    colorClass: "fitness",
    iconBg: "bg-fitness/10",
  },
];

function AvailabilityWidget({ business }: { business: BusinessConfig }) {
  const { data: slots, isLoading, error } = useNextAvailable(business.type);
  const Icon = business.icon;

  if (isLoading) {
    return (
      <Link 
        to={business.href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
        role="link"
        aria-label={`View ${business.name} availability`}
      >
        <Card className="border-2 hover:border-accent/30 transition-all duration-300 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-xl ${business.iconBg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 text-${business.colorClass}`} />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (error) {
    return (
      <Link 
        to={business.href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
        role="link"
        aria-label={`View ${business.name}`}
      >
        <Card className="border-2 hover:border-accent/30 transition-all duration-300 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${business.iconBg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 text-${business.colorClass}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{business.name}</p>
                <p className="text-xs text-muted-foreground">Check availability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const hasSlots = slots && slots.length > 0;
  const nextSlot = hasSlots ? slots[0] : null;

  return (
    <Link 
      to={business.href}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
      role="link"
      aria-label={`View ${business.name} - ${hasSlots ? `Next available ${new Date(nextSlot!.start_time).toLocaleDateString()}` : 'Fully booked for now'}`}
    >
      <Card className={`border-2 hover:border-${business.colorClass}/50 hover:shadow-lg transition-all duration-300 group cursor-pointer`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${business.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className={`h-5 w-5 text-${business.colorClass}`} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{business.name}</p>
              {hasSlots && nextSlot ? (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(nextSlot.start_time).toLocaleDateString(undefined, { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Fully booked for now</span>
                </div>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function NextAvailableStrip() {
  return (
    <section id="availability" className="py-12 bg-muted/50 border-y scroll-mt-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Next Openings (Real-Time)</h3>
              <p className="text-sm text-muted-foreground">Real-time availability</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-accent hover:text-accent/80">
            <Link to="/booking" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {businesses.map((business) => (
            <AvailabilityWidget key={business.type} business={business} />
          ))}
        </div>

        {/* Single section CTA */}
        <div className="text-center mt-8">
          <Button asChild className="bg-accent hover:bg-accent/90 text-primary font-semibold">
            <Link to="/booking" className="flex items-center gap-2">
              View Availability
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
