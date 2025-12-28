import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { Sparkles, CalendarDays } from "lucide-react";

export default function Spa() {
  const { data: business } = useBusinessByType("spa");

  return (
    <div className="min-h-screen">
      <section className="py-16 bg-gradient-to-b from-spa/5 to-background">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">The Hive Restoration Lounge</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {business?.description || "Luxury recovery and restoration services"}
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to="/booking"><Sparkles className="h-5 w-5 mr-2" />Book Service</Link>
              </Button>
              <Button size="lg" variant="outline">View Menu</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Massage Therapy", "Recovery Services", "Wellness Packages"].map((type) => (
            <Card key={type} className="hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle>{type}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Premium {type.toLowerCase()}</p>
                <Button variant="outline" className="w-full">Book Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
