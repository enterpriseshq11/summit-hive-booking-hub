import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, Check, CreditCard, CheckCircle, ArrowRight, Phone, MapPin, Star, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/config/siteConfig";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SEOHead } from "@/components/seo";

const FALLBACK_TIERS = [
  { id: "standard", name: "Standard Monthly", price: 49, interval: "month", features: ["Full gym access", "Group fitness classes", "Locker room access", "Free parking"], popular: false },
  { id: "premium", name: "Premium Monthly", price: 79, interval: "month", features: ["Everything in Standard", "Monthly personal training session", "Nutrition consultation", "Priority class booking", "Guest passes (2/month)"], popular: true },
  { id: "day_pass", name: "Day Pass", price: 15, interval: "day", features: ["Full gym access for one day", "Group classes included", "Locker room access"], popular: false },
];

interface FitnessTier {
  id: string;
  name: string;
  price: number;
  interval: string;
  priceId: string | null;
  features: string[];
  popular: boolean;
}

export default function JoinFitness() {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [step, setStep] = useState<"select" | "form">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [healthAcknowledged, setHealthAcknowledged] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    emergency_name: "", emergency_phone: "",
  });

  // Load tiers from pricing_rules
  const { data: tiers = FALLBACK_TIERS as FitnessTier[] } = useQuery<FitnessTier[]>({
    queryKey: ["fitness_tiers_pricing"],
    queryFn: async () => {
      const { data: rules } = await supabase
        .from("pricing_rules")
        .select("id, name, description, modifier_value, stripe_price_id, conditions, businesses!inner(type)")
        .eq("is_active", true)
        .eq("businesses.type", "fitness" as any)
        .order("priority", { ascending: true });

      if (rules && rules.length > 0) {
        return rules.map((r: any) => {
          const cond = r.conditions || {};
          return {
            id: r.id,
            name: r.name,
            price: Math.abs(r.modifier_value),
            interval: cond.interval || "month",
            priceId: r.stripe_price_id || null,
            features: cond.features || [],
            popular: cond.popular === true,
          };
        });
      }
      return FALLBACK_TIERS.map((t) => ({ ...t, priceId: null }));
    },
  });

  const tier = tiers.find((t) => t.id === selectedTier);
  const canPayOnline = tier?.priceId != null;
  const isDayPass = tier?.interval === "day";

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!form.emergency_name || !form.emergency_phone) {
      toast.error("Emergency contact information is required.");
      return;
    }
    if (!healthAcknowledged) {
      toast.error("Please acknowledge the health statement to continue.");
      return;
    }
    if (!tier) return;

    if (!canPayOnline) {
      toast.error("Online payment is not yet configured for this tier. Please call us to sign up.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Day Pass = one-time payment, Monthly = subscription
      const checkoutMode = isDayPass ? "payment" : "subscription";
      const { data, error } = await supabase.functions.invoke("experience-checkout", {
        body: {
          price_id: tier.priceId,
          service_name: tier.name,
          customer_email: form.email,
          customer_name: `${form.first_name} ${form.last_name}`,
          customer_phone: form.phone,
          business_unit: "fitness",
          mode: checkoutMode,
          metadata: {
            booking_type: isDayPass ? "day_pass" : "fitness_membership",
            tier_id: tier.id,
            tier_name: tier.name,
            client_name: `${form.first_name} ${form.last_name}`,
            client_email: form.email,
            client_phone: form.phone,
            emergency_contact_name: form.emergency_name,
            emergency_contact_phone: form.emergency_phone,
            health_acknowledged: "true",
          },
        },
      });
      if (error) throw error;
      if (data?.url) {
        // Also create lead
        await supabase.functions.invoke("lead-intake", {
          body: {
            business_unit: "fitness",
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            source: "website",
            form_fields: {
              tier: tier.name,
              price: tier.price,
              emergency_contact: `${form.emergency_name} (${form.emergency_phone})`,
            },
          },
        });
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message?.includes("price")
        ? "Stripe subscription creation failed. The configured price may be invalid. Please call us."
        : "Unable to start checkout. Please try again or call us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Welcome — A-Z Total Fitness" description="Your membership signup is complete." />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-accent mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Welcome to A-Z Total Fitness!</h1>
          <p className="text-muted-foreground text-lg">Your membership is active. Check your email for details.</p>
          <Button onClick={() => navigate("/fitness")} variant="outline">Explore Fitness</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Join A-Z Total Fitness — Gym Memberships in Wapakoneta" description="Join A-Z Total Fitness. Monthly memberships from $49/month. Full gym access, classes, and personal training." />

      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="bg-accent text-accent-foreground">Join Today</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Join A-Z Total Fitness</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Your neighborhood gym with everything you need to reach your fitness goals.</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> 10 W Auglaize St, Suite B, Wapakoneta, OH</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Open 7 Days</span>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {SITE_CONFIG.contact.phone}</span>
          </div>
        </div>
      </section>

      {step === "select" ? (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <Card key={t.id} className={`relative transition-all cursor-pointer ${selectedTier === t.id ? "border-accent ring-2 ring-accent/30" : "hover:border-accent/50"} ${t.popular ? "border-accent" : ""}`}
                onClick={() => setSelectedTier(t.id)}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground"><Star className="w-3 h-3 mr-1" /> Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-xl">{t.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-accent">${t.price}</span>
                    <span className="text-muted-foreground">/{t.interval}</span>
                  </div>
                  {!t.priceId && (
                    <p className="text-xs text-amber-500 flex items-center justify-center gap-1 mt-2">
                      <AlertCircle className="w-3 h-3" /> Contact us to sign up
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-accent shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button onClick={() => { if (!selectedTier) { toast.error("Please select a plan."); return; } setStep("form"); }} className="bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={!selectedTier}>
              Continue to Signup <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Dumbbell className="w-5 h-5 text-accent" /> Complete Signup</CardTitle>
              <CardDescription>{tier?.name} — ${tier?.price}/{tier?.interval}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name *</Label><Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required /></div>
                <div><Label>Last Name *</Label><Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} required /></div>
              </div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
              <div><Label>Phone *</Label><Input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required /></div>
              <Separator />
              <p className="text-sm font-semibold text-foreground">Emergency Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name *</Label><Input value={form.emergency_name} onChange={(e) => setForm((f) => ({ ...f, emergency_name: e.target.value }))} required /></div>
                <div><Label>Phone *</Label><Input type="tel" value={form.emergency_phone} onChange={(e) => setForm((f) => ({ ...f, emergency_phone: e.target.value }))} required /></div>
              </div>
              <div className="flex items-start gap-3 bg-muted p-3 rounded-lg">
                <Checkbox checked={healthAcknowledged} onCheckedChange={(v) => setHealthAcknowledged(!!v)} id="health" />
                <Label htmlFor="health" className="text-sm text-muted-foreground leading-relaxed">
                  I acknowledge that I am physically able to participate in fitness activities and will consult a physician if needed.
                </Label>
              </div>

              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <p className="font-semibold text-foreground">{tier?.name}</p>
                <p className="text-2xl font-bold text-accent">${tier?.price}<span className="text-sm font-normal text-muted-foreground">/{tier?.interval}</span></p>
              </div>

              {!canPayOnline && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center text-sm text-amber-600">
                  Online payment is not yet configured. Please call us at {SITE_CONFIG.contact.phone} to sign up.
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("select")} className="flex-1">Back</Button>
                <Button onClick={handleSubmit} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || !canPayOnline}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : `Pay $${tier?.price}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ScrollToTopButton />
    </div>
  );
}
