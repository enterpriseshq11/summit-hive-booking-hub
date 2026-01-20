import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduleEntry {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface BlackoutEntry {
  id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
}

export function useProviderScheduleManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch provider's schedule (availability windows)
  const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['provider-schedule', user?.id],
    queryFn: async () => {
      // For now, fetch all availability windows - in production, filter by provider_id
      const { data, error } = await supabase
        .from('availability_windows')
        .select('*')
        .order('day_of_week');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch provider's blackouts
  const { data: blackouts, isLoading: isLoadingBlackouts } = useQuery({
    queryKey: ['provider-blackouts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blackout_dates')
        .select('*')
        .gte('end_datetime', new Date().toISOString())
        .order('start_datetime');
      
      if (error) throw error;
      return data as BlackoutEntry[];
    },
    enabled: !!user,
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (entry: ScheduleEntry) => {
      // Check if entry exists for this day
      const existing = schedule?.find(s => s.day_of_week === entry.day_of_week);
      
      if (existing) {
        const { error } = await supabase
          .from('availability_windows')
          .update({
            start_time: entry.start_time,
            end_time: entry.end_time,
            is_active: entry.is_active,
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('availability_windows')
          .insert({
            day_of_week: entry.day_of_week,
            start_time: entry.start_time,
            end_time: entry.end_time,
            is_active: entry.is_active,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['lindsey-availability'] });
    },
  });

  // Add blackout mutation
  const addBlackoutMutation = useMutation({
    mutationFn: async (blackout: Omit<BlackoutEntry, 'id'>) => {
      const { error } = await supabase
        .from('blackout_dates')
        .insert({
          start_datetime: blackout.start_datetime,
          end_datetime: blackout.end_datetime,
          reason: blackout.reason,
          created_by: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-blackouts'] });
      queryClient.invalidateQueries({ queryKey: ['lindsey-availability'] });
    },
  });

  // Remove blackout mutation
  const removeBlackoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blackout_dates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-blackouts'] });
      queryClient.invalidateQueries({ queryKey: ['lindsey-availability'] });
    },
  });

  return {
    schedule,
    blackouts,
    isLoading: isLoadingSchedule || isLoadingBlackouts,
    updateSchedule: updateScheduleMutation.mutateAsync,
    addBlackout: addBlackoutMutation.mutateAsync,
    removeBlackout: removeBlackoutMutation.mutateAsync,
    isUpdating: updateScheduleMutation.isPending || addBlackoutMutation.isPending || removeBlackoutMutation.isPending,
  };
}
