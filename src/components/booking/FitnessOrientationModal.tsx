import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface FitnessOrientationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FitnessOrientationModal({ open, onOpenChange }: FitnessOrientationModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [timeframe, setTimeframe] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTime, setPreferredTime] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [questions, setQuestions] = useState("");

  const toggleDay = (day: string) => {
    setPreferredDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Orientation request received! We'll confirm your session within 24 hours.");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setTimeframe("");
      setPreferredDays([]);
      setPreferredTime("");
      setFirstName("");
      setEmail("");
      setPhone("");
      setQuestions("");
    }, 300);
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <DialogTitle className="text-2xl mb-2">Orientation Requested</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">
              We'll confirm your orientation session within 24 hours and send you all the details you need to prepare.
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
            <Calendar className="h-5 w-5 text-accent" />
            <Badge variant="outline" className="border-accent/30 text-accent text-xs">
              Free Session
            </Badge>
          </div>
          <DialogTitle className="text-2xl">Schedule Orientation</DialogTitle>
          <DialogDescription>
            Get a personalized tour of our facility and equipment. No obligation, completely free.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Timeframe */}
          <div className="space-y-2">
            <Label>When works best?</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">As soon as possible</SelectItem>
                <SelectItem value="this-week">This week</SelectItem>
                <SelectItem value="next-week">Next week</SelectItem>
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
                <SelectItem value="early-morning">Early Morning (5am - 8am)</SelectItem>
                <SelectItem value="morning">Morning (8am - 12pm)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                <SelectItem value="evening">Evening (5pm - 9pm)</SelectItem>
                <SelectItem value="any">Any time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orient-firstName">First name *</Label>
              <Input
                id="orient-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orient-email">Email *</Label>
              <Input
                id="orient-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orient-phone">Phone (for reminders)</Label>
              <Input
                id="orient-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orient-questions">Any questions for us?</Label>
              <Textarea
                id="orient-questions"
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                placeholder="Equipment you want to see, accessibility needs, etc..."
                rows={2}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={!email || !firstName || isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
              data-event="fitness_orientation_submit"
            >
              {isSubmitting ? "Submitting..." : "Request Orientation"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Free • No obligation • Takes about 30 minutes
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
