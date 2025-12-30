import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HelpCircle, Phone, Mail, Calendar, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FloatingHelpDrawerProps {
  businessType?: "coworking" | "summit" | "spa" | "fitness";
  phoneNumber?: string;
  email?: string;
}

export function FloatingHelpDrawer({ 
  businessType = "coworking",
  phoneNumber = "(419) 555-1234",
  email = "hello@thehive.com"
}: FloatingHelpDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTourForm, setShowTourForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("type", businessType)
        .single();

      if (!business) throw new Error("Business not found");

      const { error } = await supabase.from("leads").insert({
        business_id: business.id,
        first_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: "floating_help_drawer",
        event_type: "tour",
        status: "new",
      });

      if (error) throw error;

      toast({
        title: "Tour request sent!",
        description: "We'll be in touch within 24 hours.",
      });
      setShowTourForm(false);
      setFormData({ name: "", email: "", phone: "" });
    } catch (error) {
      toast({
        title: "Unable to submit",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 md:bottom-6 right-4 z-40 h-12 w-12 rounded-full bg-accent hover:bg-accent/90 text-primary shadow-gold-lg"
          aria-label="Get help"
          data-event="hive_help_drawer_open"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>How can we help?</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Options */}
          <div className="space-y-3">
            <a
              href={`tel:${phoneNumber.replace(/\D/g, "")}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Phone className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">Call Us</p>
                <p className="text-xs text-muted-foreground">{phoneNumber}</p>
              </div>
            </a>

            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Mail className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">Email Us</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </a>
          </div>

          {/* Quick Tour Form */}
          <div className="border-t border-border pt-6">
            {!showTourForm ? (
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => setShowTourForm(true)}
              >
                <Calendar className="h-4 w-4 text-accent" />
                Request a Quick Tour
              </Button>
            ) : (
              <form onSubmit={handleTourSubmit} className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  Quick Tour Request
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="help-name" className="text-xs">Name *</Label>
                    <Input
                      id="help-name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="help-email" className="text-xs">Email *</Label>
                    <Input
                      id="help-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="help-phone" className="text-xs">Phone</Label>
                    <Input
                      id="help-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTourForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                  >
                    {isSubmitting ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Response Time */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3 text-accent" />
              Typically respond within 24 hours
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
