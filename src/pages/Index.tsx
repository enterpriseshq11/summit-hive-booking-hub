import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CalendarDays, Building2, Sparkles, Dumbbell, Gift } from "lucide-react";

const businesses = [
  {
    name: "The Summit",
    tagline: "Elevate Every Event",
    description: "Premier event venue for weddings, corporate events, and celebrations",
    icon: Building2,
    href: "/summit",
  },
  {
    name: "The Hive Coworking",
    tagline: "Where Work Thrives",
    description: "Modern workspaces, private offices, and meeting rooms",
    icon: Building2,
    href: "/coworking",
  },
  {
    name: "Restoration Lounge",
    tagline: "Renew & Restore",
    description: "Luxury spa treatments and recovery services",
    icon: Sparkles,
    href: "/spa",
  },
  {
    name: "Total Fitness",
    tagline: "Your Journey Starts Here",
    description: "24/7 gym access, classes, and personal training",
    icon: Dumbbell,
    href: "/fitness",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              A-Z Booking Hub
            </h1>
            <p className="text-xl text-muted-foreground">
              Your one-stop destination for events, workspaces, wellness, and fitness 
              in Wapakoneta, Ohio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/booking">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Book Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/gift-cards">
                  <Gift className="h-5 w-5 mr-2" />
                  Gift Cards
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Cards */}
      <section className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Businesses</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four unique experiences under one roof. Explore what A-Z Enterprises 
            has to offer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {businesses.map((business) => (
            <Card 
              key={business.href} 
              className="group hover:shadow-lg hover:border-primary/50 transition-all"
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <business.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{business.name}</CardTitle>
                <CardDescription className="text-primary font-medium">
                  {business.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{business.description}</p>
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link to={business.href} className="flex items-center justify-center gap-2">
                    Learn More
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Browse availability across all our services and book your next experience in minutes.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/booking">
              Go to Booking Hub
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
