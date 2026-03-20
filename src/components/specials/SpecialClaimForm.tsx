import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, CalendarIcon } from "lucide-react";

const SPA_SERVICES_WITH_PRICES: { name: string; price60: number }[] = [
  { name: "Scalp Stimulation", price60: 45 },
  { name: "Infrared Sauna", price60: 45 },
  { name: "Yoni Steam", price60: 60 },
  { name: "Neck, Back & Shoulders", price60: 75 },
  { name: "Trigger Point Release", price60: 85 },
  { name: "Radiant Renewal", price60: 90 },
  { name: "Total Body Stretch", price60: 90 },
  { name: "Hot Stone", price60: 100 },
  { name: "Cupping", price60: 100 },
  { name: "Deep Tissue", price60: 110 },
  { name: "Lymphatic Drainage", price60: 120 },
  { name: "Table Thai", price60: 120 },
  { name: "Hydrating Sugar Scrub", price60: 125 },
  { name: "Mud Detox", price60: 150 },
  { name: "Seaweed Body Wrap", price60: 150 },
  { name: "Chamomile Body Wrap", price60: 150 },
  { name: "Natural Herbal Bath", price60: 155 },
  { name: "Cold Plunge Bath", price60: 155 },
];

const SPA_SERVICES = SPA_SERVICES_WITH_PRICES.map(s => s.name);

const SERVICE_DURATIONS: Record<string, { duration: string; price: string }[]> = Object.fromEntries(
  SPA_SERVICES_WITH_PRICES.map(s => [
    s.name,
    [
      { duration: "60 min", price: `$${s.price60}` },
      { duration: "90 min", price: `$${s.price60 + 35}` },
    ],
  ])
);

const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10;
  const min = i % 2 === 0 ? "00" : "30";
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = `${hour > 12 ? hour - 12 : hour}:${min} ${ampm}`;
  return { value: `${hour}:${min}`, label: display };
});

interface SpecialClaimFormProps {
  specialId: string;
  specialTitle: string;
  businessUnit?: string;
}

export function SpecialClaimForm({ specialId, specialTitle, businessUnit }: SpecialClaimFormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [service, setService] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");

  const isSpa = useMemo(() => {
    const unit = (businessUnit || "").toLowerCase();
    return unit.includes("spa") || unit.includes("restoration");
  }, [businessUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    if (isSpa && (!service || !date || !time)) {
      toast({ title: "Missing fields", description: "Please select a service, date, and time.", variant: "destructive" });
      return;
    }
    if (isSpa && hasDurations && !duration) {
      toast({ title: "Missing fields", description: "Please select a session duration.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const messageParts = [form.message];
    if (isSpa) {
      messageParts.unshift(
        `Service: ${service}${duration ? ` (${duration})` : ""}`,
        `Price: ${servicePrice || "N/A"}`,
        `Requested Date: ${date ? format(date, "PPP") : ""}`,
        `Requested Time: ${TIME_SLOTS.find(t => t.value === time)?.label || time}`
      );
    }
    const fullMessage = messageParts.filter(Boolean).join(" | ");

    const { error } = await supabase.from("special_claims").insert({
      special_id: specialId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: fullMessage || null,
    });

    if (error) {
      setLoading(false);
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      return;
    }

    let resolvedUnit = businessUnit || "";
    if (!resolvedUnit) {
      const { data: specialData } = await supabase
        .from("specials")
        .select("business_unit")
        .eq("id", specialId)
        .single();
      resolvedUnit = specialData?.business_unit || "unknown";
    }

    supabase.functions.invoke("special-claim-notification", {
      body: {
        special_id: specialId,
        special_title: specialTitle,
        business_unit: resolvedUnit,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: fullMessage || null,
      },
    }).catch((err) => console.error("Notification send failed:", err));

    setLoading(false);
    setSubmitted(true);
  };

  const hasDurations = !!SERVICE_DURATIONS[service];
  const durations = SERVICE_DURATIONS[service] || [];

  // Compute price shown to customer based on service + duration
  const servicePrice = useMemo(() => {
    if (!service) return null;
    if (hasDurations && duration) {
      const match = durations.find(d => d.duration === duration);
      return match?.price || null;
    }
    return null;
  }, [service, duration, hasDurations, durations]);

  if (submitted) {
    return (
      <div className="text-center py-4 space-y-2">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
        <p className="font-semibold text-foreground">Request Received!</p>
        <p className="text-sm text-muted-foreground">
          We received your request for "{specialTitle}". We will contact you within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-border">
      <p className="text-sm font-medium text-foreground">Claim This Special</p>

      {isSpa && (
        <>
          <div>
            <Label className="text-xs">Service *</Label>
            <Select value={service} onValueChange={(v) => { setService(v); setDuration(""); }} required>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {SPA_SERVICES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasDurations && (
              <div className="mt-2">
                <Label className="text-xs">Duration *</Label>
                <Select value={duration} onValueChange={setDuration} required>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {durations.map((d) => (
                      <SelectItem key={d.duration} value={d.duration}>
                        {d.duration} — {d.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {servicePrice && (
              <p className="text-xs text-muted-foreground mt-1">
                Price at checkout: <span className="font-semibold text-foreground">{servicePrice}</span>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Preferred Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full h-9 justify-start text-left font-normal text-sm", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                    {date ? format(date, "MM/dd/yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">Preferred Time *</Label>
              <Select value={time} onValueChange={setTime} required>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Pick time" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50 max-h-48">
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      <div>
        <Label className="text-xs">Name *</Label>
        <Input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your full name"
          className="h-9"
        />
      </div>
      <div>
        <Label className="text-xs">Email *</Label>
        <Input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          className="h-9"
        />
      </div>
      <div>
        <Label className="text-xs">Phone *</Label>
        <Input
          required
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="(555) 123-4567"
          className="h-9"
        />
      </div>
      <div>
        <Label className="text-xs">Message (optional)</Label>
        <Textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Any details or questions..."
          rows={2}
          className="text-sm"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold">
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Request"}
      </Button>
    </form>
  );
}