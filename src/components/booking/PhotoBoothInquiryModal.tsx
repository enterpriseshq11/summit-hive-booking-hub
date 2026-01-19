import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarDays, Check, Loader2, Phone, Mail, MessageSquare } from "lucide-react";
import { useCreatePhotoBoothInquiry } from "@/hooks/usePhotoBoothInquiries";
import { cn } from "@/lib/utils";

interface PhotoBoothInquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
}

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding / Reception" },
  { value: "birthday", label: "Birthday Party" },
  { value: "graduation", label: "Graduation Party" },
  { value: "corporate", label: "Corporate Event" },
  { value: "school", label: "School Event / Dance" },
  { value: "fundraiser", label: "Fundraiser / Community Event" },
  { value: "other", label: "Other" },
];

const CONTACT_METHODS = [
  { value: "call", label: "Call", icon: Phone },
  { value: "text", label: "Text", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
];

export function PhotoBoothInquiryModal({ open, onOpenChange, source = "website" }: PhotoBoothInquiryModalProps) {
  const createInquiry = useCreatePhotoBoothInquiry();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    event_type: "",
    event_location: "",
    notes: "",
    preferred_contact: "email",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createInquiry.mutateAsync({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
        event_type: formData.event_type || null,
        event_location: formData.event_location.trim() || null,
        notes: formData.notes.trim() || null,
        preferred_contact: formData.preferred_contact,
        source,
      });

      setIsSuccess(true);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after closing
    setTimeout(() => {
      setIsSuccess(false);
      setEventDate(undefined);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        event_type: "",
        event_location: "",
        notes: "",
        preferred_contact: "email",
      });
    }, 300);
  };

  const isValid = formData.full_name && formData.phone && formData.email;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        aria-describedby="photo-booth-inquiry-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">360 Photo Booth Inquiry</DialogTitle>
          <DialogDescription id="photo-booth-inquiry-description">
            Tell us about your event and we'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 text-center" role="status" aria-live="polite">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <p className="font-semibold text-xl mb-2">Thanks!</p>
            <p className="text-muted-foreground">
              Your 360 Photo Booth inquiry is in. We'll contact you shortly to confirm availability and next steps.
            </p>
            <Button onClick={handleClose} className="mt-6 bg-accent text-primary hover:bg-accent/90">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact Information */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {eventDate ? format(eventDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={setEventDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type</Label>
                <Select value={formData.event_type} onValueChange={(v) => handleChange("event_type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
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

              <div className="space-y-2">
                <Label htmlFor="event_location">Event Location / Venue</Label>
                <Input
                  id="event_location"
                  value={formData.event_location}
                  onChange={(e) => handleChange("event_location", e.target.value)}
                  placeholder="Venue name or address"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Requests</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any special requests or questions?"
                rows={3}
              />
            </div>

            {/* Preferred Contact Method */}
            <div className="space-y-3">
              <Label>Preferred Contact Method</Label>
              <div className="flex flex-wrap gap-2">
                {CONTACT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = formData.preferred_contact === method.value;
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => handleChange("preferred_contact", method.value)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium",
                        "hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        isSelected 
                          ? "border-accent bg-accent/10 text-foreground" 
                          : "border-border text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {method.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold py-6"
              disabled={!isValid || createInquiry.isPending}
            >
              {createInquiry.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Get Availability"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We'll respond within 24 hours with availability and next steps.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
