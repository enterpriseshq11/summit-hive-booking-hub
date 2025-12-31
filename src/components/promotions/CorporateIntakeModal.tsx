import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSubmitPromotionLead } from "@/hooks/usePromotions";
import { CheckCircle, Loader2, Building2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  companyName: z.string().min(2, "Company name is required"),
  teamSize: z.string().min(1, "Team size is required"),
  dateRange: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CorporateIntakeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CorporateIntakeModal({ open, onOpenChange }: CorporateIntakeModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const submitLead = useSubmitPromotionLead();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
      teamSize: "",
      dateRange: "",
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await submitLead.mutateAsync({
      name: data.name,
      email: data.email,
      phone: data.phone,
      offer_title_snapshot: "Corporate VIP",
      business_interest: ["coworking", "fitness", "spa"],
      notes: `Company: ${data.companyName}\nTeam Size: ${data.teamSize}\nDate Range: ${data.dateRange || "Flexible"}\n\n${data.notes || ""}`,
      preferred_contact_method: "email",
      lead_type: "corporate",
      metadata: {
        company_name: data.companyName,
        team_size: data.teamSize,
        date_range: data.dateRange,
      },
    });
    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      form.reset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border/50">
        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gold/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-gold" />
            </div>
            <DialogTitle className="text-xl">Request Received!</DialogTitle>
            <DialogDescription>
              Our corporate team will review your request and reach out within 24 hours.
            </DialogDescription>
            <Button onClick={handleClose} variant="outline" className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <DialogTitle>Corporate VIP Inquiry</DialogTitle>
                  <DialogDescription>
                    Tell us about your team and we'll build a custom package.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
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
                    name="teamSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Size</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 15-20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Start Date (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Q1 2025 or flexible" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your goals, specific needs, etc." 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold"
                  disabled={submitLead.isPending}
                  data-event="promo_submit_corporate"
                >
                  {submitLead.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Corporate Inquiry"
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
