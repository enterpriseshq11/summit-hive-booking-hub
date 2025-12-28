import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type SignedDocument = Database["public"]["Tables"]["signed_documents"]["Row"];

export function useRequiredDocuments(bookableTypeId?: string, businessId?: string) {
  return useQuery({
    queryKey: ["required_documents", bookableTypeId, businessId],
    queryFn: async () => {
      let query = supabase
        .from("document_templates")
        .select("*")
        .eq("is_active", true)
        .eq("is_required", true);

      if (bookableTypeId) {
        query = query.or(`bookable_type_id.eq.${bookableTypeId},bookable_type_id.is.null`);
      }
      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(bookableTypeId || businessId),
  });
}

export function useSignedDocuments(userId?: string, bookingId?: string) {
  return useQuery({
    queryKey: ["signed_documents", userId, bookingId],
    queryFn: async () => {
      let query = supabase
        .from("signed_documents")
        .select("*, document_templates(name, type, version)")
        .order("signed_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }
      if (bookingId) {
        query = query.eq("booking_id", bookingId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(userId || bookingId),
  });
}

export function useSignDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      userId,
      bookingId,
      membershipId,
      signatureData,
      contentHash,
    }: {
      templateId: string;
      userId: string;
      bookingId?: string;
      membershipId?: string;
      signatureData?: string;
      contentHash?: string;
    }) => {
      // Get template version
      const { data: template } = await supabase
        .from("document_templates")
        .select("version")
        .eq("id", templateId)
        .single();

      const { data, error } = await supabase
        .from("signed_documents")
        .insert({
          template_id: templateId,
          user_id: userId,
          booking_id: bookingId,
          membership_id: membershipId,
          signature_data: signatureData,
          content_hash: contentHash,
          template_version: template?.version || 1,
          signed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("audit_log").insert([{
        entity_type: "signed_document",
        entity_id: data.id,
        action_type: "signed",
        after_json: data as any,
      }]);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["signed_documents", variables.userId] });
      if (variables.bookingId) {
        queryClient.invalidateQueries({ queryKey: ["signed_documents", undefined, variables.bookingId] });
      }
      toast.success("Document signed successfully");
    },
    onError: (error) => {
      toast.error("Failed to sign document: " + error.message);
    },
  });
}

// Check if all required documents are signed for a booking
export function useCheckDocumentCompletion(bookingId: string, bookableTypeId?: string) {
  const { data: required } = useRequiredDocuments(bookableTypeId);
  const { data: signed } = useSignedDocuments(undefined, bookingId);

  if (!required || !signed) return { complete: false, missing: [] };

  const signedTemplateIds = new Set(signed.map((s) => s.template_id));
  const missing = required.filter((r) => !signedTemplateIds.has(r.id));

  return {
    complete: missing.length === 0,
    missing,
    signed,
    required,
  };
}
