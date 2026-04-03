import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

interface IntakeFormProps {
  businessUnit: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  alertRecipients?: string[];
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "date" | "time" | "textarea" | "toggle" | "number";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string | boolean;
}

const SOURCE_OPTIONS = [
  { value: "google_search", label: "Google Search" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "referral", label: "Referral from Friend" },
  { value: "drive_by", label: "Drive By" },
  { value: "wedding_wire", label: "Wedding Wire" },
  { value: "the_knot", label: "The Knot" },
  { value: "other", label: "Other" },
];

export function LeadIntakeForm({ businessUnit, title, description, fields }: IntakeFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm();
  const [honeypot, setHoneypot] = useState("");

  const onSubmit = async (data: any) => {
    // Honeypot check
    if (honeypot) return;

    setSubmitting(true);
    try {
      const { first_name, last_name, email, phone, source, ...formFields } = data;

      const { data: result, error } = await supabase.functions.invoke("lead-intake", {
        body: {
          business_unit: businessUnit,
          first_name,
          last_name,
          email,
          phone,
          source,
          form_fields: formFields,
        },
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Your request has been submitted! We'll be in touch within 24 hours.");
      reset();
    } catch (err: any) {
      toast.error("Something went wrong. Please try again or call us directly.");
      console.error("Intake form error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto border-green-500/30 bg-green-500/5">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h3 className="text-2xl font-bold text-white">Request Received!</h3>
          <p className="text-zinc-300">
            We received your request and will contact you within 1 business day. 
            Check your email for a confirmation.
          </p>
          <Button
            variant="outline"
            onClick={() => setSubmitted(false)}
            className="border-zinc-700 text-zinc-300"
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-zinc-800">
      <CardHeader>
        <CardTitle className="text-xl text-white">{title}</CardTitle>
        {description && <CardDescription className="text-zinc-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Honeypot */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            className="absolute -left-[9999px]"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />

          {/* Standard name/contact fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-zinc-300">First Name *</Label>
              <Input
                id="first_name"
                {...register("first_name", { required: true })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="First name"
              />
              {errors.first_name && <span className="text-red-400 text-xs">Required</span>}
            </div>
            <div>
              <Label htmlFor="last_name" className="text-zinc-300">Last Name *</Label>
              <Input
                id="last_name"
                {...register("last_name", { required: true })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Last name"
              />
              {errors.last_name && <span className="text-red-400 text-xs">Required</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-zinc-300">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="email@example.com"
              />
              {errors.email && <span className="text-red-400 text-xs">Valid email required</span>}
            </div>
            <div>
              <Label htmlFor="phone" className="text-zinc-300">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone", { required: true })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="(555) 123-4567"
              />
              {errors.phone && <span className="text-red-400 text-xs">Required</span>}
            </div>
          </div>

          {/* Dynamic fields */}
          {fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name} className="text-zinc-300">
                {field.label} {field.required && "*"}
              </Label>
              {field.type === "select" && (
                <Select
                  onValueChange={(v) => setValue(field.name, v)}
                  defaultValue={field.defaultValue as string}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  {...register(field.name, { required: field.required })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder={field.placeholder}
                  rows={3}
                />
              )}
              {field.type === "toggle" && (
                <div className="flex items-center gap-2 mt-1">
                  <Switch
                    id={field.name}
                    defaultChecked={field.defaultValue as boolean}
                    onCheckedChange={(v) => setValue(field.name, v)}
                  />
                  <span className="text-sm text-zinc-400">{field.placeholder || "Yes"}</span>
                </div>
              )}
              {["text", "email", "tel", "date", "time", "number"].includes(field.type) && (
                <Input
                  id={field.name}
                  type={field.type}
                  {...register(field.name, { required: field.required })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder={field.placeholder}
                />
              )}
              {errors[field.name] && <span className="text-red-400 text-xs">Required</span>}
            </div>
          ))}

          {/* Source - standard for all forms */}
          <div>
            <Label htmlFor="source" className="text-zinc-300">How did you hear about us? *</Label>
            <Select onValueChange={(v) => setValue("source", v)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              "Submit Request"
            )}
          </Button>

          <p className="text-xs text-zinc-500 text-center">
            We will contact you within 1 business day. Your information is secure and never shared.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
