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
import { Mic, Headphones, Video, Podcast, Music, Sparkles, MapPin, Phone, Mail, Clock, Users, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/config/siteConfig";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SEOHead } from "@/components/seo";

const SESSION_TYPES = [
  { id: "recording", name: "Recording Session", icon: Mic, description: "Full studio access for vocals, instruments, and voiceovers.", price: "$45/hr" },
  { id: "mixing", name: "Mixing & Mastering", icon: Headphones, description: "Professional post-production to polish your tracks.", price: "$45/hr" },
  { id: "podcast", name: "Podcast Recording", icon: Podcast, description: "Multi-mic podcast setup with video capability.", price: "$45/hr" },
  { id: "content", name: "Content Creation", icon: Video, description: "Video and audio content for social media and marketing.", price: "$45/hr" },
  { id: "beats", name: "Beat Production", icon: Music, description: "Collaborate with our on-staff producer to create original beats.", price: "$45/hr" },
];

export default function BookVoiceVault() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    session_type: "", preferred_date: "", preferred_time: "",
    guests: "1", message: "", source: "website",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.session_type) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("lead-intake", {
        body: {
          business_unit: "voice_vault",
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          source: form.source,
          form_fields: {
            session_type: form.session_type,
            preferred_date: form.preferred_date,
            preferred_time: form.preferred_time,
            guests: form.guests,
            message: form.message,
          },
        },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Your studio inquiry has been submitted!");
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
        <SEOHead title="Inquiry Submitted — Voice Vault Studio" description="Your studio booking inquiry has been submitted." />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-accent mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Inquiry Submitted</h1>
          <p className="text-muted-foreground text-lg">We received your studio booking request and will follow up within 24 hours.</p>
          <p className="text-muted-foreground">Questions? Call us at <a href={SITE_CONFIG.contact.phoneLink} className="text-accent font-semibold">{SITE_CONFIG.contact.phone}</a></p>
          <Button onClick={() => navigate("/voice-vault")} variant="outline">Back to Voice Vault</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Book Voice Vault Studio — A-Z Enterprises"
        description="Book a recording session at Voice Vault Studio in Wapakoneta, Ohio. Professional podcasting, music production, and content creation."
      />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="bg-accent text-accent-foreground">Now Booking</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Book Voice Vault Studio</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional recording studio for podcasts, music, voiceovers, and content creation.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> 10 W Auglaize St, Suite Z, Wapakoneta, OH 45895</span>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {SITE_CONFIG.contact.phone}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Up to 4 guests</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-5 gap-8">
        {/* Session Types */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Session Types</h2>
          <div className="space-y-3">
            {SESSION_TYPES.map((s) => (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all ${form.session_type === s.id ? "border-accent ring-2 ring-accent/30" : "hover:border-accent/50"}`}
                onClick={() => setForm((f) => ({ ...f, session_type: s.id }))}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <s.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <Badge variant="secondary" className="text-xs">{s.price}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Request a Session</CardTitle>
              <CardDescription>Fill out the form below and we'll confirm your booking within 24 hours.</CardDescription>
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
                  <Label>Session Type *</Label>
                  <Select value={form.session_type} onValueChange={(v) => setForm((f) => ({ ...f, session_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select session type" /></SelectTrigger>
                    <SelectContent>
                      {SESSION_TYPES.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Preferred Date</Label><Input type="date" value={form.preferred_date} onChange={(e) => setForm((f) => ({ ...f, preferred_date: e.target.value }))} /></div>
                  <div><Label>Preferred Time</Label><Input type="time" value={form.preferred_time} onChange={(e) => setForm((f) => ({ ...f, preferred_time: e.target.value }))} /></div>
                </div>
                <div>
                  <Label>Number of Guests</Label>
                  <Select value={form.guests} onValueChange={(v) => setForm((f) => ({ ...f, guests: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((n) => (<SelectItem key={n} value={String(n)}>{n} {n === 1 ? "person" : "people"}</SelectItem>))}
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
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="drive_by">Drive-by</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Additional Details</Label><Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Tell us about your project..." rows={3} /></div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"} <ArrowRight className="w-4 h-4 ml-2" />
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
