import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format, addHours, setHours, setMinutes } from "date-fns";
import { 
  CalendarDays, 
  Users, 
  Check, 
  X, 
  Plus, 
  Heart, 
  Building2, 
  PartyPopper,
  Loader2,
  ArrowRight,
  MapPin
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SummitRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillEventType?: string;
  prefillQuestion?: string;
}

const EVENT_TYPES = [
  { id: "wedding", name: "Wedding", icon: Heart },
  { id: "corporate", name: "Corporate", icon: Building2 },
  { id: "party", name: "Private Party", icon: PartyPopper },
];

const GUEST_RANGES = [
  { label: "1–50", value: "1-50" },
  { label: "51–120", value: "51-120" },
  { label: "121–200", value: "121-200" },
  { label: "201–300", value: "201-300" },
];

const BUDGET_OPTIONS = [
  { label: "Value", value: "value" },
  { label: "Standard", value: "standard" },
  { label: "Premium", value: "premium" },
  { label: "Not sure", value: "unsure" },
];

export function SummitRequestModal({ 
  open, 
  onOpenChange, 
  prefillEventType,
  prefillQuestion 
}: SummitRequestModalProps) {
  const navigate = useNavigate();
  const { user, authUser } = useAuth();
  const { data: business } = useBusinessByType("summit");
  const { data: bookableTypes } = useBookableTypes(business?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(prefillEventType || "");
  const [preferredDates, setPreferredDates] = useState<Date[]>([]);
  const [guestRange, setGuestRange] = useState("");
  const [customGuestCount, setCustomGuestCount] = useState("");
  const [budgetComfort, setBudgetComfort] = useState("");
  const [wantsTour, setWantsTour] = useState(false);
  const [notes, setNotes] = useState(prefillQuestion || "");

  // Summit time + duration (request-only, no slot holds)
  const [startTime, setStartTime] = useState("17:00"); // default 5:00 PM
  const [durationHours, setDurationHours] = useState("4"); // default 4 hours
  
  // Contact info for guests
  const [guestName, setGuestName] = useState(
    authUser?.profile?.first_name 
      ? `${authUser.profile.first_name} ${authUser.profile.last_name || ""}`.trim() 
      : ""
  );
  const [guestEmail, setGuestEmail] = useState(authUser?.profile?.email || "");
  const [guestPhone, setGuestPhone] = useState(authUser?.profile?.phone || "");

  // Wedding-specific fields
  const [ceremonyIncluded, setCeremonyIncluded] = useState<boolean | null>(null);

  // Corporate-specific fields
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (prefillEventType) setSelectedEventType(prefillEventType);
    if (prefillQuestion) setNotes(prefillQuestion);
  }, [prefillEventType, prefillQuestion]);

  const addDate = (date: Date | undefined) => {
    if (date && preferredDates.length < 3) {
      const exists = preferredDates.some(d => d.toDateString() === date.toDateString());
      if (!exists) {
        setPreferredDates([...preferredDates, date]);
      }
    }
  };

  const removeDate = (index: number) => {
    setPreferredDates(preferredDates.filter((_, i) => i !== index));
  };

  const getBookableTypeId = () => {
    if (!bookableTypes) return null;
    const typeMap: Record<string, string> = {
      wedding: "Wedding",
      corporate: "Corporate Event",
      party: "Private Party",
    };
    const typeName = typeMap[selectedEventType] || selectedEventType;
    const type = bookableTypes.find(t => 
      t.name.toLowerCase().includes(typeName.toLowerCase()) ||
      t.slug.toLowerCase().includes(selectedEventType.toLowerCase())
    );
    return type?.id || bookableTypes[0]?.id;
  };

  const formatSubmitError = (err: unknown) => {
    const anyErr = err as any;
    const msg =
      (typeof anyErr?.message === "string" && anyErr.message) ||
      (typeof anyErr?.error === "string" && anyErr.error) ||
      (typeof anyErr?.error_description === "string" && anyErr.error_description) ||
      (typeof anyErr?.details === "string" && anyErr.details) ||
      (typeof anyErr?.hint === "string" && anyErr.hint) ||
      (typeof err === "string" ? err : "");
    if (msg) return msg;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!business || !selectedEventType || preferredDates.length === 0) {
      toast.error("Please fill in all required fields", {
        description: "Event type and at least one preferred date are required."
      });
      return;
    }

    if (!user && (!guestEmail || !guestName)) {
      toast.error("Please provide your contact information");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookableTypeId = getBookableTypeId();
      if (!bookableTypeId) throw new Error("No bookable type found");

      const guestCount = customGuestCount 
        ? parseInt(customGuestCount) 
        : guestRange 
          ? parseInt(guestRange.split("-")[1]) 
          : null;

      const baseDate = preferredDates[0];
      const [hhStr, mmStr] = startTime.split(":");
      const hh = Number(hhStr);
      const mm = Number(mmStr);
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
        throw new Error("Invalid start time");
      }

      const startDate = setMinutes(setHours(baseDate, hh), mm);
      const durationH = Math.max(1, Math.min(12, Number(durationHours || 1)));
      const endDate = addHours(startDate, durationH);

      // Summit hours: 9:00 AM – 9:00 PM (local). Enforce client-side too.
      const startMins = startDate.getHours() * 60 + startDate.getMinutes();
      const endMins = endDate.getHours() * 60 + endDate.getMinutes();
      const OPEN_MINS = 9 * 60;
      const CLOSE_MINS = 21 * 60;
      if (startMins < OPEN_MINS || startMins >= CLOSE_MINS) {
        throw new Error("Start time must be between 9:00 AM and 9:00 PM");
      }
      if (endMins > CLOSE_MINS) {
        throw new Error("End time must be 9:00 PM or earlier. Please reduce duration or choose an earlier start time.");
      }
      
      const bookingData = {
        business_id: business.id,
        bookable_type_id: bookableTypeId,
        guest_name: guestName || null,
        guest_email: guestEmail || null,
        guest_phone: guestPhone || null,
        guest_count: guestCount,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        notes: [
          `Event Type: ${selectedEventType}`,
          `Preferred Dates: ${preferredDates.map(d => format(d, "PPP")).join(", ")}`,
          `Requested Start Time: ${format(startDate, "h:mm a")}`,
          `Requested Duration: ${durationH} hour${durationH === 1 ? "" : "s"}`,
          `Requested End Time: ${format(endDate, "h:mm a")}`,
          `Guest Range: ${guestRange || customGuestCount || "Not specified"}`,
          `Budget Comfort: ${budgetComfort || "Not specified"}`,
          wantsTour ? "Wants venue tour: Yes" : "",
          selectedEventType === "wedding" && ceremonyIncluded !== null 
            ? `Ceremony included: ${ceremonyIncluded ? "Yes" : "No"}` 
            : "",
          selectedEventType === "corporate" && companyName 
            ? `Company: ${companyName}` 
            : "",
          notes ? `Additional notes: ${notes}` : "",
        ].filter(Boolean).join("\n"),
      };

      // IMPORTANT: Summit requests are submitted via backend function to avoid anonymous RLS failures.
      const { data, error } = await supabase.functions.invoke("summit-request", {
        body: bookingData,
      });
      if (error) throw error;
      if (!data?.booking_id) throw new Error("Submit succeeded but no booking_id was returned.");

      // Best-effort audit log (do not block submission for public/anon users)
      try {
        await supabase.from("audit_log").insert([
          {
            entity_type: "booking",
            entity_id: data.booking_id,
            action_type: "summit_event_request",
            after_json: {
              event_type: selectedEventType,
              guest_range: guestRange,
              budget_comfort: budgetComfort,
              wants_tour: wantsTour,
              notifications: data?.notify,
            } as any,
          },
        ]);
      } catch {
        // ignore
      }

      setIsSuccess(true);
      
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        navigate(`/booking/confirmation?id=${data.booking_id}&pending=true`);
      }, 2000);
    } catch (error) {
      console.error("[SummitRequestModal] Submit failed", {
        error,
        selectedEventType,
        preferredDates: preferredDates.map((d) => d.toISOString()),
        businessId: business?.id,
      });
      const message = formatSubmitError(error);
      toast.error("Unable to submit — please try again.", {
        description: message?.slice(0, 280) || "If this continues, please contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = selectedEventType && preferredDates.length > 0 && (user || (guestName && guestEmail));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="summit-request-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Request Your Event</DialogTitle>
          <DialogDescription id="summit-request-description">
            Tell us about your vision — we'll respond within 24 hours with a tailored proposal.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 text-center" role="status" aria-live="polite">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <p className="font-semibold text-xl mb-2">Request Submitted!</p>
            <p className="text-muted-foreground">
              Request submitted — awaiting approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Event Type *</Label>
              <div className="grid grid-cols-3 gap-3">
                {EVENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedEventType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedEventType(type.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-center",
                        "hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        isSelected 
                          ? "border-accent bg-accent/10" 
                          : "border-border bg-card"
                      )}
                      data-event="summit_event_type_select"
                    >
                      <Icon className={cn(
                        "h-6 w-6 mx-auto mb-2",
                        isSelected ? "text-accent" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {type.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Dates (up to 3) */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Preferred Dates * (up to 3)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {preferredDates.map((date, i) => (
                  <div 
                    key={i} 
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-full text-sm"
                  >
                    <CalendarDays className="h-3.5 w-3.5 text-accent" />
                    {format(date, "MMM d, yyyy")}
                    <button
                      type="button"
                      onClick={() => removeDate(i)}
                      className="hover:text-destructive"
                      aria-label={`Remove ${format(date, "MMM d, yyyy")}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {preferredDates.length < 3 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      onSelect={addDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Start time + duration (Summit hours: 9 AM - 9 PM) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Requested Start Time *</Label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={cn(
                    "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  )}
                >
                  {Array.from({ length: (21 - 9) * 4 }, (_, i) => {
                    const totalMins = 9 * 60 + i * 15;
                    const hh = Math.floor(totalMins / 60);
                    const mm = totalMins % 60;
                    const value = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
                    const label = format(setMinutes(setHours(new Date(), hh), mm), "h:mm a");
                    return (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <p className="text-xs text-muted-foreground">Available daily 9:00 AM – 9:00 PM</p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Requested Duration *</Label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className={cn(
                    "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  )}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={String(h)}>
                      {h} hour{h === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">We’ll confirm the final schedule during approval.</p>
              </div>
            </div>

            {/* Guest Count Range Presets */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Estimated Guests</Label>
              <div className="flex flex-wrap gap-2">
                {GUEST_RANGES.map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => {
                      setGuestRange(range.value);
                      setCustomGuestCount("");
                    }}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm font-medium",
                      "hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      guestRange === range.value 
                        ? "border-accent bg-accent/10 text-foreground" 
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
                <Input
                  type="number"
                  placeholder="Custom"
                  value={customGuestCount}
                  onChange={(e) => {
                    setCustomGuestCount(e.target.value);
                    setGuestRange("");
                  }}
                  className="w-24"
                  min={1}
                  max={500}
                />
              </div>
            </div>

            {/* Budget Comfort Range */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Budget Comfort Level</Label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setBudgetComfort(option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all text-sm font-medium",
                      "hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      budgetComfort === option.value 
                        ? "border-accent bg-accent/10 text-foreground" 
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Fields by Event Type */}
            {selectedEventType === "wedding" && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                <Label className="text-sm font-medium">Will this include a ceremony?</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCeremonyIncluded(true)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                      ceremonyIncluded === true 
                        ? "border-accent bg-accent/10" 
                        : "border-border"
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCeremonyIncluded(false)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                      ceremonyIncluded === false 
                        ? "border-accent bg-accent/10" 
                        : "border-border"
                    )}
                  >
                    No, reception only
                  </button>
                </div>
              </div>
            )}

            {selectedEventType === "corporate" && (
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your organization"
                />
              </div>
            )}

            {/* Contact Information (for guests) */}
            {!user && (
              <Card className="border-border">
                <CardContent className="pt-4 space-y-4">
                  <Label className="text-base font-semibold">Contact Information</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guest-name">Your Name *</Label>
                      <Input
                        id="guest-name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guest-email">Email *</Label>
                      <Input
                        id="guest-email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-phone">Phone (optional)</Label>
                    <Input
                      id="guest-phone"
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tour Request */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="wants-tour"
                checked={wantsTour}
                onCheckedChange={(checked) => setWantsTour(checked === true)}
              />
              <Label htmlFor="wants-tour" className="text-sm cursor-pointer flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                I'd like to tour the venue
              </Label>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us about your vision, special requirements, or questions..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold"
                disabled={isSubmitting || !isValid}
                data-event="summit_request_submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                No obligation — review everything before you commit.
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
