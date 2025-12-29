import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Dumbbell, Building2, Heart, Check, Shield, Clock, Mail } from "lucide-react";

const giftCardOptions = [
  { amount: 50, label: "Starter", description: "Perfect for a single service" },
  { amount: 100, label: "Classic", description: "Great for spa treatments or gym passes" },
  { amount: 200, label: "Premium", description: "Full day of wellness experiences" },
  { amount: 500, label: "Ultimate", description: "Complete wellness package" },
];

export default function GiftCards() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handlePurchase = () => {
    if (!selectedAmount) return;
    // TODO: Integrate with Stripe checkout for gift card purchase
    // This will be connected when Stripe goes live
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium Black & Gold */}
      <section className="relative py-20 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-accent/20 border border-accent/30 mb-6">
            <Gift className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary-foreground">Give the Gift of Wellness</h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            A thoughtful way to share fitness, relaxation, and unforgettable experiences. 
            Valid at all A-Z Enterprises locations.
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-primary font-semibold px-8"
            onClick={() => document.getElementById('gift-card-selection')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Select Your Gift Card
          </Button>
          <p className="text-sm text-primary-foreground/50 mt-4">
            Never expires • Instant delivery • Secure checkout
          </p>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* Gift Card Selection */}
      <section id="gift-card-selection" className="py-16 container max-w-5xl">
        <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Amount</h2>
        <p className="text-muted-foreground text-center mb-8">Select a gift card value below</p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {giftCardOptions.map((option) => (
            <Card 
              key={option.amount} 
              onClick={() => setSelectedAmount(option.amount)}
              className={`cursor-pointer transition-all text-center relative shadow-premium group ${
                selectedAmount === option.amount 
                  ? "ring-2 ring-accent border-accent/30 shadow-premium-hover" 
                  : "hover:border-accent/30 hover:shadow-premium-hover"
              }`}
            >
              {selectedAmount === option.amount && (
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
              <CardHeader>
                <CardDescription className="font-medium text-muted-foreground">{option.label}</CardDescription>
                <CardTitle className="text-4xl font-bold text-accent">${option.amount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Single Section CTA */}
        <div className="text-center">
          <Button 
            size="lg"
            disabled={!selectedAmount}
            onClick={handlePurchase}
            className="bg-accent hover:bg-accent/90 text-primary font-semibold px-12"
          >
            {selectedAmount ? `Purchase $${selectedAmount} Gift Card` : "Select an Amount"}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            You'll review your order before payment
          </p>
        </div>
      </section>

      {/* Where to Use */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-2 text-center">Redeem Anywhere</h2>
          <p className="text-muted-foreground text-center mb-8">Use your gift card at any A-Z Enterprises location</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "The Summit", icon: Building2, desc: "Events & Venues" },
              { name: "The Hive", icon: Building2, desc: "Coworking" },
              { name: "Restoration Lounge", icon: Heart, desc: "Spa & Wellness" },
              { name: "Total Fitness", icon: Dumbbell, desc: "Gym & Classes" },
            ].map((location) => (
              <Card key={location.name} className="text-center shadow-premium hover:shadow-premium-hover hover:border-accent/30 transition-all">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <location.icon className="h-6 w-6 text-accent" />
                  </div>
                  <p className="font-semibold">{location.name}</p>
                  <p className="text-sm text-muted-foreground">{location.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Process Timeline */}
      <section className="py-16 container max-w-4xl">
        <h2 className="text-2xl font-bold mb-2 text-center">How It Works</h2>
        <p className="text-muted-foreground text-center mb-12">Simple, secure, and instant</p>
        
        <div className="relative">
          {/* Vertical line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          
          <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
            {[
              { step: "1", title: "Choose Amount", desc: "Select the perfect gift card value for your recipient", icon: Gift },
              { step: "2", title: "Instant Delivery", desc: "Receive your gift card code immediately via email", icon: Mail },
              { step: "3", title: "Redeem Anytime", desc: "Apply the code at checkout for any A-Z service", icon: Check },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="h-14 w-14 rounded-full bg-accent text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold relative z-10">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <p className="font-medium">Never Expires</p>
              <p className="text-sm text-muted-foreground">Use it whenever you're ready</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <p className="font-medium">Instant Delivery</p>
              <p className="text-sm text-muted-foreground">Delivered to your inbox immediately</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <p className="font-medium">Secure Checkout</p>
              <p className="text-sm text-muted-foreground">Protected by Stripe</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 container max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Give the Gift of Wellness?</h2>
        <p className="text-muted-foreground mb-6">
          A perfect present for birthdays, holidays, or just because.
        </p>
        <Button 
          size="lg"
          className="bg-accent hover:bg-accent/90 text-primary font-semibold px-8"
          onClick={() => document.getElementById('gift-card-selection')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Select Your Gift Card
        </Button>
      </section>

      {/* Terms */}
      <section className="py-8 container max-w-4xl border-t">
        <p className="text-center text-sm text-muted-foreground">
          Gift cards never expire and cannot be redeemed for cash. 
          For questions, contact us at (419) 555-0100.
        </p>
      </section>
    </div>
  );
}
