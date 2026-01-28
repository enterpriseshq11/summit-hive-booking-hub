import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface ApplicationNote {
  id: string;
  application_id: string;
  content: string;
  created_at: string;
  actor: string | null;
}

export function useApplicationNotes(applicationId: string) {
  return useQuery({
    queryKey: ["career-application-notes", applicationId],
    queryFn: async () => {
      if (!applicationId) return [];

      const { data, error } = await supabase
        .from("career_application_activity")
        .select("*")
        .eq("application_id", applicationId)
        .eq("action", "note_added")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((item) => ({
        id: item.id,
        application_id: item.application_id,
        content: (item.metadata as { content?: string })?.content || "",
        created_at: item.created_at,
        actor: item.actor,
      })) as ApplicationNote[];
    },
    enabled: !!applicationId,
  });
}

export function useAddApplicationNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      content,
    }: {
      applicationId: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("career_application_activity")
        .insert([
          {
            application_id: applicationId,
            action: "note_added",
            metadata: { content } as Json,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["career-application-notes", variables.applicationId],
      });
    },
    onError: (error) => {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    },
  });
}

export function useLogApplicationActivity() {
  return useMutation({
    mutationFn: async ({
      applicationId,
      action,
      metadata,
    }: {
      applicationId: string;
      action: string;
      metadata?: Record<string, string | number | boolean | null>;
    }) => {
      const { data, error } = await supabase
        .from("career_application_activity")
        .insert([
          {
            application_id: applicationId,
            action,
            metadata: (metadata || null) as Json,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}
