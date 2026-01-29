import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WorkerAvailabilityWindow {
  id?: string;
  worker_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface CurrentWorkerInfo {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  onboarding_complete: boolean;
}

/**
 * Hook for managing spa worker availability.
 * Uses the spa_worker_availability table to store per-worker schedules.
 */
export function useSpaWorkerAvailability(workerId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch the current worker's info (for spa_worker role users)
  const { data: currentWorker, isLoading: isLoadingCurrentWorker } = useQuery({
    queryKey: ["current-spa-worker", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("spa_workers")
        .select("id, first_name, last_name, display_name, onboarding_complete")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as CurrentWorkerInfo | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Determine which worker ID to use (passed in or current user's worker ID)
  const effectiveWorkerId = workerId || currentWorker?.id;

  // Fetch worker's availability windows
  const { data: availability, isLoading: isLoadingAvailability, refetch: refetchAvailability } = useQuery({
    queryKey: ["spa-worker-availability", effectiveWorkerId],
    queryFn: async () => {
      if (!effectiveWorkerId) return [];

      const { data, error } = await supabase
        .from("spa_worker_availability")
        .select("*")
        .eq("worker_id", effectiveWorkerId)
        .order("day_of_week");

      if (error) throw error;
      return (data || []) as WorkerAvailabilityWindow[];
    },
    enabled: !!effectiveWorkerId,
    staleTime: 60 * 1000,
  });

  // Save full weekly schedule (upsert all 7 days)
  const saveScheduleMutation = useMutation({
    mutationFn: async (schedule: Array<Omit<WorkerAvailabilityWindow, "id">>) => {
      if (!effectiveWorkerId) throw new Error("No worker ID");

      // Delete existing entries for this worker, then insert new ones
      const { error: deleteError } = await supabase
        .from("spa_worker_availability")
        .delete()
        .eq("worker_id", effectiveWorkerId);

      if (deleteError) throw deleteError;

      // Insert new schedule entries (only active days)
      const activeEntries = schedule.filter(s => s.is_active);
      if (activeEntries.length > 0) {
        const { error: insertError } = await supabase
          .from("spa_worker_availability")
          .insert(activeEntries.map(entry => ({
            worker_id: effectiveWorkerId,
            day_of_week: entry.day_of_week,
            start_time: entry.start_time,
            end_time: entry.end_time,
            is_active: entry.is_active,
          })));

        if (insertError) throw insertError;
      }

      // Mark onboarding as complete
      const { error: updateError } = await supabase
        .from("spa_workers")
        .update({ onboarding_complete: true })
        .eq("id", effectiveWorkerId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spa-worker-availability", effectiveWorkerId] });
      queryClient.invalidateQueries({ queryKey: ["current-spa-worker"] });
      queryClient.invalidateQueries({ queryKey: ["active-spa-workers"] });
      toast.success("Your availability has been saved! Customers can now book with you.");
    },
    onError: (error) => {
      console.error("Failed to save availability:", error);
      toast.error("Failed to save availability. Please try again.");
    },
  });

  // Update single day availability
  const updateDayMutation = useMutation({
    mutationFn: async (entry: Omit<WorkerAvailabilityWindow, "id">) => {
      if (!effectiveWorkerId) throw new Error("No worker ID");

      const existing = availability?.find(a => a.day_of_week === entry.day_of_week);

      if (existing) {
        const { error } = await supabase
          .from("spa_worker_availability")
          .update({
            start_time: entry.start_time,
            end_time: entry.end_time,
            is_active: entry.is_active,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("spa_worker_availability")
          .insert({
            worker_id: effectiveWorkerId,
            day_of_week: entry.day_of_week,
            start_time: entry.start_time,
            end_time: entry.end_time,
            is_active: entry.is_active,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spa-worker-availability", effectiveWorkerId] });
    },
  });

  // Check if worker needs onboarding
  const needsOnboarding = currentWorker && !currentWorker.onboarding_complete;

  // Check if worker has set any availability
  const hasAvailability = availability && availability.length > 0;

  return {
    currentWorker,
    availability,
    isLoading: isLoadingCurrentWorker || isLoadingAvailability,
    needsOnboarding,
    hasAvailability,
    saveSchedule: saveScheduleMutation.mutateAsync,
    updateDay: updateDayMutation.mutateAsync,
    isSaving: saveScheduleMutation.isPending || updateDayMutation.isPending,
    refetchAvailability,
  };
}
