import { useState } from "react";
import { Shield, RefreshCw, HeartHandshake, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

const guarantees = [
  {
    icon: Shield,
    title: "Transparent Process",
    description: "You'll review everything before payment—no surprises.",
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

const experienceFilters = ["All", "Events", "Coworking", "Spa", "Fitness"] as const;
type ExperienceFilter = typeof experienceFilters[number];

export function SocialProofSection() {
  const [activeFilter, setActiveFilter] = useState<ExperienceFilter>("All");

  return (
    <section className="py-24 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-semibold text-accent mb-6">
            <Award className="h-4 w-4" />
            Trusted by Locals
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            The Experience People Talk About
          </h2>
          <p className="text-lg text-muted-foreground">
            Join satisfied customers who've discovered their destination.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {experienceFilters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter 
                ? "bg-accent text-primary hover:bg-accent/90" 
                : "border-border hover:border-accent/30"
              }
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Testimonials Carousel */}
        <div className="mb-20">
          <TestimonialsCarousel filter={activeFilter} />
        </div>

        {/* Trust Strip - Replaces partner logos */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-muted-foreground">
            <span className="px-4 py-2 rounded-full bg-muted/50 border font-medium">
              ✓ Trusted locally
            </span>
            <span className="px-4 py-2 rounded-full bg-muted/50 border font-medium">
              ✓ High satisfaction
            </span>
            <span className="px-4 py-2 rounded-full bg-muted/50 border font-medium">
              ✓ 4 experiences under one roof
            </span>
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
