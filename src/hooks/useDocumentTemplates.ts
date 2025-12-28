import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DocumentTemplate = Database["public"]["Tables"]["document_templates"]["Row"];
type DocumentTemplateInsert = Database["public"]["Tables"]["document_templates"]["Insert"];
type DocumentTemplateUpdate = Database["public"]["Tables"]["document_templates"]["Update"];

export function useDocumentTemplates(businessId?: string) {
  return useQuery({
    queryKey: ["document_templates", businessId],
    queryFn: async () => {
      let query = supabase
        .from("document_templates")
        .select("*, businesses(name, type), bookable_types(name)")
        .order("name", { ascending: true });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDocumentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: DocumentTemplateInsert) => {
      const { data, error } = await supabase
        .from("document_templates")
        .insert({ ...template, version: 1 })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "document_template",
        entity_id: data.id,
        action_type: "created",
        after_json: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document_templates"] });
      toast.success("Document template created");
    },
    onError: (error) => {
      toast.error("Failed to create template: " + error.message);
    },
  });
}

export function useUpdateDocumentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      incrementVersion = false,
    }: {
      id: string;
      updates: DocumentTemplateUpdate;
      incrementVersion?: boolean;
    }) => {
      const { data: current } = await supabase
        .from("document_templates")
        .select()
        .eq("id", id)
        .single();

      const finalUpdates = incrementVersion
        ? { ...updates, version: (current?.version || 1) + 1 }
        : updates;

      const { data, error } = await supabase
        .from("document_templates")
        .update(finalUpdates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "document_template",
        entity_id: id,
        action_type: incrementVersion ? "version_updated" : "updated",
        before_json: current,
        after_json: data,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document_templates"] });
      toast.success("Document template updated");
    },
    onError: (error) => {
      toast.error("Failed to update template: " + error.message);
    },
  });
}
