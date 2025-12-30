import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarDays, Check, Loader2, Plus, X, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SummitWaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "party", label: "Private Party" },
  { value: "other", label: "Other" },
];

export function SummitWaitlistModal({ open, onOpenChange }: SummitWaitlistModalProps) {
  const { user, authUser } = useAuth();
  const { data: business } = useBusinessByType("summit");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [name, setName] = useState(
    authUser?.profile?.first_name 
      ? `${authUser.profile.first_name} ${authUser.profile.last_name || ""}`.trim() 
      : ""
  );
  const [email, setEmail] = useState(authUser?.profile?.email || "");
  const [phone, setPhone] = useState(authUser?.profile?.phone || "");
  const [eventType, setEventType] = useState("");
  const [preferredDates, setPreferredDates] = useState<Date[]>([]);

  const addDate = (date: Date | undefined) => {
    if (date && preferredDates.length < 3) {
      const exists = preferredDates.some(d => d.toDateString() === date.toDateString());
      if (!exists) {
        setPreferredDates([...preferredDates, date]);
      }
    }
  };

  const removeDate = (index: number) => {
    setPreferredDates(preferredDates.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!business || !name || !email) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("waitlist_entries").insert({
        business_id: business.id,
        user_id: user?.id,
        guest_email: email,
        guest_phone: phone || null,
        preferred_date: preferredDates[0]?.toISOString().split("T")[0] || null,
        status: "waiting",
      });

      if (error) throw error;

      // Log to audit
      await supabase.from("audit_log").insert([{
        entity_type: "waitlist",
        action_type: "summit_waitlist_join",
        after_json: { 
          event_type: eventType,
          preferred_dates: preferredDates.map(d => format(d, "yyyy-MM-dd"))
        } as any,
      }]);

      setIsSuccess(true);
      
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        // Reset form
        setName(authUser?.profile?.first_name || "");
        setEmail(authUser?.profile?.email || "");
        setPhone("");
        setEventType("");
        setPreferredDates([]);
      }, 2000);
    } catch (error) {
      toast.error("Unable to join waitlist — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md"
        aria-describedby="waitlist-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            Join the Priority List
          </DialogTitle>
          <DialogDescription id="waitlist-description">
            Be the first to know when popular dates become available.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-10 text-center" role="status" aria-live="polite">
            <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Check className="h-7 w-7 text-accent" />
            </div>
            <p className="font-semibold text-lg mb-1">You're on the list!</p>
            <p className="text-sm text-muted-foreground">
              We'll notify you when availability opens.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="wl-name">Name *</Label>
              <Input
                id="wl-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="wl-email">Email *</Label>
              <Input
                id="wl-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="wl-phone">Phone (optional)</Label>
              <Input
                id="wl-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Dates */}
            <div className="space-y-2">
              <Label>Preferred Dates (up to 3)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {preferredDates.map((date, i) => (
                  <div 
                    key={i} 
                    className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-sm"
                  >
                    <CalendarDays className="h-3 w-3 text-accent" />
                    {format(date, "MMM d")}
                    <button
                      type="button"
                      onClick={() => removeDate(i)}
                      className="hover:text-destructive"
                      aria-label={`Remove ${format(date, "MMM d")}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {preferredDates.length < 3 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      onSelect={addDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                disabled={isSubmitting}
                data-event="summit_waitlist_submit"
              >
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
