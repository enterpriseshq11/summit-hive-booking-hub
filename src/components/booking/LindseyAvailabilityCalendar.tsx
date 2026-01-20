import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay, startOfToday, isAfter, isBefore, startOfDay } from "date-fns";
import { CalendarIcon, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";

interface LindseyAvailabilityCalendarProps {
  onSelectDate?: (date: Date) => void;
}

// Mock availability data - in production this would come from the booking system
// Shows slots as available/unavailable without any client details
const generateMockAvailability = () => {
  const today = startOfToday();
  const availability: Record<string, { available: number; total: number }> = {};
  
  // Generate 60 days of availability
  for (let i = 0; i < 60; i++) {
    const date = addDays(today, i);
    const dateKey = format(date, "yyyy-MM-dd");
    
    // Random availability (more available = green, less = yellow, none = red)
    // Simulate realistic booking patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Weekends tend to be busier
    const baseAvailable = isWeekend ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 6) + 2;
    const totalSlots = 8; // 9am-9pm with ~1.5hr avg appointments
    
    availability[dateKey] = {
      available: Math.min(baseAvailable, totalSlots),
      total: totalSlots,
    };
  }
  
  return availability;
};

// Time slots for the day view
const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

export function LindseyAvailabilityCalendar({ onSelectDate }: LindseyAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"month" | "day">("month");
  
  const availability = useMemo(() => generateMockAvailability(), []);
  
  // Generate mock slots for selected day
  const selectedDaySlots = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const dayAvail = availability[dateKey];
    
    if (!dayAvail) return [];
    
    // Randomly mark some slots as unavailable
    return TIME_SLOTS.map((time, index) => ({
      time,
      available: index < dayAvail.available || Math.random() > 0.5,
    }));
  }, [selectedDate, availability]);
  
  const getDateAvailability = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return availability[dateKey];
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setViewMode("day");
    }
  };
  
  const handleSlotClick = (time: string) => {
    if (selectedDate && onSelectDate) {
      onSelectDate(selectedDate);
    }
  };
  
  const handleBookDate = () => {
    if (selectedDate && onSelectDate) {
      onSelectDate(selectedDate);
    }
  };
  
  return (
    <Card className="shadow-premium border-border overflow-hidden">
      {/* Gold accent line */}
      <div className="h-1 bg-accent" />
      
      <CardHeader className="border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="h-5 w-5 text-accent" />
            See Availability
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("month")}
              className={viewMode === "month" ? "bg-accent text-primary hover:bg-accent/90" : ""}
            >
              Month
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("day")}
              disabled={!selectedDate}
              className={viewMode === "day" ? "bg-accent text-primary hover:bg-accent/90" : ""}
            >
              Day View
            </Button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <span>Fully Booked</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {viewMode === "month" ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar */}
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => isBefore(startOfDay(date), startOfToday())}
                className="rounded-md border pointer-events-auto"
                modifiers={{
                  available: (date) => {
                    const avail = getDateAvailability(date);
                    return avail ? avail.available >= 4 : false;
                  },
                  limited: (date) => {
                    const avail = getDateAvailability(date);
                    return avail ? avail.available > 0 && avail.available < 4 : false;
                  },
                  fullyBooked: (date) => {
                    const avail = getDateAvailability(date);
                    return avail ? avail.available === 0 : false;
                  },
                }}
                modifiersClassNames={{
                  available: "bg-green-500/20 text-green-700 dark:text-green-400 font-medium",
                  limited: "bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium",
                  fullyBooked: "bg-red-500/20 text-red-700 dark:text-red-400 line-through opacity-60",
                }}
              />
            </div>
            
            {/* Selected date preview */}
            <div className="flex-1 lg:max-w-xs">
              {selectedDate ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">
                    {format(selectedDate, "EEEE, MMMM d")}
                  </h4>
                  
                  {(() => {
                    const avail = getDateAvailability(selectedDate);
                    if (!avail) return <p className="text-sm text-muted-foreground">No data available</p>;
                    
                    const percentage = (avail.available / avail.total) * 100;
                    
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          {avail.available > 0 ? (
                            <Badge className={cn(
                              "text-xs",
                              percentage >= 50 ? "bg-green-500/20 text-green-700" : "bg-amber-500/20 text-amber-700"
                            )}>
                              {avail.available} slots available
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Fully Booked
                            </Badge>
                          )}
                        </div>
                        
                        {/* Availability bar */}
                        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              percentage >= 50 ? "bg-green-500" : percentage > 0 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleBookDate}
                          disabled={avail.available === 0}
                          className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {avail.available > 0 ? "Book This Date" : "Join Waitlist"}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-6 text-center">
                  <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    Select a date to see available times
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Day View - Time Slots */
          <div>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("month")}
              >
                ← Back to Calendar
              </Button>
              
              {selectedDate && (
                <h4 className="font-semibold">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h4>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedDaySlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant="outline"
                  disabled={!slot.available}
                  onClick={() => handleSlotClick(slot.time)}
                  className={cn(
                    "h-14 flex flex-col items-center justify-center gap-1 transition-all",
                    slot.available 
                      ? "hover:bg-accent/10 hover:border-accent" 
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="font-medium">{slot.time}</span>
                  {slot.available ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Open
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Booked
                    </span>
                  )}
                </Button>
              ))}
            </div>
            
            {selectedDate && (
              <div className="mt-6 text-center">
                <Button
                  onClick={handleBookDate}
                  className="bg-accent hover:bg-accent/90 text-primary font-semibold"
                >
                  Continue to Book {format(selectedDate, "MMM d")}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Calendar shows available time slots only. No booking details are displayed.
        </p>
      </CardContent>
    </Card>
  );
}