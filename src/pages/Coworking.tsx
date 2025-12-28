import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { Building2, CalendarDays } from "lucide-react";

export default function Coworking() {
  const { data: business } = useBusinessByType("coworking");

  return (
    <div className="min-h-screen">
      <section className="py-16 bg-gradient-to-b from-coworking/5 to-background">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">The Hive Coworking</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {business?.description || "Modern workspace solutions for growing businesses"}
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to="/booking"><Building2 className="h-5 w-5 mr-2" />View Offices</Link>
              </Button>
              <Button size="lg" variant="outline">Schedule Tour</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">Office Options</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Private Offices", "Dedicated Desks", "Meeting Rooms"].map((type) => (
            <Card key={type} className="hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle>{type}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Flexible workspace for your team</p>
                <Button variant="outline" className="w-full">View Availability</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
