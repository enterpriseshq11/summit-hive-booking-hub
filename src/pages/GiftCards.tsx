import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Dumbbell, Building2, Heart, ArrowRight } from "lucide-react";

const giftCardOptions = [
  { amount: 50, label: "Starter", description: "Perfect for a single service", popular: false },
  { amount: 100, label: "Classic", description: "Great for spa treatments or gym passes", popular: true },
  { amount: 200, label: "Premium", description: "Full day of wellness experiences", popular: false },
  { amount: 500, label: "Ultimate", description: "Complete wellness package", popular: false },
];

export default function GiftCards() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary-foreground">Gift Cards</h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            Give the gift of wellness, fitness, and unforgettable experiences. 
            Valid at all A-Z Enterprises locations.
          </p>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* Gift Card Options */}
      <section className="py-16 container max-w-5xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {giftCardOptions.map((option) => (
            <Card 
              key={option.amount} 
              className={`hover:shadow-premium-hover transition-all text-center relative shadow-premium group ${
                option.popular ? "ring-2 ring-accent border-accent/30" : "hover:border-accent/30"
              }`}
            >
              {option.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent text-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader className={option.popular ? "pt-6" : ""}>
                <CardDescription className="font-medium text-muted-foreground">{option.label}</CardDescription>
                <CardTitle className="text-4xl font-bold text-accent">${option.amount}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{option.description}</p>
                <Button className={`w-full ${option.popular ? "bg-accent hover:bg-accent/90 text-primary" : ""}`} variant={option.popular ? "default" : "outline"}>
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Where to Use */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-8 text-center">Use Your Gift Card At</h2>
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

      {/* How It Works */}
      <section className="py-16 container max-w-4xl">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Purchase", desc: "Choose an amount and complete your purchase securely" },
            { step: "2", title: "Receive", desc: "Get your gift card code instantly via email" },
            { step: "3", title: "Redeem", desc: "Apply the code at checkout for any A-Z service" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="h-14 w-14 rounded-full bg-accent text-primary flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Terms */}
      <section className="py-8 container max-w-4xl">
        <p className="text-center text-sm text-muted-foreground">
          Gift cards never expire. Cannot be redeemed for cash. 
          For questions, contact us at (419) 555-0100.
        </p>
      </section>
    </div>
  );
}
