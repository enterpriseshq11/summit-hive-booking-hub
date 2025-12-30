import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, CheckCircle, ArrowRight, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HiveWaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const workspaceTypes = [
  { value: "private-office", label: "Private Office" },
  { value: "dedicated-desk", label: "Dedicated Desk" },
  { value: "day-pass", label: "Day Pass" },
  { value: "any", label: "Any availability" },
];

const timeframes = [
  { value: "asap", label: "As soon as possible" },
  { value: "2-weeks", label: "Within 2 weeks" },
  { value: "1-month", label: "Within 1 month" },
  { value: "flexible", label: "Flexible" },
];

export function HiveWaitlistModal({ open, onOpenChange }: HiveWaitlistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    workspaceType: "",
    timeframe: "",
    firstName: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("type", "coworking")
        .single();

      if (!business) throw new Error("Business not found");

      const { error } = await supabase.from("waitlist_entries").insert({
        business_id: business.id,
        guest_email: formData.email,
        guest_phone: formData.phone,
        status: "waiting",
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      toast({
        title: "Unable to join waitlist",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({
        workspaceType: "",
        timeframe: "",
        firstName: "",
        email: "",
        phone: "",
      });
    }, 300);
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-2">You're on the List</h3>
            <p className="text-muted-foreground mb-6">
              We'll notify you the moment space opens up that matches your needs.
            </p>
            <Button onClick={handleClose} className="bg-accent hover:bg-accent/90 text-primary">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-5 w-5 text-accent" />
            Join the Waitlist
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Be first to know when space opens up.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Interested In</Label>
            <Select
              value={formData.workspaceType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, workspaceType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workspace type" />
              </SelectTrigger>
              <SelectContent>
                {workspaceTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timeframe</Label>
            <Select
              value={formData.timeframe}
              onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="When do you need space?" />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map(tf => (
                  <SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              required
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.firstName || !formData.email}
              className="bg-accent hover:bg-accent/90 text-primary font-bold"
              data-event="hive_waitlist_submit"
            >
              {isSubmitting ? "Joining..." : "Join Waitlist"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              <Check className="h-3 w-3 inline mr-1" />
              We'll only contact you when space is available
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
