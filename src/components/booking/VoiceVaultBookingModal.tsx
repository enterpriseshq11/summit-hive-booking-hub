import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VoiceVaultBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: "hourly" | "core_series" | "white_glove";
}

type Step = "type" | "details" | "contact" | "payment";

export function VoiceVaultBookingModal({
  open,
  onOpenChange,
  initialType,
}: VoiceVaultBookingModalProps) {
  const [step, setStep] = useState<Step>("type");
  const [loading, setLoading] = useState(false);

  // Form state
  const [bookingType, setBookingType] = useState<"hourly" | "core_series" | "white_glove">(
    initialType || "hourly"
  );
  const [paymentPlan, setPaymentPlan] = useState<"full" | "weekly">("weekly");

  // Hourly booking details
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [durationHours, setDurationHours] = useState("2");

  // Contact info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const resetForm = () => {
    setStep("type");
    setBookingType(initialType || "hourly");
    setPaymentPlan("weekly");
    setBookingDate("");
    setStartTime("09:00");
    setDurationHours("2");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const calculateEndTime = (start: string, hours: number): string => {
    const [h, m] = start.split(":").map(Number);
    const endHour = h + hours;
    return `${String(endHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        type: bookingType,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      };

      if (bookingType === "hourly") {
        payload.booking_date = bookingDate;
        payload.start_time = startTime;
        payload.end_time = calculateEndTime(startTime, parseInt(durationHours));
        payload.duration_hours = parseInt(durationHours);
      } else {
        payload.payment_plan = paymentPlan;
      }

      const { data, error } = await supabase.functions.invoke("voice-vault-checkout", {
        body: payload,
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, "_blank");
        toast.success("Redirecting to secure payment...");
        handleClose();
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const canProceedFromType = bookingType !== null;
  const canProceedFromDetails = bookingType === "hourly" 
    ? bookingDate && startTime && parseInt(durationHours) >= 2
    : paymentPlan !== null;
  const canProceedFromContact = customerName && customerEmail;

  const getStepTitle = () => {
    switch (step) {
      case "type":
        return "What would you like to book?";
      case "details":
        return bookingType === "hourly" ? "Choose Your Time" : "Choose Your Payment Plan";
      case "contact":
        return "Your Information";
      case "payment":
        return "Review & Pay";
      default:
        return "";
    }
  };

  const getPackagePrice = () => {
    if (bookingType === "core_series") return paymentPlan === "full" ? "$5,000" : "$100/week";
    if (bookingType === "white_glove") return paymentPlan === "full" ? "$8,000" : "$160/week";
    return `$${parseInt(durationHours) * 45}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-accent" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>
            {step === "type" && "Select how you'd like to use Voice Vault"}
            {step === "details" && (bookingType === "hourly" ? "Choose your preferred date and time" : "Select how you'd like to pay")}
            {step === "contact" && "We'll use this to confirm your booking"}
            {step === "payment" && "Review your selection and proceed to payment"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Step 1: Type Selection */}
          {step === "type" && (
            <RadioGroup
              value={bookingType}
              onValueChange={(v) => setBookingType(v as typeof bookingType)}
              className="space-y-3"
            >
              <label
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  bookingType === "hourly" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
              >
                <RadioGroupItem value="hourly" className="mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Hourly Studio Rental</p>
                  <p className="text-sm text-muted-foreground">$45/hour • 2-hour minimum</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  bookingType === "core_series" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
              >
                <RadioGroupItem value="core_series" className="mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Core Series Package</p>
                  <p className="text-sm text-muted-foreground">$100/week • 10 episodes included</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  bookingType === "white_glove" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
              >
                <RadioGroupItem value="white_glove" className="mt-1" />
                <div>
                  <p className="font-semibold text-foreground">White Glove Package</p>
                  <p className="text-sm text-muted-foreground">$160/week • Full production support</p>
                </div>
              </label>
            </RadioGroup>
          )}

          {/* Step 2: Details */}
          {step === "details" && bookingType === "hourly" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-date">Date</Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                        <SelectItem key={hour} value={`${String(hour).padStart(2, "0")}:00`}>
                          {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 ${hour === 12 ? "PM" : "AM"}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={durationHours} onValueChange={setDurationHours}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map((hours) => (
                        <SelectItem key={hours} value={String(hours)}>
                          {hours} hours
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-accent">${parseInt(durationHours) * 45}</span>
                </div>
              </div>
            </div>
          )}

          {step === "details" && bookingType !== "hourly" && (
            <div className="space-y-4">
              <RadioGroup
                value={paymentPlan}
                onValueChange={(v) => setPaymentPlan(v as "full" | "weekly")}
                className="space-y-3"
              >
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentPlan === "weekly" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                  }`}
                >
                  <RadioGroupItem value="weekly" className="mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Weekly Payment Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingType === "core_series" ? "$100/week for 50 weeks" : "$160/week for 50 weeks"}
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentPlan === "full" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                  }`}
                >
                  <RadioGroupItem value="full" className="mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Pay in Full</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingType === "core_series" ? "$5,000 one-time" : "$8,000 one-time"}
                    </p>
                  </div>
                </label>
              </RadioGroup>

              <div className="bg-accent/10 rounded-lg p-4 border border-accent/30">
                <p className="text-sm text-foreground">
                  <strong>Note:</strong> Full content ownership is released after all payments are complete.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Contact */}
          {step === "contact" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Full Name *</Label>
                <Input
                  id="customer-name"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-email">Email *</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone (optional)</Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === "payment" && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 border border-border space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium text-foreground">
                    {bookingType === "hourly" && `Studio Rental (${durationHours} hrs)`}
                    {bookingType === "core_series" && "Core Series Package"}
                    {bookingType === "white_glove" && "White Glove Package"}
                  </span>
                </div>
                {bookingType === "hourly" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium text-foreground">
                      {bookingDate} at {startTime}
                    </span>
                  </div>
                )}
                {bookingType !== "hourly" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Plan</span>
                    <span className="font-medium text-foreground">
                      {paymentPlan === "weekly" ? "Weekly" : "Pay in Full"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{customerEmail}</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-accent">{getPackagePrice()}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By proceeding, you agree to the Voice Vault Studio & Content Terms.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {step !== "type" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === "details") setStep("type");
                  if (step === "contact") setStep("details");
                  if (step === "payment") setStep("contact");
                }}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              disabled={
                loading ||
                (step === "type" && !canProceedFromType) ||
                (step === "details" && !canProceedFromDetails) ||
                (step === "contact" && !canProceedFromContact)
              }
              onClick={() => {
                if (step === "type") setStep("details");
                else if (step === "details") setStep("contact");
                else if (step === "contact") setStep("payment");
                else if (step === "payment") handleSubmit();
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : step === "payment" ? (
                <>
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
