import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHivePrivateOffices } from "@/hooks/useHivePrivateOffices";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, Clock, ImageIcon } from "lucide-react";
import p1OfficePhoto1 from "@/assets/hive-office-p1.png";
import s1OfficePhoto1 from "@/assets/hive-office-s1.jpg";
import s1OfficePhoto2 from "@/assets/hive-office-s1-2.jpg";
import s2OfficePhoto1 from "@/assets/hive-office-s2.jpg";
import s2OfficePhoto2 from "@/assets/hive-office-s2-2.jpg";
import p2OfficePhoto1 from "@/assets/hive-office-p2-1.png";
import p2OfficePhoto2 from "@/assets/hive-office-p2-2.jpg";
import { format } from "date-fns";
import { useState } from "react";
import { OfficePhotoGalleryModal } from "./OfficePhotoGalleryModal";

// Photo arrays - add more photos here as needed
const P1_PHOTOS = [p1OfficePhoto1];
const S1_PHOTOS = [s1OfficePhoto1, s1OfficePhoto2];
const S2_PHOTOS = [s2OfficePhoto1, s2OfficePhoto2];
const P2_PHOTOS = [p2OfficePhoto1, p2OfficePhoto2];

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
  const [p1GalleryOpen, setP1GalleryOpen] = useState(false);
  const [s1GalleryOpen, setS1GalleryOpen] = useState(false);
  const [s2GalleryOpen, setS2GalleryOpen] = useState(false);
  const [p2GalleryOpen, setP2GalleryOpen] = useState(false);

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

  // Helper to get display info for each office (main label + optional subtext)
  const getDisplayInfo = (code: string): { label: string; subtext?: string } => {
    switch (code) {
      case "P1": return { label: "Private Office P1", subtext: "First Floor" };
      case "P2": return { label: "Private Office P2", subtext: "First Floor" };
      case "S1": return { label: "Private Office S1", subtext: "Second Floor" };
      case "S2": return { label: "Private Office S2", subtext: "Second Floor" };
      default: return { label: code };
    }
  };

  // Helper to render a photo card (S1, S2, or P2)
  const renderPhotoCard = (
    office: typeof data[0],
    photos: string[],
    setGalleryOpen: (open: boolean) => void
  ) => {
    const isBooked = office.status === "booked";
    const displayInfo = getDisplayInfo(office.code);

    return (
      <Card 
        key={office.code} 
        className="overflow-hidden relative flex flex-col"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${photos[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Clickable photo area */}
        <div 
          className="flex-1 cursor-pointer group"
          onClick={() => setGalleryOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setGalleryOpen(true)}
          aria-label="View office photos"
        >
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base flex items-center gap-2 text-white font-bold drop-shadow-md">
                  <Building2 className="h-4 w-4 text-white/90" />
                  <span className="truncate">{office.code}</span>
                </CardTitle>
                <p className="text-sm mt-1 text-white/90 font-semibold drop-shadow-md">{displayInfo.label}</p>
                {displayInfo.subtext && (
                  <p className="text-xs mt-0.5 text-white/70 font-medium drop-shadow-sm">{displayInfo.subtext}</p>
                )}
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

          <CardContent className="pt-0 space-y-3 relative z-10">
            <div className="flex items-center justify-between text-sm text-white/90">
              <span className="text-white/80 font-medium drop-shadow-sm">Monthly</span>
              <span className="font-bold text-white drop-shadow-md">{formatMonthly(office.monthly_rate)}</span>
            </div>

            {isBooked && (
              <div className="flex items-start gap-2 text-xs text-white/80">
                <Calendar className="h-3.5 w-3.5 mt-0.5" />
                <div>
                  <p className="font-medium text-white/90 drop-shadow-sm">{bookedLabel(office.booked_until)}</p>
                  {office.notes ? <p className="mt-0.5">{office.notes}</p> : null}
                </div>
              </div>
            )}

            {/* Photo hint */}
            <div className="flex items-center gap-1.5 text-xs text-white/70 group-hover:text-white/90 transition-colors">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Click to view photos</span>
            </div>
          </CardContent>
        </div>

        {/* Request button - separate from photo click area */}
        <div className="p-4 pt-0 relative z-10">
          <Button
            className="w-full font-bold"
            variant={isBooked ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              onRequestOffice(office.code);
            }}
            data-event="hive_office_card_request_click"
          >
            Request this Office
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="h-4 w-4" />
        Available Spaces
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((office) => {
          const isP1 = office.code === "P1";
          const isS1 = office.code === "S1";
          const isS2 = office.code === "S2";
          const isP2 = office.code === "P2";
          
          // Photo cards for P1, S1, S2, and P2
          if (isP1) {
            return renderPhotoCard(office, P1_PHOTOS, setP1GalleryOpen);
          }
          if (isS1) {
            return renderPhotoCard(office, S1_PHOTOS, setS1GalleryOpen);
          }
          if (isS2) {
            return renderPhotoCard(office, S2_PHOTOS, setS2GalleryOpen);
          }
          if (isP2) {
            return renderPhotoCard(office, P2_PHOTOS, setP2GalleryOpen);
          }

          // Fallback for any future offices
          return null;
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Request-based — no payment collected now.
      </p>

      {/* P1 Photo Gallery Modal */}
      <OfficePhotoGalleryModal
        open={p1GalleryOpen}
        onOpenChange={setP1GalleryOpen}
        photos={P1_PHOTOS}
      />

      {/* S1 Photo Gallery Modal */}
      <OfficePhotoGalleryModal
        open={s1GalleryOpen}
        onOpenChange={setS1GalleryOpen}
        photos={S1_PHOTOS}
      />

      {/* S2 Photo Gallery Modal */}
      <OfficePhotoGalleryModal
        open={s2GalleryOpen}
        onOpenChange={setS2GalleryOpen}
        photos={S2_PHOTOS}
      />

      {/* P2 Photo Gallery Modal */}
      <OfficePhotoGalleryModal
        open={p2GalleryOpen}
        onOpenChange={setP2GalleryOpen}
        photos={P2_PHOTOS}
      />
    </div>
  );
}
