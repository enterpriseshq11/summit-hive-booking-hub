import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SpaWorker {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  invited_at: string | null;
  invite_accepted_at: string | null;
  invite_token: string | null;
  invite_expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
  deactivated_by: string | null;
  notes: string | null;
}

export interface SpaWorkerFormData {
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface SpaWorkerAvailability {
  id: string;
  worker_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

// Fetch all spa workers
export function useSpaWorkers() {
  return useQuery({
    queryKey: ["spa_workers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spa_workers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SpaWorker[];
    },
  });
}

// Fetch active spa workers (for booking dropdown)
export function useActiveSpaWorkers() {
  return useQuery({
    queryKey: ["spa_workers", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spa_workers")
        .select("id, display_name, first_name, last_name, user_id")
        .eq("is_active", true)
        .order("display_name");

      if (error) throw error;
      return data;
    },
  });
}

// Fetch single spa worker
export function useSpaWorker(workerId: string | undefined) {
  return useQuery({
    queryKey: ["spa_workers", workerId],
    queryFn: async () => {
      if (!workerId) return null;
      const { data, error } = await supabase
        .from("spa_workers")
        .select("*")
        .eq("id", workerId)
        .single();

      if (error) throw error;
      return data as SpaWorker;
    },
    enabled: !!workerId,
  });
}

// Create spa worker
export function useCreateSpaWorker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: SpaWorkerFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("spa_workers")
        .insert({
          first_name: formData.first_name,
          last_name: formData.last_name,
          display_name: formData.display_name,
          email: formData.email.toLowerCase(),
          phone: formData.phone || null,
          notes: formData.notes || null,
          created_by: user?.id || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SpaWorker;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spa_workers"] });
      toast.success("Worker created successfully");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate key")) {
        toast.error("A worker with this email already exists");
      } else {
        toast.error("Failed to create worker: " + error.message);
      }
    },
  });
}

// Update spa worker
export function useUpdateSpaWorker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: SpaWorkerFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("spa_workers")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          display_name: formData.display_name,
          email: formData.email.toLowerCase(),
          phone: formData.phone || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SpaWorker;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spa_workers"] });
      toast.success("Worker updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update worker: " + error.message);
    },
  });
}

// Deactivate spa worker
export function useDeactivateSpaWorker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workerId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("spa_workers")
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
          deactivated_by: user?.id || null,
        })
        .eq("id", workerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spa_workers"] });
      toast.success("Worker deactivated");
    },
    onError: (error: any) => {
      toast.error("Failed to deactivate worker: " + error.message);
    },
  });
}

// Reactivate spa worker
export function useReactivateSpaWorker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workerId: string) => {
      const { error } = await supabase
        .from("spa_workers")
        .update({
          is_active: true,
          deactivated_at: null,
          deactivated_by: null,
        })
        .eq("id", workerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spa_workers"] });
      toast.success("Worker reactivated");
    },
    onError: (error: any) => {
      toast.error("Failed to reactivate worker: " + error.message);
    },
  });
}

// Send invite to worker
export function useSendWorkerInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workerId: string) => {
      const { data, error } = await supabase.functions.invoke("spa-worker-invite", {
        body: { workerId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["spa_workers"] });
      toast.success(data.message || "Invite sent successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to send invite: " + error.message);
    },
  });
}

// Fetch worker availability
export function useSpaWorkerAvailability(workerId: string | undefined) {
  return useQuery({
    queryKey: ["spa_worker_availability", workerId],
    queryFn: async () => {
      if (!workerId) return [];
      const { data, error } = await supabase
        .from("spa_worker_availability")
        .select("*")
        .eq("worker_id", workerId)
        .order("day_of_week");

      if (error) throw error;
      return data as SpaWorkerAvailability[];
    },
    enabled: !!workerId,
  });
}

// Save worker availability
export function useSaveWorkerAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      workerId, 
      availability 
    }: { 
      workerId: string; 
      availability: Omit<SpaWorkerAvailability, "id">[] 
    }) => {
      // Delete existing availability
      await supabase
        .from("spa_worker_availability")
        .delete()
        .eq("worker_id", workerId);

      // Insert new availability
      if (availability.length > 0) {
        const { error } = await supabase
          .from("spa_worker_availability")
          .insert(availability.map(a => ({
            worker_id: workerId,
            day_of_week: a.day_of_week,
            start_time: a.start_time,
            end_time: a.end_time,
            is_active: a.is_active ?? true,
          })));

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["spa_worker_availability", variables.workerId] });
      toast.success("Availability saved");
    },
    onError: (error: any) => {
      toast.error("Failed to save availability: " + error.message);
    },
  });
}
