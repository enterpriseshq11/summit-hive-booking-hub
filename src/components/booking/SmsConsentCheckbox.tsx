import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SmsConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function SmsConsentCheckbox({ checked, onCheckedChange }: SmsConsentCheckboxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <Checkbox
          id="sms-consent"
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          className="mt-1"
        />
        <Label htmlFor="sms-consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          I consent to receive transactional SMS messages from A-Z Enterprises related to my inquiry, appointment, or service request. Message frequency may vary. Message &amp; data rates may apply. Reply HELP for help or STOP to opt out.
        </Label>
      </div>
      <div className="text-xs text-muted-foreground/70 space-y-0.5 pl-7">
        <p>Message frequency may vary</p>
        <p>Message &amp; data rates may apply</p>
        <p>STOP to opt out, HELP for help</p>
      </div>
    </div>
  );
}
