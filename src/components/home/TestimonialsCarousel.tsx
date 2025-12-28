import { useState, useEffect, useCallback } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    experience: "The Summit",
    rating: 5,
    quote: "Our wedding was absolutely perfect. The team handled every detail flawlessly. Booked in minutes, stress-free for months.",
    tag: "Wedding Reception",
  },
  {
    id: 2,
    name: "Michael R.",
    experience: "The Hive Coworking",
    rating: 5,
    quote: "Finally found my productive space. The 24/7 access and community vibe have transformed how I work remotely.",
    tag: "Private Office",
  },
  {
    id: 3,
    name: "Jennifer L.",
    experience: "Restoration Lounge",
    rating: 5,
    quote: "Best massage I've ever had. The atmosphere is so calming, and booking online made it effortless.",
    tag: "Deep Tissue Massage",
  },
  {
    id: 4,
    name: "David K.",
    experience: "Total Fitness",
    rating: 5,
    quote: "The gym has everything I need and the trainers actually care about your progress. Great local facility!",
    tag: "Membership",
  },
  {
    id: 5,
    name: "Amanda T.",
    experience: "The Summit",
    rating: 5,
    quote: "Hosted our company retreat here. Professional, beautiful venue, and the booking process was seamless.",
    tag: "Corporate Event",
  },
  {
    id: 6,
    name: "Chris B.",
    experience: "Restoration Lounge",
    rating: 5,
    quote: "I schedule monthly treatments now. The online booking shows real availability — no phone tag needed.",
    tag: "Facial Treatment",
  },
  {
    id: 7,
    name: "Lauren H.",
    experience: "The Hive Coworking",
    rating: 5,
    quote: "Meeting rooms are always clean and available when I need them. Love being able to book same-day.",
    tag: "Meeting Room",
  },
  {
    id: 8,
    name: "Tom P.",
    experience: "Total Fitness",
    rating: 5,
    quote: "Best gym in Wapakoneta, hands down. Clean, modern equipment, and the group classes are excellent.",
    tag: "Group Classes",
  },
];

const experienceColors: Record<string, string> = {
  "The Summit": "text-summit",
  "The Hive Coworking": "text-coworking",
  "Restoration Lounge": "text-spa",
  "Total Fitness": "text-fitness",
};

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, nextSlide]);

  // Get visible testimonials (3 on desktop, 1 on mobile)
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return visible;
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Desktop: 3-card carousel */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {getVisibleTestimonials().map((testimonial, idx) => (
          <Card 
            key={`${testimonial.id}-${idx}`}
            className={`bg-card border-2 transition-all duration-500 ${
              idx === 1 ? 'scale-105 shadow-xl border-accent/30' : 'opacity-90'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              
              <Quote className="h-8 w-8 text-muted-foreground/30 mb-2" />
              
              <p className="text-foreground mb-4 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className={`text-sm font-medium ${experienceColors[testimonial.experience]}`}>
                    {testimonial.experience}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {testimonial.tag}
                </span>
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
              {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            
            <Quote className="h-8 w-8 text-muted-foreground/30 mb-2" />
            
            <p className="text-foreground mb-4 leading-relaxed">
              "{testimonials[currentIndex].quote}"
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
                <p className={`text-sm font-medium ${experienceColors[testimonials[currentIndex].experience]}`}>
                  {testimonials[currentIndex].experience}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {testimonials[currentIndex].tag}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="h-10 w-10 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-accent' : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="h-10 w-10 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
