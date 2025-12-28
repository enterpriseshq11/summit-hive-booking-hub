import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PricingModifier {
  name: string;
  type: "percentage" | "fixed_amount";
  value: number;
  label?: string;
}

interface SelectedAddon {
  addon_id: string;
  name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface PriceSummaryProps {
  packageName?: string;
  packagePrice: number;
  addons?: SelectedAddon[];
  modifiers?: PricingModifier[];
  depositPercent?: number;
  balanceDueDate?: string;
  startDate?: string;
  durationMins?: number;
  guestCount?: number;
  isMember?: boolean;
  showDeposit?: boolean;
}

export function PriceSummary({
  packageName,
  packagePrice,
  addons = [],
  modifiers = [],
  depositPercent = 100,
  balanceDueDate,
  startDate,
  durationMins,
  guestCount,
  isMember = false,
  showDeposit = true,
}: PriceSummaryProps) {
  const calculations = useMemo(() => {
    let subtotal = packagePrice;

    // Add addons
    const addonsTotal = addons.reduce((sum, addon) => sum + addon.total_price, 0);
    subtotal += addonsTotal;

    // Apply modifiers
    let modifierTotal = 0;
    modifiers.forEach((mod) => {
      if (mod.type === "percentage") {
        modifierTotal += subtotal * (mod.value / 100);
      } else {
        modifierTotal += mod.value;
      }
    });

    const total = subtotal + modifierTotal;
    const depositAmount = showDeposit ? total * (depositPercent / 100) : total;
    const balanceAmount = total - depositAmount;

    return {
      subtotal,
      addonsTotal,
      modifierTotal,
      total,
      depositAmount,
      balanceAmount,
    };
  }, [packagePrice, addons, modifiers, depositPercent, showDeposit]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TooltipProvider>
      <Card className="sticky top-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Price Summary</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Booking details */}
          {(startDate || durationMins || guestCount) && (
            <div className="space-y-2 text-sm">
              {startDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(startDate)}</span>
                </div>
              )}
              {durationMins && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{durationMins} minutes</span>
                </div>
              )}
              {isMember && (
                <Badge variant="secondary" className="text-xs">
                  Member Pricing Applied
                </Badge>
              )}
            </div>
          )}

          <Separator />

          {/* Line items */}
          <div className="space-y-3">
            {/* Package */}
            {packageName && (
              <div className="flex justify-between">
                <span>{packageName}</span>
                <span>${packagePrice.toFixed(2)}</span>
              </div>
            )}

            {/* Addons */}
            {addons.length > 0 && (
              <div className="space-y-2">
                {addons.map((addon, i) => (
                  <div key={addon.addon_id || i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {addon.name || "Add-on"}
                      {addon.quantity > 1 && ` x${addon.quantity}`}
                    </span>
                    <span>${addon.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Modifiers / pricing labels */}
            {modifiers.length > 0 && (
              <div className="space-y-2">
                {modifiers.map((mod, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">{mod.name}</span>
                      {mod.label && (
                        <Badge variant="outline" className="text-xs">
                          {mod.label}
                        </Badge>
                      )}
                    </span>
                    <span className={mod.value < 0 ? "text-success" : ""}>
                      {mod.type === "percentage"
                        ? `${mod.value > 0 ? "+" : ""}${mod.value}%`
                        : `${mod.value > 0 ? "+" : ""}$${Math.abs(mod.value).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${calculations.total.toFixed(2)}</span>
            </div>

            {showDeposit && depositPercent < 100 && (
              <>
                <Separator />

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium">Due Today</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{depositPercent}% deposit required to secure booking</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <span className="font-semibold text-primary">
                      ${calculations.depositAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Balance due
                      {balanceDueDate && ` by ${formatDate(balanceDueDate)}`}
                    </span>
                    <span>${calculations.balanceAmount.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
