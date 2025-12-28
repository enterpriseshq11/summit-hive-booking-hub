import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Checklist = Database["public"]["Tables"]["checklists"]["Row"];
type ChecklistTemplate = Database["public"]["Tables"]["checklist_templates"]["Row"];

export function useChecklistTemplates(businessId?: string, bookableTypeId?: string) {
  return useQuery({
    queryKey: ["checklist_templates", businessId, bookableTypeId],
    queryFn: async () => {
      let query = supabase
        .from("checklist_templates")
        .select("*, businesses(name, type), bookable_types(name)")
        .eq("is_active", true)
        .order("trigger_offset_hours", { ascending: true });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }
      if (bookableTypeId) {
        query = query.eq("bookable_type_id", bookableTypeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useBookingChecklists(bookingId: string) {
  return useQuery({
    queryKey: ["checklists", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select("*, checklist_templates:template_id(name, trigger_type)")
        .eq("booking_id", bookingId)
        .order("due_datetime", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });
}

export function useGenerateChecklists() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      businessId,
      bookableTypeId,
      eventDate,
    }: {
      bookingId: string;
      businessId: string;
      bookableTypeId: string;
      eventDate: string;
    }) => {
      // Get applicable templates
      const { data: templates, error: tError } = await supabase
        .from("checklist_templates")
        .select("*")
        .eq("is_active", true)
        .or(`business_id.eq.${businessId},bookable_type_id.eq.${bookableTypeId}`);

      if (tError) throw tError;
      if (!templates || templates.length === 0) return [];

      const eventDateObj = new Date(eventDate);
      const checklistsToCreate = templates.map((template) => {
        const dueDate = new Date(eventDateObj);
        if (template.trigger_offset_hours) {
          dueDate.setHours(dueDate.getHours() - template.trigger_offset_hours);
        }

        return {
          booking_id: bookingId,
          template_id: template.id,
          name: template.name,
          items: template.items,
          due_datetime: dueDate.toISOString(),
        };
      });

      const { data, error } = await supabase
        .from("checklists")
        .insert(checklistsToCreate)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["checklists", variables.bookingId] });
      toast.success("Checklists generated");
    },
    onError: (error) => {
      toast.error("Failed to generate checklists: " + error.message);
    },
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checklistId,
      completedItems,
    }: {
      checklistId: string;
      completedItems: Record<string, boolean>;
    }) => {
      const allComplete = Object.values(completedItems).every((v) => v);

      const { data, error } = await supabase
        .from("checklists")
        .update({
          completed_items: completedItems,
          completed_at: allComplete ? new Date().toISOString() : null,
        })
        .eq("id", checklistId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["checklists", data.booking_id] });
    },
    onError: (error) => {
      toast.error("Failed to update checklist: " + error.message);
    },
  });
}
