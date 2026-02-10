import type { PromoCode } from "@/hooks/usePromoCodes";

interface CheckoutDiscountSummaryProps {
  subtotal: number;
  promoCode: PromoCode | null;
  serviceDiscountCategory: string | null;
  serviceDiscountPercent: number;
  /** Whether promo and service discount can stack */
  stackable?: boolean;
}

export function computeDiscounts({
  subtotal,
  promoCode,
  serviceDiscountCategory,
  serviceDiscountPercent,
  stackable = false,
}: CheckoutDiscountSummaryProps) {
  let promoDiscount = 0;
  let serviceDiscount = 0;

  const hasPromo = !!promoCode;
  const hasService = !!serviceDiscountCategory;

  // If both are selected and not stackable, only apply the one the user selected last
  // We'll prefer promo code when both are set and not stackable
  if (hasPromo) {
    if (promoCode!.discount_type === "percent") {
      promoDiscount = Math.round((subtotal * promoCode!.discount_value) / 100 * 100) / 100;
    } else {
      promoDiscount = Math.min(promoCode!.discount_value, subtotal);
    }
  }

  if (hasService && (!hasPromo || stackable)) {
    serviceDiscount = Math.round((subtotal * serviceDiscountPercent) / 100 * 100) / 100;
  }

  const totalDiscount = promoDiscount + serviceDiscount;
  const total = Math.max(0, subtotal - totalDiscount);

  return { promoDiscount, serviceDiscount, totalDiscount, total };
}

export function CheckoutDiscountSummary({
  subtotal,
  promoCode,
  serviceDiscountCategory,
  serviceDiscountPercent,
  stackable = false,
}: CheckoutDiscountSummaryProps) {
  const { promoDiscount, serviceDiscount, totalDiscount, total } = computeDiscounts({
    subtotal,
    promoCode,
    serviceDiscountCategory,
    serviceDiscountPercent,
    stackable,
  });

  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      {promoDiscount > 0 && (
        <div className="flex justify-between text-green-400">
          <span>Promo ({promoCode?.code})</span>
          <span>-${promoDiscount.toFixed(2)}</span>
        </div>
      )}
      {serviceDiscount > 0 && (
        <div className="flex justify-between text-blue-400">
          <span>{serviceDiscountCategory} discount</span>
          <span>-${serviceDiscount.toFixed(2)}</span>
        </div>
      )}
      {totalDiscount > 0 && (
        <>
          <div className="border-t border-border my-1" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
}
