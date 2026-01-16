import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Clock } from "lucide-react";

export default function Shop() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-32 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Curated Products We
            <span className="block text-accent">Build & Stand Behind</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
            This is not a generic store. Every product featured here is something we personally designed, tested, or use daily.
          </p>
        </div>
      </section>

      {/* Featured Brand - BEEAM Lights */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden border-0 shadow-2xl bg-card">
              <div className="grid md:grid-cols-2">
                {/* Image Side */}
                <div className="relative h-64 md:h-auto min-h-[400px] bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center">
                  {/* Abstract light beams visual */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-1 h-32 bg-accent/60 rotate-45 blur-sm" />
                    <div className="absolute top-1/3 left-1/3 w-1 h-48 bg-accent/40 rotate-12 blur-sm" />
                    <div className="absolute top-1/2 right-1/4 w-1 h-40 bg-accent/50 -rotate-30 blur-sm" />
                    <div className="absolute bottom-1/4 right-1/3 w-1 h-36 bg-accent/30 rotate-60 blur-sm" />
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-accent" />
                    </div>
                    <span className="text-accent font-semibold tracking-widest text-sm uppercase">Featured Brand</span>
                  </div>
                </div>
                
                {/* Content Side */}
                <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    BEEAM Lights
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Premium lighting designed for performance, visibility, and durability. Built for those who refuse to compromise.
                  </p>
                  <Button asChild size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-primary font-semibold group">
                    <Link to="/shop/beam-lights" className="flex items-center justify-center gap-2">
                      Explore BEEAM Lights
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              More Coming Soon
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We're carefully selecting the next products to feature. Quality over quantity, always.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Coming Soon Card 1 */}
            <Card className="border border-border/50 bg-card/50 opacity-60">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Additional Products
                </h3>
                <p className="text-sm text-muted-foreground">
                  Coming Soon
                </p>
              </CardContent>
            </Card>
            
            {/* Coming Soon Card 2 */}
            <Card className="border border-border/50 bg-card/50 opacity-60">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Limited Drops
                </h3>
                <p className="text-sm text-muted-foreground">
                  Coming Soon
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}