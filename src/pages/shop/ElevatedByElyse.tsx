import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Gift, Truck } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

const STORE_URL = "https://elevatedbyelyse.com";

interface Product {
  name: string;
  price: string;
  slug: string;
  category: string;
}

const products: Product[] = [
  { name: "Personalized Easter Basket", price: "$49.99", slug: "personalized-easter-basket", category: "Easter" },
  { name: "Personalized Easter Basket Name Tag", price: "$12.99", slug: "personalized-easter-basket-name-tag", category: "Easter" },
  { name: "Personalized Tumbler", price: "$29.99", slug: "personalized-tumbler", category: "Cups & Tumblers" },
  { name: "Personalized Kids Sweatshirt", price: "$34.99", slug: "personalized-kids-sweatshirt", category: "Apparel" },
  { name: "Personalized Adult Sweatshirt", price: "$39.99", slug: "personalized-adult-sweatshirt", category: "Apparel" },
  { name: "Personalized Hat", price: "$27.99", slug: "personalized-hat", category: "Apparel" },
  { name: "Wood-Burned Charcuterie Board", price: "$64.99", slug: "wood-burned-charcuterie-board", category: "Home & Kitchen" },
  { name: "Personalized Cutting Board", price: "$54.99", slug: "personalized-cutting-board", category: "Home & Kitchen" },
  { name: "Birthday Girl Bundle", price: "$89.99", slug: "birthday-girl-bundle", category: "Gift Bundles" },
  { name: "Bride Gift Bundle", price: "$99.99", slug: "bride-gift-bundle", category: "Gift Bundles" },
  { name: "Teacher Appreciation Gift Bundle", price: "$59.99", slug: "teacher-appreciation-gift-bundle", category: "Gift Bundles" },
  { name: "Business Logo Tumbler", price: "$34.99", slug: "business-logo-tumbler", category: "Business Gifts" },
];

export default function ElevatedByElyse() {
  return (
    <>
      <SEOHead
        title="Elevated by Elyse | Custom Personalized Gifts"
        description="Shop premium personalized gifts, tumblers, apparel, and custom home goods from Elevated by Elyse. Local pickup and shipping available."
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
          </div>

          {/* Honeycomb Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.10]" aria-hidden="true">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
              <pattern id="honeycomb-elyse" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
                <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#honeycomb-elyse)" />
            </svg>
          </div>

          <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
            <span className="inline-block text-accent font-semibold tracking-widest text-xs uppercase mb-4">
              Featured Brand
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Elevated by Elyse
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed mb-3">
              Beautifully personalized. Locally crafted. Made for the moments that matter.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-primary-foreground/50 mb-8">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Local Pickup Available</span>
              <span className="flex items-center gap-1.5"><Gift className="w-4 h-4" /> Free Personalization on Select Items</span>
            </div>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold">
              <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Visit Full Store <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* Product Grid */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Shop the Collection</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Premium custom gifts, seasonal favorites, and personalized products.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
              {products.map((product) => (
                <a
                  key={product.slug}
                  href={`${STORE_URL}/product/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                  data-event="cta_click_shop_elyse"
                >
                  <Card className="overflow-hidden border border-border/50 bg-card hover:border-accent/50 transition-all duration-300 h-full group-hover:shadow-lg group-hover:shadow-accent/5">
                    {/* Placeholder image area */}
                    <div className="aspect-square bg-muted/50 flex items-center justify-center relative overflow-hidden">
                      <Gift className="w-10 h-10 text-muted-foreground/30" />
                      <span className="absolute top-2 left-2 text-[10px] font-medium tracking-wider uppercase bg-accent/10 text-accent px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                    </div>
                    <CardContent className="p-3 md:p-4">
                      <h3 className="text-sm md:text-base font-semibold text-foreground leading-tight mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-accent">{product.price}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Shop <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-3">Want Something Custom?</h2>
            <p className="text-muted-foreground mb-6">
              Elevated by Elyse specializes in personalized, made-to-order gifts. Visit the full store to start a custom order.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold">
                <a href={`${STORE_URL}/custom-orders`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  Start a Custom Order <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  Browse Full Store <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
