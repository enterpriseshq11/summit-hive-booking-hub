import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper to send email notifications
async function sendInquiryNotification(
  type: 'user_confirmation' | 'staff_notification',
  inquiry: {
    first_name: string;
    last_name?: string | null;
    email: string;
    phone?: string | null;
    company_name?: string | null;
    workspace_type?: string | null;
    move_in_timeframe?: string | null;
    seats_needed?: number | null;
    message?: string | null;
    inquiry_type: string;
    needs_meeting_rooms?: boolean;
    needs_business_address?: boolean;
  }
) {
  try {
    const { data, error } = await supabase.functions.invoke('send-inquiry-notification', {
      body: { type, inquiry }
    });
    if (error) {
      console.error(`Failed to send ${type} email:`, error);
    } else {
      console.log(`${type} email sent successfully:`, data);
    }
    return { data, error };
  } catch (err) {
    console.error(`Error invoking send-inquiry-notification for ${type}:`, err);
    return { data: null, error: err };
  }
}

export type InquiryType = 'request' | 'tour' | 'waitlist' | 'question';
export type InquiryStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'closed';

export interface OfficeInquiry {
  id: string;
  office_id: string | null;
  inquiry_type: InquiryType;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  company_name: string | null;
  workspace_type: string | null;
  move_in_timeframe: string | null;
  seats_needed: number | null;
  message: string | null;
  needs_meeting_rooms: boolean;
  needs_business_address: boolean;
  preferred_tour_dates: any;
  tour_type: string | null;
  status: InquiryStatus;
  assigned_to: string | null;
  internal_notes: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfficeInquiryInsert {
  office_id?: string | null;
  inquiry_type?: InquiryType;
  first_name: string;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  company_name?: string | null;
  workspace_type?: string | null;
  move_in_timeframe?: string | null;
  seats_needed?: number | null;
  message?: string | null;
  needs_meeting_rooms?: boolean;
  needs_business_address?: boolean;
  preferred_tour_dates?: any;
  tour_type?: string | null;
  source?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

// =============================================
// OFFICE INQUIRIES HOOKS
// =============================================

export function useOfficeInquiries(filters?: {
  status?: InquiryStatus;
  inquiry_type?: InquiryType;
  office_id?: string;
}) {
  return useQuery({
    queryKey: ["office-inquiries", filters],
    queryFn: async () => {
      let query = supabase
        .from("office_inquiries")
        .select(`
          *,
          office_listings(name, slug)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.inquiry_type) {
        query = query.eq("inquiry_type", filters.inquiry_type);
      }
      if (filters?.office_id) {
        query = query.eq("office_id", filters.office_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (OfficeInquiry & { office_listings: { name: string; slug: string } | null })[];
    },
  });
}

export function useOfficeInquiry(id: string) {
  return useQuery({
    queryKey: ["office-inquiry", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("office_inquiries")
        .select(`
          *,
          office_listings(name, slug, office_type, floor_label)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOfficeInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inquiry: OfficeInquiryInsert) => {
      const { data, error } = await supabase
        .from("office_inquiries")
        .insert(inquiry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["office-inquiries"] });
      toast.success("Your request has been submitted! We'll be in touch within 24 hours.");
      
      // Send email notifications (fire-and-forget, don't block UI)
      const inquiryPayload = {
        first_name: variables.first_name,
        last_name: variables.last_name,
        email: variables.email,
        phone: variables.phone,
        company_name: variables.company_name,
        workspace_type: variables.workspace_type,
        move_in_timeframe: variables.move_in_timeframe,
        seats_needed: variables.seats_needed,
        message: variables.message,
        inquiry_type: variables.inquiry_type || 'request',
        needs_meeting_rooms: variables.needs_meeting_rooms,
        needs_business_address: variables.needs_business_address,
      };
      
      // Send both emails in parallel
      Promise.all([
        sendInquiryNotification('user_confirmation', inquiryPayload),
        sendInquiryNotification('staff_notification', inquiryPayload),
      ]).catch(err => console.error('Email notification error:', err));
    },
    onError: (error) => {
      toast.error("Failed to submit request: " + error.message);
    },
  });
}

export function useUpdateOfficeInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OfficeInquiry> }) => {
      const { data, error } = await supabase
        .from("office_inquiries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["office-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["office-inquiry", variables.id] });
      toast.success("Inquiry updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update inquiry: " + error.message);
    },
  });
}

export function useDeleteOfficeInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("office_inquiries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-inquiries"] });
      toast.success("Inquiry deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete inquiry: " + error.message);
    },
  });
}

// Stats hook for dashboard
export function useOfficeInquiryStats() {
  return useQuery({
    queryKey: ["office-inquiry-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("office_inquiries")
        .select("status, inquiry_type");
      if (error) throw error;
      
      const stats = {
        total: data.length,
        new: data.filter(i => i.status === 'new').length,
        contacted: data.filter(i => i.status === 'contacted').length,
        scheduled: data.filter(i => i.status === 'scheduled').length,
        completed: data.filter(i => i.status === 'completed').length,
        byType: {
          request: data.filter(i => i.inquiry_type === 'request').length,
          tour: data.filter(i => i.inquiry_type === 'tour').length,
          waitlist: data.filter(i => i.inquiry_type === 'waitlist').length,
          question: data.filter(i => i.inquiry_type === 'question').length,
        }
      };
      
      return stats;
    },
  });
}
