import { Phone, MessageSquare, Mail, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/siteConfig";

interface BookingHelpSectionProps {
  onScrollToFAQ?: () => void;
}

export function BookingHelpSection({ onScrollToFAQ }: BookingHelpSectionProps) {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Need Help Finding the Right Option?
            </h2>
            <p className="text-muted-foreground text-lg">
              Our team is available {SITE_CONFIG.hours.range}. Reach out and we'll guide you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Call */}
            <a
              href={SITE_CONFIG.contact.phoneLink}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border-2 border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <p className="font-bold text-foreground">Call Us</p>
              <p className="text-sm text-muted-foreground">{SITE_CONFIG.contact.phone}</p>
            </a>

            {/* Text */}
            <a
              href={`sms:+1${SITE_CONFIG.contact.phone.replace(/\D/g, '')}`}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border-2 border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <p className="font-bold text-foreground">Text Us</p>
              <p className="text-sm text-muted-foreground">Quick response</p>
            </a>

            {/* Email */}
            <a
              href={SITE_CONFIG.contact.emailLink}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border-2 border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <p className="font-bold text-foreground">Email Us</p>
              <p className="text-sm text-muted-foreground">{SITE_CONFIG.contact.email}</p>
            </a>

            {/* FAQ */}
            {onScrollToFAQ && (
              <button
                onClick={onScrollToFAQ}
                className="flex flex-col items-center p-6 rounded-2xl bg-card border-2 border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <HelpCircle className="h-6 w-6 text-accent" />
                </div>
                <p className="font-bold text-foreground">Jump to FAQ</p>
                <p className="text-sm text-muted-foreground">Common questions</p>
              </button>
            )}
          </div>

          <div className="text-center">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-primary font-semibold">
              <a href={SITE_CONFIG.contact.phoneLink} className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {SITE_CONFIG.contact.phone}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
