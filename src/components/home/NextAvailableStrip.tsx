import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Sparkles, Dumbbell, Zap, ArrowRight, Clock, Users, Calendar } from "lucide-react";
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

type TimeFilter = "today" | "tomorrow" | "week";

function AvailabilityWidget({ business, filter }: { business: BusinessConfig; filter: TimeFilter }) {
  const { data: slots, isLoading, error } = useNextAvailable(business.type);
  const Icon = business.icon;

  // Filter slots based on selected time filter
  const filteredSlots = slots?.filter(slot => {
    const slotDate = new Date(slot.start_time);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    switch (filter) {
      case "today":
        return slotDate.toDateString() === today.toDateString();
      case "tomorrow":
        return slotDate.toDateString() === tomorrow.toDateString();
      case "week":
        return slotDate >= today && slotDate < weekEnd;
      default:
        return true;
    }
  }).slice(0, 3) || []; // Show up to 3 slots

  if (isLoading) {
    return (
      <Link 
        to={business.href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
        role="link"
        aria-label={`View ${business.name} availability`}
      >
        <Card className="border-2 hover:border-accent/30 transition-all duration-300 cursor-pointer h-full">
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
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
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
        <Card className="border-2 hover:border-accent/30 transition-all duration-300 cursor-pointer h-full">
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

  const hasSlots = filteredSlots.length > 0;

  return (
    <Link 
      to={business.href}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
      role="link"
      aria-label={`View ${business.name} - ${hasSlots ? `${filteredSlots.length} slots available` : 'Check other dates'}`}
    >
      <Card className={`border-2 hover:border-${business.colorClass}/50 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-10 w-10 rounded-xl ${business.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className={`h-5 w-5 text-${business.colorClass}`} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{business.name}</p>
              {hasSlots ? (
                <p className="text-xs text-accent font-medium">{filteredSlots.length} time{filteredSlots.length > 1 ? 's' : ''} available</p>
              ) : (
                <p className="text-xs text-muted-foreground">Check other dates</p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
          </div>
          
          {/* Time slots */}
          {hasSlots ? (
            <div className="space-y-1.5">
              {filteredSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded-md">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(slot.start_time).toLocaleDateString(undefined, { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })} at {new Date(slot.start_time).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Fully booked - try another date</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function NextAvailableStrip() {
  const [filter, setFilter] = useState<TimeFilter>("week");

  return (
    <section id="availability" className="py-12 bg-muted/50 border-y scroll-mt-20">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Next Openings (Real-Time)</h3>
              <p className="text-sm text-muted-foreground">Up to 3 slots per experience</p>
            </div>
          </div>
          
          {/* Time Filter Toggle */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted border">
              <button
                onClick={() => setFilter("today")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  filter === "today"
                    ? "bg-accent text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter("tomorrow")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  filter === "tomorrow"
                    ? "bg-accent text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tomorrow
              </button>
              <button
                onClick={() => setFilter("week")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  filter === "week"
                    ? "bg-accent text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                This Week
              </button>
            </div>
            
            <Button variant="ghost" size="sm" asChild className="text-accent hover:text-accent/80">
              <Link to="/booking" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {businesses.map((business) => (
            <AvailabilityWidget key={business.type} business={business} filter={filter} />
          ))}
        </div>

        {/* Single section CTA */}
        <div className="text-center mt-8">
          <Button asChild className="bg-accent hover:bg-accent/90 text-primary font-semibold">
            <Link to="/booking" className="flex items-center gap-2">
              View Full Availability
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
