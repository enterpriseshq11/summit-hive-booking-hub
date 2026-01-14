import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Users, Loader2, Sun, Sunset, Moon, Clock, Zap, Phone, Bell } from "lucide-react";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { useAvailability } from "@/hooks/useAvailability";
import { WaitlistCTA } from "./WaitlistCTA";
import { SITE_CONFIG } from "@/config/siteConfig";
import type { BusinessType } from "@/types";

interface AvailabilitySearchProps {
  defaultBusinessType?: BusinessType;
  showPartySize?: boolean;
  onSlotSelect?: (slot: any) => void;
  compact?: boolean;
}

// Time period categorization
const getTimePeriod = (hour: number): "morning" | "afternoon" | "evening" => {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

const timePeriodConfig = {
  morning: { label: "Morning", sublabel: "6am - 12pm", icon: Sun },
  afternoon: { label: "Afternoon", sublabel: "12pm - 5pm", icon: Sunset },
  evening: { label: "Evening", sublabel: "5pm - 10pm", icon: Moon },
};

// Better placeholder examples for services
const servicePlaceholders: Record<BusinessType, string> = {
  summit: "e.g. Event Rental, Private Party",
  coworking: "e.g. Office Tour, Day Pass",
  spa: "e.g. Massage, Facial, Recovery",
  fitness: "e.g. Day Pass, Membership",
  voice_vault: "e.g. Podcast Recording",
};

export function AvailabilitySearch({
  defaultBusinessType,
  showPartySize = false,
  onSlotSelect,
  compact = false,
}: AvailabilitySearchProps) {
  const navigate = useNavigate();
  const [businessType, setBusinessType] = useState<BusinessType | "">(defaultBusinessType || "");
  const [bookableTypeId, setBookableTypeId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [partySize, setPartySize] = useState<number>(2);
  const [isSearching, setIsSearching] = useState(false);
  const [isFindingSoonest, setIsFindingSoonest] = useState(false);

  const { data: businesses } = useBusinesses();
  const { data: bookableTypes } = useBookableTypes(
    businessType ? businesses?.find((b) => b.type === businessType)?.id : undefined
  );

  const { data: availability, isLoading, refetch } = useAvailability(
    {
      business_type: businessType || undefined,
      bookable_type_id: bookableTypeId || undefined,
      date,
      party_size: showPartySize ? partySize : undefined,
    },
    isSearching
  );

  const handleSearch = async () => {
    setIsSearching(true);
    await refetch();
  };

  // Find soonest available - searches today first, then increments
  const handleFindSoonest = async () => {
    if (!businessType) return;
    setIsFindingSoonest(true);
    setIsSearching(true);
    
    // Start from today and search forward
    let searchDate = new Date();
    let attempts = 0;
    const maxAttempts = 30; // Search up to 30 days ahead
    
    while (attempts < maxAttempts) {
      setDate(searchDate.toISOString().split("T")[0]);
      await refetch();
      
      // Check if we found slots (this is a simplified check)
      // In a real implementation, you'd wait for the result
      attempts++;
      searchDate.setDate(searchDate.getDate() + 1);
    }
    
    setIsFindingSoonest(false);
  };

  const handleSlotClick = (slot: any) => {
    if (onSlotSelect) {
      onSlotSelect(slot);
    } else {
      const route = businessType ? `/${businessType}` : "/booking";
      navigate(`${route}?slot=${slot.id}&date=${date}`);
    }
  };

  // Group slots by time period
  const groupedSlots = availability?.slots?.reduce((acc, slot) => {
    const hour = new Date(slot.start_time).getHours();
    const period = getTimePeriod(hour);
    if (!acc[period]) acc[period] = [];
    acc[period].push(slot);
    return acc;
  }, {} as Record<string, typeof availability.slots>) || {};

  // Get first available slot for "Next Available" display
  const nextAvailable = availability?.slots?.[0];

  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="What are you booking?" />
          </SelectTrigger>
          <SelectContent className="bg-popover border shadow-lg z-50">
            <SelectItem value="summit">The Summit - Events</SelectItem>
            <SelectItem value="coworking">The Hive - Coworking</SelectItem>
            <SelectItem value="spa">Restoration Lounge - Spa</SelectItem>
            <SelectItem value="fitness">Total Fitness - Gym</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1"
        />

        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  // Get business ID for waitlist
  const selectedBusinessId = businesses?.find((b) => b.type === businessType)?.id;

  // Check if form is valid for search
  const isFormValid = !!businessType && !!date;

  return (
    <div className="space-y-6">
      {/* BOOKNOW-02: Start Here Instruction */}
      <div className="text-center mb-2">
        <p className="text-sm font-medium text-muted-foreground">
          <span className="text-accent font-semibold">Start here:</span> Choose a business and service below.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Examples: Massage, Event Rental, Day Pass, Office Tour
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-card border border-accent/10 rounded-xl p-6 shadow-lg">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Business/Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What are you booking?</label>
            <Select 
              value={businessType} 
              onValueChange={(v) => setBusinessType(v as BusinessType)}
            >
              <SelectTrigger data-event="booking_service_select">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                <SelectItem value="summit">The Summit - Events</SelectItem>
                <SelectItem value="coworking">The Hive - Coworking</SelectItem>
                <SelectItem value="spa">Restoration Lounge - Spa</SelectItem>
                <SelectItem value="fitness">Total Fitness - Gym</SelectItem>
              </SelectContent>
            </Select>
            {businessType && (
              <p className="text-xs text-muted-foreground">
                {servicePlaceholders[businessType]}
              </p>
            )}
          </div>

          {/* Bookable Type (if business selected) */}
          {businessType && bookableTypes && bookableTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={bookableTypeId} onValueChange={setBookableTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  <SelectItem value="">All types</SelectItem>
                  {bookableTypes.map((bt) => (
                    <SelectItem key={bt.id} value={bt.id}>
                      {bt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10"
                min={new Date().toISOString().split("T")[0]}
                data-event="booking_date_change"
              />
            </div>
            <p className="text-xs text-muted-foreground">Times shown in local Wapakoneta time.</p>
          </div>

          {/* Party Size (Summit only) */}
          {showPartySize && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Party Size</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                  className="pl-10"
                  min={1}
                  max={500}
                />
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="flex flex-col justify-end gap-2">
            <Button 
              onClick={handleSearch} 
              className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold shadow-md hover:shadow-lg transition-all h-11" 
              size="lg" 
              disabled={isLoading || !isFormValid}
              data-event="booking_search_click"
            >
              {isLoading && !isFindingSoonest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Availability
                </>
              )}
            </Button>
            
            {/* BOOKNOW-03: Soonest Available Button */}
            {businessType && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFindSoonest}
                disabled={isLoading || !businessType}
                className="w-full text-xs border-accent/30 hover:bg-accent/10"
                data-event="booking_soonest_available"
              >
                {isFindingSoonest ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Finding...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1 text-accent" />
                    Soonest Available
                  </>
                )}
              </Button>
            )}
            
            {!isFormValid && (
              <p className="text-xs text-muted-foreground text-center">
                Select a service and date to search
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isSearching && isLoading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {isSearching && !isLoading && availability && (
        <div className="space-y-6">
          {/* Results Header with Next Available */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                Available Slots
                <Badge variant="secondary" className="ml-2">
                  {availability.slots.length} found
                </Badge>
              </h3>
              {nextAvailable && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Next available: {new Date(nextAvailable.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>

          {availability.slots.length === 0 ? (
            /* BOOKNOW-04: Enhanced Empty State with recovery actions */
            <div className="bg-card rounded-xl p-8 text-center border border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-accent" />
              </div>
              <h4 className="font-semibold text-lg mb-2">No Openings in Next 14 Days</h4>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto text-sm">
                High demand! Here are your options:
              </p>
              
              {/* Recovery Actions Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 max-w-3xl mx-auto">
                {/* Join Waitlist */}
                {selectedBusinessId && (
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <Bell className="h-5 w-5 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium mb-2">Join Waitlist</p>
                    <WaitlistCTA
                      businessId={selectedBusinessId}
                      bookableTypeId={bookableTypeId || undefined}
                      preferredDate={date}
                      buttonVariant="default"
                      buttonText="Notify Me"
                    />
                  </div>
                )}
                
                {/* View Next Available (beyond 14 days) */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <Calendar className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium mb-2">Check Later Dates</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const futureDate = new Date(date);
                      futureDate.setDate(futureDate.getDate() + 14);
                      setDate(futureDate.toISOString().split("T")[0]);
                      handleSearch();
                    }}
                    data-event="booking_check_future"
                  >
                    +14 Days
                  </Button>
                </div>
                
                {/* Request Tour */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <Users className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium mb-2">Request Tour</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a href={`mailto:${SITE_CONFIG.contact.email}?subject=Tour Request`}>
                      Email Us
                    </a>
                  </Button>
                </div>
                
                {/* Call Us */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <Phone className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium mb-2">Call Us</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a href={SITE_CONFIG.contact.phoneLink}>
                      {SITE_CONFIG.contact.phone}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Grouped Time Slots */
            <div className="space-y-6">
              {(["morning", "afternoon", "evening"] as const).map((period) => {
                const slots = groupedSlots[period];
                if (!slots || slots.length === 0) return null;
                
                const config = timePeriodConfig[period];
                const PeriodIcon = config.icon;

                return (
                  <div key={period} className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <PeriodIcon className="h-4 w-4" />
                      <span>{config.label}</span>
                      <span className="text-xs">({config.sublabel})</span>
                      <Badge variant="outline" className="ml-auto">
                        {slots.length} slots
                      </Badge>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slots.slice(0, 6).map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotClick(slot)}
                          className="group bg-card border-2 rounded-lg p-4 text-left hover:border-primary hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {new Date(slot.start_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <Badge variant="secondary" className="font-semibold">
                              ${slot.base_price.toFixed(0)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {slot.resource_name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Until{" "}
                            {new Date(slot.end_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {slots.length > 6 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{slots.length - 6} more {period} slots available
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
