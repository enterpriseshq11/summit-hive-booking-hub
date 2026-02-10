import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, X, Loader2 } from "lucide-react";
import { useValidatePromoCode, type PromoCode } from "@/hooks/usePromoCodes";

interface PromoCodeInputProps {
  businessUnit: string;
  appliedPromo: PromoCode | null;
  onApply: (promo: PromoCode | null) => void;
  disabled?: boolean;
  initialCode?: string;
}

export function PromoCodeInput({ businessUnit, appliedPromo, onApply, disabled, initialCode }: PromoCodeInputProps) {
  const [code, setCode] = useState(initialCode || "");
  const [searchCode, setSearchCode] = useState<string | null>(initialCode || null);
  const { data: validatedPromo, isLoading } = useValidatePromoCode(searchCode, businessUnit);

  const handleApply = () => {
    if (!code.trim()) return;
    setSearchCode(code.trim().toUpperCase());
    // Once validated, apply via effect
  };

  // Auto-apply when validation completes
  if (searchCode && validatedPromo && !appliedPromo) {
    onApply(validatedPromo);
  }

  const handleRemove = () => {
    onApply(null);
    setCode("");
    setSearchCode(null);
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <Tag className="h-4 w-4 text-green-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-400">
            {appliedPromo.code} applied
            {appliedPromo.discount_type === "percent"
              ? ` (${appliedPromo.discount_value}% off)`
              : ` ($${appliedPromo.discount_value} off)`}
          </p>
          {appliedPromo.description && (
            <p className="text-xs text-muted-foreground">{appliedPromo.description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleRemove} className="h-6 w-6" disabled={disabled}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <Input
          placeholder="Have a promo code?"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
          className="flex-1"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleApply}
          disabled={disabled || isLoading || !code.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {searchCode && !isLoading && !validatedPromo && (
        <p className="text-xs text-destructive">Invalid or expired promo code.</p>
      )}
    </div>
  );
}
