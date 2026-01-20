import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, parseISO, isBefore, isAfter, startOfDay, addDays, getDay } from "date-fns";

// Lindsey's default working hours (9 AM - 9 PM, 7 days/week)
const DEFAULT_WORKING_HOURS = {
  start: "09:00",
  end: "21:00",
};

// Type for availability windows from DB
interface AvailabilityWindow {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

// Type for bookings from DB
interface BookingRecord {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
}

// Type for blackout dates from DB
interface BlackoutRecord {
  id: string;
  start_datetime: string;
  end_datetime: string;
  reason?: string;
}

export interface TimeSlot {
  time: string; // "HH:mm" format
  display: string; // "h:mm a" format
  available: boolean;
  reason?: "booked" | "unavailable" | "closed" | "too-short";
}

export interface DayAvailability {
  available: number;
  total: number;
  isWorkingDay: boolean;
}

interface UseLindseyAvailabilityParams {
  selectedDate?: Date;
  selectedDuration?: number; // in minutes
}

/**
 * Hook to fetch Lindsey's real-time availability from the database.
 * Checks availability_windows, bookings, and blackout_dates tables.
 */
export function useLindseyAvailability({ selectedDate, selectedDuration = 60 }: UseLindseyAvailabilityParams) {
  const spaBusinessId = "4df48af2-39e4-4bd1-a9b3-963de8ef39d7";

  // Fetch availability windows (Lindsey's schedule)
  const { data: availabilityWindows } = useQuery({
    queryKey: ["lindsey-availability-windows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_windows")
        .select("day_of_week, start_time, end_time, is_active")
        .order("day_of_week");
      
      if (error) throw error;
      return (data || []) as AvailabilityWindow[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch bookings for the next 60 days
  const { data: bookings } = useQuery({
    queryKey: ["lindsey-bookings"],
    queryFn: async () => {
      const startDate = format(new Date(), "yyyy-MM-dd");
      const endDate = format(addDays(new Date(), 60), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("bookings")
        .select("id, start_datetime, end_datetime, status")
        .eq("business_id", spaBusinessId)
        .gte("start_datetime", `${startDate}T00:00:00`)
        .lte("start_datetime", `${endDate}T23:59:59`)
        .not("status", "in", '("cancelled","no_show")');
      
      if (error) throw error;
      return (data || []) as BookingRecord[];
    },
    staleTime: 30 * 1000, // 30 seconds - refresh more often
  });

  // Fetch blackout dates
  const { data: blackouts } = useQuery({
    queryKey: ["lindsey-blackouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blackout_dates")
        .select("id, start_datetime, end_datetime, reason")
        .gte("end_datetime", new Date().toISOString());
      
      if (error) throw error;
      return (data || []) as BlackoutRecord[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Get working hours for a specific date based on availability_windows
   * Falls back to default hours if no specific window is set
   */
  const getWorkingHours = (date: Date): { start: string; end: string; isActive: boolean } => {
    const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday
    const window = availabilityWindows?.find(w => w.day_of_week === dayOfWeek);
    
    if (window) {
      return {
        start: window.start_time,
        end: window.end_time,
        isActive: window.is_active ?? true,
      };
    }
    
    // Default to working hours
    return {
      start: DEFAULT_WORKING_HOURS.start,
      end: DEFAULT_WORKING_HOURS.end,
      isActive: true,
    };
  };

  /**
   * Check if a date is blacked out
   */
  const isDateBlackedOut = (date: Date): boolean => {
    if (!blackouts) return false;
    
    const dateStart = startOfDay(date);
    const dateEnd = addDays(dateStart, 1);
    
    return blackouts.some(blackout => {
      const blackoutStart = parseISO(blackout.start_datetime);
      const blackoutEnd = parseISO(blackout.end_datetime);
      
      // Check if date overlaps with blackout period
      return isBefore(dateStart, blackoutEnd) && isAfter(dateEnd, blackoutStart);
    });
  };

  /**
   * Check if a specific time slot conflicts with existing bookings
   */
  const isSlotBooked = (date: Date, slotStart: string, durationMins: number): boolean => {
    if (!bookings) return false;
    
    const dateStr = format(date, "yyyy-MM-dd");
    const slotStartTime = parseISO(`${dateStr}T${slotStart}:00`);
    const slotEndTime = addMinutes(slotStartTime, durationMins);
    
    return bookings.some(booking => {
      const bookingStart = parseISO(booking.start_datetime);
      const bookingEnd = parseISO(booking.end_datetime);
      
      // Check for overlap: slot starts before booking ends AND slot ends after booking starts
      return isBefore(slotStartTime, bookingEnd) && isAfter(slotEndTime, bookingStart);
    });
  };

  /**
   * Check if a time slot fits within working hours
   * (slot start + duration must end before closing time)
   */
  const slotFitsInWorkingHours = (slotStart: string, durationMins: number, closingTime: string): boolean => {
    const [slotHours, slotMins] = slotStart.split(":").map(Number);
    const slotEndMinutes = slotHours * 60 + slotMins + durationMins;
    
    const [closeHours, closeMins] = closingTime.split(":").map(Number);
    const closeMinutes = closeHours * 60 + closeMins;
    
    return slotEndMinutes <= closeMinutes;
  };

  /**
   * Generate available time slots for a selected date
   * Filters based on duration, existing bookings, and working hours
   */
  const getTimeSlotsForDate = (date: Date, duration: number): TimeSlot[] => {
    const { start: openTime, end: closeTime, isActive } = getWorkingHours(date);
    const dateStr = format(date, "yyyy-MM-dd");
    
    // If day is not active or blacked out, return empty
    if (!isActive || isDateBlackedOut(date)) {
      return [];
    }
    
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = openTime.split(":").map(Number);
    const [endHour] = closeTime.split(":").map(Number);
    
    // Generate 30-minute interval slots
    for (let hour = startHour; hour < endHour; hour++) {
      for (const min of [0, 30]) {
        // Skip if before opening time
        if (hour === startHour && min < startMin) continue;
        
        const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        const displayTime = format(parseISO(`${dateStr}T${timeStr}:00`), "h:mm a");
        
        // Check if slot fits before closing time
        if (!slotFitsInWorkingHours(timeStr, duration, closeTime)) {
          slots.push({
            time: timeStr,
            display: displayTime,
            available: false,
            reason: "too-short",
          });
          continue;
        }
        
        // Check if slot conflicts with existing booking
        const booked = isSlotBooked(date, timeStr, duration);
        
        slots.push({
          time: timeStr,
          display: displayTime,
          available: !booked,
          reason: booked ? "booked" : undefined,
        });
      }
    }
    
    return slots;
  };

  /**
   * Get availability summary for calendar day coloring
   * Returns count of available slots for a given date
   */
  const getDayAvailability = (date: Date, duration: number = 60): DayAvailability => {
    const { isActive } = getWorkingHours(date);
    
    if (!isActive || isDateBlackedOut(date)) {
      return { available: 0, total: 0, isWorkingDay: false };
    }
    
    const slots = getTimeSlotsForDate(date, duration);
    const availableSlots = slots.filter(s => s.available);
    
    return {
      available: availableSlots.length,
      total: slots.length,
      isWorkingDay: true,
    };
  };

  /**
   * Generate availability map for next N days (for calendar coloring)
   */
  const getAvailabilityMap = (days: number = 60, duration: number = 60): Record<string, DayAvailability> => {
    const today = startOfDay(new Date());
    const map: Record<string, DayAvailability> = {};
    
    for (let i = 0; i < days; i++) {
      const date = addDays(today, i);
      const dateKey = format(date, "yyyy-MM-dd");
      map[dateKey] = getDayAvailability(date, duration);
    }
    
    return map;
  };

  // Memoized slots for selected date
  const selectedDaySlots = selectedDate && selectedDuration
    ? getTimeSlotsForDate(selectedDate, selectedDuration)
    : [];

  return {
    availabilityWindows,
    bookings,
    blackouts,
    getTimeSlotsForDate,
    getDayAvailability,
    getAvailabilityMap,
    getWorkingHours,
    isDateBlackedOut,
    selectedDaySlots,
    isLoading: !availabilityWindows || !bookings || !blackouts,
  };
}

/**
 * Check if a date qualifies for promo pricing (Jan 1 - Feb 28/29)
 */
export function isPromoDate(date: Date): boolean {
  const month = date.getMonth(); // 0 = January, 1 = February
  return month === 0 || month === 1;
}

/**
 * Calculate price based on service, duration, and date (for promo pricing)
 */
export function calculateServicePrice(
  serviceId: string,
  duration: number,
  date: Date,
  options: Array<{ duration: number; price: number | null; promoPrice?: number }>
): number | null {
  const option = options.find(o => o.duration === duration);
  if (!option || option.price === null) return null;
  
  // Check for promo pricing on couples massage
  if (serviceId === "couples" && isPromoDate(date) && option.promoPrice !== undefined) {
    return option.promoPrice;
  }
  
  return option.price;
}
