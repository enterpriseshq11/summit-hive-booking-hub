import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Heart, Leaf, Star } from "lucide-react";
import { toast } from "sonner";

interface SpaWaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedService?: "massage" | "recovery" | "wellness" | null;
}

export function SpaWaitlistModal({ open, onOpenChange, preselectedService = null }: SpaWaitlistModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [serviceType, setServiceType] = useState<string>(preselectedService || "");
  const [timeframe, setTimeframe] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTime, setPreferredTime] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const toggleDay = (day: string) => {
    setPreferredDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("You're on the waitlist! We'll notify you when space opens.");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setServiceType(preselectedService || "");
      setTimeframe("");
      setPreferredDays([]);
      setPreferredTime("");
      setEmail("");
      setPhone("");
    }, 300);
  };

  const serviceOptions = [
    { value: "massage", label: "Massage Therapy", icon: Heart },
    { value: "recovery", label: "Recovery Services", icon: Leaf },
    { value: "wellness", label: "Wellness Experience", icon: Star },
    { value: "any", label: "Any service", icon: Clock }
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <DialogTitle className="text-2xl mb-2">You're on the List</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">
              We'll notify you as soon as an appointment opens up that matches your preferences.
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-accent" />
            <Badge variant="outline" className="border-accent/30 text-accent text-xs">
              Waitlist
            </Badge>
          </div>
          <DialogTitle className="text-2xl">Join the Waitlist</DialogTitle>
          <DialogDescription>
            Tell us your preferences and we'll notify you the moment an opening matches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Service Type */}
          <div className="space-y-2">
            <Label>Service type</Label>
            <div className="grid grid-cols-2 gap-2">
              {serviceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setServiceType(option.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-sm ${
                    serviceType === option.value
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <option.icon className={`h-4 w-4 ${
                    serviceType === option.value ? "text-accent" : "text-muted-foreground"
                  }`} />
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <Label>How soon?</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">As soon as possible</SelectItem>
                <SelectItem value="this-week">This week</SelectItem>
                <SelectItem value="next-week">Next week</SelectItem>
                <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                <SelectItem value="flexible">I'm flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Days */}
          <div className="space-y-2">
            <Label>Preferred days (select all that work)</Label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    preferredDays.includes(day)
                      ? "bg-accent text-primary"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Time */}
          <div className="space-y-2">
            <Label>Preferred time of day</Label>
            <Select value={preferredTime} onValueChange={setPreferredTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (8am - 12pm)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                <SelectItem value="evening">Evening (5pm - 8pm)</SelectItem>
                <SelectItem value="any">Any time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="waitlist-email">Email *</Label>
              <Input
                id="waitlist-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waitlist-phone">Phone (for text alerts)</Label>
              <Input
                id="waitlist-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={!email || isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
              data-event="spa_waitlist_submit"
            >
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We'll only contact you when there's an opening that matches
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
