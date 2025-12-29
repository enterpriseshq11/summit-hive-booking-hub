import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA, LeaseSignupForm } from "@/components/booking";
import { Building2, MapPin, Wifi, Coffee, Clock, ArrowRight, Check, Zap } from "lucide-react";

export default function Coworking() {
  const navigate = useNavigate();
  const { data: business } = useBusinessByType("coworking");
  const [showLeaseForm, setShowLeaseForm] = useState(false);

  const handleSlotSelect = (slot: any) => {
    navigate(`/booking?slot=${slot.id}&business=coworking`);
  };

  const handleLeaseSuccess = (bookingId: string) => {
    setShowLeaseForm(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Black & Gold */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30">
                <Building2 className="h-4 w-4" />
                Modern Workspace
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">The Hive</h1>
                <p className="text-xl md:text-2xl text-accent font-medium mb-4">Where Work Thrives</p>
                <p className="text-lg text-primary-foreground/70 max-w-xl">
                  {business?.description || "Modern workspace solutions for growing businesses. Private offices, dedicated desks, and meeting rooms with 24/7 access."}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog open={showLeaseForm} onOpenChange={setShowLeaseForm}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all">
                      <Building2 className="h-5 w-5 mr-2" />
                      Lease an Office
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Lease Your Workspace</DialogTitle>
                    </DialogHeader>
                    <LeaseSignupForm onSuccess={handleLeaseSuccess} />
                  </DialogContent>
                </Dialog>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50">
                  <Link to="/booking?business=coworking">
                    Schedule Tour
                  </Link>
                </Button>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-accent" />
                  <span>High-Speed Internet</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-accent" />
                  <span>Coffee Bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <span>24/7 Access</span>
                </div>
              </div>
            </div>

            {/* Next Available Widget */}
            <Card className="bg-card shadow-2xl border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Available Now
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {business && (
                  <NextAvailableWidget 
                    businessType="coworking"
                    title="Available Spaces"
                    onSlotSelect={handleSlotSelect}
                  />
                )}
                {business && (
                  <div className="mt-6 pt-6 border-t border-border">
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
        
        {/* Angled divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* Office Options */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Workspace Options</h2>
          <p className="text-muted-foreground text-lg">Flexible solutions for every work style</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: "Private Offices", desc: "Dedicated lockable space for your team. Includes furniture, utilities, and storage.", price: "From $500/mo", features: ["24/7 access", "Mail handling", "Meeting credits"] },
            { name: "Dedicated Desks", desc: "Your own permanent desk in our open workspace. Great for solo professionals.", price: "From $250/mo", features: ["Reserved desk", "Locker included", "Community events"] },
            { name: "Meeting Rooms", desc: "Professional rooms for client meetings, interviews, or team sessions.", price: "From $25/hr", features: ["A/V equipment", "Whiteboard", "Refreshments"] },
          ].map((type, index) => (
            <Card 
              key={type.name} 
              className={`hover:shadow-premium-hover hover:border-accent/30 transition-all duration-300 shadow-premium group ${
                index === 0 ? "ring-2 ring-accent relative" : ""
              }`}
            >
              {index === 0 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-primary text-xs px-3 py-1 rounded-full font-semibold">Most Popular</span>
                </div>
              )}
              <CardHeader className={index === 0 ? "pt-8" : ""}>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{type.name}</CardTitle>
                <p className="text-2xl font-bold text-accent">{type.price}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{type.desc}</p>
                <ul className="space-y-2 mb-6">
                  {type.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={index === 0 ? "default" : "outline"} 
                  className={`w-full ${index === 0 ? "bg-accent hover:bg-accent/90 text-primary" : "hover:bg-accent hover:text-primary hover:border-accent"} transition-all`}
                  onClick={() => setShowLeaseForm(true)}
                >
                  {type.name === "Meeting Rooms" ? "Book Now" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
