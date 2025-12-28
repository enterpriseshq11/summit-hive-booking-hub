import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { Dumbbell, CalendarDays } from "lucide-react";

export default function Fitness() {
  const { data: business } = useBusinessByType("fitness");

  return (
    <div className="min-h-screen">
      <section className="py-16 bg-gradient-to-b from-fitness/5 to-background">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Total Fitness by A-Z</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {business?.description || "24/7 fitness and wellness center"}
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to="/booking"><Dumbbell className="h-5 w-5 mr-2" />Join Now</Link>
              </Button>
              <Button size="lg" variant="outline">View Memberships</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">Membership Tiers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Basic", "Premium", "Elite"].map((tier) => (
            <Card key={tier} className="hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle>{tier} Membership</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">24/7 gym access with {tier.toLowerCase()} perks</p>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
