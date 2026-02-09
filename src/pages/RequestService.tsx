import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmsConsentCheckbox } from "@/components/booking/SmsConsentCheckbox";
import { SEOHead } from "@/components/seo/SEOHead";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RequestService() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission (replace with real endpoint as needed)
    await new Promise((r) => setTimeout(r, 1000));

    setIsSuccess(true);
    toast({
      title: "Request received!",
      description: "We will contact you within 1 business day.",
    });
    setIsSubmitting(false);
  };

  return (
    <>
      <SEOHead
        title="Request Service | A-Z Enterprises"
        description="Request information about our services. Contact A-Z Enterprises for coworking, fitness, events, spa, and more."
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Request Service</h1>
            <p className="text-muted-foreground mt-2">
              Submit your inquiry to <strong>A-Z Enterprises</strong>. Tell us what you're interested in and we'll get back to you fast.
            </p>
          </div>

          {isSuccess ? (
            <div className="py-12 text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-semibold text-lg">We received your request.</p>
              <p className="text-sm text-muted-foreground mt-1">
                We will contact you within 1 business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="rs-name">Name *</Label>
                <Input
                  id="rs-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rs-email">Email *</Label>
                <Input
                  id="rs-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rs-phone">Phone *</Label>
                <Input
                  id="rs-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rs-interest">What are you interested in?</Label>
                <Select
                  value={formData.interest}
                  onValueChange={(val) => setFormData({ ...formData, interest: val })}
                >
                  <SelectTrigger id="rs-interest">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coworking">The Hive by A-Z (Coworking)</SelectItem>
                    <SelectItem value="fitness">A-Z Total Fitness</SelectItem>
                    <SelectItem value="events">Memory Maker Event Center</SelectItem>
                    <SelectItem value="spa">Restoration Lounge (Spa)</SelectItem>
                    <SelectItem value="photo-booth">360 Photo Booth</SelectItem>
                    <SelectItem value="voice-vault">Voice Vault</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rs-message">
                  Message <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="rs-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more about what you need..."
                  rows={4}
                />
              </div>

              {/* A2P SMS Consent */}
              <SmsConsentCheckbox checked={smsConsent} onCheckedChange={setSmsConsent} />

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
