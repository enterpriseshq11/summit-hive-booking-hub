import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AvailabilityRequest {
  business_type?: string;
  bookable_type_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  duration_mins?: number;
  party_size?: number;
  resource_id?: string;
}

interface AvailableSlot {
  id: string;
  start_time: string;
  end_time: string;
  resource_id: string;
  resource_name: string;
  bookable_type_id: string;
  bookable_type_name: string;
  base_price: number;
  is_available: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: AvailabilityRequest = await req.json();
    const { business_type, bookable_type_id, date, start_date, end_date, duration_mins, party_size, resource_id } = body;

    // Determine date range
    const queryDate = date || start_date || new Date().toISOString().split("T")[0];
    const endQueryDate = end_date || queryDate;

    // Parse dates and generate list of all dates in range
    const startDateObj = new Date(queryDate + "T00:00:00");
    const endDateObj = new Date(endQueryDate + "T00:00:00");
    const allDatesInRange: string[] = [];
    const currentDate = new Date(startDateObj);
    while (currentDate <= endDateObj) {
      allDatesInRange.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get business if filtering by type
    let businessId: string | undefined;
    if (business_type) {
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("type", business_type)
        .eq("is_active", true)
        .single();
      businessId = business?.id;
    }

    // Build bookable types query
    let bookableTypesQuery = supabase
      .from("bookable_types")
      .select(`
        id,
        name,
        slug,
        business_id,
        min_duration_mins,
        max_duration_mins,
        buffer_before_mins,
        buffer_after_mins,
        min_guests,
        max_guests,
        booking_mode,
        businesses!inner (
          id,
          name,
          type
        )
      `)
      .eq("is_active", true);

    if (bookable_type_id) {
      bookableTypesQuery = bookableTypesQuery.eq("id", bookable_type_id);
    }
    if (businessId) {
      bookableTypesQuery = bookableTypesQuery.eq("business_id", businessId);
    }

    const { data: bookableTypes, error: btError } = await bookableTypesQuery;
    if (btError) throw btError;

    // Get resources
    let resourcesQuery = supabase
      .from("resources")
      .select(`
        id,
        name,
        slug,
        type,
        capacity,
        business_id
      `)
      .eq("is_active", true);

    if (resource_id) {
      resourcesQuery = resourcesQuery.eq("id", resource_id);
    }
    if (businessId) {
      resourcesQuery = resourcesQuery.eq("business_id", businessId);
    }

    const { data: resources, error: resError } = await resourcesQuery;
    if (resError) throw resError;

    // Get ALL availability windows (for all days of week)
    const { data: availabilityWindows } = await supabase
      .from("availability_windows")
      .select("*")
      .eq("is_active", true);

    // Get existing bookings for the date range
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select(`
        id,
        start_datetime,
        end_datetime,
        bookable_type_id,
        booking_resources (
          resource_id
        )
      `)
      .gte("start_datetime", `${queryDate}T00:00:00`)
      .lte("start_datetime", `${endQueryDate}T23:59:59`)
      .not("status", "in", '("cancelled","no_show")');

    // Get active slot holds
    const { data: activeHolds } = await supabase
      .from("slot_holds")
      .select("*")
      .gte("expires_at", new Date().toISOString())
      .eq("status", "active");

    // Get blackout dates
    const { data: blackouts } = await supabase
      .from("blackout_dates")
      .select("*")
      .lte("start_datetime", `${endQueryDate}T23:59:59`)
      .gte("end_datetime", `${queryDate}T00:00:00`);

    // Get packages with pricing
    const { data: packages } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true);

    // Build available slots
    const availableSlots: AvailableSlot[] = [];

    // Pre-index bookings per resource with buffer applied
    const bookedByResource = new Map<string, { start: number; end: number }[]>();
    for (const booking of existingBookings || []) {
      const start = new Date(booking.start_datetime).getTime();
      const baseEnd = new Date(booking.end_datetime).getTime();
      
      // Find buffer for this booking's bookable type
      const bt = bookableTypes?.find((t: any) => t.id === booking.bookable_type_id);
      const bufferAfterMs = ((bt?.buffer_after_mins || 0) * 60 * 1000);
      const end = baseEnd + bufferAfterMs;
      
      for (const br of booking.booking_resources || []) {
        const arr = bookedByResource.get(br.resource_id) || [];
        arr.push({ start, end });
        bookedByResource.set(br.resource_id, arr);
      }
      
      // Also block by resource linked to bookable type if no explicit booking_resources
      if ((!booking.booking_resources || booking.booking_resources.length === 0) && bt) {
        const linkedResources = resources?.filter((r: any) => r.business_id === bt.business_id) || [];
        for (const r of linkedResources) {
          const arr = bookedByResource.get(r.id) || [];
          arr.push({ start, end });
          bookedByResource.set(r.id, arr);
        }
      }
    }

    const holdsByResource = new Map<string, { start: number; end: number }[]>();
    for (const hold of activeHolds || []) {
      if (!hold.resource_id) continue;
      const start = new Date(hold.start_datetime).getTime();
      const end = new Date(hold.end_datetime).getTime();
      const arr = holdsByResource.get(hold.resource_id) || [];
      arr.push({ start, end });
      holdsByResource.set(hold.resource_id, arr);
    }

