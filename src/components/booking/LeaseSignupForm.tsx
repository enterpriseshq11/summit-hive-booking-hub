import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, CreditCard, Users, Check, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { useResources } from "@/hooks/useResources";
import { supabase } from "@/integrations/supabase/client";

interface LeaseSignupFormProps {
  onSuccess?: (bookingId: string) => void;
}

const leaseTerms = [
  { value: "month", label: "Month-to-Month", discount: 0 },
  { value: "6month", label: "6 Month Lease", discount: 5 },
  { value: "12month", label: "12 Month Lease", discount: 10 },
];

export default function LeaseSignupForm({ onSuccess }: LeaseSignupFormProps) {
  const navigate = useNavigate();
  const { user, authUser } = useAuth();
  const { data: business } = useBusinessByType("coworking");
  const { data: resources } = useResources(business?.id);

  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState("month");
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const offices = resources?.filter(r => r.type === "office" || r.type === "suite") || [];
  const selectedOffice = offices.find(o => o.id === selectedUnit);
  const selectedTermData = leaseTerms.find(t => t.value === selectedTerm);

  // Mock pricing - in production, this would come from packages/pricing rules
  const getBasePrice = (office: typeof selectedOffice) => {
    if (!office) return 0;
    if (office.capacity && office.capacity >= 4) return 800;
    if (office.capacity && office.capacity >= 2) return 500;
    return 300;
  };

  const calculateMonthlyPrice = () => {
    const base = getBasePrice(selectedOffice);
    const discount = selectedTermData?.discount || 0;
    return Math.round(base * (1 - discount / 100));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUnit || !business) {
      toast.error("Please select an office unit");
      return;
    }

    if (!user && (!guestInfo.email || !guestInfo.name)) {
      toast.error("Please provide your contact information");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a subscription checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          price_amount: calculateMonthlyPrice(),
          description: `${selectedOffice?.name} - ${selectedTermData?.label}`,
          metadata: {
            resource_id: selectedUnit,
            lease_term: selectedTerm,
            business_type: "coworking",
          },
          success_url: `${window.location.origin}/coworking/confirmation`,
          cancel_url: `${window.location.origin}/coworking?cancelled=true`,
        },
      });

      if (error) throw error;

      // Log to audit
      await supabase.from("audit_log").insert([{
        entity_type: "lease_inquiry",
        entity_id: selectedUnit,
        action_type: "lease_signup_initiated",
        after_json: { 
          unit: selectedOffice?.name, 
          term: selectedTerm, 
          monthly_price: calculateMonthlyPrice() 
        } as any,
      }]);

      // Redirect to Stripe checkout
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Opening payment page...");
      }
    } catch (error) {
      console.error("Lease signup error:", error);
      toast.error("Failed to process. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Select Your Space
          </CardTitle>
          <CardDescription>Choose from our available offices and dedicated desks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {offices.map((office) => (
              <Card
                key={office.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedUnit === office.id ? "border-primary ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedUnit(office.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{office.name}</h4>
                      <p className="text-sm text-muted-foreground">{office.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {office.capacity && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Up to {office.capacity}
                          </span>
                        )}
                        {office.square_footage && (
                          <span>{office.square_footage} sq ft</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${getBasePrice(office)}</p>
                      <p className="text-xs text-muted-foreground">/month</p>
                    </div>
                  </div>
                  {selectedUnit === office.id && (
                    <Badge className="mt-2" variant="default">
                      <Check className="h-3 w-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {offices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No units currently available. Join the waitlist!</p>
              <Button variant="outline" className="mt-4">
                Join Waitlist
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUnit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Lease Term
            </CardTitle>
            <CardDescription>Longer terms come with additional savings</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedTerm} onValueChange={setSelectedTerm} className="space-y-3">
              {leaseTerms.map((term) => (
                <div
                  key={term.value}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTerm === term.value ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTerm(term.value)}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={term.value} id={term.value} />
                    <Label htmlFor={term.value} className="cursor-pointer">
                      {term.label}
                    </Label>
                  </div>
                  <div className="text-right">
                    {term.discount > 0 && (
                      <Badge variant="secondary" className="mb-1">
                        Save {term.discount}%
                      </Badge>
                    )}
                    <p className="font-semibold">
                      ${Math.round(getBasePrice(selectedOffice) * (1 - term.discount / 100))}/mo
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {!user && selectedUnit && (
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={guestInfo.company}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedUnit && (
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{selectedOffice?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedTermData?.label}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${calculateMonthlyPrice()}</p>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        type="submit" 
        size="lg" 
        className="w-full" 
        disabled={isSubmitting || !selectedUnit}
      >
        <CreditCard className="h-5 w-5 mr-2" />
        {isSubmitting ? "Processing..." : "Continue to Payment"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        First month's rent will be charged today. Your lease begins immediately upon payment.
      </p>
    </form>
  );
}
