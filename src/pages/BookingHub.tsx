import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinesses } from "@/hooks/useBusinesses";
import { AvailabilitySearch, NextAvailableWidget } from "@/components/booking";
import { Building2, Sparkles, Dumbbell, CalendarDays, ArrowRight } from "lucide-react";
import type { BusinessType } from "@/types";

const businessIcons: Record<BusinessType, React.ComponentType<{ className?: string }>> = {
  summit: Building2,
  coworking: Building2,
  spa: Sparkles,
  fitness: Dumbbell,
};

const businessRoutes: Record<BusinessType, string> = {
  summit: "/summit",
  coworking: "/coworking",
  spa: "/spa",
  fitness: "/fitness",
};

const businessLabels: Record<BusinessType, string> = {
  summit: "The Summit",
  coworking: "The Hive",
  spa: "Restoration Lounge",
  fitness: "Total Fitness",
};

export default function BookingHub() {
  const navigate = useNavigate();
  const { data: businesses, isLoading } = useBusinesses();

  const handleSlotSelect = (slot: any) => {
    // Navigate to the appropriate booking flow
    const businessType = slot.bookable_type_name?.toLowerCase().includes("summit") 
      ? "summit" 
      : slot.bookable_type_name?.toLowerCase().includes("spa") 
        ? "spa" 
        : slot.bookable_type_name?.toLowerCase().includes("fitness")
          ? "fitness"
          : "coworking";
    navigate(`/${businessType}?slot=${slot.id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary">
              <CalendarDays className="h-4 w-4" />
              Booking Hub
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              What would you like to book?
            </h1>
            <p className="text-lg text-muted-foreground">
              Search availability across all A-Z services or choose a business below.
            </p>
          </div>

          {/* Global Availability Search */}
          <div className="max-w-4xl mx-auto">
            <AvailabilitySearch 
              showPartySize={false}
              onSlotSelect={handleSlotSelect}
            />
          </div>
        </div>
      </section>

      {/* Business Cards with Next Available */}
      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-8 text-center">Browse by Business</h2>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-muted" />
                  <div className="h-6 w-32 bg-muted rounded mt-4" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            businesses?.map((business) => {
              const Icon = businessIcons[business.type];
              const route = businessRoutes[business.type];
              const label = businessLabels[business.type];

              return (
                <Card key={business.id} className="group hover:shadow-lg transition-all hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{label}</CardTitle>
                    <CardDescription>
                      {business.tagline || "Book your next experience"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Next Available Widget */}
                    <NextAvailableWidget 
                      businessType={business.type}
                      showPrice={true}
                      limit={2}
                      onSlotSelect={handleSlotSelect}
                    />

                    <Button asChild className="w-full group-hover:bg-primary">
                      <Link to={route} className="flex items-center justify-center gap-2">
                        View All Options
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/gift-cards">
                  <span className="text-2xl">🎁</span>
                  <span className="text-sm">Gift Cards</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/account">
                  <span className="text-2xl">📋</span>
                  <span className="text-sm">My Bookings</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/fitness">
                  <span className="text-2xl">💪</span>
                  <span className="text-sm">Memberships</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/spa">
                  <span className="text-2xl">🧘</span>
                  <span className="text-sm">Spa Services</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
