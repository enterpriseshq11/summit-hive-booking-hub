import { useMemo, useState } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    experience: "The Summit",
    category: "Events",
    rating: 5,
    quote: "Best event space we've ever used. Every detail handled flawlessly — our guests are still talking about it.",
    tag: "Wedding Reception",
  },
  {
    id: 2,
    name: "Michael R.",
    experience: "The Hive Coworking",
    category: "Coworking",
    rating: 5,
    quote: "Easiest booking process in town. 24/7 access, fast WiFi, and I closed three deals in my first month here.",
    tag: "Private Office",
  },
  {
    id: 3,
    name: "Jennifer L.",
    experience: "Restoration Lounge",
    category: "Spa",
    rating: 5,
    quote: "Felt like a private retreat, not a spa. Walked out renewed and already booked my next visit.",
    tag: "Deep Tissue Massage",
  },
  {
    id: 4,
    name: "David K.",
    experience: "Total Fitness",
    category: "Fitness",
    rating: 5,
    quote: "Felt like a private club, not a gym. Clean, modern, and trainers who actually remember your goals.",
    tag: "Membership",
  },
  {
    id: 5,
    name: "Amanda T.",
    experience: "The Summit",
    category: "Events",
    rating: 5,
    quote: "Our company retreat was seamless. Professional venue, responsive team, and everyone left impressed.",
    tag: "Corporate Event",
  },
  {
    id: 6,
    name: "Chris B.",
    experience: "Restoration Lounge",
    category: "Spa",
    rating: 5,
    quote: "No phone tag needed — saw real availability online and booked in under two minutes.",
    tag: "Facial Treatment",
  },
  {
    id: 7,
    name: "Tyler W.",
    experience: "Voice Vault Studio",
    category: "Studio",
    rating: 5,
    quote: "Crystal-clear sound quality and a vibe that makes you want to create. Best studio in the area.",
    tag: "Recording Session",
  },
  {
    id: 8,
    name: "Brianna P.",
    experience: "360 Photo Booth",
    category: "Photo Booth",
    rating: 5,
    quote: "Our guests couldn't stop using it! The videos turned out amazing and everyone shared them instantly.",
    tag: "Party Rental",
  },
  {
    id: 9,
    name: "Marcus J.",
    experience: "Voice Vault Studio",
    category: "Studio",
    rating: 5,
    quote: "Professional setup, easy booking, and the acoustics are top-notch. Highly recommend for any artist.",
    tag: "Podcast Recording",
  },
];

const INITIAL_COUNT = 3;

export type TestimonialFilter = "All" | "Events" | "Coworking" | "Spa" | "Fitness" | "Studio" | "Photo Booth";

interface TestimonialsCarouselProps {
  filter?: TestimonialFilter;
}

export function TestimonialsCarousel({ filter = "All" }: TestimonialsCarouselProps) {
  const [showAll, setShowAll] = useState(false);

  const filteredTestimonials = useMemo(() => {
    if (filter === "All") return testimonials;
    return testimonials.filter(t => t.category === filter);
  }, [filter]);

  // Reset when filter changes
  useMemo(() => setShowAll(false), [filter]);

  if (filteredTestimonials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No testimonials available for this category yet.
      </div>
    );
  }

  const visible = showAll ? filteredTestimonials : filteredTestimonials.slice(0, INITIAL_COUNT);
  const hasMore = filteredTestimonials.length > INITIAL_COUNT && !showAll;

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {visible.map((testimonial) => (
          <Card
            key={testimonial.id}
            className="bg-card border border-border hover:border-accent/30 transition-all duration-300"
          >
            <CardContent className="p-6">
              <Quote className="h-8 w-8 text-accent/40 mb-4" />

              <p className="text-foreground mb-6 leading-relaxed text-base min-h-[72px]">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm font-medium text-accent/80">
                    {testimonial.experience}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="border-accent/30 hover:border-accent hover:bg-accent/10 text-foreground"
          >
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}
