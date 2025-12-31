import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Dumbbell, Zap, Trophy } from "lucide-react";
import { toast } from "sonner";

interface FitnessWaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedPlan?: "essential" | "performance" | "elite" | null;
}

export function FitnessWaitlistModal({ open, onOpenChange, preselectedPlan = null }: FitnessWaitlistModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [planInterest, setPlanInterest] = useState<string>(preselectedPlan || "");
  const [timeframe, setTimeframe] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("You're on the waitlist! We'll notify you when spots open.");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setPlanInterest(preselectedPlan || "");
      setTimeframe("");
      setEmail("");
      setPhone("");
    }, 300);
  };

  const planOptions = [
    { value: "essential", label: "Essential", icon: Dumbbell },
    { value: "performance", label: "Performance", icon: Zap },
    { value: "elite", label: "Elite", icon: Trophy },
    { value: "any", label: "Any plan", icon: Clock }
  ];

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
              We'll notify you as soon as membership spots open up. You'll be among the first to know!
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
            Be first in line when membership spots open. We'll notify you immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Plan Interest */}
          <div className="space-y-2">
            <Label>Which membership interests you?</Label>
            <div className="grid grid-cols-2 gap-2">
              {planOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPlanInterest(option.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-sm ${
                    planInterest === option.value
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <option.icon className={`h-4 w-4 ${
                    planInterest === option.value ? "text-accent" : "text-muted-foreground"
                  }`} />
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <Label>When are you hoping to start?</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">As soon as possible</SelectItem>
                <SelectItem value="this-month">This month</SelectItem>
                <SelectItem value="next-month">Next month</SelectItem>
                <SelectItem value="flexible">I'm flexible</SelectItem>
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
              data-event="fitness_waitlist_submit"
            >
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We'll only contact you when spots open up
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
