import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Info, ChevronUp, ChevronDown, Shield, CreditCard } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

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
  bookingType?: "instant" | "request";
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
  bookingType = "instant",
}: PriceSummaryProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Mobile sticky bottom sheet
  if (isMobile) {
    return (
      <TooltipProvider>
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          {/* Collapsed View */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="text-left">
                <p className="text-xs text-muted-foreground">
                  {showDeposit && depositPercent < 100 ? "Due Today" : "Total"}
                </p>
                <p className="text-xl font-bold">
                  ${showDeposit && depositPercent < 100 
                    ? calculations.depositAmount.toFixed(2) 
                    : calculations.total.toFixed(2)}
                </p>
              </div>
              {showDeposit && depositPercent < 100 && (
                <Badge variant="secondary" className="text-xs">
                  {depositPercent}% deposit
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {/* Expanded View */}
          {isExpanded && (
            <div className="px-4 pb-4 pt-2 border-t space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Booking details */}
              {(startDate || durationMins) && (
                <div className="flex flex-wrap gap-4 text-sm">
                  {startDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(startDate)}</span>
                    </div>
                  )}
                  {durationMins && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{durationMins} min</span>
                    </div>
                  )}
                  {isMember && (
                    <Badge variant="secondary" className="text-xs">
                      Member Pricing
                    </Badge>
                  )}
                </div>
              )}

              <Separator />

              {/* Line items */}
              <div className="space-y-2">
                {packageName && (
                  <div className="flex justify-between text-sm">
                    <span>{packageName}</span>
                    <span>${packagePrice.toFixed(2)}</span>
                  </div>
                )}
                {addons.map((addon, i) => (
                  <div key={addon.addon_id || i} className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {addon.name || "Add-on"}
                      {addon.quantity > 1 && ` x${addon.quantity}`}
                    </span>
                    <span>${addon.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${calculations.total.toFixed(2)}</span>
                </div>

                {showDeposit && depositPercent < 100 && (
                  <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Due Today ({depositPercent}%)</span>
                      <span className="font-bold text-primary">
                        ${calculations.depositAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Balance{balanceDueDate && ` by ${formatDate(balanceDueDate)}`}
                      </span>
                      <span>${calculations.balanceAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking type indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Shield className="h-3 w-3" />
                <span>
                  {bookingType === "instant" 
                    ? "Instant confirmation" 
                    : "Request sent for approval (24h response)"}
                </span>
              </div>
            </div>
          )}
        </div>
        {/* Spacer to prevent content from being hidden behind sticky footer */}
        <div className="h-20" />
      </TooltipProvider>
    );
  }

  // Desktop card view
  return (
    <TooltipProvider>
      <Card className="sticky top-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Price Summary
          </CardTitle>
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

                <div className="bg-primary/5 rounded-lg p-4 space-y-3">
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
                    <span className="font-bold text-lg text-primary">
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

          {/* Booking type indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Shield className="h-3 w-3" />
            <span>
              {bookingType === "instant" 
                ? "Instant confirmation • Secure payment" 
                : "Request sent for approval (24h response)"}
            </span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
