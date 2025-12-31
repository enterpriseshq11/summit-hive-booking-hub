import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Dumbbell, Zap, Trophy, Target } from "lucide-react";
import { toast } from "sonner";

interface FitnessJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedPlan?: "essential" | "performance" | "elite" | null;
}

export function FitnessJoinModal({ open, onOpenChange, preselectedPlan = null }: FitnessJoinModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [planType, setPlanType] = useState<string>(preselectedPlan || "");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [startDate, setStartDate] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Membership request received! We'll be in touch within 24 hours.");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setPlanType(preselectedPlan || "");
      setFitnessGoal("");
      setExperience("");
      setStartDate("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setNotes("");
    }, 300);
  };

  const planOptions = [
    { value: "essential", label: "Essential", desc: "24/7 access, equipment orientation", icon: Dumbbell },
    { value: "performance", label: "Performance", desc: "Classes, sauna, guest pass", icon: Zap, popular: true },
    { value: "elite", label: "Elite", desc: "All access, unlimited guests, priority booking", icon: Trophy }
  ];

  const goalOptions = [
    { value: "weight-loss", label: "Weight Loss" },
    { value: "muscle-gain", label: "Build Muscle" },
    { value: "endurance", label: "Improve Endurance" },
    { value: "general", label: "General Fitness" },
    { value: "sport", label: "Sport-Specific Training" }
  ];

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <DialogTitle className="text-2xl mb-2">You're Almost In!</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">
              Our team will review your request and reach out within 24 hours to finalize your membership and schedule your orientation.
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
            <Dumbbell className="h-5 w-5 text-accent" />
            <Badge variant="outline" className="border-accent/30 text-accent text-xs">
              Total Fitness
            </Badge>
          </div>
          <DialogTitle className="text-2xl">Start Your Membership</DialogTitle>
          <DialogDescription>
            Tell us about your goals — we'll confirm your membership and schedule your orientation within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Membership Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Membership Type</Label>
            <div className="grid gap-3">
              {planOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPlanType(option.value)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left relative ${
                    planType === option.value
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  {option.popular && (
                    <div className="absolute -top-2 right-3">
                      <span className="bg-accent text-primary text-xs px-2 py-0.5 rounded-full font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    planType === option.value ? "bg-accent" : "bg-muted"
                  }`}>
                    <option.icon className={`h-5 w-5 ${
                      planType === option.value ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                  {planType === option.value && (
                    <CheckCircle className="h-5 w-5 text-accent ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">What's your primary fitness goal?</Label>
            <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                {goalOptions.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>{goal.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label>Experience level</Label>
            <div className="flex gap-2">
              {["beginner", "intermediate", "advanced"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setExperience(level)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                    experience === level
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">When would you like to start?</Label>
            <Select value={startDate} onValueChange={setStartDate}>
              <SelectTrigger>
                <SelectValue placeholder="Select start date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">As soon as possible</SelectItem>
                <SelectItem value="this-week">This week</SelectItem>
                <SelectItem value="next-week">Next week</SelectItem>
                <SelectItem value="this-month">This month</SelectItem>
                <SelectItem value="flexible">I'm flexible</SelectItem>
              </SelectContent>
            </Select>
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
              <Label htmlFor="notes">Anything else we should know?</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Health considerations, schedule preferences, questions..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={!planType || !email || !firstName || isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
              data-event="fitness_join_submit"
            >
              {isSubmitting ? "Submitting..." : "Request Membership"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              No contracts • Review everything before payment • Cancel anytime
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
