import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Video, CheckCircle, ArrowRight, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleTourModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessType?: "coworking" | "summit";
}

const dayOptions = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const timeOptions = [
  { value: "morning", label: "Morning (9am - 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm - 4pm)" },
  { value: "evening", label: "Evening (4pm - 6pm)" },
];

export function ScheduleTourModal({ open, onOpenChange, businessType = "coworking" }: ScheduleTourModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    preferredDay1: "",
    preferredTime1: "",
    preferredDay2: "",
    preferredTime2: "",
    preferredDay3: "",
    preferredTime3: "",
    tourType: "in-person",
    firstName: "",
    lastName: "",
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
        .eq("type", businessType)
        .single();

      if (!business) throw new Error("Business not found");

      const preferredDates = [
        formData.preferredDay1 && formData.preferredTime1 ? `${formData.preferredDay1} ${formData.preferredTime1}` : null,
        formData.preferredDay2 && formData.preferredTime2 ? `${formData.preferredDay2} ${formData.preferredTime2}` : null,
        formData.preferredDay3 && formData.preferredTime3 ? `${formData.preferredDay3} ${formData.preferredTime3}` : null,
      ].filter(Boolean);

      const { error } = await supabase.from("leads").insert({
        business_id: business.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        source: "tour_request_modal",
        event_type: "tour",
        notes: `Tour Type: ${formData.tourType}\nPreferred Times: ${preferredDates.join(", ")}`,
        status: "new",
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      toast({
        title: "Unable to submit",
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
        preferredDay1: "",
        preferredTime1: "",
        preferredDay2: "",
        preferredTime2: "",
        preferredDay3: "",
        preferredTime3: "",
        tourType: "in-person",
        firstName: "",
        lastName: "",
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
            <h3 className="text-2xl font-bold mb-2">Tour Request Received</h3>
            <p className="text-muted-foreground mb-6">
              We'll reach out within 24 hours to confirm your tour time.
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-accent" />
            Schedule a Tour
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            See the space in person or virtually — we'll confirm a time that works.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Tour Type */}
          <div className="space-y-2">
            <Label>Tour Type</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={formData.tourType === "in-person" ? "default" : "outline"}
                className={`flex-1 ${formData.tourType === "in-person" ? "bg-accent text-primary" : ""}`}
                onClick={() => setFormData(prev => ({ ...prev, tourType: "in-person" }))}
              >
                <MapPin className="h-4 w-4 mr-2" />
                In-Person
              </Button>
              <Button
                type="button"
                variant={formData.tourType === "virtual" ? "default" : "outline"}
                className={`flex-1 ${formData.tourType === "virtual" ? "bg-accent text-primary" : ""}`}
                onClick={() => setFormData(prev => ({ ...prev, tourType: "virtual" }))}
              >
                <Video className="h-4 w-4 mr-2" />
                Virtual
              </Button>
            </div>
          </div>

          {/* Preferred Times */}
          <div className="space-y-4">
            <Label>Preferred Day/Time Windows (select up to 3)</Label>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className="grid grid-cols-2 gap-2">
                <Select
                  value={formData[`preferredDay${num}` as keyof typeof formData] as string}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, [`preferredDay${num}`]: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Day ${num}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData[`preferredTime${num}` as keyof typeof formData] as string}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, [`preferredTime${num}`]: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="border-t border-border pt-6 space-y-4">
            <h4 className="font-semibold">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
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
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.firstName || !formData.email || (!formData.preferredDay1 && !formData.preferredTime1)}
              className="bg-accent hover:bg-accent/90 text-primary font-bold"
              data-event="hive_schedule_tour_submit"
            >
              {isSubmitting ? "Submitting..." : "Request Tour"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              <Check className="h-3 w-3 inline mr-1" />
              We'll confirm within 24 hours
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
