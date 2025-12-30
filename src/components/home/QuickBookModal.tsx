import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Building2, Sparkles, Dumbbell, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { format, addDays } from "date-fns";
import type { BusinessType } from "@/types";

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBusiness?: BusinessType;
}

const businessConfig = {
  summit: { name: "The Summit", subtitle: "Premium Event Venue", icon: Building2, href: "/summit" },
  coworking: { name: "The Hive", subtitle: "Private Offices + Coworking", icon: Building2, href: "/coworking" },
  spa: { name: "Restoration", subtitle: "Recovery + Spa Treatments", icon: Sparkles, href: "/spa" },
  fitness: { name: "Total Fitness", subtitle: "24/7 Gym + Coaching", icon: Dumbbell, href: "/fitness" },
};

// Mock next available slots - in production this would come from API
const getNextSlots = (business: BusinessType, date: Date) => {
  const baseSlots = ["9:00 AM", "11:00 AM", "2:00 PM"];
  return baseSlots.map((time, idx) => ({
    id: `${business}-${idx}`,
    time,
    date: format(date, "MMM d"),
  }));
};

export function QuickBookModal({ isOpen, onClose, preselectedBusiness }: QuickBookModalProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessType | undefined>(preselectedBusiness);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));

  const config = selectedBusiness ? businessConfig[selectedBusiness] : null;
  const slots = selectedBusiness ? getNextSlots(selectedBusiness, selectedDate) : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-accent" />
            Quick Book
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Business Selection */}
          {!preselectedBusiness && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Experience</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(businessConfig) as [BusinessType, typeof businessConfig.summit][]).map(([key, biz]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedBusiness(key)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedBusiness === key 
                        ? "border-accent bg-accent/5" 
                        : "border-border hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <biz.icon className="h-4 w-4 text-accent" />
                      <span className="font-medium text-sm">{biz.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Business Info */}
          {config && preselectedBusiness && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <config.icon className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">{config.name}</p>
                <p className="text-xs text-muted-foreground">{config.subtitle}</p>
              </div>
            </div>
          )}

          {/* Date Selection */}
          {selectedBusiness && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                className="rounded-md border mx-auto"
              />
            </div>
          )}

          {/* Available Slots */}
          {selectedBusiness && slots.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Next 3 Openings
              </label>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-lg border border-border bg-muted/30 text-center"
                  >
                    <p className="text-xs text-muted-foreground">{slot.date}</p>
                    <p className="font-semibold text-sm">{slot.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {selectedBusiness && config && (
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold">
              <Link to={`/booking?business=${selectedBusiness}`} onClick={onClose}>
                Continue to Booking
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
