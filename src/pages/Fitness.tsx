import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { NextAvailableWidget, WaitlistCTA, MembershipSignupForm } from "@/components/booking";
import { Dumbbell, Check, Star, Users } from "lucide-react";

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
      features: ["All Basic features", "Group classes", "Sauna access", "1 guest pass/month"]
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
      {/* Hero Section - Neutral Styling */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Total Fitness by A-Z
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {business?.description || "24/7 fitness and wellness center"}
            </p>
            <div className="flex flex-wrap gap-4">
              <Dialog open={showMembershipForm} onOpenChange={setShowMembershipForm}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Dumbbell className="h-5 w-5 mr-2" />
                    Join Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Start Your Fitness Journey</DialogTitle>
                  </DialogHeader>
                  <MembershipSignupForm onSuccess={handleMembershipSuccess} />
                </DialogContent>
              </Dialog>
              <Button size="lg" variant="outline" onClick={() => setShowMembershipForm(true)}>
                View Memberships
              </Button>
              {business && (
                <WaitlistCTA
                  businessId={business.id}
                  buttonText="Join Fitness Waitlist"
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
          businessType="fitness"
          title="Next Available Orientations"
          showPrice={false}
          limit={3}
        />
      </section>

      {/* Membership Tiers Section */}
      <section className="py-16 container">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-foreground">Membership Plans</h2>
          <p className="text-muted-foreground">Choose the plan that fits your fitness goals</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {membershipTiers.map((tier, index) => (
            <Card 
              key={tier.name} 
              className={`hover:shadow-lg transition-shadow border-border ${
                index === 1 ? "ring-2 ring-primary relative" : ""
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className={index === 1 ? "pt-8" : ""}>
                <CardTitle className="text-foreground">{tier.name}</CardTitle>
                <p className="text-3xl font-bold text-foreground">{tier.price}</p>
                <p className="text-xs text-muted-foreground">Billed monthly • Cancel anytime</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={index === 1 ? "default" : "outline"} 
                  className="w-full" 
                  onClick={() => setShowMembershipForm(true)}
                >
                  {index === 1 ? "Get Started" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Start Your Fitness Journey</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join today and get access to our state-of-the-art facilities 24/7.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => setShowMembershipForm(true)}>
              Join Now
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/booking?business=fitness">Schedule Tour</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
