import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA } from "@/components/booking";
import { CalendarDays, MapPin, Users, Clock } from "lucide-react";

export default function Summit() {
  const navigate = useNavigate();
  const { data: business } = useBusinessByType("summit");

  const handleSlotSelect = (slot: any) => {
    navigate(`/booking?slot=${slot.id}&business=summit`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - neutral styling */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-primary mb-2">Event Center</p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">The Summit</h1>
                <p className="text-xl text-muted-foreground mb-2">Elevate Every Event</p>
                <p className="text-lg text-muted-foreground">
                  {business?.description || "Where Life's Most Important Moments Reach Their Highest Point"}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/booking?business=summit">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Check Availability
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Request Quote
                </Button>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>Wapakoneta, OH</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>Up to 300 guests</span>
                </div>
              </div>
            </div>

            {/* Next Available Widget */}
            <Card>
              <CardHeader>
                <CardTitle>Next Available</CardTitle>
              </CardHeader>
              <CardContent>
                {business && (
                  <NextAvailableWidget 
                    businessType="summit"
                    onSlotSelect={handleSlotSelect}
                  />
                )}
                {business && (
                  <div className="mt-4 pt-4 border-t">
                    <WaitlistCTA 
                      businessId={business.id}
                      buttonText="Join Waitlist for Popular Dates"
                      buttonVariant="outline"
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">Event Types</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Weddings", desc: "Your perfect day deserves a perfect venue" },
            { name: "Corporate Events", desc: "Professional settings for business gatherings" },
            { name: "Private Parties", desc: "Celebrate life's special moments" },
          ].map((type) => (
            <Card key={type.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{type.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{type.desc}</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/booking?business=summit">View Availability</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Request to Book Info */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Request to Book</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                For weddings and large events, we use a request-to-book process to ensure 
                we can meet all your needs. Submit your preferred dates and details, and 
                our team will respond within 24-48 hours.
              </p>
              <Button asChild>
                <Link to="/booking?business=summit&mode=request">
                  Submit Request
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
