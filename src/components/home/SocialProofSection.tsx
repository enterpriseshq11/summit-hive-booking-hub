import { Shield, RefreshCw, HeartHandshake, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

const guarantees = [
  {
    icon: Shield,
    title: "Transparent Pricing",
    description: "No hidden fees. See the full breakdown before you book.",
  },
  {
    icon: RefreshCw,
    title: "Easy Changes",
    description: "Need to adjust? Contact support to modify your booking.",
  },
  {
    icon: HeartHandshake,
    title: "Local Support",
    description: "Real people in Wapakoneta, ready to help you.",
  },
];

const partnerLogos = [
  "Local Chamber",
  "Visit Ohio",
  "AAA Approved",
  "Better Business",
  "Community Trust",
  "Local Awards",
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-semibold text-accent mb-6">
            <Award className="h-4 w-4" />
            Trusted by Locals
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Real Experiences, Real Results
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of satisfied customers who've discovered their destination.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="mb-20">
          <TestimonialsCarousel />
        </div>

        {/* Partner Logos Row */}
        <div className="mb-20">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wider">
            Local Partners & Recognition
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {partnerLogos.map((logo, index) => (
              <div
                key={index}
                className="px-6 py-3 rounded-full bg-muted/50 border text-sm font-medium text-muted-foreground"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {guarantees.map((guarantee, index) => (
            <Card 
              key={index}
              className="border-2 hover:border-accent/30 hover:shadow-lg transition-all duration-300 group"
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                  <guarantee.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">{guarantee.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {guarantee.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
