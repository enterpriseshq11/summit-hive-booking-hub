import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA } from "@/components/booking";
import { Building2, MapPin, Wifi, Coffee, Clock } from "lucide-react";

export default function Coworking() {
  const navigate = useNavigate();
  const { data: business } = useBusinessByType("coworking");

  const handleSlotSelect = (slot: any) => {
    navigate(`/booking?slot=${slot.id}&business=coworking`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - neutral styling */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-primary mb-2">Coworking Space</p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">The Hive</h1>
                <p className="text-lg text-muted-foreground">
                  {business?.description || "Modern workspace solutions for growing businesses"}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/booking?business=coworking">
                    <Building2 className="h-5 w-5 mr-2" />
                    View Offices
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Schedule Tour
                </Button>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-4 w-4" />
                  <span>High-Speed Internet</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coffee className="h-4 w-4" />
                  <span>Coffee Bar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Access</span>
                </div>
              </div>
            </div>

            {/* Next Available Widget */}
            <Card>
              <CardHeader>
                <CardTitle>Available Now</CardTitle>
              </CardHeader>
              <CardContent>
                {business && (
                  <NextAvailableWidget 
                    businessType="coworking"
                    title="Available Spaces"
                    onSlotSelect={handleSlotSelect}
                  />
                )}
                {business && (
                  <div className="mt-4 pt-4 border-t">
                    <WaitlistCTA 
                      businessId={business.id}
                      buttonText="Join Waitlist for Specific Office"
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

      {/* Office Options */}
      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">Office Options</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Private Offices", desc: "Dedicated space for your team", price: "From $500/mo" },
            { name: "Dedicated Desks", desc: "Your own desk in a shared space", price: "From $250/mo" },
            { name: "Meeting Rooms", desc: "Book by the hour for meetings", price: "From $25/hr" },
          ].map((type) => (
            <Card key={type.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{type.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{type.desc}</p>
                <p className="font-semibold text-primary mb-4">{type.price}</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/booking?business=coworking">View Availability</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
