import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Dumbbell, CreditCard, Check, Star, Users, Shield, Calendar, Pause, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { useMembershipTiers, useMembership, useCreateMembership, usePauseMembership, useCancelMembership, useCreateGuestPass } from "@/hooks/useMemberships";
import { useRequiredDocuments, useSignDocument } from "@/hooks/useSignedDocuments";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

interface MembershipSignupFormProps {
  onSuccess?: (membershipId: string) => void;
}

export default function MembershipSignupForm({ onSuccess }: MembershipSignupFormProps) {
  const navigate = useNavigate();
  const { user, authUser } = useAuth();
  const { data: business } = useBusinessByType("fitness");
  const { data: tiers } = useMembershipTiers(business?.id);
  const { data: existingMembership } = useMembership(user?.id);
  const { data: requiredDocs } = useRequiredDocuments(undefined, business?.id);
  
  const createMembership = useCreateMembership();
  const pauseMembership = usePauseMembership();
  const cancelMembership = useCancelMembership();
  const signDocument = useSignDocument();
  const createGuestPass = useCreateGuestPass();

  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guest pass form state
  const [showGuestPassForm, setShowGuestPassForm] = useState(false);
  const [guestPassInfo, setGuestPassInfo] = useState({ name: "", email: "", date: "" });

  // Freeze controls
  const [showFreezeForm, setShowFreezeForm] = useState(false);
  const [freezeResumeDate, setFreezeResumeDate] = useState("");

  const selectedTier = tiers?.find(t => t.id === selectedTierId);

  const getPrice = (tier: typeof selectedTier) => {
    if (!tier) return 0;
    if (billingCycle === "annual" && tier.annual_price) {
      return tier.annual_price;
    }
    return tier.monthly_price;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTierId) {
      toast.error("Please select a membership tier");
      return;
    }

    if (!waiverAgreed) {
      toast.error("Please agree to the waiver to continue");
      return;
    }

    if (!user) {
      toast.error("Please log in to sign up for a membership");
      navigate("/login?redirect=/fitness");
      return;
    }

    setIsSubmitting(true);

    try {
      // Sign waiver first
      if (requiredDocs && requiredDocs.length > 0) {
        for (const doc of requiredDocs) {
          await signDocument.mutateAsync({
            templateId: doc.id,
            userId: user.id,
          });
        }
      }

      // Create Stripe checkout for subscription
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-checkout", {
        body: {
          membership_tier_id: selectedTierId,
          price_amount: getPrice(selectedTier),
          description: `${selectedTier?.name} Membership - ${billingCycle === "annual" ? "Annual" : "Monthly"}`,
          metadata: {
            tier_id: selectedTierId,
            billing_cycle: billingCycle,
            user_id: user.id,
          },
          success_url: `${window.location.origin}/fitness/welcome`,
          cancel_url: `${window.location.origin}/fitness?cancelled=true`,
        },
      });

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        window.open(checkoutData.url, "_blank");
        toast.success("Opening payment page...");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to process signup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFreeze = async () => {
    if (!existingMembership || !freezeResumeDate) return;

    try {
      await pauseMembership.mutateAsync({
        membershipId: existingMembership.id,
        resumeDate: freezeResumeDate,
      });
      setShowFreezeForm(false);
      setFreezeResumeDate("");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    if (!existingMembership) return;
    
    if (!confirm("Are you sure you want to cancel your membership? This action cannot be undone.")) {
      return;
    }

    try {
      await cancelMembership.mutateAsync({
        membershipId: existingMembership.id,
        reason: "User requested cancellation",
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAddGuestPass = async () => {
    if (!existingMembership || !guestPassInfo.name || !guestPassInfo.date) return;

    try {
      await createGuestPass.mutateAsync({
        membershipId: existingMembership.id,
        guestName: guestPassInfo.name,
        guestEmail: guestPassInfo.email,
        validDate: guestPassInfo.date,
      });
      setShowGuestPassForm(false);
      setGuestPassInfo({ name: "", email: "", date: "" });
    } catch (error) {
      // Error handled by hook
    }
  };

  // If user already has membership, show management view
  if (existingMembership) {
    const tierInfo = existingMembership.membership_tiers;
    const isPaused = existingMembership.status === "paused";

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Your Membership
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-semibold text-lg">{tierInfo?.name} Membership</h3>
                <p className="text-sm text-muted-foreground">
                  {isPaused ? (
                    <span className="text-amber-500">Paused until {format(new Date(existingMembership.pause_resume_date!), "MMM d, yyyy")}</span>
                  ) : (
                    <>Next billing: {existingMembership.current_period_end ? format(new Date(existingMembership.current_period_end), "MMM d, yyyy") : "N/A"}</>
                  )}
                </p>
              </div>
              <Badge variant={isPaused ? "secondary" : "default"}>
                {isPaused ? "Paused" : "Active"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isPaused && (
                <Button variant="outline" onClick={() => setShowFreezeForm(true)}>
                  <Pause className="h-4 w-4 mr-2" />
                  Freeze Membership
                </Button>
              )}

              <Button variant="outline" onClick={() => setShowGuestPassForm(true)}>
                <Users className="h-4 w-4 mr-2" />
                Add Guest Pass
              </Button>

              <Button 
                variant="outline" 
                onClick={async () => {
                  const { data, error } = await supabase.functions.invoke("customer-portal");
                  if (data?.url) window.open(data.url, "_blank");
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>

              <Button variant="destructive" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>

            {showFreezeForm && (
              <Card className="mt-4">
                <CardContent className="p-4 space-y-4">
                  <h4 className="font-medium">Freeze Your Membership</h4>
                  <p className="text-sm text-muted-foreground">
                    You can freeze up to 2 times per year for a maximum of 30 days each.
                    Freezes used this year: {existingMembership.pauses_used_this_year || 0}/2
                  </p>
                  <div className="space-y-2">
                    <Label>Resume Date</Label>
                    <Input
                      type="date"
                      value={freezeResumeDate}
                      onChange={(e) => setFreezeResumeDate(e.target.value)}
                      min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                      max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleFreeze} disabled={!freezeResumeDate}>
                      Confirm Freeze
                    </Button>
                    <Button variant="ghost" onClick={() => setShowFreezeForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showGuestPassForm && (
              <Card className="mt-4">
                <CardContent className="p-4 space-y-4">
                  <h4 className="font-medium">Create Guest Pass</h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Guest Name *</Label>
                      <Input
                        value={guestPassInfo.name}
                        onChange={(e) => setGuestPassInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Guest's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Guest Email</Label>
                      <Input
                        type="email"
                        value={guestPassInfo.email}
                        onChange={(e) => setGuestPassInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="guest@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valid Date *</Label>
                      <Input
                        type="date"
                        value={guestPassInfo.date}
                        onChange={(e) => setGuestPassInfo(prev => ({ ...prev, date: e.target.value }))}
                        min={format(new Date(), "yyyy-MM-dd")}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddGuestPass} disabled={!guestPassInfo.name || !guestPassInfo.date}>
                      Create Pass
                    </Button>
                    <Button variant="ghost" onClick={() => setShowGuestPassForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // New member signup form
  return (
    <form onSubmit={handleSignup} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Choose Your Membership
          </CardTitle>
          <CardDescription>All memberships include 24/7 gym access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {tiers?.map((tier, index) => {
              const isPopular = index === 1;
              const features = (tier.features as string[]) || [];
              
              return (
                <Card
                  key={tier.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary relative",
                    selectedTierId === tier.id && "border-primary ring-2 ring-primary",
                    isPopular && "border-primary/50"
                  )}
                  onClick={() => setSelectedTierId(tier.id)}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-4 pt-6">
                    <h3 className="font-semibold text-lg">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-2xl font-bold">${tier.monthly_price}</span>
                      <span className="text-muted-foreground">/mo</span>
                      {tier.annual_price && (
                        <p className="text-sm text-muted-foreground">
                          or ${tier.annual_price}/year (save ${tier.monthly_price * 12 - tier.annual_price})
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {selectedTierId === tier.id && (
                      <Badge className="mt-4 w-full justify-center">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedTierId && selectedTier?.annual_price && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Card
                className={cn(
                  "flex-1 cursor-pointer transition-all hover:border-primary p-4",
                  billingCycle === "monthly" && "border-primary ring-2 ring-primary"
                )}
                onClick={() => setBillingCycle("monthly")}
              >
                <h4 className="font-medium">Monthly</h4>
                <p className="text-2xl font-bold">${selectedTier.monthly_price}/mo</p>
              </Card>
              <Card
                className={cn(
                  "flex-1 cursor-pointer transition-all hover:border-primary p-4",
                  billingCycle === "annual" && "border-primary ring-2 ring-primary"
                )}
                onClick={() => setBillingCycle("annual")}
              >
                <h4 className="font-medium">Annual</h4>
                <p className="text-2xl font-bold">${selectedTier.annual_price}/yr</p>
                <Badge variant="secondary" className="mt-1">
                  Save ${selectedTier.monthly_price * 12 - selectedTier.annual_price}
                </Badge>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waiver Agreement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Liability Waiver
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg text-sm max-h-48 overflow-y-auto mb-4">
            <p>
              By signing up for a membership, I acknowledge that I am voluntarily participating in 
              physical exercise activities. I understand and acknowledge that physical exercise 
              involves inherent risks of injury. I agree to assume all risks associated with my 
              use of the facilities and equipment, including any injury that may occur.
            </p>
            <p className="mt-2">
              I certify that I am physically fit and have no medical condition that would prevent 
              my safe participation in physical activities. I release and hold harmless Total Fitness 
              and its employees from any claims arising from my participation.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="waiver"
              checked={waiverAgreed}
              onCheckedChange={(checked) => setWaiverAgreed(checked as boolean)}
            />
            <label htmlFor="waiver" className="text-sm cursor-pointer">
              I have read and agree to the liability waiver
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Price Summary */}
      {selectedTier && (
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{selectedTier.name} Membership</p>
                <p className="text-sm text-muted-foreground">
                  {billingCycle === "annual" ? "Annual billing" : "Monthly billing"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${getPrice(selectedTier)}</p>
                <p className="text-sm text-muted-foreground">
                  {billingCycle === "annual" ? "/year" : "/month"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        type="submit" 
        size="lg" 
        className="w-full" 
        disabled={isSubmitting || !selectedTierId || !waiverAgreed}
      >
        <CreditCard className="h-5 w-5 mr-2" />
        {isSubmitting ? "Processing..." : "Join Now"}
      </Button>

      {!user && (
        <p className="text-sm text-muted-foreground text-center">
          You'll need to <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/login?redirect=/fitness")}>sign in or create an account</Button> to complete your membership.
        </p>
      )}
    </form>
  );
}
