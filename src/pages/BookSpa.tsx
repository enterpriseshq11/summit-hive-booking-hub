import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Sparkles, MapPin, Phone, Clock, CheckCircle, CreditCard, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/config/siteConfig";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SEOHead } from "@/components/seo";

// Fallback services if no pricing rules configured
const FALLBACK_SERVICES = [
  { id: "swedish", name: "Swedish Massage", duration: "60 min", price: 85 },
  { id: "deep_tissue", name: "Deep Tissue Massage", duration: "60 min", price: 95 },
  { id: "hot_stone", name: "Hot Stone Massage", duration: "75 min", price: 110 },
  { id: "facial", name: "Facial Treatment", duration: "60 min", price: 90 },
  { id: "couples", name: "Couples Massage", duration: "60 min", price: 160 },
  { id: "package", name: "Spa Package", duration: "90 min", price: 145 },
];

const SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "google_search", label: "Google Search" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "referral", label: "Referral" },
  { value: "walk_in", label: "Walk-in" },
  { value: "other", label: "Other" },
];

interface SpaService {
  id: string;
  name: string;
  duration: string;
  price: number;
  priceId: string | null;
}

export default function BookSpa() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    is_returning: false, source: "website", notes: "",
    preferred_date: "", preferred_time: "",
  });

  // Load spa services from pricing_rules with stripe_price_id
  const { data: services = [] } = useQuery<SpaService[]>({
    queryKey: ["spa_services_pricing"],
    queryFn: async () => {
      const { data: rules } = await supabase
        .from("pricing_rules")
        .select("id, name, description, modifier_value, stripe_price_id, businesses!inner(type)")
        .eq("is_active", true)
        .eq("businesses.type", "spa" as any)
        .order("priority", { ascending: true });

      if (rules && rules.length > 0) {
        return rules.map((r: any) => ({
          id: r.id,
          name: r.name,
          duration: r.description || "60 min",
          price: Math.abs(r.modifier_value),
          priceId: r.stripe_price_id || null,
        }));
      }

      // Fallback to hardcoded if no pricing rules configured
      return FALLBACK_SERVICES.map((s) => ({ ...s, priceId: null }));
    },
  });

  const service = services.find((s) => s.id === selectedService);
  const canPayOnline = service?.priceId != null;

  const handlePayAndBook = async () => {
    if (!validateForm()) return;
    if (!canPayOnline) {
      toast.error("Online payment is not available for this service. Please use Request Booking.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("experience-checkout", {
        body: {
          price_id: service!.priceId,
          service_name: service!.name,
          customer_email: form.email,
          customer_name: `${form.first_name} ${form.last_name}`,
          customer_phone: form.phone,
          business_unit: "spa",
          mode: "payment",
          metadata: {
            booking_type: "spa_booking",
            service_type: service!.name,
            preferred_date: form.preferred_date,
            preferred_time: form.preferred_time,
            client_name: `${form.first_name} ${form.last_name}`,
            client_email: form.email,
            client_phone: form.phone,
            is_returning: String(form.is_returning),
            source: form.source,
            notes: form.notes,
          },
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message?.includes("price") 
        ? "Stripe subscription creation failed. The configured price may be invalid. Please call us to book."
        : "Unable to start checkout. Please try again or call us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestBooking = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("lead-intake", {
        body: {
          business_unit: "spa",
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          source: form.source,
          form_fields: {
            service: service?.name,
            preferred_date: form.preferred_date,
            preferred_time: form.preferred_time,
            is_returning: form.is_returning,
            notes: form.notes,
          },
        },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Your booking request has been submitted!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again or call us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (!selectedService) {
      toast.error("Please select a service.");
      return false;
    }
    return true;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Booking Requested — Restoration Lounge Spa" description="Your spa booking request has been submitted." />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-accent mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Booking Request Submitted</h1>
          <p className="text-muted-foreground text-lg">We will contact you within 24 hours to confirm your appointment.</p>
          <p className="text-muted-foreground">Questions? Call us at <a href={SITE_CONFIG.contact.phoneLink} className="text-accent font-semibold">{SITE_CONFIG.contact.phone}</a></p>
          <Button onClick={() => navigate("/spa")} variant="outline">Back to Spa</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Book a Spa Service — Restoration Lounge Spa" description="Book a massage or spa treatment at the Restoration Lounge Spa in Wapakoneta, Ohio." />

      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="bg-accent text-accent-foreground">Now Accepting Bookings</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Book a Spa Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Restoration Lounge Spa — Professional massage and wellness treatments.</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> 10 W Auglaize St, Suite A, Wapakoneta, OH</span>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {SITE_CONFIG.contact.phone}</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Service Menu</h2>
          <div className="space-y-3">
            {services.map((s) => (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all ${selectedService === s.id ? "border-accent ring-2 ring-accent/30" : "hover:border-accent/50"}`}
                onClick={() => setSelectedService(s.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.duration}</p>
                      {!s.priceId && (
                        <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" /> Request booking only
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-sm font-bold">${s.price}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Important Info</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Please arrive 10 minutes before your appointment</li>
              <li>Full payment is due at time of booking</li>
              <li>24-hour cancellation policy applies</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Book Your Appointment</CardTitle>
              <CardDescription>Select a service, fill in your details, and choose how you'd like to book.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name *</Label><Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required /></div>
                <div><Label>Last Name *</Label><Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} required /></div>
              </div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
              <div><Label>Phone *</Label><Input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Preferred Date</Label><Input type="date" value={form.preferred_date} onChange={(e) => setForm((f) => ({ ...f, preferred_date: e.target.value }))} /></div>
                <div><Label>Preferred Time</Label><Input type="time" value={form.preferred_time} onChange={(e) => setForm((f) => ({ ...f, preferred_time: e.target.value }))} /></div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={form.is_returning} onCheckedChange={(v) => setForm((f) => ({ ...f, is_returning: v }))} />
                <Label>I'm a returning client</Label>
              </div>

              <div>
                <Label>How did you hear about us?</Label>
                <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div><Label>Special Notes (optional)</Label><Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Allergies, pressure preferences, focus areas..." rows={3} /></div>

              {service && (
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <p className="font-semibold text-foreground">Selected: {service.name} — {service.duration}</p>
                  <p className="text-2xl font-bold text-accent">${service.price}</p>
                  <p className="text-xs text-muted-foreground">Paid in full at time of booking</p>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                {canPayOnline ? (
                  <Button onClick={handlePayAndBook} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || !selectedService} size="lg">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Processing..." : `Book & Pay Now${service ? ` — $${service.price}` : ""}`}
                  </Button>
                ) : service ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center text-sm text-amber-600">
                    Online payment is not yet available for this service. Use Request Booking below or call us.
                  </div>
                ) : null}
                <Button onClick={handleRequestBooking} variant="outline" className="w-full" disabled={isSubmitting || !selectedService} size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Request Booking (No Payment)
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Prefer to talk first? Call us at <a href={SITE_CONFIG.contact.phoneLink} className="text-accent">{SITE_CONFIG.contact.phone}</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
