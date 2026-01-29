import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that subscribes to real-time booking changes.
 * When a booking is created, updated (including cancelled), or deleted,
 * all relevant queries are invalidated to refresh calendars automatically.
 * 
 * Use this in:
 * - AdminLayout (covers all admin calendar views)
 * - Public booking components (Spa, 360 Photo Booth, Voice Vault, etc.)
 */
export function useBookingsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          console.log("[Realtime] Booking change detected:", payload.eventType, payload);

          // Invalidate all booking-related queries to refresh calendars
          queryClient.invalidateQueries({ queryKey: ["bookings"] });
          queryClient.invalidateQueries({ queryKey: ["booking"] });
          
          // Lindsey/Spa-specific booking queries
          queryClient.invalidateQueries({ queryKey: ["lindsey-bookings"] });
          
          // Also invalidate admin stats/alerts that may show pending counts
          queryClient.invalidateQueries({ queryKey: ["admin_stats"] });
          queryClient.invalidateQueries({ queryKey: ["admin_alerts"] });
          
          // Invalidate availability-related queries so freed slots show up
          queryClient.invalidateQueries({ queryKey: ["availability"] });
          queryClient.invalidateQueries({ queryKey: ["next-available"] });
          queryClient.invalidateQueries({ queryKey: ["slot_holds"] });
          
          // Reschedule-related queries
          queryClient.invalidateQueries({ queryKey: ["reschedule_requests"] });
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] Bookings subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
