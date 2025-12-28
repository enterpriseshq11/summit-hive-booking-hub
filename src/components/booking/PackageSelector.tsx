import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Users } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";

interface PackageSelectorProps {
  bookableTypeId: string;
  selectedPackageId?: string;
  onSelect: (packageData: any) => void;
  isMember?: boolean;
}

export function PackageSelector({
  bookableTypeId,
  selectedPackageId,
  onSelect,
  isMember = false,
}: PackageSelectorProps) {
  const { data: packages, isLoading } = usePackages(bookableTypeId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select a Package</h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No packages available for this service.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select a Package</h3>

      <div className="grid gap-4">
        {packages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;
          const displayPrice = isMember && pkg.member_price ? pkg.member_price : pkg.base_price;
          const hasDiscount = isMember && pkg.member_price && pkg.member_price < pkg.base_price;

          // Parse included items if stored as JSON
          let includedItems: string[] = [];
          if (pkg.included_items) {
            try {
              includedItems = Array.isArray(pkg.included_items)
                ? pkg.included_items
                : JSON.parse(pkg.included_items as string);
            } catch {
              includedItems = [];
            }
          }

          return (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-primary/50"
              }`}
              onClick={() => onSelect(pkg)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {pkg.name}
                      {hasDiscount && (
                        <Badge variant="secondary" className="text-xs">
                          Member Price
                        </Badge>
                      )}
                    </CardTitle>
                    {pkg.description && (
                      <CardDescription className="mt-1">
                        {pkg.description}
                      </CardDescription>
                    )}
                  </div>
                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Duration and capacity info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{pkg.duration_mins} min</span>
                  </div>
                </div>

                {/* Included items */}
                {includedItems.length > 0 && (
                  <ul className="space-y-1">
                    {includedItems.slice(0, 4).map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 text-success" />
                        <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                      </li>
                    ))}
                    {includedItems.length > 4 && (
                      <li className="text-sm text-muted-foreground">
                        +{includedItems.length - 4} more included
                      </li>
                    )}
                  </ul>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    ${displayPrice.toFixed(0)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${pkg.base_price.toFixed(0)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
