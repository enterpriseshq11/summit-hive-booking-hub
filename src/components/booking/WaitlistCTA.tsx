import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Loader2, Check, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface WaitlistCTAProps {
  businessId: string;
  bookableTypeId?: string;
  resourceId?: string;
  preferredDate?: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}

export function WaitlistCTA({
  businessId,
  bookableTypeId,
  resourceId,
  preferredDate,
  buttonText = "Join Waitlist",
  buttonVariant = "outline",
  className,
}: WaitlistCTAProps) {
  const { toast } = useToast();
  const { user, authUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: authUser?.profile?.email || "",
    phone: authUser?.profile?.phone || "",
    name: authUser?.profile?.first_name
      ? `${authUser.profile.first_name} ${authUser.profile.last_name || ""}`.trim()
      : "",
    preferred_date: preferredDate || "",
    preferred_time_start: "",
    preferred_time_end: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("waitlist_entries").insert({
        business_id: businessId,
        bookable_type_id: bookableTypeId,
        resource_id: resourceId,
        user_id: user?.id,
        guest_email: formData.email,
        guest_phone: formData.phone || null,
        preferred_date: formData.preferred_date || null,
        preferred_time_start: formData.preferred_time_start || null,
        preferred_time_end: formData.preferred_time_end || null,
        status: "waiting",
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "You're on the waitlist!",
        description: "We'll notify you when a spot becomes available.",
      });

      // Reset after a moment
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Waitlist error:", error);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className={className}>
          <Bell className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join the Waitlist</DialogTitle>
          <DialogDescription>
            We'll notify you as soon as a spot becomes available.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-success" />
            </div>
            <p className="font-medium text-lg">You're on the list!</p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll reach out when availability opens up.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="waitlist-name">Name</Label>
              <Input
                id="waitlist-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="waitlist-email">Email</Label>
              <Input
                id="waitlist-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Phone (optional) */}
            <div className="space-y-2">
              <Label htmlFor="waitlist-phone">
                Phone <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="waitlist-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Preferred date */}
            <div className="space-y-2">
              <Label htmlFor="waitlist-date">Preferred Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="waitlist-date"
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  className="pl-10"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Preferred time window */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waitlist-time-start">Earliest Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="waitlist-time-start"
                    type="time"
                    value={formData.preferred_time_start}
                    onChange={(e) => setFormData({ ...formData, preferred_time_start: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="waitlist-time-end">Latest Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="waitlist-time-end"
                    type="time"
                    value={formData.preferred_time_end}
                    onChange={(e) => setFormData({ ...formData, preferred_time_end: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="waitlist-notes">
                Notes <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="waitlist-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any specific requirements or preferences..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
