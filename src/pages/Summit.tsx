import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

export default function Summit() {
  const { data: business } = useBusinessByType("summit");

  return (
    <div className="min-h-screen">
      <section className="py-16 bg-gradient-to-b from-summit/5 to-background">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">The Summit</h1>
            <p className="text-xl text-muted-foreground mb-2">Elevate Every Event</p>
            <p className="text-lg text-muted-foreground mb-8">
              {business?.description || "Where Life's Most Important Moments Reach Their Highest Point"}
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to="/booking"><CalendarDays className="h-5 w-5 mr-2" />Book Now</Link>
              </Button>
              <Button size="lg" variant="outline">Request Quote</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">Event Types</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Weddings", "Corporate Events", "Private Parties"].map((type) => (
            <Card key={type} className="hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle>{type}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Perfect venue for your {type.toLowerCase()}</p>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
