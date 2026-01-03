import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface EmployeeWithStats {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  department: string | null;
  leads_assigned: number;
  leads_contacted: number;
  leads_won: number;
  conversion_rate: number;
  revenue_influenced: number;
  commission_earned: number;
  last_activity: string | null;
}

export function useCrmEmployees() {
  return useQuery({
    queryKey: ["crm_employees"],
    queryFn: async () => {
      // Get all staff with roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, department");

      if (rolesError) throw rolesError;

      const employees: EmployeeWithStats[] = [];

      for (const roleData of roles || []) {
        // Fetch profile separately to avoid join issues
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .eq("id", roleData.user_id)
          .single();

        if (!profile) continue;

        // Get leads stats
        const { data: leads } = await supabase
          .from("crm_leads")
          .select("id, status")
          .eq("assigned_employee_id", profile.id);

        const leadsAssigned = leads?.length || 0;
        const leadsContacted = leads?.filter(l => l.status !== "new").length || 0;
        const leadsWon = leads?.filter(l => l.status === "won").length || 0;

        // Get revenue
        const { data: revenue } = await supabase
          .from("crm_revenue_events")
          .select("amount")
          .eq("employee_attributed_id", profile.id);

        const revenueInfluenced = revenue?.reduce((s, r) => s + Number(r.amount), 0) || 0;

        // Get commissions
        const { data: commissions } = await supabase
          .from("crm_commissions")
          .select("amount, status")
          .eq("employee_id", profile.id);

        const commissionEarned = commissions?.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0) || 0;

        // Get last activity
        const { data: activity } = await supabase
          .from("crm_activity_events")
          .select("created_at")
          .eq("actor_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1);

        employees.push({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          role: roleData.role,
          department: roleData.department,
          leads_assigned: leadsAssigned,
          leads_contacted: leadsContacted,
          leads_won: leadsWon,
          conversion_rate: leadsAssigned > 0 ? (leadsWon / leadsAssigned) * 100 : 0,
          revenue_influenced: revenueInfluenced,
          commission_earned: commissionEarned,
          last_activity: activity?.[0]?.created_at || null,
        });
      }

      return employees;
    },
  });
}

export function useCrmEmployee(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["crm_employee", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (profileError) throw profileError;

      // Get role
      const { data: role } = await supabase
        .from("user_roles")
        .select("role, department")
        .eq("user_id", employeeId)
        .single();

      // Get leads stats
      const { data: leads } = await supabase
        .from("crm_leads")
        .select("id, status, created_at")
        .eq("assigned_employee_id", employeeId);

      // Get activity heatmap data (last 30 days)
      const { data: activities } = await supabase
        .from("crm_activity_events")
        .select("created_at")
        .eq("actor_id", employeeId)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get revenue
      const { data: revenue } = await supabase
        .from("crm_revenue_events")
        .select("amount, revenue_date")
        .eq("employee_attributed_id", employeeId);

      // Get commissions
      const { data: commissions } = await supabase
        .from("crm_commissions")
        .select("amount, status, created_at")
        .eq("employee_id", employeeId);

      // Get employee notes (admin only)
      const { data: notes } = await supabase
        .from("employee_notes")
        .select(`
          *,
          created_by_profile:created_by(first_name, last_name)
        `)
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });

      const leadsAssigned = leads?.length || 0;
      const leadsWon = leads?.filter(l => l.status === "won").length || 0;
      const revenueTotal = revenue?.reduce((s, r) => s + Number(r.amount), 0) || 0;
      const commissionTotal = commissions?.reduce((s, c) => s + Number(c.amount), 0) || 0;
      const commissionPaid = commissions?.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0) || 0;

      return {
        profile,
        role: role?.role || null,
        department: role?.department || null,
        stats: {
          leads_assigned: leadsAssigned,
          leads_won: leadsWon,
          conversion_rate: leadsAssigned > 0 ? (leadsWon / leadsAssigned) * 100 : 0,
          revenue_total: revenueTotal,
          commission_total: commissionTotal,
          commission_paid: commissionPaid,
        },
        activities: activities || [],
        notes: notes || [],
      };
    },
    enabled: !!employeeId,
  });
}
