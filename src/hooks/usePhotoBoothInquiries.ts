import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PhotoBoothInquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  event_date: string | null;
  event_type: string | null;
  event_location: string | null;
  notes: string | null;
  preferred_contact: string | null;
  status: string | null;
  internal_notes: string | null;
  assigned_to: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhotoBoothInquiryInsert {
  full_name: string;
  email: string;
  phone: string;
  event_date?: string | null;
  event_type?: string | null;
  event_location?: string | null;
  notes?: string | null;
  preferred_contact?: string | null;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

// Fetch all photo booth inquiries (admin)
export function usePhotoBoothInquiries() {
  return useQuery({
    queryKey: ["photo-booth-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photo_booth_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PhotoBoothInquiry[];
    },
  });
}

// Create a new photo booth inquiry (public form)
export function useCreatePhotoBoothInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inquiry: PhotoBoothInquiryInsert) => {
      const { data, error } = await supabase
        .from("photo_booth_inquiries")
        .insert(inquiry)
        .select()
        .single();
      if (error) throw error;
      return data as PhotoBoothInquiry;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["photo-booth-inquiries"] });
      
      // Track analytics event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('analytics:track', {
          detail: {
            event: 'photo_booth_inquiry_submitted',
            properties: {
              event_type: variables.event_type,
              source: variables.source || 'website',
              has_event_date: !!variables.event_date,
            }
          }
        }));
      }

      // Send notification emails
      sendPhotoBoothNotification(data);
    },
    onError: (error) => {
      console.error("Photo booth inquiry error:", error);
      toast.error("Something went wrong. Please try again.");
    },
  });
}

// Send notification for photo booth inquiry
async function sendPhotoBoothNotification(inquiry: PhotoBoothInquiry) {
  try {
    // Use existing notification edge function
    await supabase.functions.invoke("send-inquiry-notification", {
      body: {
        type: "staff_notification",
        inquiry: {
          ...inquiry,
          inquiry_type: "photo_booth",
          first_name: inquiry.full_name.split(" ")[0],
          last_name: inquiry.full_name.split(" ").slice(1).join(" "),
          message: `Event Type: ${inquiry.event_type || "Not specified"}\nEvent Date: ${inquiry.event_date || "Not specified"}\nLocation: ${inquiry.event_location || "Not specified"}\nPreferred Contact: ${inquiry.preferred_contact || "Email"}\n\n${inquiry.notes || ""}`,
        },
      },
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

// Update photo booth inquiry (admin)
export function useUpdatePhotoBoothInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PhotoBoothInquiry> }) => {
      const { data, error } = await supabase
        .from("photo_booth_inquiries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as PhotoBoothInquiry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-booth-inquiries"] });
      toast.success("Inquiry updated");
    },
  });
}
