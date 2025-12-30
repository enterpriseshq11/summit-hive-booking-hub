import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, Building2, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CoworkingRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedType?: string;
}

const workspaceTypes = [
  { value: "private-office", label: "Private Office" },
  { value: "dedicated-desk", label: "Dedicated Desk" },
  { value: "day-pass", label: "Day Pass" },
];

const moveInTimeframes = [
  { value: "immediately", label: "Immediately" },
  { value: "2-weeks", label: "Within 2 weeks" },
  { value: "1-month", label: "Within 1 month" },
  { value: "2-3-months", label: "2-3 months" },
  { value: "flexible", label: "Flexible / Not sure" },
];

const seatPresets = [1, 2, 3, 4, "5+"];

const budgetOptions = [
  { value: "value", label: "Value-focused" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "not-sure", label: "Not sure yet" },
];

export function CoworkingRequestModal({ open, onOpenChange, preselectedType }: CoworkingRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    workspaceType: preselectedType || "",
    moveInTimeframe: "",
    seats: "",
    needsMeetingRooms: false,
    needsBusinessAddress: false,
    budget: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  const handleSeatSelect = (seat: number | string) => {
    setFormData(prev => ({ ...prev, seats: seat.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get coworking business ID
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("type", "coworking")
        .single();

      if (!business) throw new Error("Business not found");

      const { error } = await supabase.from("leads").insert({
        business_id: business.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company,
        source: "coworking_request_modal",
        notes: `Workspace Type: ${formData.workspaceType}\nMove-in: ${formData.moveInTimeframe}\nSeats: ${formData.seats}\nMeeting Rooms: ${formData.needsMeetingRooms ? "Yes" : "No"}\nBusiness Address: ${formData.needsBusinessAddress ? "Yes" : "No"}\nBudget: ${formData.budget}\n\nNotes: ${formData.notes}`,
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
        workspaceType: "",
        moveInTimeframe: "",
        seats: "",
        needsMeetingRooms: false,
        needsBusinessAddress: false,
        budget: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        notes: "",
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
            <h3 className="text-2xl font-bold mb-2">Request Received</h3>
            <p className="text-muted-foreground mb-6">
              Our team will review your request and get back to you within 24 hours with availability and options.
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5 text-accent" />
            Request Your Workspace
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Tell us what you need — we'll confirm options within 24 hours.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Workspace Type */}
          <div className="space-y-2">
            <Label>Workspace Type *</Label>
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

          {/* Move-in Timeframe */}
          <div className="space-y-2">
            <Label>When do you need space? *</Label>
            <Select
              value={formData.moveInTimeframe}
              onValueChange={(value) => setFormData(prev => ({ ...prev, moveInTimeframe: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {moveInTimeframes.map(timeframe => (
                  <SelectItem key={timeframe.value} value={timeframe.value}>{timeframe.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seats Needed */}
          <div className="space-y-2">
            <Label>Seats Needed</Label>
            <div className="flex flex-wrap gap-2">
              {seatPresets.map(seat => (
                <Button
                  key={seat}
                  type="button"
                  variant={formData.seats === seat.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSeatSelect(seat)}
                  className={formData.seats === seat.toString() ? "bg-accent text-primary hover:bg-accent/90" : ""}
                >
                  {seat}
                </Button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="meeting-rooms">Need meeting room access?</Label>
              <Switch
                id="meeting-rooms"
                checked={formData.needsMeetingRooms}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, needsMeetingRooms: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="business-address">Interested in business address?</Label>
              <Switch
                id="business-address"
                checked={formData.needsBusinessAddress}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, needsBusinessAddress: checked }))}
              />
            </div>
          </div>

          {/* Budget Comfort */}
          <div className="space-y-2">
            <Label>Budget Comfort Level</Label>
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  variant={formData.budget === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, budget: option.value }))}
                  className={formData.budget === option.value ? "bg-accent text-primary hover:bg-accent/90" : ""}
                >
                  {option.label}
                </Button>
              ))}
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Anything else we should know?</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.workspaceType || !formData.moveInTimeframe || !formData.firstName || !formData.email}
              className="bg-accent hover:bg-accent/90 text-primary font-bold"
              data-event="hive_request_workspace_submit"
            >
              {isSubmitting ? "Submitting..." : "Request Workspace"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              <Check className="h-3 w-3 inline mr-1" />
              No obligation • Response within 24 hours
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
