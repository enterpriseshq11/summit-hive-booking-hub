import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Clock, Info } from "lucide-react";
import { useAddons } from "@/hooks/useAddons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SelectedAddon {
  addon_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface AddonBuilderProps {
  bookableTypeId?: string;
  businessId?: string;
  selectedAddons: SelectedAddon[];
  onAddonsChange: (addons: SelectedAddon[]) => void;
  durationMins?: number;
  guestCount?: number;
  isMember?: boolean;
}

export function AddonBuilder({
  bookableTypeId,
  businessId,
  selectedAddons,
  onAddonsChange,
  durationMins = 60,
  guestCount = 1,
  isMember = false,
}: AddonBuilderProps) {
  const { data: addons, isLoading } = useAddons(bookableTypeId, businessId);

  const calculatePrice = (addon: any, quantity: number): number => {
    const basePrice = isMember && addon.member_price ? addon.member_price : addon.base_price;

    switch (addon.pricing_mode) {
      case "per_hour":
        return basePrice * (durationMins / 60) * quantity;
      case "per_guest":
        return basePrice * guestCount * quantity;
      case "time_based":
        // Could implement time-of-day pricing here
        return basePrice * quantity;
      case "flat":
      default:
        return basePrice * quantity;
    }
  };

  const getPricingLabel = (addon: any): string => {
    switch (addon.pricing_mode) {
      case "per_hour":
        return "/hour";
      case "per_guest":
        return "/person";
      case "time_based":
        return "varies";
      default:
        return "";
    }
  };

  const isAddonSelected = (addonId: string): boolean => {
    return selectedAddons.some((a) => a.addon_id === addonId);
  };

  const getAddonQuantity = (addonId: string): number => {
    return selectedAddons.find((a) => a.addon_id === addonId)?.quantity || 0;
  };

  const toggleAddon = (addon: any) => {
    if (isAddonSelected(addon.id)) {
      onAddonsChange(selectedAddons.filter((a) => a.addon_id !== addon.id));
    } else {
      const quantity = 1;
      const totalPrice = calculatePrice(addon, quantity);
      onAddonsChange([
        ...selectedAddons,
        {
          addon_id: addon.id,
          quantity,
          unit_price: addon.base_price,
          total_price: totalPrice,
        },
      ]);
    }
  };

  const updateQuantity = (addon: any, newQuantity: number) => {
    const maxQty = addon.max_quantity || 10;
    const quantity = Math.max(0, Math.min(newQuantity, maxQty));

    if (quantity === 0) {
      onAddonsChange(selectedAddons.filter((a) => a.addon_id !== addon.id));
    } else {
      const totalPrice = calculatePrice(addon, quantity);
      const updated = selectedAddons.map((a) =>
        a.addon_id === addon.id
          ? { ...a, quantity, total_price: totalPrice }
          : a
      );

      if (!isAddonSelected(addon.id)) {
        updated.push({
          addon_id: addon.id,
          quantity,
          unit_price: addon.base_price,
          total_price: totalPrice,
        });
      }

      onAddonsChange(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add-ons</h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!addons || addons.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add-ons</h3>

        <div className="space-y-3">
          {addons.map((addon) => {
            const isSelected = isAddonSelected(addon.id);
            const quantity = getAddonQuantity(addon.id);
            const displayPrice = isMember && addon.member_price ? addon.member_price : addon.base_price;
            const pricingLabel = getPricingLabel(addon);
            const totalPrice = isSelected ? calculatePrice(addon, quantity) : displayPrice;
            const hasQuantity = (addon.max_quantity || 1) > 1;

            return (
              <div
                key={addon.id}
                className={`border rounded-lg p-4 transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleAddon(addon)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{addon.name}</span>
                        {addon.adds_duration_mins && addon.adds_duration_mins > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            +{addon.adds_duration_mins} min
                          </Badge>
                        )}
                        {addon.description && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{addon.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {addon.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {addon.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity controls (if applicable) */}
                    {hasQuantity && isSelected && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(addon, quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => updateQuantity(addon, parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-center"
                          min={0}
                          max={addon.max_quantity || 10}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(addon, quantity + 1)}
                          disabled={quantity >= (addon.max_quantity || 10)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Price */}
                    <div className="text-right min-w-[80px]">
                      <div className="font-semibold">
                        ${isSelected ? totalPrice.toFixed(2) : displayPrice.toFixed(2)}
                      </div>
                      {pricingLabel && (
                        <div className="text-xs text-muted-foreground">{pricingLabel}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
