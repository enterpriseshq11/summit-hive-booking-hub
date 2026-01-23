import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, Building2, ArrowRight, CheckCircle, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CoworkingRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedType?: string;
  preselectedOfficeCode?: string;
}

const workspaceTypes = [
  { value: "private-office", label: "Private Office" },
  { value: "dedicated-desk", label: "Dedicated Desk" },
  { value: "day-pass", label: "Day Pass" },
];

const officeOptions = [
  { value: "S1", label: "S1 — Standard (2nd floor)" },
  { value: "S2", label: "S2 — Standard (2nd floor)" },
  { value: "P1", label: "P1 — Premium (1st floor)" },
  { value: "P2", label: "P2 — Premium (1st floor)" },
];

const leaseTermOptions = [
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
];

function normalizeWorkspaceType(input?: string) {
  if (!input) return "";
  const v = input.toLowerCase();
  if (v === "private office" || v === "private-office") return "private-office";
  if (v === "dedicated desk" || v === "dedicated-desk") return "dedicated-desk";
  if (v === "day pass" || v === "day-pass") return "day-pass";
  return input;
}

function pricingForOffice(officeCode?: string, termMonths?: number) {
  if (!officeCode || !termMonths) return null;
  const isPremium = officeCode.startsWith("P");
  const monthly = isPremium ? 550 : 350;
  const deposit = isPremium ? 500 : 350;
  const termTotal = monthly * termMonths;
  return { monthly, deposit, termTotal };
}

