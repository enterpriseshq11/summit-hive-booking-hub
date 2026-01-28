import { useState, useMemo } from "react";
import { format, addDays, startOfToday } from "date-fns";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceVaultPaymentsConfig } from "@/hooks/usePaymentConfigs";
import { 
  VOICE_VAULT_PRICING, 
  getPackageDisplayPrice,
  type WhiteGlovePaymentOption 
} from "@/config/voiceVaultPricing";

function isValidEmail(email: string) {
  // Keep it simple: Stripe will reject obviously invalid emails.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function getFunctionErrorMessage(err: unknown) {
  // Supabase functions errors often include a Response on `context`.
  const anyErr = err as any;
  const context = anyErr?.context;

  try {
    if (context instanceof Response) {
      const text = await context.text();
      try {
        const json = JSON.parse(text);
        if (json?.error) return String(json.error);
      } catch {
        // ignore JSON parse
      }
      return text || anyErr?.message;
    }
  } catch {
    // ignore
  }

  return anyErr?.message || "Something went wrong";
}

interface VoiceVaultBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: "hourly" | "core_series" | "white_glove";
}

type Step = "type" | "details" | "contact" | "payment" | "confirmed";

export function VoiceVaultBookingModal({
  open,
  onOpenChange,
  initialType,
}: VoiceVaultBookingModalProps) {
  const [step, setStep] = useState<Step>("type");
  const [loading, setLoading] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  
  // Get payment config
  const { voiceVaultPaymentsEnabled } = useVoiceVaultPaymentsConfig();

  // Form state
  const [bookingType, setBookingType] = useState<"hourly" | "core_series" | "white_glove">(
    initialType || "hourly"
  );
  const [paymentPlan, setPaymentPlan] = useState<"full" | "weekly">("weekly");
  const [whiteGloveOption, setWhiteGloveOption] = useState<WhiteGlovePaymentOption>("standard");

  // Hourly booking details
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
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
    setWhiteGloveOption("standard");
    setBookingDate(undefined);
    setStartTime("09:00");
    setDurationHours("2");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
  };

  const today = startOfToday();
  const maxDate = addDays(today, 60); // Allow booking up to 60 days out

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
      if (!customerName.trim()) {
        toast.error("Please enter your name.");
        return;
      }

      if (!isValidEmail(customerEmail)) {
        toast.error("Please enter a valid email address.");
        return;
      }

      const payload: Record<string, unknown> = {
        type: bookingType,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim() || null,
        skip_payment: bookingType === "hourly" && !voiceVaultPaymentsEnabled,
      };

      if (bookingType === "hourly") {
        payload.booking_date = bookingDate ? format(bookingDate, "yyyy-MM-dd") : "";
        payload.start_time = startTime;
        payload.end_time = calculateEndTime(startTime, parseInt(durationHours));
        payload.duration_hours = parseInt(durationHours);
      } else {
        payload.payment_plan = paymentPlan;
        if (bookingType === "white_glove" && paymentPlan === "weekly") {
          payload.white_glove_option = whiteGloveOption;
        }
      }

      const { data, error } = await supabase.functions.invoke("voice-vault-checkout", {
        body: payload,
      });

      if (error) throw error;

      // Handle pay-on-arrival response
      if (data?.is_pay_on_arrival) {
        setConfirmedBookingId(data.record_id);
        setStep("confirmed");
        toast.success("Booking confirmed! Payment is due on arrival.");
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to secure payment...");
        handleClose();
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      const message = await getFunctionErrorMessage(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const { hourly, coreSeries, whiteGlove } = VOICE_VAULT_PRICING;

  const canProceedFromType = bookingType !== null;
  const canProceedFromDetails = bookingType === "hourly" 
    ? bookingDate && startTime && parseInt(durationHours) >= hourly.minimumHours
    : paymentPlan !== null;
  const canProceedFromContact = customerName.trim().length > 0 && isValidEmail(customerEmail);

  const getStepTitle = () => {
    switch (step) {
      case "type":
        return "What would you like to book?";
      case "details":
        return bookingType === "hourly" ? "Choose Your Time" : "Choose Your Payment Plan";
      case "contact":
        return "Your Information";
      case "payment":
        return "Review & Pay Deposit";
      default:
        return "";
    }
  };

  // Calculate deposit amounts for hourly bookings
  const getHourlyPricing = () => {
    const total = parseInt(durationHours) * hourly.ratePerHour;
    const deposit = Math.round((total / 3) * 100) / 100;
    const remaining = Math.round((total - deposit) * 100) / 100;
    return { total, deposit, remaining };
  };

  const getPackagePrice = () => {
    if (bookingType === "hourly") {
      return `$${parseInt(durationHours) * hourly.ratePerHour}`;
    }
    return getPackageDisplayPrice(
      bookingType, 
      paymentPlan, 
      bookingType === "white_glove" ? whiteGloveOption : undefined
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-accent" />
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
                  <p className="text-sm text-muted-foreground">
                    ${hourly.ratePerHour}/hour • {hourly.minimumHours}-hour minimum
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  bookingType === "core_series" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
              >
                <RadioGroupItem value="core_series" className="mt-1" />
                <div>
                  <p className="font-semibold text-foreground">{coreSeries.name} Package</p>
                  <p className="text-sm text-muted-foreground">
                    ${coreSeries.weeklyPayment}/week for {coreSeries.weeklyTermWeeks} weeks • {coreSeries.episodes} episodes
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or ${coreSeries.totalPrice.toLocaleString()} paid in full
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  bookingType === "white_glove" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
              >
                <RadioGroupItem value="white_glove" className="mt-1" />
                <div>
                  <p className="font-semibold text-foreground">{whiteGlove.name} Package</p>
                  <p className="text-sm text-muted-foreground">
                    ${whiteGlove.paymentOptions.standard.weeklyPayment}/week for {whiteGlove.paymentOptions.standard.termWeeks} weeks • Full production support
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or ${whiteGlove.totalPrice.toLocaleString()} paid in full
                  </p>
                </div>
              </label>
            </RadioGroup>
          )}

          {/* Step 2: Details - Hourly */}
          {step === "details" && bookingType === "hourly" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select a Date</Label>
                <div className="rounded-lg border border-border p-3 bg-card">
                  <CalendarComponent
                    mode="single"
                    selected={bookingDate}
                    onSelect={setBookingDate}
                    disabled={(date) => date < today}
                    fromDate={today}
                    toDate={maxDate}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </div>
                {bookingDate && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: <span className="font-medium text-foreground">{format(bookingDate, "EEEE, MMMM d, yyyy")}</span>
                  </p>
                )}
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
                  <Label htmlFor="duration">Duration (min {hourly.minimumHours} hours)</Label>
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

              {/* Deposit pricing breakdown for hourly bookings */}
              <div className="bg-secondary/50 rounded-lg p-4 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Price</span>
                  <span className="font-medium text-foreground">
                    ${getHourlyPricing().total.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-accent">
                  <span className="font-medium">Deposit Due Today (1/3)</span>
                  <span className="text-xl font-bold">
                    ${getHourlyPricing().deposit.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground text-sm">
                  <span>Remaining Balance Due on Arrival</span>
                  <span className="font-medium">
                    ${getHourlyPricing().remaining.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details - Packages */}
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
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Weekly Payment Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingType === "core_series" 
                        ? `$${coreSeries.weeklyPayment}/week for ${coreSeries.weeklyTermWeeks} weeks`
                        : `$${whiteGlove.paymentOptions.standard.weeklyPayment}/week for ${whiteGlove.paymentOptions.standard.termWeeks} weeks`
                      }
                    </p>
                  </div>
                </label>

                {/* White Glove Accelerated Option */}
                {bookingType === "white_glove" && paymentPlan === "weekly" && (
                  <div className="ml-8 space-y-2">
                    <Label className="text-sm text-muted-foreground">Payment Speed</Label>
                    <RadioGroup
                      value={whiteGloveOption}
                      onValueChange={(v) => setWhiteGloveOption(v as WhiteGlovePaymentOption)}
                      className="space-y-2"
                    >
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          whiteGloveOption === "standard" ? "border-accent/50 bg-accent/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="standard" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Standard</p>
                          <p className="text-xs text-muted-foreground">
                            ${whiteGlove.paymentOptions.standard.weeklyPayment}/week × {whiteGlove.paymentOptions.standard.termWeeks} weeks
                          </p>
                        </div>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          whiteGloveOption === "accelerated" ? "border-accent/50 bg-accent/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="accelerated" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Accelerated Payoff</p>
                          <p className="text-xs text-muted-foreground">
                            ${whiteGlove.paymentOptions.accelerated.weeklyPayment}/week × {whiteGlove.paymentOptions.accelerated.termWeeks} weeks
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>
                )}

                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentPlan === "full" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                  }`}
                >
                  <RadioGroupItem value="full" className="mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">Pay in Full</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingType === "core_series" 
                        ? `$${coreSeries.totalPrice.toLocaleString()} one-time`
                        : `$${whiteGlove.totalPrice.toLocaleString()} one-time`
                      }
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
                    {bookingType === "core_series" && coreSeries.name}
                    {bookingType === "white_glove" && whiteGlove.name}
                  </span>
                </div>
                {bookingType === "hourly" && bookingDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium text-foreground">
                      {format(bookingDate, "MMM d, yyyy")} at {startTime}
                    </span>
                  </div>
                )}
                {bookingType !== "hourly" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Plan</span>
                    <span className="font-medium text-foreground">
                      {paymentPlan === "weekly" 
                        ? (bookingType === "white_glove" 
                            ? `Weekly (${whiteGloveOption === "accelerated" ? "Accelerated" : "Standard"})` 
                            : "Weekly")
                        : "Pay in Full"
                      }
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

                {/* Payment breakdown */}
                <div className="pt-3 border-t border-border space-y-2">
                  {bookingType === "hourly" ? (
                    <>
                      {/* Hourly deposit breakdown */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Price</span>
                        <span className="font-medium text-foreground">${getHourlyPricing().total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-accent">
                        <span className="font-semibold">Deposit Due Today</span>
                        <span className="text-xl font-bold">${getHourlyPricing().deposit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining Balance Due on Arrival</span>
                        <span className="font-medium text-muted-foreground">${getHourlyPricing().remaining.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">
                        {paymentPlan === "weekly" ? "Payment" : "Total"}
                      </span>
                      <span className="text-xl font-bold text-accent">{getPackagePrice()}</span>
                    </div>
                  )}
                </div>
              </div>

              {bookingType === "hourly" && (
                <div className="bg-accent/10 rounded-lg p-3 border border-accent/30">
                  <p className="text-sm text-foreground text-center">
                    <strong>Note:</strong> A 1/3 deposit secures your booking. The remaining balance is due on arrival.
                  </p>
                </div>
              )}

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
