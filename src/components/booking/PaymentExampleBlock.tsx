import { DollarSign, ArrowRight } from "lucide-react";

export function PaymentExampleBlock() {
  return (
    <div className="bg-card/50 border border-accent/20 rounded-xl p-6 mt-6">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <DollarSign className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="font-semibold text-primary-foreground mb-2">What You Pay Today (Example)</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-primary-foreground/50 text-xs uppercase tracking-wide">Total</p>
              <p className="font-bold text-primary-foreground">$200</p>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3 text-accent" />
              <div>
                <p className="text-primary-foreground/50 text-xs uppercase tracking-wide">Deposit Today</p>
                <p className="font-bold text-accent">$50</p>
              </div>
            </div>
            <div>
              <p className="text-primary-foreground/50 text-xs uppercase tracking-wide">Due on Arrival</p>
              <p className="font-bold text-primary-foreground">$150</p>
            </div>
          </div>
          <p className="text-xs text-primary-foreground/50 mt-3">
            Deposit amounts vary by service. You'll see the exact breakdown before confirming.
          </p>
        </div>
      </div>
    </div>
  );
}
