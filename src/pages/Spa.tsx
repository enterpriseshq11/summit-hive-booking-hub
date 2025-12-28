import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA } from "@/components/booking";
import { Sparkles, Clock, Users, Heart } from "lucide-react";

export default function Spa() {
  const { data: business } = useBusinessByType("spa");

  return (
    <div className="min-h-screen">
      {/* Hero Section - Neutral Styling */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              The Hive Restoration Lounge
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {business?.description || "Luxury recovery and restoration services"}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/booking?business=spa">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Book Service
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/booking?business=spa">View Menu</Link>
              </Button>
              {business && (
                <WaitlistCTA
                  businessId={business.id}
                  buttonText="Join Spa Waitlist"
                  buttonVariant="ghost"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Next Available Widget */}
      <section className="py-8 container">
        <NextAvailableWidget
          businessType="spa"
          title="Next Available Appointments"
          showPrice={true}
          limit={3}
        />
      </section>

      {/* Services Section */}
      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Massage Therapy", icon: Heart, desc: "Deep tissue, Swedish, and sports massage" },
            { name: "Recovery Services", icon: Clock, desc: "Cryotherapy, compression, and infrared" },
            { name: "Wellness Packages", icon: Users, desc: "Couples and group experiences" }
          ].map((service) => (
            <Card key={service.name} className="hover:shadow-lg transition-shadow border-border">
              <CardHeader>
                <service.icon className="h-8 w-8 mb-2 text-muted-foreground" />
                <CardTitle className="text-foreground">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.desc}</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/booking?business=spa">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Restore?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience luxury recovery services.
          </p>
          <Button size="lg" asChild>
            <Link to="/booking?business=spa">Find Available Times</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
