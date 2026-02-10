import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { useServiceDiscountConfig } from "@/hooks/usePromoCodes";

interface ServiceDiscountSelectorProps {
  businessUnit: string;
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
  eligibilityConfirmed: boolean;
  onEligibilityChange: (confirmed: boolean) => void;
  disabled?: boolean;
  hasPromoApplied?: boolean;
}

export function ServiceDiscountSelector({
  businessUnit,
  selectedCategory,
  onSelect,
  eligibilityConfirmed,
  onEligibilityChange,
  disabled,
  hasPromoApplied,
}: ServiceDiscountSelectorProps) {
  const { data: config } = useServiceDiscountConfig(businessUnit);

  if (!config?.enabled) return null;

  const categories = (config.categories || []) as string[];

  return (
    <div className="space-y-3 p-3 border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-blue-400" />
        <Label className="text-sm font-medium">Service Discounts ({config.discount_percent}% off)</Label>
      </div>

      {hasPromoApplied && selectedCategory && (
        <p className="text-xs text-amber-400">
          Discounts can't be combined. Choose promo code OR service discount.
        </p>
      )}

      <Select
        value={selectedCategory || "none"}
        onValueChange={(v) => onSelect(v === "none" ? null : v)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a discount" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat} ({config.discount_percent}%)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedCategory && (
        <div className="flex items-start gap-2">
          <Checkbox
            id="eligibility-confirm"
            checked={eligibilityConfirmed}
            onCheckedChange={(v) => onEligibilityChange(v === true)}
            disabled={disabled}
          />
          <label htmlFor="eligibility-confirm" className="text-xs text-muted-foreground cursor-pointer">
            I confirm I'm eligible for this discount.
          </label>
        </div>
      )}
    </div>
  );
}
