import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CrmLead = Database["public"]["Tables"]["crm_leads"]["Row"];
type CrmLeadInsert = Database["public"]["Tables"]["crm_leads"]["Insert"];
type CrmLeadUpdate = Database["public"]["Tables"]["crm_leads"]["Update"];
type CrmLeadStatus = Database["public"]["Enums"]["crm_lead_status"];
type CrmLeadSource = Database["public"]["Enums"]["crm_lead_source"];
type BusinessType = Database["public"]["Enums"]["business_type"];

export interface CrmLeadWithRelations extends CrmLead {
  assigned_employee?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  created_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function useCrmLeads(filters?: {
  status?: CrmLeadStatus;
  businessUnit?: BusinessType;
  assignedTo?: string;
  source?: CrmLeadSource;
  search?: string;
}) {
  return useQuery({
    queryKey: ["crm_leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("crm_leads")
        .select(`
          *,
          assigned_employee:profiles!crm_leads_assigned_employee_id_fkey(first_name, last_name, email),
          created_by_profile:profiles!crm_leads_created_by_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.businessUnit) {
        query = query.eq("business_unit", filters.businessUnit);
      }
      if (filters?.assignedTo) {
        query = query.eq("assigned_employee_id", filters.assignedTo);
      }
      if (filters?.source) {
        query = query.eq("source", filters.source);
      }
      if (filters?.search) {
        query = query.or(`lead_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrmLeadWithRelations[];
    },
  });
}

export function useCrmLead(leadId: string | undefined) {
  return useQuery({
    queryKey: ["crm_lead", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      
      const { data, error } = await supabase
        .from("crm_leads")
        .select(`
          *,
          assigned_employee:profiles!crm_leads_assigned_employee_id_fkey(first_name, last_name, email),
          created_by_profile:profiles!crm_leads_created_by_fkey(first_name, last_name)
        `)
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return data as CrmLeadWithRelations;
    },
    enabled: !!leadId,
  });
}

export function useCreateCrmLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: CrmLeadInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("crm_leads")
        .insert({ ...lead, created_by: user?.id })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("crm_activity_events").insert({
        event_type: "lead_created",
        actor_id: user?.id,
        entity_type: "lead",
        entity_id: data.id,
        entity_name: lead.lead_name,
        after_data: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
      toast.success("Lead created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create lead: " + error.message);
    },
  });
}

export function useUpdateCrmLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CrmLeadUpdate & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get before state
      const { data: before } = await supabase
        .from("crm_leads")
        .select()
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("crm_leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Determine event type
      let eventType: Database["public"]["Enums"]["crm_activity_type"] = "lead_updated";
      if (updates.status && updates.status !== before?.status) {
        eventType = "lead_status_changed";
      } else if (updates.assigned_employee_id && updates.assigned_employee_id !== before?.assigned_employee_id) {
        eventType = "lead_assigned";
      }

      // Log activity
      await supabase.from("crm_activity_events").insert({
        event_type: eventType,
        actor_id: user?.id,
        entity_type: "lead",
        entity_id: id,
        entity_name: data.lead_name,
        before_data: before,
        after_data: data,
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm_lead", data.id] });
      toast.success("Lead updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update lead: " + error.message);
    },
  });
}

export function useDeleteCrmLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("crm_leads")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
      toast.success("Lead deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete lead: " + error.message);
    },
  });
}

export function useBulkUpdateLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: CrmLeadUpdate }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("crm_leads")
        .update(updates)
        .in("id", ids);

      if (error) throw error;

      // Log bulk activity
      await supabase.from("crm_activity_events").insert({
        event_type: updates.status ? "lead_status_changed" : updates.assigned_employee_id ? "lead_assigned" : "lead_updated",
        actor_id: user?.id,
        entity_type: "lead",
        metadata: { affected_ids: ids, updates },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
      toast.success("Leads updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update leads: " + error.message);
    },
  });
}
