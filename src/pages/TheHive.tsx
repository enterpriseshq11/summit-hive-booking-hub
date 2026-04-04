import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Clock, Check, Users, ArrowRight, CalendarDays } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SEOHead } from "@/components/seo";
import { useHivePrivateOffices } from "@/hooks/useHivePrivateOffices";

export default function TheHive() {
  const navigate = useNavigate();
  const { data: offices, isLoading } = useHivePrivateOffices();

  const availableCount = offices?.filter((o) => o.status === "available").length ?? 0;
  const totalCount = offices?.length ?? 0;

  const officeTypes = [
    {
      name: "Standard Private Office",
      code: "S",
      price: offices?.find((o) => o.code.startsWith("S"))?.monthly_rate ?? 350,
      features: ["Lockable private office", "Furnished desk and chair", "24/7 building access", "WiFi included", "Shared conference room"],
    },
    {
      name: "Premium Executive Suite",
      code: "P",
      price: offices?.find((o) => o.code.startsWith("P"))?.monthly_rate ?? 550,
      features: ["Larger private office", "Premium furnishings", "24/7 building access", "WiFi included", "Priority conference room", "Dedicated parking spot"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="The Hive Co-Working Space — Private Offices in Wapakoneta" description="Rent a private office at The Hive by A-Z. Affordable coworking and private offices in Wapakoneta, Ohio." />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="bg-accent text-accent-foreground">
            {isLoading ? "Loading..." : `${availableCount} of ${totalCount} Offices Available`}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">The Hive Co-Working Space</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional private offices and coworking space in the heart of Wapakoneta.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {SITE_CONFIG.location.street}, Suite D</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 24/7 Access</span>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {SITE_CONFIG.contact.phone}</span>
          </div>
        </div>
      </section>

      {/* Availability Banner */}
      {!isLoading && (
        <div className={`py-3 px-4 text-center text-sm font-semibold ${availableCount > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
          {availableCount > 0
            ? `${availableCount} office${availableCount !== 1 ? "s" : ""} available right now — secure yours today`
            : "All offices are currently leased — join our waitlist"}
        </div>
      )}

      {/* Office Types */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Office Options</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {officeTypes.map((type) => {
            const available = offices?.filter((o) => o.code.startsWith(type.code) && o.status === "available").length ?? 0;
            return (
              <Card key={type.code} className="transition-all hover:border-accent/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{type.name}</CardTitle>
                    <Badge variant={available > 0 ? "default" : "secondary"}>
                      {available > 0 ? `${available} Available` : "Leased"}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-accent">${type.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {type.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-accent shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => navigate("/intake/coworking")} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {available > 0 ? "Request This Office" : "Join Waitlist"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Why The Hive */}
      <section className="bg-muted py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Why The Hive?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "Professional Space", desc: "Dedicated offices in a modern building" },
              { icon: Clock, title: "24/7 Access", desc: "Work on your schedule with round-the-clock access" },
              { icon: Users, title: "Community", desc: "Network with other professionals in the building" },
              { icon: CalendarDays, title: "Flexible Terms", desc: "Month-to-month leases with no long commitments" },
            ].map((item) => (
              <div key={item.title} className="text-center space-y-2">
                <item.icon className="w-8 h-8 text-accent mx-auto" />
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">Ready to see the space?</h2>
        <p className="text-muted-foreground mb-6">Schedule a tour and find the perfect office for your business.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => navigate("/intake/coworking")} className="bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
            <CalendarDays className="w-4 h-4 mr-2" /> Schedule a Tour
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href={SITE_CONFIG.contact.phoneLink}><Phone className="w-4 h-4 mr-2" /> Call {SITE_CONFIG.contact.phone}</a>
          </Button>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
