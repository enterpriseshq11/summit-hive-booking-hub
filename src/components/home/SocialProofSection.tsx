import { useState } from "react";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialsCarousel, type TestimonialFilter } from "./TestimonialsCarousel";

const experienceFilters: TestimonialFilter[] = ["All", "Events", "Coworking", "Spa", "Fitness", "Studio", "Photo Booth"];


export function SocialProofSection() {
  const [activeFilter, setActiveFilter] = useState<TestimonialFilter>("All");

  return (
    <section className="pt-24 pb-16 bg-background">
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

        {/* Testimonials Grid */}
        <div className="mb-20">
          <TestimonialsCarousel filter={activeFilter} />
        </div>

      </div>
    </section>
  );
}
