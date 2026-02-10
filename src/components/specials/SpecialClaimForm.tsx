import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";

interface SpecialClaimFormProps {
  specialId: string;
  specialTitle: string;
}

export function SpecialClaimForm({ specialId, specialTitle }: SpecialClaimFormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;

    setLoading(true);
    const { error } = await supabase.from("special_claims").insert({
      special_id: specialId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message || null,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      return;
    }

    setSubmitted(true);
  };

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
