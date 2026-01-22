import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminAlert {
  type: "failed_payment" | "overdue_balance" | "pending_approval" | "expiring_hold" | "failed_renewal";
  severity: "error" | "warning" | "info";
  count: number;
  message: string;
  link: string;
}

export function useAdminAlerts() {
  return useQuery({
    queryKey: ["admin_alerts"],
    queryFn: async () => {
      const alerts: AdminAlert[] = [];
      const now = new Date().toISOString();

      // Failed payments (last 24 hours)
      const { count: failedPayments } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (failedPayments && failedPayments > 0) {
        alerts.push({
          type: "failed_payment",
          severity: "error",
          count: failedPayments,
          message: `${failedPayments} failed payment${failedPayments > 1 ? "s" : ""} in the last 24 hours`,
          link: "/admin/schedule?filter=failed_payments",
        });
      }

      // Overdue payment schedules
      const { count: overduePayments } = await supabase
        .from("payment_schedules")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .lt("due_date", now);

      if (overduePayments && overduePayments > 0) {
        alerts.push({
          type: "overdue_balance",
          severity: "warning",
          count: overduePayments,
          message: `${overduePayments} overdue balance${overduePayments > 1 ? "s" : ""} require attention`,
          link: "/admin/schedule?filter=overdue",
        });
      }

      // Pending approvals
      // Includes:
      // - Bookings requiring approval (bookings.status = 'pending')
      // - Hive office lease requests (office_inquiries.approval_status = 'pending' AND inquiry_type = 'lease_request')
      const [{ count: pendingBookingsApprovals }, { count: pendingLeaseApprovals }] = await Promise.all([
        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("office_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("approval_status", "pending")
          .eq("inquiry_type", "lease_request"),
      ]);

      const pendingApprovals = (pendingBookingsApprovals || 0) + (pendingLeaseApprovals || 0);

      if (pendingApprovals && pendingApprovals > 0) {
        alerts.push({
          type: "pending_approval",
          severity: "info",
          count: pendingApprovals,
          message: `${pendingApprovals} booking request${pendingApprovals > 1 ? "s" : ""} awaiting approval`,
          link: "/admin/approvals",
        });
      }

      // Expiring slot holds (within 5 minutes)
      const { count: expiringHolds } = await supabase
        .from("slot_holds")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .lte("expires_at", new Date(Date.now() + 5 * 60 * 1000).toISOString())
        .gt("expires_at", now);

      if (expiringHolds && expiringHolds > 0) {
        alerts.push({
          type: "expiring_hold",
          severity: "info",
          count: expiringHolds,
          message: `${expiringHolds} slot hold${expiringHolds > 1 ? "s" : ""} expiring soon`,
          link: "/admin/schedule",
        });
      }

      // Failed membership renewals (paused or expired status)
      const { count: failedRenewals } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "expired");

      if (failedRenewals && failedRenewals > 0) {
        alerts.push({
          type: "failed_renewal",
          severity: "error",
          count: failedRenewals,
          message: `${failedRenewals} membership${failedRenewals > 1 ? "s" : ""} expired or need attention`,
          link: "/admin/users-roles?filter=past_due",
        });
      }

      return alerts;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();
      const tomorrowIso = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

      // Today's bookings
      const { count: todayBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .gte("start_datetime", todayIso)
        .lt("start_datetime", tomorrowIso)
        .neq("status", "cancelled");

      // Pending approvals (bookings + Hive lease requests)
      const [{ count: pendingBookingsApprovals }, { count: pendingLeaseApprovals }] = await Promise.all([
        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("office_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("approval_status", "pending")
          .eq("inquiry_type", "lease_request"),
      ]);

      const pendingApprovals = (pendingBookingsApprovals || 0) + (pendingLeaseApprovals || 0);

      // Active resources
      const { count: activeResources } = await supabase
        .from("resources")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Pending reviews (public but unresponded)
      const { count: pendingReviews } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("is_public", true)
        .is("admin_response", null);

      // Active memberships
      const { count: activeMemberships } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Today's revenue
      const { data: todayPayments } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .gte("paid_at", todayIso)
        .lt("paid_at", tomorrowIso);

      const todayRevenue = todayPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      return {
        todayBookings: todayBookings || 0,
        pendingApprovals: pendingApprovals || 0,
        activeResources: activeResources || 0,
        pendingReviews: pendingReviews || 0,
        activeMemberships: activeMemberships || 0,
        todayRevenue,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Audit log utility for operational events
export async function logOperationalEvent(params: {
  entityType: string;
  entityId?: string;
  actionType: string;
  details?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("audit_log").insert({
    entity_type: params.entityType,
    entity_id: params.entityId || null,
    action_type: params.actionType,
    after_json: params.details as any,
  });
  
  if (error) {
    console.error("Failed to log operational event:", error);
  }
}
