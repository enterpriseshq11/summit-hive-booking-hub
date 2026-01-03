import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type CrmActivityEvent = Database["public"]["Tables"]["crm_activity_events"]["Row"];
type CrmActivityType = Database["public"]["Enums"]["crm_activity_type"];

export interface CrmActivityWithActor extends CrmActivityEvent {
  actor?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export function useCrmActivity(filters?: {
  actorId?: string;
  eventType?: CrmActivityType;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["crm_activity", filters],
    queryFn: async () => {
      let query = supabase
        .from("crm_activity_events")
        .select(`
          *,
          actor:actor_id(first_name, last_name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(filters?.limit || 100);

      if (filters?.actorId) {
        query = query.eq("actor_id", filters.actorId);
      }
      if (filters?.eventType) {
        query = query.eq("event_type", filters.eventType);
      }
      if (filters?.entityType) {
        query = query.eq("entity_type", filters.entityType);
      }
      if (filters?.entityId) {
        query = query.eq("entity_id", filters.entityId);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrmActivityWithActor[];
    },
  });
}

export function useLogActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: Database["public"]["Tables"]["crm_activity_events"]["Insert"]) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("crm_activity_events")
        .insert({ ...activity, actor_id: activity.actor_id || user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_activity"] });
    },
  });
}
