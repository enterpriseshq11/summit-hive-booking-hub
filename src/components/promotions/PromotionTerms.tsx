import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function PromotionTerms() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-gold" />
            General Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            All promotions, bundles, and special offers are subject to the following terms unless 
            otherwise stated in the specific offer details.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="w-5 h-5 text-gold" />
            What's Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              Benefits activate within 48 hours of qualification confirmation
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              All stated benefits apply for the duration of your active membership
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              Priority booking windows are guaranteed when booked 7+ days in advance
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              Concierge support available during business hours for all bundle members
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <XCircle className="w-5 h-5 text-gold" />
            Exclusions & Limitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              Offers cannot be stacked unless explicitly stated in offer details
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              Holiday and peak periods may have limited availability
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              Some premium services may require additional fees
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              Benefits are non-transferable and apply to the primary member only
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              Promotional offers are not redeemable for cash value
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="w-5 h-5 text-gold" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              A-Z reserves the right to modify or discontinue offers at any time
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              Final eligibility is determined at the time of activation
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              Questions about specific offers should be directed to our team
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              Corporate and custom bundles are subject to individual agreements
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          Questions? Contact us at <span className="text-gold">(419) 555-0100</span> or email{" "}
          <span className="text-gold">hello@az-wellness.com</span>
        </p>
      </div>
    </div>
  );
}
