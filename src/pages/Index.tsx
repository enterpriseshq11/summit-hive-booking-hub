import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CalendarDays, Building2, Sparkles, Dumbbell, Gift, MapPin, Phone, Clock } from "lucide-react";

const businesses = [
  {
    name: "The Summit",
    tagline: "Elevate Every Event",
    description: "Premier event venue for weddings, corporate events, and celebrations. Up to 300 guests.",
    icon: Building2,
    href: "/summit",
    cta: "Plan Your Event",
  },
  {
    name: "The Hive Coworking",
    tagline: "Where Work Thrives",
    description: "Modern workspaces, private offices, and meeting rooms with 24/7 access.",
    icon: Building2,
    href: "/coworking",
    cta: "Find Your Space",
  },
  {
    name: "Restoration Lounge",
    tagline: "Renew & Restore",
    description: "Luxury spa treatments, massage therapy, and recovery services.",
    icon: Sparkles,
    href: "/spa",
    cta: "Book Treatment",
  },
  {
    name: "Total Fitness",
    tagline: "Your Journey Starts Here",
    description: "24/7 gym access, group classes, and personal training programs.",
    icon: Dumbbell,
    href: "/fitness",
    cta: "Start Membership",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-primary/5 via-muted/30 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">
                Wapakoneta, Ohio's Premier Destination
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                A-Z Booking Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Events, workspaces, wellness, and fitness — all under one roof. 
                Book your next experience in minutes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-base" asChild>
                <Link to="/booking">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Book Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link to="/gift-cards">
                  <Gift className="h-5 w-5 mr-2" />
                  Gift Cards
                </Link>
              </Button>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Wapakoneta, OH</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Open 7 Days</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(419) 555-0100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Cards */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Businesses</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four unique experiences designed for life's biggest moments and everyday wellness.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {businesses.map((business) => (
            <Card 
              key={business.href} 
              className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300"
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
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
                    {business.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Browse availability across all our services and book your next experience in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/booking">
                Go to Booking Hub
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/login">
                Sign In / Register
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-sm text-muted-foreground">
                123 Main Street<br />
                Wapakoneta, OH 45895
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Contact</h3>
              <p className="text-sm text-muted-foreground">
                (419) 555-0100<br />
                info@azbookinghub.com
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Hours</h3>
              <p className="text-sm text-muted-foreground">
                Mon-Fri: 6am - 10pm<br />
                Sat-Sun: 7am - 9pm
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