    // Process blackouts - map by date/resource
    const blackoutsByDateResource = new Map<string, boolean>();
    blackouts?.forEach((blackout: any) => {
      const blackoutStart = new Date(blackout.start_datetime);
      const blackoutEnd = new Date(blackout.end_datetime);
      
      // Mark all dates and resources affected
      for (const dateStr of allDatesInRange) {
        const dateObj = new Date(dateStr + "T12:00:00");
        if (dateObj >= blackoutStart && dateObj <= blackoutEnd) {
          if (blackout.resource_id) {
            blackoutsByDateResource.set(`${dateStr}-${blackout.resource_id}`, true);
          } else if (blackout.business_id) {
            // Business-wide blackout - mark all resources
            resources?.filter((r: any) => r.business_id === blackout.business_id).forEach((r: any) => {
              blackoutsByDateResource.set(`${dateStr}-${r.id}`, true);
            });
          }
        }
      }
    });

    // Generate time slots for EACH day in the range
    const slotLengthMins = Math.max(30, Number(duration_mins || 60));
    const stepMins = 60;

    for (const dateStr of allDatesInRange) {
      const dateObj = new Date(dateStr + "T12:00:00"); // Use noon to avoid timezone issues
      const dayOfWeek = dateObj.getDay();
      
      // Find windows for this day of week
      const windowsForDay = availabilityWindows?.filter((w: any) => w.day_of_week === dayOfWeek) || [];
      
      for (const window of windowsForDay) {
        const startHour = parseInt(window.start_time.split(":")[0]);
        const startMinute = parseInt(window.start_time.split(":")[1] || "0");
        const endHour = parseInt(window.end_time.split(":")[0]);
        const endMinute = parseInt(window.end_time.split(":")[1] || "0");
        
        const windowStartMins = startHour * 60 + startMinute;
        const windowEndMins = endHour * 60 + endMinute;

        // Check which resources or bookable types this window applies to
        let applicableResources: any[] = [];
        let applicableBookableType: any = null;
        
        if (window.resource_id) {
          const res = resources?.find((r: any) => r.id === window.resource_id);
          if (res) applicableResources = [res];
          applicableBookableType = bookableTypes?.find((bt: any) => bt.business_id === res?.business_id);
        } else if (window.bookable_type_id) {
          applicableBookableType = bookableTypes?.find((bt: any) => bt.id === window.bookable_type_id);
          if (applicableBookableType) {
            applicableResources = resources?.filter((r: any) => r.business_id === applicableBookableType.business_id) || [];
          }
        }

        if (!applicableBookableType || applicableResources.length === 0) continue;

        // Get buffer for this bookable type
        const bufferAfterMins = applicableBookableType.buffer_after_mins || 0;

        for (let minutesFromMidnight = windowStartMins; minutesFromMidnight < windowEndMins; minutesFromMidnight += stepMins) {
          const slotStartMins = minutesFromMidnight;
          const slotEndMins = minutesFromMidnight + slotLengthMins;

          // Slot must fit within the window
          if (slotEndMins > windowEndMins) continue;

          const pad2 = (n: number) => String(n).padStart(2, "0");
          const startH = Math.floor(slotStartMins / 60);
          const startM = slotStartMins % 60;
          const endH = Math.floor(slotEndMins / 60);
          const endM = slotEndMins % 60;

          const slotStart = `${dateStr}T${pad2(startH)}:${pad2(startM)}:00`;
          const slotEnd = `${dateStr}T${pad2(endH)}:${pad2(endM)}:00`;

          for (const resource of applicableResources) {
            const slotStartMs = new Date(slotStart).getTime();
            const slotEndMs = new Date(slotEnd).getTime();
            // Add buffer when checking for conflicts (the new booking needs buffer room after it)
            const slotEndWithBufferMs = slotEndMs + (bufferAfterMins * 60 * 1000);

            // Check blackout
            const isBlackout = blackoutsByDateResource.get(`${dateStr}-${resource.id}`) === true;

            // Check overlap with existing bookings (which already include their buffer)
            const overlaps = (intervals: { start: number; end: number }[]) =>
              intervals.some((i) => slotStartMs < i.end && slotEndWithBufferMs > i.start);

            const isBooked = overlaps(bookedByResource.get(resource.id) || []);
            const isHeld = overlaps(holdsByResource.get(resource.id) || []);
            const isBlocked = isBlackout || isBooked || isHeld;

            // Check capacity if party_size specified
            const hasCapacity = !party_size || (resource.capacity && resource.capacity >= party_size);

            // Find package pricing
            const pkg = packages?.find((p: any) => p.bookable_type_id === applicableBookableType.id);

            availableSlots.push({
              id: `${resource.id}-${slotStart}`,
              start_time: slotStart,
              end_time: slotEnd,
              resource_id: resource.id,
              resource_name: resource.name,
              bookable_type_id: applicableBookableType.id,
              bookable_type_name: applicableBookableType.name,
              base_price: pkg?.base_price || 0,
              is_available: !isBlocked && hasCapacity,
            });
          }
        }
      }
    }

    // Get next available slots per business for the "Next Available" widget
    const nextAvailable: Record<string, AvailableSlot[]> = {};
    bookableTypes?.forEach((bt: any) => {
      const businessType = bt.businesses?.type;
      if (!businessType) return;

      const available = availableSlots
        .filter((slot) => slot.bookable_type_id === bt.id && slot.is_available)
        .slice(0, 3);

      if (!nextAvailable[businessType]) {
        nextAvailable[businessType] = [];
      }
      nextAvailable[businessType].push(...available);
    });

    return new Response(
      JSON.stringify({
        success: true,
        slots: availableSlots.filter((s) => s.is_available),
        all_slots: availableSlots,
        next_available: nextAvailable,
        query: {
          date: queryDate,
          end_date: endQueryDate,
          business_type,
          bookable_type_id,
          party_size,
          duration_mins: slotLengthMins,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Availability check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});