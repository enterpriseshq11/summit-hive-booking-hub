import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA, SpaBookingForm } from "@/components/booking";
import { Sparkles, Clock, Users, Heart } from "lucide-react";

export default function Spa() {
  const { data: business } = useBusinessByType("spa");
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleBookingSuccess = (bookingId: string) => {
    setShowBookingForm(false);
  };

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
              <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Book Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Book Your Spa Experience</DialogTitle>
                  </DialogHeader>
                  <SpaBookingForm onSuccess={handleBookingSuccess} />
                </DialogContent>
              </Dialog>
              <Button size="lg" variant="outline" onClick={() => setShowBookingForm(true)}>
                View Menu
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
      <section className="py-16 container">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-foreground">Our Services</h2>
          <p className="text-muted-foreground">Restore your body and mind</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Massage Therapy", icon: Heart, desc: "Deep tissue, Swedish, hot stone, and sports massage by certified therapists.", duration: "60-120 min", price: "From $85" },
            { name: "Recovery Services", icon: Clock, desc: "Cryotherapy, compression therapy, infrared sauna, and cold plunge.", duration: "30-60 min", price: "From $40" },
            { name: "Wellness Packages", icon: Users, desc: "Couples massages, spa days, and group wellness experiences.", duration: "2-4 hours", price: "From $150" }
          ].map((service) => (
            <Card key={service.name} className="hover:shadow-lg transition-shadow border-border">
              <CardHeader>
                <service.icon className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-foreground">{service.name}</CardTitle>
                <p className="text-sm text-primary font-medium">{service.price} • {service.duration}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.desc}</p>
                <Button variant="outline" className="w-full" onClick={() => setShowBookingForm(true)}>
                  Book Now
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
          <Button size="lg" onClick={() => setShowBookingForm(true)}>
            Find Available Times
          </Button>
        </div>
      </section>
    </div>
  );
}
