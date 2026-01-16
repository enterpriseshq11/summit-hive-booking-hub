import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateOfficeInquiry, type InquiryType } from "@/hooks/useOfficeInquiries";
import { type OfficeListing } from "@/hooks/useOfficeListings";
import { Loader2, Check, Building2, Calendar, MessageSquare, Clock } from "lucide-react";

interface OfficeInquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  office?: OfficeListing;
  inquiryType: InquiryType;
}

const typeConfig: Record<InquiryType, { 
  title: string; 
  description: string; 
  icon: typeof Building2;
  submitLabel: string;
}> = {
  request: {
    title: "Request This Office",
    description: "Tell us about your needs and we'll get back to you within 24 hours.",
    icon: Building2,
    submitLabel: "Submit Request",
  },
  tour: {
    title: "Schedule a Tour",
    description: "See the space in person. We'll confirm your tour within 24 hours.",
    icon: Calendar,
    submitLabel: "Request Tour",
  },
  waitlist: {
    title: "Join the Waitlist",
    description: "Be first to know when this space becomes available.",
    icon: Clock,
    submitLabel: "Join Waitlist",
  },
  question: {
    title: "Ask a Question",
    description: "Have questions about this space? We're here to help.",
    icon: MessageSquare,
    submitLabel: "Send Question",
  },
};

const moveInOptions = [
  { value: "immediately", label: "Immediately" },
  { value: "1_month", label: "Within 1 month" },
  { value: "1_3_months", label: "1-3 months" },
  { value: "3_6_months", label: "3-6 months" },
  { value: "6_plus_months", label: "6+ months" },
  { value: "flexible", label: "Flexible" },
];

const tourTypeOptions = [
  { value: "in_person", label: "In-Person Tour" },
  { value: "virtual", label: "Virtual Tour" },
  { value: "either", label: "Either works" },
];

export function OfficeInquiryModal({ 
  open, 
  onOpenChange, 
  office,
  inquiryType 
}: OfficeInquiryModalProps) {
  const createInquiry = useCreateOfficeInquiry();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_name: "",
    workspace_type: office?.office_type || "",
    move_in_timeframe: "",
    seats_needed: "",
    message: "",
    needs_meeting_rooms: false,
    needs_business_address: false,
    tour_type: "in_person",
  });

  const config = typeConfig[inquiryType];
  const IconComponent = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createInquiry.mutateAsync({
      office_id: office?.id || null,
      inquiry_type: inquiryType,
      first_name: formData.first_name,
      last_name: formData.last_name || null,
      email: formData.email,
      phone: formData.phone || null,
      company_name: formData.company_name || null,
      workspace_type: formData.workspace_type || null,
      move_in_timeframe: formData.move_in_timeframe || null,
      seats_needed: formData.seats_needed ? parseInt(formData.seats_needed) : null,
      message: formData.message || null,
      needs_meeting_rooms: formData.needs_meeting_rooms,
      needs_business_address: formData.needs_business_address,
      tour_type: inquiryType === "tour" ? formData.tour_type : null,
      source: "website",
    });

    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company_name: "",
        workspace_type: office?.office_type || "",
        move_in_timeframe: "",
        seats_needed: "",
        message: "",
        needs_meeting_rooms: false,
        needs_business_address: false,
        tour_type: "in_person",
      });
    }, 300);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thanks for reaching out. We'll get back to you within 24 hours.
            </p>
            <Button onClick={handleClose} className="bg-accent hover:bg-accent/90 text-primary">
              Close
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
          
          {office && (
            <div className="bg-muted/50 p-3 rounded-lg mt-4">
              <p className="text-sm text-muted-foreground">Selected Office:</p>
              <p className="font-medium">{office.name}</p>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Smith"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Acme Inc."
            />
          </div>

          {/* Request-specific fields */}
          {(inquiryType === "request" || inquiryType === "waitlist") && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="move_in_timeframe">Move-in Timeframe</Label>
                  <Select 
                    value={formData.move_in_timeframe} 
                    onValueChange={(v) => setFormData({ ...formData, move_in_timeframe: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      {moveInOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="seats_needed">Seats Needed</Label>
                  <Input
                    id="seats_needed"
                    type="number"
                    min="1"
                    value={formData.seats_needed}
                    onChange={(e) => setFormData({ ...formData, seats_needed: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Additional needs */}
              <div className="space-y-3">
                <Label>Additional Needs</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_meeting_rooms"
                    checked={formData.needs_meeting_rooms}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, needs_meeting_rooms: checked as boolean })
                    }
                  />
                  <label htmlFor="needs_meeting_rooms" className="text-sm cursor-pointer">
                    I need meeting room access
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_business_address"
                    checked={formData.needs_business_address}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, needs_business_address: checked as boolean })
                    }
                  />
                  <label htmlFor="needs_business_address" className="text-sm cursor-pointer">
                    I need a business address
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Tour-specific fields */}
          {inquiryType === "tour" && (
            <div>
              <Label htmlFor="tour_type">Tour Preference</Label>
              <Select 
                value={formData.tour_type} 
                onValueChange={(v) => setFormData({ ...formData, tour_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tourTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Message */}
          <div>
            <Label htmlFor="message">
              {inquiryType === "question" ? "Your Question *" : "Additional Information"}
            </Label>
            <Textarea
              id="message"
              required={inquiryType === "question"}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={inquiryType === "question" 
                ? "What would you like to know about this space?"
                : "Anything else we should know?"
              }
              rows={3}
            />
          </div>

          {/* Trust Signal */}
          <p className="text-xs text-muted-foreground text-center">
            No obligation. We'll respond within 24 hours. Your information is secure.
          </p>

          {/* Submit */}
          <Button 
            type="submit" 
            disabled={createInquiry.isPending}
            className="w-full bg-accent hover:bg-accent/90 text-primary"
          >
            {createInquiry.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              config.submitLabel
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
