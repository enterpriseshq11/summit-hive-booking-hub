import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSubmitPromotionLead, type Promotion } from "@/hooks/usePromotions";
import { CheckCircle, Send, Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  businessInterest: z.array(z.string()).min(1, "Select at least one business"),
  notes: z.string().optional(),
  preferredContact: z.enum(["email", "phone", "either"]),
});

type FormData = z.infer<typeof formSchema>;

interface PromotionInterestFormProps {
  preselectedOffer?: Promotion | null;
  leadType?: string;
}

const BUSINESS_OPTIONS = [
  { id: "coworking", label: "Coworking / Office" },
  { id: "fitness", label: "Fitness" },
  { id: "spa", label: "Spa & Recovery" },
  { id: "summit", label: "Events / Summit" },
];

export function PromotionInterestForm({ preselectedOffer, leadType = "standard" }: PromotionInterestFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const submitLead = useSubmitPromotionLead();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      businessInterest: preselectedOffer?.tags?.filter(t => 
        ["office", "fitness", "spa", "summit", "coworking"].includes(t)
      ).map(t => t === "office" ? "coworking" : t) || [],
      notes: "",
      preferredContact: "email",
    },
  });

  const onSubmit = async (data: FormData) => {
    await submitLead.mutateAsync({
      name: data.name,
      email: data.email,
      phone: data.phone,
      offer_id: preselectedOffer?.id,
      offer_title_snapshot: preselectedOffer?.title,
      business_interest: data.businessInterest,
      notes: data.notes,
      preferred_contact_method: data.preferredContact,
      lead_type: leadType,
      metadata: {
        utm: window.location.search,
        referrer: document.referrer,
      },
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="border-gold/30 bg-card">
        <CardContent className="py-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gold/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-gold" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Request Received!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our team will review your request and reach out within 24 hours to discuss next steps.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-xl">
          {preselectedOffer ? `Interest: ${preselectedOffer.title}` : "Request a Custom Bundle"}
        </CardTitle>
        <CardDescription>
          Tell us what you're interested in and we'll build the best-value package for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessInterest"
              render={() => (
                <FormItem>
                  <FormLabel>Which businesses interest you?</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {BUSINESS_OPTIONS.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="businessInterest"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, option.id]);
                                  } else {
                                    field.onChange(current.filter((v) => v !== option.id));
                                  }
                                }}
                              />
                            </FormControl>
                            <Label className="text-sm font-normal cursor-pointer">
                              {option.label}
                            </Label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anything else we should know? (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your goals, timeline, team size, etc." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred contact method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="text-sm font-normal cursor-pointer">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" />
                        <Label htmlFor="phone" className="text-sm font-normal cursor-pointer">Phone</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="either" id="either" />
                        <Label htmlFor="either" className="text-sm font-normal cursor-pointer">Either</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold"
              size="lg"
              disabled={submitLead.isPending}
              data-event={`promo_submit_interest_${preselectedOffer?.slug || "custom"}`}
            >
              {submitLead.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We'll confirm details and next steps within 24 hours.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
