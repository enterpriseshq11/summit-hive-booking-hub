import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CareerConsents } from "@/hooks/useCareerApplications";

interface ConsentsStepProps {
  consents: Partial<CareerConsents>;
  setConsents: (consents: Partial<CareerConsents>) => void;
}

export function ConsentsStep({ consents, setConsents }: ConsentsStepProps) {
  const updateField = <K extends keyof CareerConsents>(
    field: K,
    value: CareerConsents[K]
  ) => {
    setConsents({ ...consents, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Agreements & Signature</h2>
        <p className="text-muted-foreground text-sm">
          Please review and accept the following agreements to complete your application.
        </p>
      </div>

      {/* Consents */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-4 border rounded-lg">
          <Checkbox
            id="certify"
            checked={consents.certifyTruthful}
            onCheckedChange={(checked) => updateField("certifyTruthful", checked === true)}
          />
          <div className="space-y-1">
            <Label htmlFor="certify" className="text-sm font-medium leading-none">
              Certification of Accuracy *
            </Label>
            <p className="text-sm text-muted-foreground">
              I certify that all information provided in this application is true and complete 
              to the best of my knowledge. I understand that false or misleading information 
              may result in disqualification from consideration or termination if discovered after hire.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 border rounded-lg">
          <Checkbox
            id="contact"
            checked={consents.agreeToContact}
            onCheckedChange={(checked) => updateField("agreeToContact", checked === true)}
          />
          <div className="space-y-1">
            <Label htmlFor="contact" className="text-sm font-medium leading-none">
              Communication Consent *
            </Label>
            <p className="text-sm text-muted-foreground">
              I agree to be contacted by A-Z Enterprises via phone, email, or text message 
              regarding my application and potential employment opportunities.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/30">
          <Checkbox
            id="background"
            checked={consents.backgroundCheckConsent}
            onCheckedChange={(checked) => updateField("backgroundCheckConsent", checked === true)}
          />
          <div className="space-y-1">
            <Label htmlFor="background" className="text-sm font-medium leading-none">
              Background Check Authorization (Optional)
            </Label>
            <p className="text-sm text-muted-foreground">
              I authorize A-Z Enterprises to conduct a background check if required for the position. 
              I understand this will only be performed for candidates in the final stages of consideration.
            </p>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium">Electronic Signature</h3>
        <p className="text-sm text-muted-foreground">
          By typing your full legal name below, you are providing an electronic signature 
          acknowledging that you have read and agree to the above statements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signature">Full Legal Name *</Label>
            <Input
              id="signature"
              value={consents.signatureFullName || ""}
              onChange={(e) => updateField("signatureFullName", e.target.value)}
              placeholder="John Michael Doe"
              className="font-serif italic"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signDate">Date *</Label>
            <Input
              id="signDate"
              type="date"
              value={consents.signatureDate || new Date().toISOString().split("T")[0]}
              onChange={(e) => updateField("signatureDate", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
