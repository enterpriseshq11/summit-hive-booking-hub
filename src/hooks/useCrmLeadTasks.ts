import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CrmLeadTask {
  id: string;
  lead_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assigned_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function useCrmLeadTasks(leadId?: string) {
  return useQuery({
    queryKey: ["crm_lead_tasks", leadId],
    queryFn: async () => {
      let query = supabase
        .from("crm_lead_tasks")
        .select(`
          *,
          assigned_profile:profiles!crm_lead_tasks_assigned_to_fkey(first_name, last_name)
        `)
        .order("due_date", { ascending: true, nullsFirst: false });

      if (leadId) {
        query = query.eq("lead_id", leadId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrmLeadTask[];
    },
    enabled: leadId ? !!leadId : true,
  });
}

export function useTodaysTasks() {
  return useQuery({
    queryKey: ["crm_lead_tasks_today"],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const { data, error } = await supabase
        .from("crm_lead_tasks")
        .select(`
          *,
          assigned_profile:profiles!crm_lead_tasks_assigned_to_fkey(first_name, last_name)
        `)
        .eq("is_completed", false)
        .lte("due_date", endOfDay)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data as CrmLeadTask[];
    },
  });
}

export function useCreateLeadTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: {
      lead_id: string;
      title: string;
      description?: string;
      assigned_to?: string;
      due_date?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("crm_lead_tasks")
        .insert({ ...task, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crm_lead_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["crm_lead_tasks_today"] });
      toast.success("Task created");
    },
    onError: (error) => toast.error("Failed to create task: " + error.message),
  });
}

export function useUpdateLeadTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; is_completed?: boolean; completed_at?: string | null; title?: string; description?: string; assigned_to?: string; due_date?: string }) => {
      const { data, error } = await supabase
        .from("crm_lead_tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_lead_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["crm_lead_tasks_today"] });
    },
    onError: (error) => toast.error("Failed to update task: " + error.message),
  });
}

export function useDeleteLeadTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_lead_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_lead_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["crm_lead_tasks_today"] });
      toast.success("Task deleted");
    },
    onError: (error) => toast.error("Failed to delete task: " + error.message),
  });
}
