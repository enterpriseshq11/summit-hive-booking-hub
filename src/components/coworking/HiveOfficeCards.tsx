import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHivePrivateOffices } from "@/hooks/useHivePrivateOffices";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import hiveOfficeS2 from "@/assets/hive-office-s2.jpg";
import hiveOfficeS1 from "@/assets/hive-office-s1.jpg";

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

  const getOfficeBackground = (officeCode: string) => {
    if (officeCode === "S2") return hiveOfficeS2;
    if (officeCode === "S1") return hiveOfficeS1;
    return null;
  };

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
          const bg = getOfficeBackground(office.code);
          return (
            <Card
              key={office.code}
              className={bg ? "overflow-hidden bg-cover bg-center" : "overflow-hidden"}
              style={
                bg
                  ? {
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${bg})`,
                    }
                  : undefined
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{office.code}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{office.label}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isBooked
                        ? "bg-muted/40 text-muted-foreground border-border"
                        : "bg-accent/15 text-accent border-accent/30"
                    }
                  >
                    {isBooked ? "Booked" : "Available"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-medium">{formatMonthly(office.monthly_rate)}</span>
                </div>

                {isBooked && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground/80">{bookedLabel(office.booked_until)}</p>
                      {office.notes ? <p className="mt-0.5">{office.notes}</p> : null}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
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
