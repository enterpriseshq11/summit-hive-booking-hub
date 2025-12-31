import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Building2, CheckCircle, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GiftCardBulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GiftCardBulkOrderModal({ isOpen, onClose }: GiftCardBulkOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    quantity: "",
    amountPerCard: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the business ID for gift cards (using spa as proxy since gift cards are cross-business)
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("type", "spa")
        .single();

      if (business) {
        await supabase.from("leads").insert({
          business_id: business.id,
          first_name: formData.contactName,
          company_name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          source: "gift_card_bulk_order",
          event_type: "bulk_gift_cards",
          notes: `Quantity: ${formData.quantity}, Amount per card: $${formData.amountPerCard}. ${formData.notes}`,
          status: "new",
        });
      }

      setIsComplete(true);
      toast({
        title: "Request submitted!",
        description: "Our team will contact you within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Unable to submit",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsComplete(false);
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      quantity: "",
      amountPerCard: "",
      notes: "",
    });
    onClose();
  };

  if (isComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Request Received!</h3>
            <p className="text-muted-foreground mb-6">
              Our corporate team will reach out within 24 hours to discuss your bulk order.
            </p>
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-primary"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent" />
            Corporate & Bulk Orders
          </DialogTitle>
          <DialogDescription>
            Ordering 10+ gift cards? Let us help with volume pricing and custom branding options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              required
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="contact-name">Contact Name *</Label>
              <Input
                id="contact-name"
                required
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bulk-email">Email *</Label>
              <Input
                id="bulk-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bulk-phone">Phone</Label>
            <Input
              id="bulk-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="10"
                required
                placeholder="10+"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="amount-per-card">Amount Per Card</Label>
              <Input
                id="amount-per-card"
                type="number"
                min="25"
                placeholder="$100"
                value={formData.amountPerCard}
                onChange={(e) => setFormData(prev => ({ ...prev, amountPerCard: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bulk-notes">Additional Notes</Label>
            <Textarea
              id="bulk-notes"
              placeholder="Tell us about your needs (custom branding, delivery timeline, etc.)"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-primary"
            disabled={isSubmitting}
            data-event="giftcard_bulk_submit"
          >
            {isSubmitting ? "Submitting..." : "Request Quote"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            We'll respond within 24 hours
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