function formatUSD(amount: number) {
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

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

export function CoworkingRequestModal({ open, onOpenChange, preselectedType, preselectedOfficeCode }: CoworkingRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    workspaceType: normalizeWorkspaceType(preselectedType) || "",
    moveInTimeframe: "",
    seats: "",
    needsMeetingRooms: false,
    needsBusinessAddress: false,
    budget: "",
    fullName: "",
    email: "",
    phone: "",
    company: "",
    notes: "",

    // Hive private office lease request fields
    officeCode: "",
    leaseTermMonths: "",
  });

  // If a user clicks an office card, open the modal pre-filled.
  useEffect(() => {
    if (!open) return;
    if (!preselectedOfficeCode) return;
    setFormData((prev) => ({
      ...prev,
      workspaceType: "private-office",
      officeCode: preselectedOfficeCode,
    }));
  }, [open, preselectedOfficeCode]);

  // Keep workspace type synced when opened from CTA.
  useEffect(() => {
    if (!open) return;
    const normalized = normalizeWorkspaceType(preselectedType);
    if (!normalized) return;
    setFormData((prev) => ({
      ...prev,
      workspaceType: normalized,
    }));
  }, [open, preselectedType]);

  const isPrivateOffice = formData.workspaceType === "private-office";
  const termMonths = useMemo(
    () => (formData.leaseTermMonths ? Number(formData.leaseTermMonths) : undefined),
    [formData.leaseTermMonths]
  );
  const pricing = useMemo(
    () => (isPrivateOffice ? pricingForOffice(formData.officeCode, termMonths) : null),
    [isPrivateOffice, formData.officeCode, termMonths]
  );

  const handleSeatSelect = (seat: number | string) => {
    setFormData(prev => ({ ...prev, seats: seat.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEmailWarning(null);

    try {
      const isPrivateOffice = formData.workspaceType === "private-office";
      const termMonths = formData.leaseTermMonths ? Number(formData.leaseTermMonths) : undefined;
      const pricing = isPrivateOffice ? pricingForOffice(formData.officeCode, termMonths) : null;

      if (isPrivateOffice) {
        if (!formData.officeCode || !termMonths || !pricing) {
          throw new Error("Missing office pricing selection");
        }
      }

      const fullName = (formData.fullName || "").trim();
      const [firstName, ...rest] = fullName.split(/\s+/).filter(Boolean);
      const lastName = rest.length ? rest.join(" ") : null;

      const messageLines: string[] = [];
      messageLines.push(`Workspace Type: ${formData.workspaceType}`);
      if (isPrivateOffice) {
        messageLines.push(`Office: ${formData.officeCode}`);
        messageLines.push(`Lease Term: ${termMonths} months`);
        messageLines.push(`Monthly: ${formatUSD(pricing!.monthly)}`);
        messageLines.push(`Term Total: ${formatUSD(pricing!.termTotal)}`);
        messageLines.push(`Deposit/Down: ${formatUSD(pricing!.deposit)}`);
        messageLines.push(`Request-based — no payment collected now.`);
      }
      messageLines.push(`Move-in: ${formData.moveInTimeframe}`);
      messageLines.push(`Seats: ${formData.seats}`);
      messageLines.push(`Meeting Rooms: ${formData.needsMeetingRooms ? "Yes" : "No"}`);
      messageLines.push(`Business Address: ${formData.needsBusinessAddress ? "Yes" : "No"}`);
      messageLines.push(`Budget: ${formData.budget}`);
      if (formData.notes) messageLines.push(`\nNotes: ${formData.notes}`);

      const { error } = await supabase.from("office_inquiries").insert({
        inquiry_type: isPrivateOffice ? "lease_request" : "request",
        first_name: firstName || fullName || "Customer",
        last_name: lastName,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company,
        workspace_type: formData.workspaceType || null,
        move_in_timeframe: formData.moveInTimeframe || null,
        seats_needed: formData.seats ? Number(formData.seats) : null,
        needs_meeting_rooms: formData.needsMeetingRooms,
        needs_business_address: formData.needsBusinessAddress,
        message: messageLines.join("\n"),
        source: "hive_office_request",
        status: "new",

        office_code: isPrivateOffice ? formData.officeCode : null,
        lease_term_months: isPrivateOffice ? termMonths! : null,
        monthly_rate: isPrivateOffice ? pricing!.monthly : null,
        term_total: isPrivateOffice ? pricing!.termTotal : null,
        deposit_amount: isPrivateOffice ? pricing!.deposit : null,
        approval_status: "pending",
      });

      if (error) throw error;

      // eslint-disable-next-line no-console
      console.log("HIVE_REQUEST_INSERT_OK", {
        inquiry_type: isPrivateOffice ? "lease_request" : "request",
        office_code: isPrivateOffice ? formData.officeCode : null,
        lease_term_months: isPrivateOffice ? termMonths : null,
      });

      // Notifications (best-effort)
      try {
        const userRes = await supabase.functions.invoke("send-inquiry-notification", {
          body: {
            type: "user_confirmation",
            inquiry: {
              first_name: firstName || fullName || "there",
              last_name: lastName,
              email: formData.email,
              phone: formData.phone,
              company_name: formData.company,
              workspace_type: formData.workspaceType,
              move_in_timeframe: formData.moveInTimeframe,
              seats_needed: formData.seats ? Number(formData.seats) : null,
              inquiry_type: isPrivateOffice ? "lease_request" : "request",
              needs_meeting_rooms: formData.needsMeetingRooms,
              needs_business_address: formData.needsBusinessAddress,
              office_code: isPrivateOffice ? formData.officeCode : null,
              lease_term_months: isPrivateOffice ? termMonths! : null,
              monthly_rate: isPrivateOffice ? pricing!.monthly : null,
              term_total: isPrivateOffice ? pricing!.termTotal : null,
              deposit_amount: isPrivateOffice ? pricing!.deposit : null,
            },
          },
        });
        const staffRes = await supabase.functions.invoke("send-inquiry-notification", {
          body: {
            type: "staff_notification",
            inquiry: {
              first_name: firstName || fullName || "Customer",
              last_name: lastName,
              email: formData.email,
              phone: formData.phone,
              company_name: formData.company,
              workspace_type: formData.workspaceType,
              move_in_timeframe: formData.moveInTimeframe,
              seats_needed: formData.seats ? Number(formData.seats) : null,
              inquiry_type: isPrivateOffice ? "lease_request" : "request",
              needs_meeting_rooms: formData.needsMeetingRooms,
              needs_business_address: formData.needsBusinessAddress,
              office_code: isPrivateOffice ? formData.officeCode : null,
              lease_term_months: isPrivateOffice ? termMonths! : null,
              monthly_rate: isPrivateOffice ? pricing!.monthly : null,
              term_total: isPrivateOffice ? pricing!.termTotal : null,
              deposit_amount: isPrivateOffice ? pricing!.deposit : null,
              message: formData.notes || null,
            },
          },
        });

        // eslint-disable-next-line no-console
        console.log("HIVE_REQUEST_NOTIFY_RESULTS", {
          user: { error: userRes.error?.message || null, data: userRes.data || null },
          staff: { error: staffRes.error?.message || null, data: staffRes.data || null },
        });

        if (userRes.error || staffRes.error || userRes.data?.success === false || staffRes.data?.success === false) {
          setEmailWarning(
            "Request submitted. If you don’t receive an email, we’ll still follow up within 24 hours."
          );
        }
      } catch {
        setEmailWarning(
          "Request submitted. If you don’t receive an email, we’ll still follow up within 24 hours."
        );
      }

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
      setEmailWarning(null);
      setFormData({
        workspaceType: "",
        moveInTimeframe: "",
        seats: "",
        needsMeetingRooms: false,
        needsBusinessAddress: false,
        budget: "",
        fullName: "",
        email: "",
        phone: "",
        company: "",
        notes: "",

        officeCode: "",
        leaseTermMonths: "",
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
              Request received. We’ll reach out shortly to confirm availability and next steps. No payment is required until confirmed.
            </p>
            {emailWarning ? (
              <p className="text-xs text-muted-foreground mb-4">{emailWarning}</p>
            ) : null}
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

          {/* Office + Lease Term (Private Office only) */}
           {isPrivateOffice && (
            <div className="space-y-4 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-accent" />
                <h4 className="font-semibold">Office + Lease Term</h4>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Office *</Label>
                  <Select
                    value={formData.officeCode}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, officeCode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select office" />
                    </SelectTrigger>
                    <SelectContent>
                      {officeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lease Term *</Label>
                  <Select
                    value={formData.leaseTermMonths}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, leaseTermMonths: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaseTermOptions.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

               {(() => {
                 if (!pricing || !termMonths) return null;
                return (
                  <div className="bg-muted/40 border border-border rounded-lg p-4">
                    <p className="text-sm font-medium mb-3">Pricing Breakdown</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Monthly</div>
                       <div className="text-right font-medium">{formatUSD(pricing.monthly)}</div>
                       <div className="text-muted-foreground">Term total ({termMonths} months)</div>
                       <div className="text-right font-medium">{formatUSD(pricing.termTotal)}</div>
                      <div className="text-muted-foreground">Deposit/down</div>
                       <div className="text-right font-medium">{formatUSD(pricing.deposit)}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Request-based — no payment collected now.
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

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
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
              />
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
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                required
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
              disabled={
                isSubmitting ||
                !formData.workspaceType ||
                !formData.moveInTimeframe ||
                !formData.fullName ||
                !formData.email ||
                !formData.phone ||
                (formData.workspaceType === "private-office" && (!formData.officeCode || !formData.leaseTermMonths))
              }
              className="bg-accent hover:bg-accent/90 text-primary font-bold"
              data-event="hive_request_workspace_submit"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              <Check className="h-3 w-3 inline mr-1" />
              Request-based • No payment collected now
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
