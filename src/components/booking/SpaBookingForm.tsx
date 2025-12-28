import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { Sparkles, Clock, User, CalendarDays, CreditCard, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessByType } from "@/hooks/useBusinesses";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { usePackages } from "@/hooks/usePackages";
import { useProviders, useAvailableProviders } from "@/hooks/useProviders";
import { useMembership } from "@/hooks/useMemberships";
import { useRequiredDocuments } from "@/hooks/useSignedDocuments";
import { useCreateBooking } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SpaBookingFormProps {
  onSuccess?: (bookingId: string) => void;
}

export default function SpaBookingForm({ onSuccess }: SpaBookingFormProps) {
  const navigate = useNavigate();
  const { user, authUser } = useAuth();
  const { data: business } = useBusinessByType("spa");
  const { data: bookableTypes } = useBookableTypes(business?.id);
  const { data: providers } = useProviders(business?.id);
  const { data: membership } = useMembership(user?.id);

  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  const { data: packages } = usePackages(selectedTypeId);
  const { data: requiredDocs } = useRequiredDocuments(selectedTypeId, business?.id);
  const createBooking = useCreateBooking();

  const selectedPackage = packages?.find(p => p.id === selectedPackageId);
  const selectedType = bookableTypes?.find(t => t.id === selectedTypeId);
  const isMember = !!membership;

  const { data: availableProviders } = useAvailableProviders({
    businessId: business?.id || "",
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    startTime: selectedTime,
    endTime: selectedTime ? `${parseInt(selectedTime.split(":")[0]) + 1}:00` : "",
  });

  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);

  // Time slots
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const calculatePrice = () => {
    if (!selectedPackage) return 0;
    if (isMember && selectedPackage.member_price) {
      return selectedPackage.member_price;
    }
    return selectedPackage.base_price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!business || !selectedTypeId || !selectedPackageId || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user && (!guestInfo.email || !guestInfo.name)) {
      toast.error("Please provide your contact information");
      return;
    }

    // Check intake requirements
    if (selectedType?.requires_intake && !intakeComplete && requiredDocs && requiredDocs.length > 0) {
      toast.error("Please complete the required intake forms before booking");
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (selectedPackage?.duration_mins || 60));

      const price = calculatePrice();

      const bookingData = {
        business_id: business.id,
        bookable_type_id: selectedTypeId,
        package_id: selectedPackageId,
        customer_id: user?.id || null,
        guest_name: guestInfo.name || null,
        guest_email: guestInfo.email || null,
        guest_phone: guestInfo.phone || null,
        assigned_provider_id: selectedProviderId || null,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        status: "confirmed" as const,
        subtotal: price,
        total_amount: price,
        booking_number: "",
      };

      const result = await createBooking.mutateAsync(bookingData);

      // Create Stripe checkout
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-checkout", {
        body: {
          booking_id: result.id,
          price_amount: price,
          description: `${selectedPackage?.name} - ${format(startDateTime, "MMM d, yyyy h:mm a")}`,
          success_url: `${window.location.origin}/booking/confirmation?id=${result.id}`,
          cancel_url: `${window.location.origin}/spa?cancelled=true`,
        },
      });

      if (checkoutError) throw checkoutError;

      // Open Stripe checkout
      if (checkoutData?.url) {
        window.open(checkoutData.url, "_blank");
        toast.success("Opening payment page...");
        onSuccess?.(result.id);
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to complete booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Select Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedTypeId} onValueChange={(v) => {
            setSelectedTypeId(v);
            setSelectedPackageId("");
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a service category" />
            </SelectTrigger>
            <SelectContent>
              {bookableTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTypeId && packages && (
            <div className="grid gap-3">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary",
                    selectedPackageId === pkg.id && "border-primary ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedPackageId(pkg.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{pkg.name}</h4>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{pkg.duration_mins} minutes</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {isMember && pkg.member_price && pkg.member_price < pkg.base_price ? (
                          <div>
                            <p className="text-sm line-through text-muted-foreground">${pkg.base_price}</p>
                            <p className="text-lg font-bold text-primary">${pkg.member_price}</p>
                            <Badge variant="secondary" className="text-xs">Member Price</Badge>
                          </div>
                        ) : (
                          <p className="text-lg font-bold">${pkg.base_price}</p>
                        )}
                      </div>
                    </div>
                    {selectedPackageId === pkg.id && (
                      <Badge className="mt-2"><Check className="h-3 w-3 mr-1" />Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date & Time */}
      {selectedPackageId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start", !selectedDate && "text-muted-foreground")}>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Selection */}
      {selectedDate && selectedTime && providers && providers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Choose Provider (Optional)
            </CardTitle>
            <CardDescription>Select a specific therapist or leave as "Any Available"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:border-primary p-3 text-center",
                  !selectedProviderId && "border-primary ring-2 ring-primary"
                )}
                onClick={() => setSelectedProviderId("")}
              >
                <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Any Available</p>
              </Card>
              {(availableProviders || providers).map((provider) => (
                <Card
                  key={provider.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary p-3 text-center",
                    selectedProviderId === provider.id && "border-primary ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedProviderId(provider.id)}
                >
                  {provider.avatar_url ? (
                    <img src={provider.avatar_url} alt={provider.name} className="h-8 w-8 rounded-full mx-auto mb-2" />
                  ) : (
                    <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium">{provider.name}</p>
                  {provider.title && <p className="text-xs text-muted-foreground">{provider.title}</p>}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intake Warning */}
      {selectedType?.requires_intake && requiredDocs && requiredDocs.length > 0 && (
        <Card className="border-amber-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Intake Form Required</p>
                <p className="text-sm text-muted-foreground">
                  You'll need to complete the intake form before your appointment. 
                  We'll send you a link after booking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guest Info */}
      {!user && (
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
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@email.com"
                  required
                />
              </div>
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
          </CardContent>
        </Card>
      )}

      {/* Price Summary */}
      {selectedPackage && (
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{selectedPackage.name}</p>
                <p className="text-sm text-muted-foreground">{selectedPackage.duration_mins} minutes</p>
                {selectedDate && selectedTime && (
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, "EEEE, MMMM d")} at {format(new Date(`2000-01-01T${selectedTime}`), "h:mm a")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${calculatePrice()}</p>
                {isMember && <Badge variant="secondary">Member Price</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        type="submit" 
        size="lg" 
        className="w-full" 
        disabled={isSubmitting || !selectedPackageId || !selectedDate || !selectedTime}
      >
        <CreditCard className="h-5 w-5 mr-2" />
        {isSubmitting ? "Processing..." : "Book & Pay"}
      </Button>
    </form>
  );
}
