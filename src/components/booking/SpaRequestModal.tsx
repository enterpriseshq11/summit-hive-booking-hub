import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Sparkles, Heart, Leaf, Star, Users } from "lucide-react";
import { toast } from "sonner";

interface SpaRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedService?: "massage" | "recovery" | "wellness" | null;
}

export function SpaRequestModal({ open, onOpenChange, preselectedService = null }: SpaRequestModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [serviceType, setServiceType] = useState<string>(preselectedService || "");
  const [timeframe, setTimeframe] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [preferredProvider, setPreferredProvider] = useState(false);
  const [addOns, setAddOns] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Request received! We'll be in touch within 24 hours.");
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after close animation
    setTimeout(() => {
      setSubmitted(false);
      setServiceType(preselectedService || "");
      setTimeframe("");
      setGuestCount("1");
      setPreferredProvider(false);
      setAddOns(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setNotes("");
    }, 300);
  };

  const serviceOptions = [
    { value: "massage", label: "Massage Therapy", icon: Heart, desc: "Deep tissue, Swedish, sports" },
    { value: "recovery", label: "Recovery Services", icon: Leaf, desc: "Cryo, compression, infrared" },
    { value: "wellness", label: "Wellness Experience", icon: Star, desc: "Couples, packages, journeys" }
  ];

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <DialogTitle className="text-2xl mb-2">Request Received</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">
              Our team will review your request and respond within 24 hours with personalized options.
            </DialogDescription>
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <Badge variant="outline" className="border-accent/30 text-accent text-xs">
              The Restoration Lounge
            </Badge>
          </div>
          <DialogTitle className="text-2xl">Request a Service</DialogTitle>
          <DialogDescription>
            Tell us what you're looking for — we'll confirm availability and options within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Service Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Service Type</Label>
            <div className="grid gap-3">
              {serviceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setServiceType(option.value)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    serviceType === option.value
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    serviceType === option.value ? "bg-accent" : "bg-muted"
                  }`}>
                    <option.icon className={`h-5 w-5 ${
                      serviceType === option.value ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                  {serviceType === option.value && (
                    <CheckCircle className="h-5 w-5 text-accent ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <Label htmlFor="timeframe">When are you looking to book?</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This week</SelectItem>
                <SelectItem value="next-week">Next week</SelectItem>
                <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                <SelectItem value="month">Within a month</SelectItem>
                <SelectItem value="flexible">I'm flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Guest Count */}
          <div className="space-y-2">
            <Label>Number of guests</Label>
            <div className="flex gap-2">
              {["1", "2", "3-4", "5+"].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setGuestCount(count)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    guestCount === count
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <Users className="h-4 w-4 mx-auto mb-1" />
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Provider preference?</Label>
                <p className="text-xs text-muted-foreground">Request a specific therapist</p>
              </div>
              <Switch checked={preferredProvider} onCheckedChange={setPreferredProvider} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Interested in add-ons?</Label>
                <p className="text-xs text-muted-foreground">Enhancements, aromatherapy, etc.</p>
              </div>
              <Switch checked={addOns} onCheckedChange={setAddOns} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Special requests or notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Pressure preferences, areas of focus, health considerations..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={!serviceType || !email || !firstName || isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
              data-event="spa_request_submit"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              No obligation • Response within 24 hours • Review everything before payment
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
