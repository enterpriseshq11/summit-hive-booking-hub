import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinesses } from "@/hooks/useBusinesses";
import { Building2, Sparkles, Dumbbell, CalendarDays, Clock, DollarSign, ArrowRight } from "lucide-react";
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

const businessColors: Record<BusinessType, string> = {
  summit: "bg-summit/10 text-summit",
  coworking: "bg-coworking/10 text-coworking",
  spa: "bg-spa/10 text-spa",
  fitness: "bg-fitness/10 text-fitness",
};

export default function BookingHub() {
  const { data: businesses, isLoading } = useBusinesses();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary">
              <CalendarDays className="h-4 w-4" />
              Booking Hub
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              What would you like to book?
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose a business below to view availability and book your next experience.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Cards */}
      <section className="py-12 container">
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
              const colorClass = businessColors[business.type];

              return (
                <Card key={business.id} className="group hover:shadow-lg transition-all hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`h-12 w-12 rounded-lg ${colorClass} flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{business.name}</CardTitle>
                    <CardDescription>
                      {business.tagline || "Book your next experience"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Availability Preview */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>Next: Today 2:00 PM</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        <span>From $50</span>
                      </div>
                    </div>

                    <Button asChild className="w-full group-hover:bg-primary">
                      <Link to={route} className="flex items-center justify-center gap-2">
                        Book Now
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
