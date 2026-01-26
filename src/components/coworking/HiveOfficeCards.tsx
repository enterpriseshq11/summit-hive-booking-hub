import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHivePrivateOffices } from "@/hooks/useHivePrivateOffices";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Building2, Calendar, Clock, X, ZoomIn } from "lucide-react";
import { format } from "date-fns";
import s2OfficePhoto from "@/assets/hive-office-s2.jpg";

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
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

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
          
          // S2 card with photo background and special layout
          if (isS2) {
            return (
              <Card 
                key={office.code} 
                className="overflow-hidden relative flex flex-col min-h-[220px]"
              >
                {/* Clickable photo background layer */}
                <div 
                  className="absolute inset-0 cursor-pointer group"
                  onClick={() => setPhotoModalOpen(true)}
                  style={{
                    backgroundImage: `url(${s2OfficePhoto})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                  {/* Zoom hint icon */}
                  <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Content layer */}
                <CardHeader className="pb-2 relative z-10 flex-shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base flex items-center gap-2 text-white font-bold drop-shadow-md">
                        <Building2 className="h-4 w-4 text-white/90" />
                        <span className="truncate">{office.code}</span>
                      </CardTitle>
                      <p className="text-sm mt-1 text-white/90 font-semibold drop-shadow-md">{displayLabel}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        isBooked
                          ? "bg-muted/40 text-muted-foreground border-border"
                          : "bg-accent/30 text-white border-accent/50 font-semibold"
                      }
                    >
                      {isBooked ? "Booked" : "Available"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative z-10 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-sm text-white/90 mb-2">
                    <span className="text-white/80 font-medium drop-shadow-sm">Monthly</span>
                    <span className="font-bold text-white drop-shadow-md">{formatMonthly(office.monthly_rate)}</span>
                  </div>

                  {isBooked && (
                    <div className="flex items-start gap-2 text-xs text-white/80 mb-2">
                      <Calendar className="h-3.5 w-3.5 mt-0.5" />
                      <div>
                        <p className="font-medium text-white/90 drop-shadow-sm">{bookedLabel(office.booked_until)}</p>
                        {office.notes ? <p className="mt-0.5">{office.notes}</p> : null}
                      </div>
                    </div>
                  )}

                  {/* Spacer to push button to bottom */}
                  <div className="flex-1" />

                  {/* Button at bottom */}
                  <Button
                    className="w-full font-bold mt-auto"
                    variant={isBooked ? "outline" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestOffice(office.code);
                    }}
                    data-event="hive_office_card_request_click"
                  >
                    Request this Office
                  </Button>
                </CardContent>
              </Card>
            );
          }

          // Default card for P1, P2, S1
          return (
            <Card key={office.code} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{office.code}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{displayLabel}</p>
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

      {/* S2 Photo Lightbox Modal */}
      <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <DialogContent className="max-w-3xl p-0 bg-black/95 border-none overflow-hidden">
          <button
            onClick={() => setPhotoModalOpen(false)}
            className="absolute top-3 right-3 z-50 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="relative w-full flex items-center justify-center p-4">
            <img 
              src={s2OfficePhoto} 
              alt="S2 Office - Second Floor 2" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
