import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Camera, 
  CalendarDays, 
  Check, 
  Loader2, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle2,
  Users,
  Share2,
  Sparkles
} from "lucide-react";
import { SEOHead } from "@/components/seo";
import { useCreatePhotoBoothInquiry } from "@/hooks/usePhotoBoothInquiries";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/config/siteConfig";
import azLogoIcon from "@/assets/az-monogram-transparent-tightest.png";

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding / Reception" },
  { value: "birthday", label: "Birthday Party" },
  { value: "graduation", label: "Graduation Party" },
  { value: "corporate", label: "Corporate Event" },
  { value: "school", label: "School Event / Dance" },
  { value: "fundraiser", label: "Fundraiser / Community Event" },
  { value: "other", label: "Other" },
];

const CONTACT_METHODS = [
  { value: "call", label: "Call", icon: Phone },
  { value: "text", label: "Text", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
];

export default function PhotoBoothLanding() {
  const createInquiry = useCreatePhotoBoothInquiry();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    event_type: "",
    event_location: "",
    notes: "",
    preferred_contact: "email",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createInquiry.mutateAsync({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
        event_type: formData.event_type || null,
        event_location: formData.event_location.trim() || null,
        notes: formData.notes.trim() || null,
        preferred_contact: formData.preferred_contact,
        source: "ad_landing",
      });

      setIsSuccess(true);
    } catch (error) {
      // Error handled in hook
    }
  };

  const isValid = formData.full_name && formData.phone && formData.email;

  return (
    <>
      <SEOHead
        title="Book 360 Photo Booth | A-Z Enterprises"
        description="Reserve your 360 Photo Booth today. Attendant included, instant video sharing, perfect for any event. Get availability now."
      />

      <div className="min-h-screen bg-primary">
        {/* Minimal Header */}
        <header className="py-4 border-b border-primary-foreground/10">
          <div className="container flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={azLogoIcon} alt="A-Z Enterprises" className="h-8 w-8" />
              <span className="text-lg font-bold text-gold-gradient hidden sm:inline">A-Z Enterprises</span>
            </Link>
            <a
              href={SITE_CONFIG.contact.phoneLink}
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium text-sm"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">{SITE_CONFIG.contact.phoneFormatted}</span>
            </a>
          </div>
        </header>

        {/* Hero + Form */}
        <main className="py-8 lg:py-12">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
              {/* Left: Copy */}
              <div className="text-primary-foreground">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 text-accent font-medium text-sm mb-4">
                  <Camera className="h-4 w-4" />
                  Limited Availability
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gold-gradient">
                  360 Photo Booth Rentals
                </h1>

                <p className="text-lg text-primary-foreground/80 mb-6">
                  Turn your event into a VIP experience with slow-motion, share-ready 360 videos.
                </p>

                {/* Key benefits */}
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: Users, text: "Attendant included with every booking" },
                    { icon: Share2, text: "Instant sharing via QR, text, or email" },
                    { icon: Sparkles, text: "Custom overlays with your event branding" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <li key={i} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-accent" />
                        </div>
                        <span className="text-primary-foreground/90">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>

                <p className="text-sm text-primary-foreground/60">
                  Weekends book fast. Reserve your date today.
                </p>
              </div>

              {/* Right: Form */}
              <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-border/50">
                {isSuccess ? (
                  <div className="py-8 text-center">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="h-8 w-8 text-accent" />
                    </div>
                    <p className="font-semibold text-xl mb-2">Thanks!</p>
                    <p className="text-muted-foreground mb-6">
                      Your 360 Photo Booth inquiry is in. We'll contact you shortly to confirm availability and next steps.
                    </p>
                    <Link to="/360-photo-booth">
                      <Button variant="outline">View Full Details</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold mb-1">Get Availability</h2>
                    <p className="text-sm text-muted-foreground mb-6">We'll respond within 24 hours.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleChange("full_name", e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="(555) 123-4567"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Event Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !eventDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {eventDate ? format(eventDate, "PPP") : "Select a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={eventDate}
                              onSelect={setEventDate}
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="event_type">Event Type</Label>
                          <Select value={formData.event_type} onValueChange={(v) => handleChange("event_type", v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event_location">Location</Label>
                          <Input
                            id="event_location"
                            value={formData.event_location}
                            onChange={(e) => handleChange("event_location", e.target.value)}
                            placeholder="Venue or city"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleChange("notes", e.target.value)}
                          placeholder="Any questions or requests?"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Preferred Contact</Label>
                        <div className="flex flex-wrap gap-2">
                          {CONTACT_METHODS.map((method) => {
                            const Icon = method.icon;
                            const isSelected = formData.preferred_contact === method.value;
                            return (
                              <button
                                key={method.value}
                                type="button"
                                onClick={() => handleChange("preferred_contact", method.value)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium",
                                  isSelected 
                                    ? "border-accent bg-accent/10 text-foreground" 
                                    : "border-border text-muted-foreground hover:border-accent/50"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                {method.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold py-6 text-lg"
                        disabled={!isValid || createInquiry.isPending}
                      >
                        {createInquiry.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Get Availability"
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="py-6 border-t border-primary-foreground/10">
          <div className="container text-center text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} A-Z Enterprises. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
