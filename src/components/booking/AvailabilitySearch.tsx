import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Users, Loader2 } from "lucide-react";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { useAvailability } from "@/hooks/useAvailability";
import type { BusinessType } from "@/types";

interface AvailabilitySearchProps {
  defaultBusinessType?: BusinessType;
  showPartySize?: boolean;
  onSlotSelect?: (slot: any) => void;
  compact?: boolean;
}

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
      // Navigate to booking flow with slot info
      const route = businessType ? `/${businessType}` : "/booking";
      navigate(`${route}?slot=${slot.id}&date=${date}`);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-card border rounded-lg p-6 shadow-sm">
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
            <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isSearching && availability && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Available Slots ({availability.slots.length})
          </h3>

          {availability.slots.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No availability found for this date.
              </p>
              <Button variant="outline">Join Waitlist</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.slots.slice(0, 12).map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  className="bg-card border rounded-lg p-4 text-left hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="font-medium">
                    {new Date(slot.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" - "}
                    {new Date(slot.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {slot.resource_name}
                  </div>
                  <div className="text-sm font-semibold mt-2">
                    ${slot.base_price.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
