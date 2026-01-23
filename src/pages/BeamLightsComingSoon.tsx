import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bell, Phone, Mail } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

export default function BeamLightsComingSoon() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-primary text-primary-foreground py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8">
              <Bell className="w-4 h-4" />
              Store Launching Shortly
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              BEEAM Lights
              <span className="block text-accent">Online Store</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/70">
              Our storefront is being finalized. For now, you’ll see the full BEEAM experience here without any Shopify warnings.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold">
                <Link to="/shop/beam-lights" className="flex items-center gap-2">
                  Back to BEEAM
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/gift-cards" className="flex items-center gap-2">
                  Gift Cards
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border border-border/60">
              <CardContent className="p-8 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Need help or want first access?
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Contact us and we’ll get you a clear next step.
                </p>

                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  <a
                    href={SITE_CONFIG.contact.phoneLink}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-accent" />
                    <div>
                      <div className="font-semibold text-foreground">Call</div>
                      <div className="text-sm text-muted-foreground">{SITE_CONFIG.contact.phoneFormatted}</div>
                    </div>
                  </a>

                  <a
                    href={SITE_CONFIG.contact.emailLink}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-accent" />
                    <div>
                      <div className="font-semibold text-foreground">Email</div>
                      <div className="text-sm text-muted-foreground">{SITE_CONFIG.contact.email}</div>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
