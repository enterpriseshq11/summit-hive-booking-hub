import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, ChevronUp, Calendar } from "lucide-react";
import type { BusinessType } from "@/types";

interface StickyBookingBarProps {
  selectedBusiness?: string;
  selectedDate?: string;
  onSearchClick: () => void;
  heroRef: React.RefObject<HTMLElement>;
  onBusinessChange?: (business: BusinessType | "") => void;
  onDateChange?: (date: string) => void;
}

export function StickyBookingBar({
  selectedBusiness,
  selectedDate,
  onSearchClick,
  heroRef,
  onBusinessChange,
  onDateChange,
}: StickyBookingBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [localBusiness, setLocalBusiness] = useState<BusinessType | "">(selectedBusiness as BusinessType || "");
  const [localDate, setLocalDate] = useState(selectedDate || new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setIsVisible(heroBottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroRef]);

  if (!isVisible) return null;

  const handleBusinessChange = (value: BusinessType) => {
    setLocalBusiness(value);
    onBusinessChange?.(value);
  };

  const handleDateChange = (value: string) => {
    setLocalDate(value);
    onDateChange?.(value);
  };

  return (
    <div 
      className="fixed top-16 left-0 right-0 z-40 bg-primary/98 backdrop-blur-md border-b border-accent/20 shadow-xl transform transition-transform duration-300"
      role="region"
      aria-label="Quick booking bar"
    >
      <div className="container py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Business Selector */}
          <div className="flex items-center gap-3 flex-1">
            <Select value={localBusiness} onValueChange={(v) => handleBusinessChange(v as BusinessType)}>
              <SelectTrigger className="w-[160px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <SelectValue placeholder="Business" />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                <SelectItem value="summit">Summit</SelectItem>
                <SelectItem value="coworking">The Hive</SelectItem>
                <SelectItem value="spa">Restoration</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Picker */}
            <div className="relative hidden sm:block">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/50" />
              <Input
                type="date"
                value={localDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-10 w-[150px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Current selection badges */}
            {selectedBusiness && (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 shrink-0 hidden md:flex">
                {selectedBusiness}
              </Badge>
            )}
          </div>

          {/* Search Button */}
          <Button
            onClick={onSearchClick}
            size="sm"
            className="bg-accent hover:bg-accent/90 text-primary font-semibold shrink-0"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
            <ChevronUp className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
