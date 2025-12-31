import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Gift, 
  Mail, 
  FileText, 
  User, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GiftCardPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAmount: number | null;
  customAmount?: number | null;
}

const messageTemplates = [
  { id: "birthday", label: "🎂 Birthday", text: "Wishing you a wonderful birthday filled with wellness and relaxation!" },
  { id: "thankyou", label: "🙏 Thank You", text: "Thank you for everything you do. You deserve some pampering!" },
  { id: "holiday", label: "🎄 Holiday", text: "Happy Holidays! May this gift bring you rest and renewal." },
  { id: "justbecause", label: "💛 Just Because", text: "Just because you're amazing and deserve something special." },
];

export function GiftCardPurchaseModal({
  isOpen,
  onClose,
  selectedAmount,
  customAmount,
}: GiftCardPurchaseModalProps) {
  const [step, setStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "print" | "self">("email");
  const [scheduleDelivery, setScheduleDelivery] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const amount = customAmount || selectedAmount || 0;

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.text);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate checkout process - this would integrate with Stripe
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsComplete(true);
    
    toast({
      title: "Gift card purchase initiated!",
      description: "You'll be redirected to complete payment.",
    });
  };

  const handleClose = () => {
    setStep(1);
    setIsComplete(false);
    setRecipientName("");
    setRecipientEmail("");
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setMessage("");
    setDeliveryMethod("email");
    setScheduleDelivery(false);
    onClose();
  };

  const canProceedStep2 = recipientName && recipientEmail && buyerName && buyerEmail;
  const canProceedStep3 = true; // Message is optional

  if (isComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Gift Card Ready!</h3>
            <p className="text-muted-foreground mb-6">
              Your ${amount} gift card is being prepared. Check your email for payment confirmation.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-primary"
                onClick={handleClose}
              >
                Done
              </Button>
              <p className="text-xs text-muted-foreground">
                Questions? Call (419) 555-0100
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-accent" />
            Purchase ${amount} Gift Card
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s === step
                    ? "bg-accent text-primary"
                    : s < step
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-8 h-0.5 ${s < step ? "bg-accent" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Confirm Amount */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center p-6 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Gift Card Value</p>
              <p className="text-4xl font-bold text-accent">${amount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Redeemable at all A-Z locations • Never expires
              </p>
            </div>
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-primary"
              onClick={() => setStep(2)}
              data-event="giftcard_modal_step1_continue"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Delivery Details */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Delivery Method */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Delivery Method</Label>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(v) => setDeliveryMethod(v as "email" | "print" | "self")}
                className="grid grid-cols-3 gap-2"
              >
                <Label
                  htmlFor="dm-email"
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    deliveryMethod === "email" ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                  }`}
                >
                  <RadioGroupItem value="email" id="dm-email" className="sr-only" />
                  <Mail className="h-5 w-5 text-accent" />
                  <span className="text-xs font-medium">Email</span>
                </Label>
                <Label
                  htmlFor="dm-print"
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    deliveryMethod === "print" ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                  }`}
                >
                  <RadioGroupItem value="print" id="dm-print" className="sr-only" />
                  <FileText className="h-5 w-5 text-accent" />
                  <span className="text-xs font-medium">Print PDF</span>
                </Label>
                <Label
                  htmlFor="dm-self"
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    deliveryMethod === "self" ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                  }`}
                >
                  <RadioGroupItem value="self" id="dm-self" className="sr-only" />
                  <User className="h-5 w-5 text-accent" />
                  <span className="text-xs font-medium">Send to Me</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Recipient Details */}
            {deliveryMethod !== "self" && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recipient Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="recipient-name" className="text-xs">Name *</Label>
                    <Input
                      id="recipient-name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Their name"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient-email" className="text-xs">Email *</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="their@email.com"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Buyer Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Your Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="buyer-name" className="text-xs">Your Name *</Label>
                  <Input
                    id="buyer-name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Your name"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="buyer-email" className="text-xs">Your Email *</Label>
                  <Input
                    id="buyer-email"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="buyer-phone" className="text-xs">Phone (Optional)</Label>
                <Input
                  id="buyer-phone"
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="h-9"
                />
              </div>
            </div>

            {/* Schedule Delivery */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="schedule-delivery"
                  checked={scheduleDelivery}
                  onChange={(e) => setScheduleDelivery(e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="schedule-delivery" className="text-sm cursor-pointer">
                  Schedule delivery for a specific date
                </Label>
              </div>
              {scheduleDelivery && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="delivery-date" className="text-xs">Date</Label>
                    <Input
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery-time" className="text-xs">Time</Label>
                    <Input
                      id="delivery-time"
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                onClick={() => setStep(3)}
                disabled={deliveryMethod !== "self" && !canProceedStep2}
                data-event="giftcard_modal_step2_continue"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Personal Message */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                Add a Personal Message (Optional)
              </Label>
              
              {/* Quick Templates */}
              <div className="flex flex-wrap gap-2 mb-3">
                {messageTemplates.map((template) => (
                  <Button
                    key={template.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateSelect(template.id)}
                    className="text-xs"
                  >
                    {template.label}
                  </Button>
                ))}
              </div>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a personal message to include with the gift card..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {message.length}/500
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                onClick={() => setStep(4)}
                data-event="giftcard_modal_step3_continue"
              >
                Review Order
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Pay */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">Gift Card Value</span>
                  <span className="text-xl font-bold text-accent">${amount}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="capitalize">{deliveryMethod === "self" ? "Send to myself" : deliveryMethod}</span>
                  </div>
                  {deliveryMethod !== "self" && recipientName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipient</span>
                      <span>{recipientName}</span>
                    </div>
                  )}
                  {scheduleDelivery && deliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scheduled For</span>
                      <span>{deliveryDate} {deliveryTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {message && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Personal Message</p>
                  <p className="text-sm italic">"{message}"</p>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-muted-foreground">
              You'll be redirected to Stripe to complete payment securely.
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-event="giftcard_checkout_start"
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Pay ${amount}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
