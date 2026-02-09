import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmsConsentCheckbox } from "@/components/booking/SmsConsentCheckbox";
import { SEOHead } from "@/components/seo";
import { SITE_CONFIG } from "@/config/siteConfig";
import { toast } from "sonner";
import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function RequestService() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim() || !email.trim()) {
      toast.error("Please fill in the required fields.");
      return;
    }
    setSubmitting(true);
    // Simulate submission (replace with real endpoint as needed)
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <SEOHead title="Thank You | A-Z Enterprises" description="Your request has been received." />
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Thank You!</h1>
          <p className="text-muted-foreground">
            We received your request. We will contact you within 1 business day.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
          <footer className="pt-8 text-xs text-muted-foreground/60 space-y-1">
            <p>{SITE_CONFIG.business.copyright}</p>
            <p>
              <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
              {" · "}
              <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            </p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Request Service | A-Z Enterprises"
        description="Contact A-Z Enterprises to book a service, request info, or schedule a tour."
      />

      {/* Header */}
      <header className="bg-gradient-to-b from-zinc-950 to-zinc-900 text-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">{SITE_CONFIG.business.name}</h1>
          <p className="text-muted-foreground text-lg">
            Request information, book a service, or schedule a tour. We'll get back to you fast.
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-10 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Jane" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(555) 123-4567" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane@example.com" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interest">What are you interested in?</Label>
            <Select value={interest} onValueChange={setInterest}>
              <SelectTrigger id="interest">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coworking">The Hive by A-Z (Coworking)</SelectItem>
                <SelectItem value="fitness">A-Z Total Fitness</SelectItem>
                <SelectItem value="events">Memory Maker Event Center</SelectItem>
                <SelectItem value="spa">Restoration Lounge Spa</SelectItem>
                <SelectItem value="photo-booth">360 Photo Booth</SelectItem>
                <SelectItem value="voice-vault">Voice Vault</SelectItem>
                <SelectItem value="mobile-homes">A-Z Mobile Homes</SelectItem>
                <SelectItem value="other">Other / General Inquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us how we can help..." rows={3} />
          </div>

          {/* A2P SMS Consent */}
          <SmsConsentCheckbox checked={smsConsent} onCheckedChange={setSmsConsent} />

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>

        {/* Contact strip */}
        <div className="mt-10 border-t border-border pt-6 space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <a href={SITE_CONFIG.contact.phoneLink} className="hover:text-foreground">{SITE_CONFIG.contact.phoneFormatted}</a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <a href={SITE_CONFIG.contact.emailLink} className="hover:text-foreground">{SITE_CONFIG.contact.email}</a>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{SITE_CONFIG.location.full}</span>
          </div>
        </div>
      </main>

      {/* Footer with required links */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground/70 space-y-1">
        <p>{SITE_CONFIG.business.copyright}</p>
        <p>
          <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          {" · "}
          <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>
        </p>
      </footer>
    </div>
  );
}
