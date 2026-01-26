import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHivePrivateOffices } from "@/hooks/useHivePrivateOffices";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, Clock } from "lucide-react";
import s2OfficePhoto from "@/assets/hive-office-s2.jpg";
import { format } from "date-fns";

type Props = {
  onRequestOffice: (officeCode: string) => void;
};

function formatMonthly(amount: number) {
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`;
}

function bookedLabel(bookedUntil: string | null) {
  if (!bookedUntil) return "Booked";
  try {
    return `Booked until ${format(new Date(bookedUntil), "MMM d, yyyy")}`;
  } catch {
    return "Booked";
  }
}

export function HiveOfficeCards({ onRequestOffice }: Props) {
  const { data, isLoading, isError } = useHivePrivateOffices();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          Available Spaces
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.length) {
    // Fallback UI if availability can't load
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" />
          Available Spaces
        </div>
        <div className="border border-border rounded-lg bg-muted/5 p-4 text-sm text-muted-foreground">
          Availability is temporarily unavailable. You can still request a workspace.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="h-4 w-4" />
        Available Spaces
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((office) => {
          const isBooked = office.status === "booked";
          const isS2 = office.code === "S2";
          
          // Override label for S2 only
          const displayLabel = isS2 ? "Second Floor 2" : office.label;
          
          return (
            <Card 
              key={office.code} 
              className="overflow-hidden relative"
              style={isS2 ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${s2OfficePhoto})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } : undefined}
            >
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className={`text-base flex items-center gap-2 ${isS2 ? "text-white font-bold drop-shadow-md" : ""}`}>
                      <Building2 className={`h-4 w-4 ${isS2 ? "text-white/90" : "text-muted-foreground"}`} />
                      <span className="truncate">{office.code}</span>
                    </CardTitle>
                    <p className={`text-sm mt-1 ${isS2 ? "text-white/90 font-semibold drop-shadow-md" : "text-muted-foreground"}`}>{displayLabel}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isBooked
                        ? "bg-muted/40 text-muted-foreground border-border"
                        : isS2
                          ? "bg-accent/30 text-white border-accent/50 font-semibold"
                          : "bg-accent/15 text-accent border-accent/30"
                    }
                  >
                    {isBooked ? "Booked" : "Available"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3 relative z-10">
                <div className={`flex items-center justify-between text-sm ${isS2 ? "text-white/90" : ""}`}>
                  <span className={isS2 ? "text-white/80 font-medium drop-shadow-sm" : "text-muted-foreground"}>Monthly</span>
                  <span className={`font-bold ${isS2 ? "text-white drop-shadow-md" : ""}`}>{formatMonthly(office.monthly_rate)}</span>
                </div>

                {isBooked && (
                  <div className={`flex items-start gap-2 text-xs ${isS2 ? "text-white/80" : "text-muted-foreground"}`}>
                    <Calendar className="h-3.5 w-3.5 mt-0.5" />
                    <div>
                      <p className={`font-medium ${isS2 ? "text-white/90 drop-shadow-sm" : "text-foreground/80"}`}>{bookedLabel(office.booked_until)}</p>
                      {office.notes ? <p className="mt-0.5">{office.notes}</p> : null}
                    </div>
                  </div>
                )}

                <Button
                  className={`w-full ${isS2 ? "font-bold" : ""}`}
                  variant={isBooked ? "outline" : "default"}
                  onClick={() => onRequestOffice(office.code)}
                  data-event="hive_office_card_request_click"
                >
                  Request this Office
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Request-based — no payment collected now.
      </p>
    </div>
  );
}
