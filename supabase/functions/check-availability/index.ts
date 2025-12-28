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
    const { business_type, bookable_type_id, date, start_date, end_date, party_size, resource_id } = body;

    // Determine date range
    const queryDate = date || start_date || new Date().toISOString().split("T")[0];
    const endQueryDate = end_date || queryDate;

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

    // Get availability windows for the day of week
    const queryDateObj = new Date(queryDate);
    const dayOfWeek = queryDateObj.getDay();

    const { data: availabilityWindows } = await supabase
      .from("availability_windows")
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    // Get existing bookings for the date range
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select(`
        id,
        start_datetime,
        end_datetime,
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
    const blockedResources = new Set<string>();

    // Mark blocked resources from bookings
    existingBookings?.forEach((booking: any) => {
      booking.booking_resources?.forEach((br: any) => {
        blockedResources.add(`${br.resource_id}-${booking.start_datetime}`);
      });
    });

    // Mark blocked resources from holds
    activeHolds?.forEach((hold: any) => {
      if (hold.resource_id) {
        blockedResources.add(`${hold.resource_id}-${hold.start_datetime}`);
      }
    });

    // Mark blocked resources from blackouts
    blackouts?.forEach((blackout: any) => {
      if (blackout.resource_id) {
        blockedResources.add(`${blackout.resource_id}-blackout`);
      }
    });

    // Generate time slots based on availability windows
    const slotDurationMins = 60; // Default 1 hour slots
    availabilityWindows?.forEach((window: any) => {
      const startHour = parseInt(window.start_time.split(":")[0]);
      const endHour = parseInt(window.end_time.split(":")[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = `${queryDate}T${hour.toString().padStart(2, "0")}:00:00`;
        const slotEnd = `${queryDate}T${(hour + 1).toString().padStart(2, "0")}:00:00`;

        resources?.forEach((resource: any) => {
          // Check if this resource is blocked
          const isBlocked = blockedResources.has(`${resource.id}-${slotStart}`) ||
                           blockedResources.has(`${resource.id}-blackout`);

          // Check capacity if party_size specified
          const hasCapacity = !party_size || (resource.capacity && resource.capacity >= party_size);

          // Find matching bookable type
          const matchingBT = bookableTypes?.find((bt: any) => bt.business_id === resource.business_id);
          if (!matchingBT) return;

          // Find package pricing
          const pkg = packages?.find((p: any) => p.bookable_type_id === matchingBT.id);

          availableSlots.push({
            id: `${resource.id}-${slotStart}`,
            start_time: slotStart,
            end_time: slotEnd,
            resource_id: resource.id,
            resource_name: resource.name,
            bookable_type_id: matchingBT.id,
            bookable_type_name: matchingBT.name,
            base_price: pkg?.base_price || 0,
            is_available: !isBlocked && hasCapacity,
          });
        });
      }
    });

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
