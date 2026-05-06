import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, CalendarDays, Clock, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/config/siteConfig";

export function PreFooterCTA() {
  return (
    <section className="py-16 bg-gradient-to-br from-accent via-accent/95 to-accent/90">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-primary">
              Ready to Book?
            </h3>
            <p className="text-primary/70">
              Reach out however works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* Call */}
            <a
              href={SITE_CONFIG.contact.phoneLink}
              className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-primary/10 border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-primary">Call Us</p>
                <p className="text-sm text-primary/70">{SITE_CONFIG.contact.phone}</p>
              </div>
            </a>

            {/* Text */}
            <a
              href={`sms:+1${SITE_CONFIG.contact.phone.replace(/\D/g, '')}`}
              className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-primary/10 border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-primary">Text Us</p>
                <p className="text-sm text-primary/70">Quick response</p>
              </div>
            </a>

            {/* Book Online */}
            <Link
              to="/booking"
              className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-primary/15 border-2 border-primary/30 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-primary">Book Online</p>
                <p className="text-sm text-primary/70">Available 24/7</p>
              </div>
            </Link>
          </div>

          {/* Hours */}
          <div className="flex items-center justify-center gap-2 text-sm text-primary/70">
            <Clock className="h-4 w-4 text-primary" />
            <span>Open {SITE_CONFIG.hours.range}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
