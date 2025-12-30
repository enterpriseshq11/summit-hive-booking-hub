import { useState, useEffect, useCallback, useMemo } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
];

const experienceColors: Record<string, string> = {
  "The Summit": "text-summit",
  "The Hive Coworking": "text-coworking",
  "Restoration Lounge": "text-spa",
  "Total Fitness": "text-fitness",
};

interface TestimonialsCarouselProps {
  filter?: "All" | "Events" | "Coworking" | "Spa" | "Fitness";
}

export function TestimonialsCarousel({ filter = "All" }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const filteredTestimonials = useMemo(() => {
    if (filter === "All") return testimonials;
    return testimonials.filter(t => t.category === filter);
  }, [filter]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  }, [filteredTestimonials.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  }, [filteredTestimonials.length]);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || filteredTestimonials.length <= 2) return;
    
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, nextSlide, filteredTestimonials.length]);

  // Get visible testimonials (2 on desktop, 1 on mobile)
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < Math.min(2, filteredTestimonials.length); i++) {
      visible.push(filteredTestimonials[(currentIndex + i) % filteredTestimonials.length]);
    }
    return visible;
  };

  if (filteredTestimonials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No testimonials available for this category.
      </div>
    );
  }

  const currentTestimonial = filteredTestimonials[currentIndex];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fade edges for visual polish */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Desktop: Show 2 testimonials at a time */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
        {getVisibleTestimonials().map((testimonial, idx) => (
          <Card 
            key={`${testimonial.id}-${idx}`}
            className="bg-card border border-border hover:border-accent/30 transition-all duration-300"
          >
            <CardContent className="p-6">
              {/* Gold decorative quote */}
              <Quote className="h-8 w-8 text-accent/40 mb-4" />
              
              <p className="text-foreground mb-6 leading-relaxed text-lg min-h-[80px]">
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

      {/* Mobile: Single card */}
      <div className="md:hidden">
        <Card className="bg-card border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            
            <Quote className="h-8 w-8 text-muted-foreground/30 mb-2" />
            
            <p className="text-foreground mb-4 leading-relaxed">
              "{currentTestimonial.quote}"
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-semibold text-foreground">{currentTestimonial.name}</p>
                <p className={`text-sm font-medium ${experienceColors[currentTestimonial.experience]}`}>
                  {currentTestimonial.experience}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {currentTestimonial.tag}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      {filteredTestimonials.length > 2 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="h-10 w-10 rounded-full"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2.5" role="tablist" aria-label="Testimonial navigation">
            {filteredTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                role="tab"
                aria-selected={idx === currentIndex}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  idx === currentIndex ? 'w-8 bg-accent' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="h-10 w-10 rounded-full"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
