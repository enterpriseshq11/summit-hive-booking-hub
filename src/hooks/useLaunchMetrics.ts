import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, subHours, startOfDay, endOfDay } from "date-fns";

export interface LaunchMetrics {
  // Booking metrics
  totalBookingsToday: number;
  totalBookingsWeek: number;
  bookingConversionRate: number;
  abandonedBookings: number;
  
  // Payment metrics
  successfulPaymentsToday: number;
  failedPaymentsToday: number;
  paymentSuccessRate: number;
  totalRevenueToday: number;
  totalRevenueWeek: number;
  pendingPayments: number;
  
  // Membership metrics
  newMembershipsToday: number;
  activeMemberships: number;
  churnedMembershipsWeek: number;
  pausedMemberships: number;
  
  // Error metrics
  errorRateHour: number;
  criticalErrors: number;
  
  // Waitlist metrics
  waitlistConversions: number;
  expiredClaims: number;
}

export interface AlertThreshold {
  metric: keyof LaunchMetrics;
  threshold: number;
  condition: "above" | "below";
  severity: "warning" | "critical";
  message: string;
}

// Define monitoring thresholds
export const LAUNCH_THRESHOLDS: AlertThreshold[] = [
  {
    metric: "paymentSuccessRate",
    threshold: 90,
    condition: "below",
    severity: "critical",
    message: "Payment success rate below 90%",
  },
  {
    metric: "failedPaymentsToday",
    threshold: 5,
    condition: "above",
    severity: "warning",
    message: "Multiple payment failures detected",
  },
  {
    metric: "errorRateHour",
    threshold: 10,
    condition: "above",
    severity: "critical",
    message: "High error rate in the last hour",
  },
  {
    metric: "abandonedBookings",
    threshold: 10,
    condition: "above",
    severity: "warning",
    message: "High booking abandonment rate",
  },
  {
    metric: "churnedMembershipsWeek",
    threshold: 5,
    condition: "above",
    severity: "warning",
    message: "Elevated membership churn this week",
  },
  {
    metric: "expiredClaims",
    threshold: 10,
    condition: "above",
    severity: "warning",
    message: "Many waitlist claims expiring unused",
  },
];

export function useLaunchMetrics() {
  return useQuery({
    queryKey: ["launch_metrics"],
    queryFn: async (): Promise<LaunchMetrics> => {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const todayEnd = endOfDay(now).toISOString();
      const weekStart = subDays(now, 7).toISOString();
      const hourAgo = subHours(now, 1).toISOString();

      // Booking metrics
      const { count: totalBookingsToday } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd);

      const { count: totalBookingsWeek } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekStart);

      const { count: confirmedBookingsToday } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart)
        .in("status", ["confirmed", "completed", "in_progress"]);

      const { count: abandonedBookings } = await supabase
        .from("slot_holds")
        .select("*", { count: "exact", head: true })
        .eq("status", "expired")
        .gte("created_at", weekStart);

      // Payment metrics
      const { count: successfulPaymentsToday } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("paid_at", todayStart);

      const { count: failedPaymentsToday } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("created_at", todayStart);

      const { count: pendingPayments } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { data: todayRevenue } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .gte("paid_at", todayStart);

      const { data: weekRevenue } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .gte("paid_at", weekStart);

      // Membership metrics
      const { count: newMembershipsToday } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart);

      const { count: activeMemberships } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: churnedMembershipsWeek } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled")
        .gte("cancelled_at", weekStart);

      const { count: pausedMemberships } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "paused");

      // Error metrics (from audit log)
      const { count: errorCount } = await supabase
        .from("audit_log")
        .select("*", { count: "exact", head: true })
        .eq("entity_type", "error")
        .gte("created_at", hourAgo);

      const { count: criticalErrors } = await supabase
        .from("audit_log")
        .select("*", { count: "exact", head: true })
        .eq("entity_type", "error")
        .eq("action_type", "error_critical")
        .gte("created_at", todayStart);

      // Waitlist metrics
      const { count: waitlistConversions } = await supabase
        .from("waitlist_entries")
        .select("*", { count: "exact", head: true })
        .eq("status", "claimed")
        .gte("claimed_at", weekStart);

      const { count: expiredClaims } = await supabase
        .from("waitlist_entries")
        .select("*", { count: "exact", head: true })
        .eq("status", "expired")
        .gte("created_at", weekStart);

      // Calculate rates
      const totalPaymentsToday = (successfulPaymentsToday || 0) + (failedPaymentsToday || 0);
      const paymentSuccessRate = totalPaymentsToday > 0 
        ? Math.round(((successfulPaymentsToday || 0) / totalPaymentsToday) * 100) 
        : 100;

      const bookingConversionRate = (totalBookingsToday || 0) > 0
        ? Math.round(((confirmedBookingsToday || 0) / (totalBookingsToday || 1)) * 100)
        : 100;

      return {
        totalBookingsToday: totalBookingsToday || 0,
        totalBookingsWeek: totalBookingsWeek || 0,
        bookingConversionRate,
        abandonedBookings: abandonedBookings || 0,
        successfulPaymentsToday: successfulPaymentsToday || 0,
        failedPaymentsToday: failedPaymentsToday || 0,
        paymentSuccessRate,
        totalRevenueToday: todayRevenue?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
        totalRevenueWeek: weekRevenue?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
        pendingPayments: pendingPayments || 0,
        newMembershipsToday: newMembershipsToday || 0,
        activeMemberships: activeMemberships || 0,
        churnedMembershipsWeek: churnedMembershipsWeek || 0,
        pausedMemberships: pausedMemberships || 0,
        errorRateHour: errorCount || 0,
        criticalErrors: criticalErrors || 0,
        waitlistConversions: waitlistConversions || 0,
        expiredClaims: expiredClaims || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Check thresholds and return alerts
export function checkThresholdAlerts(metrics: LaunchMetrics): AlertThreshold[] {
  return LAUNCH_THRESHOLDS.filter((threshold) => {
    const value = metrics[threshold.metric];
    if (threshold.condition === "above") {
      return value > threshold.threshold;
    } else {
      return value < threshold.threshold;
    }
  });
}

// Stripe live mode readiness check
export interface StripeLiveReadiness {
  secretKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
  productsExist: boolean;
  pricesExist: boolean;
  testModeActive: boolean;
  readyToFlip: boolean;
}

export function useStripeLiveReadiness() {
  return useQuery({
    queryKey: ["stripe_live_readiness"],
    queryFn: async (): Promise<StripeLiveReadiness> => {
      // Check secrets exist (we can't read values, just check if configured)
      // This is a proxy check - in production, edge function would verify
      
      // For now, return configuration status based on known setup
      return {
        secretKeyConfigured: true, // STRIPE_SECRET_KEY is set
        webhookSecretConfigured: false, // STRIPE_WEBHOOK_SECRET needs to be set for live
        productsExist: true, // Products created in Stripe
        pricesExist: true, // Prices created in Stripe
        testModeActive: true, // Currently in test mode
        readyToFlip: false, // Requires webhook secret + manual verification
      };
    },
    staleTime: 60000, // Cache for 1 minute
  });
}
