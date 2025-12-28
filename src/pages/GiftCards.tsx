import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Dumbbell, Building2, Heart } from "lucide-react";

const giftCardOptions = [
  { amount: 50, label: "Starter", description: "Perfect for a single service", popular: false },
  { amount: 100, label: "Classic", description: "Great for spa treatments or gym passes", popular: true },
  { amount: 200, label: "Premium", description: "Full day of wellness experiences", popular: false },
  { amount: 500, label: "Ultimate", description: "Complete wellness package", popular: false },
];

export default function GiftCards() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-4xl text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Gift Cards</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Give the gift of wellness, fitness, and unforgettable experiences. 
            Valid at all A-Z Enterprises locations.
          </p>
        </div>
      </section>

      {/* Gift Card Options */}
      <section className="py-12 container max-w-5xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {giftCardOptions.map((option) => (
            <Card 
              key={option.amount} 
              className={`hover:shadow-lg transition-all text-center relative ${
                option.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {option.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className={option.popular ? "pt-6" : ""}>
                <CardDescription className="font-medium">{option.label}</CardDescription>
                <CardTitle className="text-4xl font-bold">${option.amount}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{option.description}</p>
                <Button className="w-full" variant={option.popular ? "default" : "outline"}>
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Where to Use */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-8 text-center">Use Your Gift Card At</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "The Summit", icon: Building2, desc: "Events & Venues" },
              { name: "The Hive", icon: Building2, desc: "Coworking" },
              { name: "Restoration Lounge", icon: Heart, desc: "Spa & Wellness" },
              { name: "Total Fitness", icon: Dumbbell, desc: "Gym & Classes" },
            ].map((location) => (
              <Card key={location.name} className="text-center">
                <CardContent className="pt-6">
                  <location.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{location.name}</p>
                  <p className="text-sm text-muted-foreground">{location.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 container max-w-4xl">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Purchase", desc: "Choose an amount and complete your purchase securely" },
            { step: "2", title: "Receive", desc: "Get your gift card code instantly via email" },
            { step: "3", title: "Redeem", desc: "Apply the code at checkout for any A-Z service" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
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
