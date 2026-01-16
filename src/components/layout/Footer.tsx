import { forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, ArrowRight, CalendarDays, Dumbbell, Building2 } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/button";
import azLogoFull from "@/assets/az-logo-full.jpg";
import { BUILD_TIMESTAMP_UTC } from "@/lib/build";
import { SITE_CONFIG } from "@/config/siteConfig";

const footerLinks = {
  businesses: [
    { label: "The Summit", href: "/summit" },
    { label: "Hive Coworking", href: "/coworking" },
    { label: "Restoration Lounge", href: "/spa" },
    { label: "Total Fitness", href: "/fitness" },
  ],
  booking: [
    { label: "Book Now", href: "/booking" },
    { label: "Gift Cards", href: "/gift-cards" },
    { label: "My Account", href: "/account" },
  ],
};

// Context-aware CTA configuration based on current page
function getFooterCTA(pathname: string) {
  if (pathname.includes('/fitness')) {
    return {
      label: "Join Today",
      href: "/fitness",
      icon: Dumbbell,
      subline: "Start your fitness journey with 24/7 access",
    };
  }
  if (pathname.includes('/coworking')) {
    return {
      label: "Schedule a Tour",
      href: "/coworking",
      icon: Building2,
      subline: "See our workspaces and find your perfect fit",
    };
  }
  if (pathname.includes('/summit')) {
    return {
      label: "Book Your Event",
      href: "/summit",
      icon: CalendarDays,
      subline: "Create an unforgettable experience at The Summit",
    };
  }
  if (pathname.includes('/spa')) {
    return {
      label: "Book With Lindsey",
      href: "/spa",
      icon: CalendarDays,
      subline: "Professional recovery. Personalized care.",
    };
  }
  // Default for homepage and other pages
  return {
    label: "Book Now",
    href: "/booking",
    icon: CalendarDays,
    subline: "Find your experience and reserve your spot",
  };
}

export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  const location = useLocation();
  const cta = getFooterCTA(location.pathname);
  const CTAIcon = cta.icon;

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground" ref={ref}>
      {/* Gold CTA Bar */}
      <div className="bg-gradient-to-r from-accent via-accent to-accent/90 relative overflow-hidden">
        {/* Subtle shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        
        <div className="container relative z-10 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            {/* Left: Subline */}
            <div className="text-center md:text-left">
              <p className="text-primary font-semibold text-lg md:text-xl">
                Ready to get started?
              </p>
              <p className="text-primary/80 text-sm md:text-base">
                {cta.subline}
              </p>
            </div>
            
            {/* Right: Single CTA Button */}
            <Link 
              to={cta.href}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-accent font-bold text-lg rounded-lg shadow-xl hover:bg-primary/90 hover:shadow-2xl transition-all duration-300 group"
            >
              <CTAIcon className="h-5 w-5" />
              {cta.label}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="block mb-4">
              <img
                src={azLogoFull}
                alt="A-Z Enterprises - One Call, We Handle It All"
                className="h-16 w-auto object-contain no-grade"
              />
            </Link>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Your destination for events, wellness, fitness, and productivity in {SITE_CONFIG.location.city}, {SITE_CONFIG.location.state}.
            </p>
          </div>

          {/* Businesses */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Our Businesses</h3>
            <ul className="space-y-2">
              {footerLinks.businesses.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Booking */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Get Started</h3>
            <ul className="space-y-2">
              {footerLinks.booking.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70 leading-relaxed">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                {SITE_CONFIG.location.full}
              </li>
              <li>
                <a 
                  href={SITE_CONFIG.contact.phoneLink}
                  className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                  {SITE_CONFIG.contact.phone}
                </a>
              </li>
              <li>
                <a 
                  href={SITE_CONFIG.contact.emailLink}
                  className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                  {SITE_CONFIG.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Clock className="h-4 w-4 text-accent flex-shrink-0" />
                {SITE_CONFIG.hours.time}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            {SITE_CONFIG.business.copyright}
          </p>
          <p className="text-sm text-primary-foreground/50">Build: {BUILD_TIMESTAMP_UTC}</p>
          <p className="text-sm text-primary-foreground/50">Crafted with care in Ohio</p>
        </div>
      </div>
    </footer>
  );
});

