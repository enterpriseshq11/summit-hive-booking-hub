import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficeListings, useActivePromotions, type OfficeStatus, type OfficeType, type OfficeListing } from "@/hooks/useOfficeListings";
import { 
  Building2, Users, Square, MapPin, ArrowRight, Filter, 
  Sparkles, Clock, AlertCircle, RefreshCw
} from "lucide-react";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";

const statusConfig: Record<OfficeStatus, { label: string; color: string; showPublic: boolean }> = {
  available: { label: "Available", color: "bg-green-500", showPublic: true },
  renovating: { label: "Renovating Soon", color: "bg-yellow-500", showPublic: true },
  waitlist: { label: "Join Waitlist", color: "bg-blue-500", showPublic: true },
  reserved: { label: "Reserved", color: "bg-orange-500", showPublic: true },
  leased: { label: "Leased", color: "bg-muted", showPublic: false },
};

const typeLabels: Record<OfficeType, string> = {
  private_office: "Private Office",
  dedicated_desk: "Dedicated Desk",
  day_pass: "Day Pass",
  executive_suite: "Executive Suite",
};

export default function OfficeListingsHub() {
  const { data: listings, isLoading, error, refetch } = useOfficeListings({ activeOnly: true });
  const { data: promotions } = useActivePromotions();
  
  const [filterStatus, setFilterStatus] = useState<OfficeStatus | "all">("all");
  const [filterFloor, setFilterFloor] = useState<number | "all">("all");
  const [filterType, setFilterType] = useState<OfficeType | "all">("all");

  // Get unique floors from listings
  const floors = [...new Set(listings?.map(l => l.floor) || [])].sort();

  // Filter and sort listings (available first, then renovating, waitlist, reserved - hide leased)
  const filteredListings = listings
    ?.filter(listing => {
      if (!statusConfig[listing.status].showPublic && listing.status !== "leased") return false;
      if (filterStatus !== "all" && listing.status !== filterStatus) return false;
      if (filterFloor !== "all" && listing.floor !== filterFloor) return false;
      if (filterType !== "all" && listing.office_type !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      const statusOrder: Record<OfficeStatus, number> = { 
        available: 0, renovating: 1, waitlist: 2, reserved: 3, leased: 4 
      };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  // Get active promotion for a listing
  const getPromotion = (listing: OfficeListing) => {
    return promotions?.find(p => 
      p.is_global || p.office_id === listing.id
    );
  };

  // Format pricing display
  const formatPrice = (listing: OfficeListing) => {
    if (listing.pricing_visibility === "hidden") return null;
    if (listing.pricing_visibility === "qualitative") return listing.price_range_text;
    if (listing.pricing_visibility === "exact" && listing.monthly_rate) {
      return `$${listing.monthly_rate.toLocaleString()}/mo`;
    }
    return null;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to load offices</h2>
            <p className="text-muted-foreground mb-4">Please try again in a moment.</p>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-sm font-semibold text-accent border border-accent/30 mb-6">
              <Building2 className="h-4 w-4" />
              Available Offices
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Find Your Perfect Workspace
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-xl">
              Browse our available offices and flexible workspaces. Request access to any listing and we'll respond within 24 hours.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Filters */}
      <section className="container py-8">
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            
            <Select value={filterType} onValueChange={(v) => setFilterType(v as OfficeType | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFloor.toString()} onValueChange={(v) => setFilterFloor(v === "all" ? "all" : parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map((f) => (
                  <SelectItem key={f} value={f.toString()}>Floor {f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as OfficeStatus | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig)
                  .filter(([_, cfg]) => cfg.showPublic)
                  .map(([value, cfg]) => (
                    <SelectItem key={value} value={value}>{cfg.label}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            <div className="ml-auto text-sm text-muted-foreground">
              {filteredListings?.length || 0} {filteredListings?.length === 1 ? 'office' : 'offices'}
            </div>
          </div>
        </Card>
      </section>

      {/* Listings Grid */}
      <section className="container pb-20">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filteredListings?.length ? (
          <Card className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No offices match your criteria</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or contact us about upcoming availability.</p>
            <Button asChild variant="outline">
              <Link to="/coworking">Back to Coworking</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
              const promotion = getPromotion(listing);
              const price = formatPrice(listing);
              const config = statusConfig[listing.status];

              return (
                <Card 
                  key={listing.id} 
                  className="overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all group"
                >
                  {/* Image placeholder / primary photo */}
                  <div className="relative h-48 bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${config.color} text-white`}>
                        {config.label}
                      </Badge>
                    </div>

                    {/* Promotion Badge */}
                    {promotion && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-accent text-primary gap-1">
                          <Sparkles className="h-3 w-3" />
                          {promotion.badge_text || "Special Offer"}
                        </Badge>
                      </div>
                    )}

                    {/* Featured indicator */}
                    {listing.is_featured && (
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Title & Tagline */}
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                      {listing.name}
                    </h3>
                    {listing.tagline && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                        {listing.tagline}
                      </p>
                    )}

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {listing.floor_label || `Floor ${listing.floor}`}
                      </span>
                      {listing.square_footage && (
                        <span className="inline-flex items-center gap-1">
                          <Square className="h-3.5 w-3.5" />
                          {listing.square_footage} sq ft
                        </span>
                      )}
                      {listing.capacity && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Up to {listing.capacity}
                        </span>
                      )}
                    </div>

                    {/* Type Badge */}
                    <div className="mb-4">
                      <Badge variant="outline">
                        {typeLabels[listing.office_type]}
                      </Badge>
                    </div>

                    {/* Price */}
                    {price && (
                      <p className="text-lg font-semibold text-accent mb-4">
                        {price}
                      </p>
                    )}

                    {/* CTA */}
                    <Button asChild className="w-full bg-accent hover:bg-accent/90 text-primary">
                      <Link to={`/coworking/offices/${listing.slug}`}>
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Don't see the perfect space?
          </h2>
          <p className="text-primary-foreground/70 mb-6 max-w-md mx-auto">
            Contact us about upcoming availability or custom workspace solutions.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary">
            <Link to="/coworking">
              <Clock className="h-5 w-5 mr-2" />
              Request Workspace
            </Link>
          </Button>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
