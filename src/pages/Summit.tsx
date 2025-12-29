import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA, EventRequestForm } from "@/components/booking";
import { CalendarDays, MapPin, Users, Clock, Star, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Summit() {
  const navigate = useNavigate();
  const { data: business } = useBusinessByType("summit");
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleSlotSelect = (slot: any) => {
    navigate(`/booking?slot=${slot.id}&business=summit`);
  };

  const handleEventRequestSuccess = (bookingId: string) => {
    setShowRequestForm(false);
    navigate(`/booking/confirmation?id=${bookingId}&pending=true`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Black & Gold */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30">
                <Star className="h-4 w-4" />
                Premier Event Venue
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">The Summit</h1>
                <p className="text-xl md:text-2xl text-accent font-medium mb-4">Elevate Every Event</p>
                <p className="text-lg text-primary-foreground/70 max-w-xl">
                  {business?.description || "Where Life's Most Important Moments Reach Their Highest Point. Premium venue for weddings, galas, and corporate celebrations."}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all">
                      <CalendarDays className="h-5 w-5 mr-2" />
                      Request Your Event
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Request to Book Your Event</DialogTitle>
                    </DialogHeader>
                    <EventRequestForm onSuccess={handleEventRequestSuccess} />
                  </DialogContent>
                </Dialog>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50">
                  <Link to="/booking?business=summit">
                    Check Availability
                  </Link>
                </Button>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span>Wapakoneta, OH</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span>Up to 300 guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <span>Response within 24h</span>
                </div>
              </div>
            </div>

            {/* Next Available Widget */}
            <Card className="bg-card shadow-2xl border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-accent" />
                  Next Available Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {business && (
                  <NextAvailableWidget 
                    businessType="summit"
                    onSlotSelect={handleSlotSelect}
                  />
                )}
                {business && (
                  <div className="mt-6 pt-6 border-t border-border">
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
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* Event Types */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Types</h2>
          <p className="text-muted-foreground text-lg">Choose your celebration style</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: "Weddings", desc: "Your perfect day deserves a perfect venue. Full-service packages available.", capacity: "50-300 guests", icon: "💒" },
            { name: "Corporate Events", desc: "Professional settings for conferences, meetings, and team celebrations.", capacity: "20-200 attendees", icon: "🏢" },
            { name: "Private Parties", desc: "Birthdays, anniversaries, and life's special moments celebrated in style.", capacity: "25-150 guests", icon: "🎉" },
          ].map((type) => (
            <Card key={type.name} className="hover:shadow-premium-hover hover:border-accent/30 transition-all duration-300 shadow-premium group">
              <CardHeader>
                <div className="text-4xl mb-3">{type.icon}</div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{type.name}</CardTitle>
                <p className="text-xs text-accent font-medium">{type.capacity}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{type.desc}</p>
                <Button variant="outline" className="w-full hover:bg-accent hover:text-primary hover:border-accent transition-all" onClick={() => setShowRequestForm(true)}>
                  Request Quote
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Request to Book Info */}
      <section className="py-16 bg-primary">
        <div className="container">
          <Card className="max-w-2xl mx-auto bg-primary-foreground/5 border-primary-foreground/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-primary-foreground">
                <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                Request to Book Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-primary-foreground/70">
                For weddings and large events, we use a request-to-book process to ensure 
                we can meet all your needs. Submit your preferred dates and details, and 
                our team will respond within 24-48 hours.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Submit Request", "Team Review", "Custom Quote", "Confirm & Deposit"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <div className="h-6 w-6 rounded-full bg-accent text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => setShowRequestForm(true)} className="bg-accent hover:bg-accent/90 text-primary font-semibold">
                Submit Request
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
