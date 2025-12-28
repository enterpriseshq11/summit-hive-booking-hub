import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Users, Loader2, Sun, Sunset, Moon, Clock, AlertCircle, Bell } from "lucide-react";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { useAvailability } from "@/hooks/useAvailability";
import { WaitlistCTA } from "./WaitlistCTA";
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
          <SelectContent>
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

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Business/Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What are you booking?</label>
            <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summit">The Summit - Events</SelectItem>
                <SelectItem value="coworking">The Hive - Coworking</SelectItem>
                <SelectItem value="spa">Restoration Lounge - Spa</SelectItem>
                <SelectItem value="fitness">Total Fitness - Gym</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookable Type (if business selected) */}
          {businessType && bookableTypes && bookableTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={bookableTypeId} onValueChange={setBookableTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
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
              />
            </div>
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
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
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
            /* Empty State */
            <div className="bg-muted/30 rounded-xl p-8 text-center border-2 border-dashed">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-lg mb-2">No Availability Found</h4>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We don't have any available slots for this date. 
                Try a different date or join our waitlist to be notified when spots open up.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    const nextDate = new Date(date);
                    nextDate.setDate(nextDate.getDate() + 1);
                    setDate(nextDate.toISOString().split("T")[0]);
                    handleSearch();
                  }}
                >
                  Try Next Day
                </Button>
                {selectedBusinessId && (
                  <WaitlistCTA
                    businessId={selectedBusinessId}
                    bookableTypeId={bookableTypeId || undefined}
                    preferredDate={date}
                    buttonVariant="default"
                    buttonText="Join Waitlist"
                  />
                )}
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
