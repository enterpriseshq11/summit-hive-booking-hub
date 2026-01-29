import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

/**
 * Booking statuses that should BLOCK a time slot (active pipeline states).
 * Any status NOT in this list will NOT block availability.
 * 
 * Valid DB enum values:
 * "pending" | "pending_payment" | "pending_documents" | "approved" | "confirmed" |
 * "in_progress" | "completed" | "denied" | "cancelled" | "no_show" | 
 * "reschedule_requested" | "rescheduled"
 */
export const BLOCKING_BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "pending_payment",
  "pending_documents",
  "approved",
  "confirmed",
  "in_progress",
  "reschedule_requested",
  "rescheduled",
];

/**
 * Booking statuses that should NOT block a time slot (terminal/cancelled states).
 * These are explicitly excluded from availability calculations.
 */
export const NON_BLOCKING_BOOKING_STATUSES: BookingStatus[] = [
  "cancelled",
  "denied",
  "no_show",
  "completed",
];
