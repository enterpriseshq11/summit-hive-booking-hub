import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spinResult: any;
  onClaimed: () => void;
}

export function ClaimModal({ open, onOpenChange, spinResult, onClaimed }: ClaimModalProps) {
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [interestedIn, setInterestedIn] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);

  const handleClaim = async () => {
    if (!consent) {
      toast.error("Please agree to receive communications");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("dopamine-claim", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { 
          spin_id: spinResult?.spin_id,
          interested_in: interestedIn,
          consent: true
        }
      });

      if (error) throw error;

      setClaimResult(data);
      setStep("success");
      
    } catch (error: any) {
      toast.error(error.message || "Claim failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(claimResult?.claim_code);
    toast.success("Claim code copied!");
  };

  const handleClose = () => {
    setStep("confirm");
    setInterestedIn("");
    setConsent(false);
    setClaimResult(null);
    onOpenChange(false);
    onClaimed();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Claim Your Prize!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">You won</p>
                <p className="text-xl font-bold text-primary">{spinResult?.prize_name}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>What are you most interested in?</Label>
                  <Select value={interestedIn} onValueChange={setInterestedIn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gym">Gym & Fitness</SelectItem>
                      <SelectItem value="spa">Spa & Wellness</SelectItem>
                      <SelectItem value="events">Events & Summit</SelectItem>
                      <SelectItem value="coworking">Coworking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="consent" 
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                  />
                  <Label htmlFor="consent" className="text-sm text-muted-foreground leading-tight">
                    I agree to receive prize notifications and promotional messages. 
                    I can unsubscribe anytime.
                  </Label>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleClaim}
                disabled={isSubmitting}
                data-event="promo_claim_submit"
              >
                {isSubmitting ? "Claiming..." : "Claim Prize"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Prize Claimed!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4" data-event="promo_claim_success">
              <div className="p-4 bg-green-500/10 rounded-lg text-center space-y-2">
                <p className="text-sm text-muted-foreground">Your claim code</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-mono font-bold text-green-600">
                    {claimResult?.claim_code}
                  </code>
                  <Button size="icon" variant="ghost" onClick={copyCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expires: {claimResult?.redemption_deadline 
                    ? new Date(claimResult.redemption_deadline).toLocaleDateString()
                    : "Never"}
                </p>
              </div>

              {claimResult?.instructions && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">How to redeem:</p>
                  <p className="text-sm text-muted-foreground">{claimResult.instructions}</p>
                </div>
              )}

              <div className="flex gap-2">
                {claimResult?.booking_url && (
                  <Button className="flex-1" asChild>
                    <a href={claimResult.booking_url}>
                      Book Now <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
