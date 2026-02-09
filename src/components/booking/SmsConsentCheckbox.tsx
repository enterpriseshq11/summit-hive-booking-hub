import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SmsConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function SmsConsentCheckbox({ checked, onCheckedChange }: SmsConsentCheckboxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Checkbox
          id="sms-consent"
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          className="mt-1"
        />
        <Label htmlFor="sms-consent" className="text-xs text-muted-foreground leading-relaxed font-normal cursor-pointer">
          I consent to receive transactional SMS messages from A-Z Enterprises related to my inquiry, appointment, or service request. Message frequency may vary. Message &amp; data rates may apply. Reply HELP for help or STOP to opt out.
        </Label>
      </div>
      <div className="pl-7 space-y-0.5">
        <p className="text-[11px] text-muted-foreground/70">Message frequency may vary</p>
        <p className="text-[11px] text-muted-foreground/70">Message &amp; data rates may apply</p>
        <p className="text-[11px] text-muted-foreground/70">STOP to opt out, HELP for help</p>
      </div>
    </div>
  );
}
