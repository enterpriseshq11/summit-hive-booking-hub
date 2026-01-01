import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ExternalLink, 
  Shield, 
  Zap, 
  Eye, 
  Sun, 
  Award,
  Star,
  ArrowRight
} from "lucide-react";

// Product images
import beamProImg from "@/assets/beam-pro.jpg";
import beamCompactImg from "@/assets/beam-compact.jpg";
import beamUltraImg from "@/assets/beam-ultra.jpg";

const benefits = [
  {
    icon: Eye,
    title: "Maximum Visibility",
    description: "Engineered optics that cut through any condition—rain, fog, or pitch black."
  },
  {
    icon: Shield,
    title: "Built to Last",
    description: "Military-grade materials that survive drops, water, and extreme temperatures."
  },
  {
    icon: Zap,
    title: "Instant Power",
    description: "Zero warm-up time. Full brightness the moment you need it."
  },
  {
    icon: Sun,
    title: "All-Day Battery",
    description: "Extended runtime that keeps up with your longest adventures."
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Every unit hand-inspected before it leaves our facility."
  }
];

const products = [
  {
    name: "Beam Pro",
    tagline: "Our flagship tactical light",
    image: beamProImg
  },
  {
    name: "Beam Compact",
    tagline: "Everyday carry perfection",
    image: beamCompactImg
  },
  {
    name: "Beam Ultra",
    tagline: "Maximum power, zero compromise",
    image: beamUltraImg
  }
];

export default function BeamLights() {
  const beamUrl = "https://beeamhq.com/?utm_source=main_site&utm_medium=referral&utm_campaign=shop_hub";
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-36 overflow-hidden">
        {/* Dramatic light beam effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-accent/60 via-accent/20 to-transparent" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-accent/40 via-accent/10 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-accent/50 via-accent/15 to-transparent" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
        
        <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Featured Brand
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Beam Lights
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Built to perform when visibility matters most.
          </p>
          
          <Button 
            asChild 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-primary font-semibold text-lg px-8 py-6 group"
          >
            <a 
              href={beamUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3"
              data-event="cta_click_beam_hero"
            >
              Shop Beam Lights
              <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Why We Built Beam
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                We got tired of flashlights that failed when we needed them most. Cheap materials. 
                Dim output. Dead batteries at the worst possible moment.
              </p>
              <p>
                So we built something better. Beam Lights are designed from the ground up for 
                people who depend on their gear—professionals, adventurers, and anyone who 
                refuses to be left in the dark.
              </p>
              <p className="text-foreground font-medium">
                No compromises. No excuses. Just light you can count on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Engineered for Excellence
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every detail designed with purpose. Every feature tested in real conditions.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-0 shadow-lg bg-card">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Lineup
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three lights. Three purposes. One standard of excellence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {products.map((product) => (
              <Card key={product.name} className="overflow-hidden border border-border/50 bg-card group hover:shadow-xl transition-shadow duration-300">
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={`${product.name} flashlight product image`}
                    loading="lazy"
                    width={768}
                    height={768}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {product.tagline}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              asChild 
              variant="outline"
              size="lg"
              className="group"
            >
              <a 
                href={beamUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
                data-event="cta_click_beam_collection"
              >
                View Full Collection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-accent fill-accent" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-foreground font-medium mb-6 italic">
              "The only flashlight I trust in the field. Beam delivers when it matters."
            </blockquote>
            <p className="text-muted-foreground">
              — Verified Customer
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to See the Difference?
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-xl mx-auto mb-10">
            Experience lighting engineered without compromise.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-primary font-semibold text-lg px-10 py-6 group"
          >
            <a 
              href={beamUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3"
              data-event="cta_click_beam_footer"
            >
              Shop Beam Lights
              <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}