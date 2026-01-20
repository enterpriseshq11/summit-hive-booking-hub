import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import azLogoFull from "@/assets/az-logo-full.jpg";
import { BUILD_TIMESTAMP_UTC } from "@/lib/build";
import { SITE_CONFIG } from "@/config/siteConfig";
const footerLinks = {
  businesses: [{
    label: "The Summit",
    href: "/summit"
  }, {
    label: "Hive Coworking",
    href: "/coworking"
  }, {
    label: "Restoration Lounge",
    href: "/spa"
  }, {
    label: "Total Fitness",
    href: "/fitness"
  }],
  booking: [{
    label: "Book Now",
    href: "/booking"
  }, {
    label: "Gift Cards",
    href: "/gift-cards"
  }, {
    label: "My Account",
    href: "/account"
  }]
};
export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  return <footer className="border-t border-border bg-primary text-primary-foreground" ref={ref}>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="block mb-4">
              <img alt="A-Z Enterprises - One Call, We Handle It All" className="h-20 w-auto object-contain" src="/lovable-uploads/dfb9a1b5-0bd4-4a72-a5e8-6a9e4aacc863.png" />
            </Link>
            <p className="text-sm text-primary-foreground/60">
              Your destination for events, wellness, fitness, and productivity in {SITE_CONFIG.location.city}, {SITE_CONFIG.location.state}.
            </p>
          </div>

          {/* Businesses */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Our Businesses</h3>
            <ul className="space-y-2">
              {footerLinks.businesses.map(link => <li key={link.href}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Booking */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Get Started</h3>
            <ul className="space-y-2">
              {footerLinks.booking.map(link => <li key={link.href}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Contact - J1: Increased line spacing, J2: Consistent gold icons */}
          <div>
            <h3 className="font-semibold text-accent mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70 leading-relaxed">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                {SITE_CONFIG.location.full}
              </li>
              <li>
                <a href={SITE_CONFIG.contact.phoneLink} className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                  {SITE_CONFIG.contact.phone}
                </a>
              </li>
              <li>
                <a href={SITE_CONFIG.contact.emailLink} className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
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
    </footer>;
});