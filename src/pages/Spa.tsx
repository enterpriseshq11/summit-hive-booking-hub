import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA, SpaBookingForm } from "@/components/booking";
import { Sparkles, Clock, Users, Heart, ArrowRight, Leaf, Star } from "lucide-react";

export default function Spa() {
  const { data: business } = useBusinessByType("spa");
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleBookingSuccess = (bookingId: string) => {
    setShowBookingForm(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Black & Gold */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--spa)/0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30 mb-8">
              <Sparkles className="h-4 w-4" />
              Luxury Spa & Wellness
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">
              The Hive Restoration Lounge
            </h1>
            <p className="text-xl md:text-2xl text-accent font-medium mb-4">Renew & Restore</p>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-2xl">
              {business?.description || "Luxury recovery and restoration services. Expert therapists, premium products, and a sanctuary designed for total relaxation."}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Book Treatment
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Book Your Spa Experience</DialogTitle>
                  </DialogHeader>
                  <SpaBookingForm onSuccess={handleBookingSuccess} />
                </DialogContent>
              </Dialog>
              <Button size="lg" variant="outline" onClick={() => setShowBookingForm(true)} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50">
                View Menu
              </Button>
              {business && (
                <WaitlistCTA
                  businessId={business.id}
                  buttonText="Join Spa Waitlist"
                  buttonVariant="ghost"
                  className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* Next Available Widget */}
      <section className="py-12 container">
        <Card className="max-w-4xl mx-auto shadow-premium border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Next Available Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <NextAvailableWidget
              businessType="spa"
              title="Next Available Appointments"
              showPrice={true}
              limit={3}
            />
          </CardContent>
        </Card>
      </section>

      {/* Services Section */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground text-lg">Restore your body and mind</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: "Massage Therapy", icon: Heart, desc: "Deep tissue, Swedish, hot stone, and sports massage by certified therapists.", duration: "60-120 min", price: "From $85" },
            { name: "Recovery Services", icon: Leaf, desc: "Cryotherapy, compression therapy, infrared sauna, and cold plunge.", duration: "30-60 min", price: "From $40" },
            { name: "Wellness Packages", icon: Star, desc: "Couples massages, spa days, and group wellness experiences.", duration: "2-4 hours", price: "From $150" }
          ].map((service) => (
            <Card key={service.name} className="hover:shadow-premium-hover hover:border-accent/30 transition-all duration-300 shadow-premium group">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                  <service.icon className="h-7 w-7 text-accent group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{service.name}</CardTitle>
                <p className="text-sm font-semibold text-accent">{service.price} • {service.duration}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{service.desc}</p>
                <Button variant="outline" className="w-full hover:bg-accent hover:text-primary hover:border-accent transition-all" onClick={() => setShowBookingForm(true)}>
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">Ready to Restore?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-2xl mx-auto text-lg">
            Book your appointment today and experience luxury recovery services designed to help you feel your best.
          </p>
          <Button size="lg" onClick={() => setShowBookingForm(true)} className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all">
            Find Available Times
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
