import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useOfficeListing, 
  useOfficePhotos, 
  useActivePromotions,
  type OfficeStatus 
} from "@/hooks/useOfficeListings";
import { 
  Building2, Users, Square, MapPin, ArrowLeft, ArrowRight, Check,
  Calendar, MessageSquare, Clock, Sparkles, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, X, Phone
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SITE_CONFIG } from "@/config/siteConfig";
import { OfficeInquiryModal } from "@/components/coworking/OfficeInquiryModal";

const statusConfig: Record<OfficeStatus, { label: string; color: string; cta: string; ctaVariant: "default" | "secondary" | "outline" }> = {
  available: { label: "Available Now", color: "bg-green-500", cta: "Request This Office", ctaVariant: "default" },
  renovating: { label: "Renovating Soon", color: "bg-yellow-500", cta: "Get Notified", ctaVariant: "secondary" },
  waitlist: { label: "Join Waitlist", color: "bg-blue-500", cta: "Join Waitlist", ctaVariant: "secondary" },
  reserved: { label: "Reserved", color: "bg-orange-500", cta: "Ask About Availability", ctaVariant: "outline" },
  leased: { label: "Currently Leased", color: "bg-muted", cta: "View Other Offices", ctaVariant: "outline" },
};

export default function OfficeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: office, isLoading, error, refetch } = useOfficeListing(slug || "");
  const { data: photos } = useOfficePhotos(office?.id || "");
  const { data: promotions } = useActivePromotions();

  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryType, setInquiryType] = useState<"request" | "tour" | "waitlist" | "question">("request");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Get active promotion for this office
  const activePromotion = promotions?.find(p => 
    p.is_global || p.office_id === office?.id
  );

  const openInquiry = (type: "request" | "tour" | "waitlist" | "question") => {
    setInquiryType(type);
    setShowInquiryModal(true);
  };

  const formatPrice = () => {
    if (!office) return null;
    if (office.pricing_visibility === "hidden") return null;
    if (office.pricing_visibility === "qualitative") return office.price_range_text;
    if (office.pricing_visibility === "exact" && office.monthly_rate) {
      return `$${office.monthly_rate.toLocaleString()}/mo`;
    }
    return null;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Office not found</h2>
            <p className="text-muted-foreground mb-4">This listing may have been removed or the URL is incorrect.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => refetch()} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button asChild>
                <Link to="/coworking/offices">View All Offices</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!office) return null;

  const config = statusConfig[office.status];
  const price = formatPrice();
  const amenities = (office.amenities as string[]) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container pt-6 pb-4">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
          <Link to="/coworking/offices">
            <ArrowLeft className="h-4 w-4" />
            All Offices
          </Link>
        </Button>
      </div>

      {/* Promotion Banner */}
      {activePromotion && (
        <div className="bg-accent/10 border-y border-accent/20">
          <div className="container py-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <div>
                <span className="font-semibold text-accent">{activePromotion.headline}</span>
                {activePromotion.description && (
                  <span className="text-muted-foreground ml-2">— {activePromotion.description}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <div className="space-y-4">
              {photos && photos.length > 0 ? (
                <>
                  {/* Main Photo */}
                  <div 
                    className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setLightboxIndex(0);
                      setLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={photos[0].url} 
                      alt={photos[0].alt_text || office.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {photos.length > 1 && (
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="secondary" className="bg-black/60 text-white border-0">
                          +{photos.length - 1} photos
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Grid */}
                  {photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {photos.slice(1, 5).map((photo, i) => (
                        <div
                          key={photo.id}
                          className="aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
                          onClick={() => {
                            setLightboxIndex(i + 1);
                            setLightboxOpen(true);
                          }}
                        >
                          <img 
                            src={photo.url} 
                            alt={photo.alt_text || `${office.name} photo ${i + 2}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-20 w-20 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Office Info */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${config.color} text-white`}>
                      {config.label}
                    </Badge>
                    {office.is_featured && (
                      <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{office.name}</h1>
                  {office.tagline && (
                    <p className="text-lg text-muted-foreground">{office.tagline}</p>
                  )}
                </div>
              </div>

              {/* Quick Specs */}
              <div className="flex flex-wrap gap-4 py-4 border-y border-border">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span>{office.floor_label || `Floor ${office.floor}`}</span>
                </div>
                {office.square_footage && (
                  <div className="flex items-center gap-2">
                    <Square className="h-5 w-5 text-accent" />
                    <span>{office.square_footage} sq ft</span>
                  </div>
                )}
                {office.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    <span>Up to {office.capacity} {office.capacity === 1 ? 'person' : 'people'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {office.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">About This Space</h2>
                <p className="text-muted-foreground leading-relaxed">{office.description}</p>
              </div>
            )}

            {/* Ideal Use */}
            {office.ideal_use && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Ideal For</h2>
                <p className="text-muted-foreground">{office.ideal_use}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Included Amenities</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Check className="h-5 w-5 text-accent flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-24 shadow-lg border-accent/20">
              <div className="h-1 bg-gradient-to-r from-accent via-accent/80 to-accent" />
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pricing</span>
                  <Badge className={`${config.color} text-white`}>
                    {config.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {price ? (
                  <div>
                    <p className="text-3xl font-bold text-accent">{price}</p>
                    {office.deposit_amount && office.pricing_visibility === "exact" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        + ${office.deposit_amount.toLocaleString()} deposit
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Contact us for pricing details</p>
                )}

                {/* Primary CTA */}
                <Button 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 text-primary"
                  onClick={() => openInquiry(office.status === "waitlist" ? "waitlist" : "request")}
                >
                  {config.cta}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => openInquiry("tour")}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule Tour
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => openInquiry("question")}
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Ask Question
                  </Button>
                </div>

                {/* Trust Signals */}
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-accent" />
                    Response within 24 hours
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-accent" />
                    No obligation to proceed
                  </div>
                </div>

                {/* Phone */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Prefer to call?</p>
                  <a 
                    href={`tel:${SITE_CONFIG.contact.phone}`}
                    className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    {SITE_CONFIG.contact.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black border-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {photos && photos.length > 0 && (
              <>
                <img
                  src={photos[lightboxIndex].url}
                  alt={photos[lightboxIndex].alt_text || office.name}
                  className="w-full max-h-[80vh] object-contain"
                />

                {photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                      onClick={() => setLightboxIndex((i) => (i === 0 ? photos.length - 1 : i - 1))}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                      onClick={() => setLightboxIndex((i) => (i === photos.length - 1 ? 0 : i + 1))}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === lightboxIndex ? "bg-white" : "bg-white/50"
                          }`}
                          onClick={() => setLightboxIndex(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Inquiry Modal */}
      <OfficeInquiryModal
        open={showInquiryModal}
        onOpenChange={setShowInquiryModal}
        office={office}
        inquiryType={inquiryType}
      />

      <ScrollToTopButton />
    </div>
  );
}
