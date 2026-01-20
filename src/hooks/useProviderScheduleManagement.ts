import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

interface RecurringBlock {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  reason: string | null;
  is_active: boolean;
}

interface ProviderSettings {
  id?: string;
  slot_increment_mins: number;
  buffer_before_mins: number;
  buffer_after_mins: number;
  min_advance_hours: number;
  max_advance_days: number;
  auto_confirm_bookings: boolean;
  notification_email: string | null;
  notification_sms: string | null;
}

// Spa business ID
const SPA_BUSINESS_ID = "4df48af2-39e4-4bd1-a9b3-963de8ef39d7";

export function useProviderScheduleManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch provider's schedule (availability windows)
  const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['provider-schedule', user?.id],
    queryFn: async () => {
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

  // Fetch provider settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['provider-settings', SPA_BUSINESS_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_settings')
        .select('*')
        .eq('business_id', SPA_BUSINESS_ID)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Return defaults if no settings exist
      return (data as ProviderSettings) || {
        slot_increment_mins: 30,
        buffer_before_mins: 0,
        buffer_after_mins: 15,
        min_advance_hours: 2,
        max_advance_days: 60,
        auto_confirm_bookings: false,
        notification_email: null,
        notification_sms: null,
      };
    },
    enabled: !!user,
  });

  // Fetch recurring blocks
  const { data: recurringBlocks, isLoading: isLoadingRecurring } = useQuery({
    queryKey: ['provider-recurring-blocks', SPA_BUSINESS_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_blocks')
        .select('*')
        .eq('business_id', SPA_BUSINESS_ID)
        .eq('is_active', true)
        .order('day_of_week');
      
      if (error) throw error;
      return data as RecurringBlock[];
    },
    enabled: !!user,
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (entry: ScheduleEntry) => {
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
      queryClient.invalidateQueries({ queryKey: ['lindsey-availability-windows'] });
    },
  });

  // Update provider settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<ProviderSettings>) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('provider_settings')
        .select('id')
        .eq('business_id', SPA_BUSINESS_ID)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('provider_settings')
          .update(newSettings)
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('provider_settings')
          .insert({
            business_id: SPA_BUSINESS_ID,
            ...newSettings,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-settings'] });
      queryClient.invalidateQueries({ queryKey: ['lindsey-availability'] });
      toast.success('Settings saved');
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
          business_id: SPA_BUSINESS_ID,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-blackouts'] });
      queryClient.invalidateQueries({ queryKey: ['lindsey-availability'] });
      queryClient.invalidateQueries({ queryKey: ['lindsey-blackouts'] });
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
      queryClient.invalidateQueries({ queryKey: ['lindsey-blackouts'] });
    },
  });

  // Add recurring block mutation
  const addRecurringBlockMutation = useMutation({
    mutationFn: async (block: Omit<RecurringBlock, 'id'>) => {
      const { error } = await supabase
        .from('recurring_blocks')
        .insert({
          day_of_week: block.day_of_week,
          start_time: block.start_time,
          end_time: block.end_time,
          reason: block.reason,
          is_active: true,
          business_id: SPA_BUSINESS_ID,
          created_by: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-recurring-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['lindsey-availability'] });
    },
  });

  // Remove recurring block mutation
  const removeRecurringBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_blocks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-recurring-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['lindsey-availability'] });
    },
  });

  return {
    schedule,
    blackouts,
    settings,
    recurringBlocks,
    isLoading: isLoadingSchedule || isLoadingBlackouts || isLoadingSettings || isLoadingRecurring,
    updateSchedule: updateScheduleMutation.mutateAsync,
    updateSettings: updateSettingsMutation.mutateAsync,
    addBlackout: addBlackoutMutation.mutateAsync,
    removeBlackout: removeBlackoutMutation.mutateAsync,
    addRecurringBlock: addRecurringBlockMutation.mutateAsync,
    removeRecurringBlock: removeRecurringBlockMutation.mutateAsync,
    isUpdating: 
      updateScheduleMutation.isPending || 
      updateSettingsMutation.isPending ||
      addBlackoutMutation.isPending || 
      removeBlackoutMutation.isPending ||
      addRecurringBlockMutation.isPending ||
      removeRecurringBlockMutation.isPending,
  };
}
