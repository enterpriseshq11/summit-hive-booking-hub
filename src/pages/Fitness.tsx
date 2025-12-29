import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA, MembershipSignupForm } from "@/components/booking";
import { Dumbbell, Check, Star, Users, ArrowRight, Clock, Zap } from "lucide-react";

export default function Fitness() {
  const { data: business } = useBusinessByType("fitness");
  const [showMembershipForm, setShowMembershipForm] = useState(false);

  const membershipTiers = [
    {
      name: "Basic",
      price: "$29/mo",
      features: ["24/7 gym access", "Locker room access", "Free WiFi"]
    },
    {
      name: "Premium",
      price: "$49/mo",
      features: ["All Basic features", "Group classes", "Sauna access", "1 guest pass/month"],
      popular: true
    },
    {
      name: "Elite",
      price: "$79/mo",
      features: ["All Premium features", "Spa discounts", "Priority booking", "Unlimited guest passes"]
    }
  ];

  const handleMembershipSuccess = (membershipId: string) => {
    setShowMembershipForm(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Black & Gold */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--fitness)/0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30 mb-8">
              <Dumbbell className="h-4 w-4" />
              24/7 Fitness Center
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground">
              Total Fitness by A-Z
            </h1>
            <p className="text-xl md:text-2xl text-accent font-medium mb-4">Your Journey Starts Here</p>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-2xl">
              {business?.description || "24/7 gym access with state-of-the-art equipment, group classes, and personal training. Transform your potential."}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Dialog open={showMembershipForm} onOpenChange={setShowMembershipForm}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all">
                    <Dumbbell className="h-5 w-5 mr-2" />
                    Join Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Start Your Fitness Journey</DialogTitle>
                  </DialogHeader>
                  <MembershipSignupForm onSuccess={handleMembershipSuccess} />
                </DialogContent>
              </Dialog>
              <Button size="lg" variant="outline" onClick={() => setShowMembershipForm(true)} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50">
                View Memberships
              </Button>
              {business && (
                <WaitlistCTA
                  businessId={business.id}
                  buttonText="Join Fitness Waitlist"
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
              Next Available Orientations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <NextAvailableWidget
              businessType="fitness"
              title="Next Available Orientations"
              showPrice={false}
              limit={3}
            />
          </CardContent>
        </Card>
      </section>

      {/* Membership Tiers Section */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Membership Plans</h2>
          <p className="text-muted-foreground text-lg">Choose the plan that fits your fitness goals</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {membershipTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`hover:shadow-premium-hover transition-all duration-300 shadow-premium group ${
                tier.popular ? "ring-2 ring-accent relative border-accent/30" : "hover:border-accent/30"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-primary text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className={tier.popular ? "pt-8" : ""}>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{tier.name}</CardTitle>
                <p className="text-3xl font-bold text-accent">{tier.price}</p>
                <p className="text-xs text-muted-foreground">Billed monthly • Cancel anytime</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={tier.popular ? "default" : "outline"} 
                  className={`w-full ${tier.popular ? "bg-accent hover:bg-accent/90 text-primary" : "hover:bg-accent hover:text-primary hover:border-accent"} transition-all font-semibold`}
                  onClick={() => setShowMembershipForm(true)}
                >
                  {tier.popular ? "Get Started" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">Start Your Fitness Journey</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-2xl mx-auto text-lg">
            Join today and get access to our state-of-the-art facilities 24/7. No contracts, cancel anytime.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" onClick={() => setShowMembershipForm(true)} className="bg-accent hover:bg-accent/90 text-primary font-bold shadow-gold hover:shadow-gold-lg transition-all">
              Join Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50">
              <Link to="/booking?business=fitness">Schedule Tour</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
