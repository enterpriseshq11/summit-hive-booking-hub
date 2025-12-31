import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

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

export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-bold text-gold-gradient">
              A-Z Enterprises
            </Link>
            <p className="text-sm text-primary-foreground/60 mt-3">
              Your destination for events, wellness, fitness, and productivity in Wapakoneta, Ohio.
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
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 text-accent" />
                Wapakoneta, Ohio
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 text-accent" />
                (419) 555-0100
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 text-accent" />
                hello@az-enterprises.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} A-Z Enterprises. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/50">
            Crafted with care in Ohio
          </p>
        </div>
      </div>
    </footer>
  );
});
