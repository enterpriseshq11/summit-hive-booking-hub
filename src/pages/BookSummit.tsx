import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, Phone, Users, Clock, Heart, Building2, PartyPopper, Star, CheckCircle, ArrowRight, Camera, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/config/siteConfig";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SEOHead } from "@/components/seo";

const EVENT_TYPES = [
  { id: "wedding", name: "Wedding / Reception", icon: Heart },
  { id: "corporate", name: "Corporate Event", icon: Building2 },
  { id: "birthday", name: "Birthday / Anniversary", icon: PartyPopper },
  { id: "graduation", name: "Graduation Party", icon: Star },
  { id: "baby_shower", name: "Baby Shower", icon: Heart },
  { id: "holiday", name: "Holiday Party", icon: PartyPopper },
  { id: "other", name: "Other Event", icon: CalendarDays },
];

const VENUE_HIGHLIGHTS = [
  { label: "Capacity", value: "50–300+ guests", icon: Users },
  { label: "Location", value: "10 W Auglaize St, Wapakoneta, OH", icon: MapPin },
  { label: "Hours", value: "9 AM – 9 PM", icon: Clock },
  { label: "Catering", value: "Full kitchen available", icon: Star },
];

export default function BookSummit() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    event_type: "", preferred_date: "", guest_count: "",
    duration_hours: "4", message: "", source: "website",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.event_type) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("lead-intake", {
        body: {
          business_unit: "summit",
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          source: form.source,
          form_fields: {
            event_type: form.event_type,
            preferred_date: form.preferred_date,
            guest_count: form.guest_count,
            duration_hours: form.duration_hours,
            message: form.message,
          },
        },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Your event inquiry has been submitted!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Inquiry Submitted — The Summit Event Center" description="Your event inquiry has been submitted." />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-accent mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Inquiry Submitted</h1>
          <p className="text-muted-foreground text-lg">We received your event inquiry and will follow up within 24 hours.</p>
          <p className="text-muted-foreground">Questions? Call us at <a href={SITE_CONFIG.contact.phoneLink} className="text-accent font-semibold">{SITE_CONFIG.contact.phone}</a></p>
          <Button onClick={() => navigate("/summit")} variant="outline">Back to The Summit</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Book The Summit Event Center — A-Z Enterprises"
        description="Plan your next event at The Summit Event Center in Wapakoneta, Ohio. Weddings, corporate events, parties, and more."
      />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="bg-accent text-accent-foreground">Now Booking Events</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Book The Summit Event Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A premium event venue for weddings, corporate events, celebrations, and private parties.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> 10 W Auglaize St, Wapakoneta, OH 45895</span>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {SITE_CONFIG.contact.phone}</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-5 gap-8">
        {/* Venue Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Venue Details</h2>
            <div className="space-y-3">
              {VENUE_HIGHLIGHTS.map((h) => (
                <div key={h.label} className="flex items-center gap-3">
                  <h.icon className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{h.label}</p>
                    <p className="font-medium text-foreground">{h.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Photo Placeholders */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Venue Photos</h3>
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center text-muted-foreground">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-sm">Photo {i} — Coming Soon</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Want a tour first?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Schedule a walkthrough to see the venue in person before committing.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/intake/summit")}>
              <CalendarDays className="w-4 h-4 mr-2" /> Schedule a Tour
            </Button>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Event Inquiry</CardTitle>
              <CardDescription>Tell us about your event and we'll get back to you within 24 hours with availability and pricing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name *</Label><Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required /></div>
                  <div><Label>Last Name *</Label><Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} required /></div>
                </div>
                <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
                <div><Label>Phone *</Label><Input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required /></div>
                <div>
                  <Label>Event Type *</Label>
                  <Select value={form.event_type} onValueChange={(v) => setForm((f) => ({ ...f, event_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Preferred Date</Label><Input type="date" value={form.preferred_date} onChange={(e) => setForm((f) => ({ ...f, preferred_date: e.target.value }))} /></div>
                  <div><Label>Expected Guest Count</Label><Input type="number" min="1" max="500" value={form.guest_count} onChange={(e) => setForm((f) => ({ ...f, guest_count: e.target.value }))} placeholder="e.g. 100" /></div>
                </div>
                <div>
                  <Label>Duration (Hours)</Label>
                  <Select value={form.duration_hours} onValueChange={(v) => setForm((f) => ({ ...f, duration_hours: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (<SelectItem key={n} value={String(n)}>{n} {n === 1 ? "hour" : "hours"}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>How did you hear about us?</Label>
                  <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="google_search">Google Search</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="wedding_wire">WeddingWire</SelectItem>
                      <SelectItem value="the_knot">The Knot</SelectItem>
                      <SelectItem value="drive_by">Drive-by</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Tell us about your event</Label><Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Budget range, special requirements, theme, etc." rows={3} /></div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Event Inquiry"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
