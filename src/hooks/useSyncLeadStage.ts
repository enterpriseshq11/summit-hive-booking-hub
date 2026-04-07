import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SyncStageParams {
  leadId: string;
  previousStage: string;
  newStage: string;
  skipWebhook?: boolean;
}

export function useSyncLeadStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, previousStage, newStage, skipWebhook = false }: SyncStageParams) => {
      const { data, error } = await supabase.functions.invoke("sync-ghl-stage", {
        body: { leadId, previousStage, newStage, skipWebhook },
      });

      if (error) throw new Error(error.message || "Failed to sync stage");
      if (!data?.success) throw new Error(data?.error || "Failed to sync stage");
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm_lead", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["crm_activity"] });
    },
    onError: (error) => {
      toast.error("Failed to update stage: " + error.message);
    },
  });
}
