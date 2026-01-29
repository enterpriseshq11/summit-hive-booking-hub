import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SpaWorkerService {
  id: string;
  worker_id: string;
  name: string;
  description: string | null;
  duration_mins: number;
  price: number;
  promo_price: number | null;
  promo_ends_at: string | null;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  icon_name: string;
  created_at: string;
  updated_at: string;
}

export interface SpaWorkerWithSlug {
  id: string;
  user_id: string | null;
  display_name: string;
  slug: string | null;
  title: string | null;
  phone: string | null;
  is_active: boolean;
  onboarding_complete: boolean;
  deleted_at: string | null;
  created_at: string;
}

// Fetch all services for a specific worker (public)
export function useWorkerServices(workerId: string | undefined) {
  return useQuery({
    queryKey: ["spa_worker_services", workerId],
    queryFn: async () => {
      if (!workerId) return [];
      
      const { data, error } = await supabase
        .from("spa_worker_services")
        .select("*")
        .eq("worker_id", workerId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as SpaWorkerService[];
    },
    enabled: !!workerId,
  });
}

// Fetch current logged-in worker's services (admin)
export function useMyServices() {
  return useQuery({
    queryKey: ["my_spa_services"],
    queryFn: async () => {
      // First get the current worker
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data: worker } = await supabase
        .from("spa_workers")
        .select("id")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .single();
      
      if (!worker) return [];
      
      const { data, error } = await supabase
        .from("spa_worker_services")
        .select("*")
        .eq("worker_id", worker.id)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as SpaWorkerService[];
    },
  });
}

// Create a new service
export function useCreateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (service: Omit<SpaWorkerService, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("spa_worker_services")
        .insert(service)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_spa_services"] });
      queryClient.invalidateQueries({ queryKey: ["spa_worker_services"] });
      toast.success("Service added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add service: " + error.message);
    },
  });
}

// Update an existing service
export function useUpdateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SpaWorkerService> & { id: string }) => {
      const { data, error } = await supabase
        .from("spa_worker_services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_spa_services"] });
      queryClient.invalidateQueries({ queryKey: ["spa_worker_services"] });
      toast.success("Service updated");
    },
    onError: (error) => {
      toast.error("Failed to update service: " + error.message);
    },
  });
}

// Delete a service
export function useDeleteService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("spa_worker_services")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_spa_services"] });
      queryClient.invalidateQueries({ queryKey: ["spa_worker_services"] });
      toast.success("Service deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete service: " + error.message);
    },
  });
}

// Public-safe worker type for slug lookup (no PII)
export interface SpaWorkerPublicProfile {
  worker_id: string;
  display_name: string;
  slug: string | null;
  title: string | null;
  is_active: boolean;
  onboarding_complete: boolean;
}

// Fetch worker by slug (for public booking page)
// Uses spa_workers_public table to avoid exposing PII
export function useSpaWorkerBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["spa_worker_by_slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from("spa_workers_public")
        .select("worker_id, display_name, slug, title, is_active, onboarding_complete")
        .eq("slug", slug)
        .eq("is_active", true)
        .eq("onboarding_complete", true)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      
      // Map to compatible format
      return {
        id: data.worker_id,
        user_id: null, // Not exposed publicly
        display_name: data.display_name,
        slug: data.slug,
        title: data.title,
        phone: null, // Not exposed publicly
        is_active: data.is_active,
        onboarding_complete: data.onboarding_complete,
        deleted_at: null,
        created_at: "",
      } as SpaWorkerWithSlug;
    },
    enabled: !!slug,
  });
}
