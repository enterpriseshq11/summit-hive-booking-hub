import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CareerTeam = "spa" | "contracting" | "fitness";
export type CareerApplicationStatus = "new" | "reviewing" | "interview" | "offer" | "hired" | "rejected";

export interface CareerApplicant {
  firstName: string;
  lastName: string;
  preferredName?: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  dateOfBirth?: string;
  authorizedToWork: boolean;
  requiresSponsorship: boolean;
  desiredStartDate: string;
  employmentType: "w2" | "1099" | "either";
  preferredLocations: string[];
  schedulePreference: string[];
  compensationExpectations?: string;
  referralSource?: string;
  yearsExperience: string;
  currentEmployer?: string;
  resumeLink?: string;
  intro: string;
}

export interface CareerAvailability {
  daysAvailable: string[];
  timeBlocks: string[];
  earliestStartDate: string;
  upcomingTimeOff?: string;
}

export interface CareerConsents {
  certifyTruthful: boolean;
  agreeToContact: boolean;
  backgroundCheckConsent?: boolean;
  signatureFullName: string;
  signatureDate: string;
}

export interface CareerApplication {
  id: string;
  created_at: string;
  updated_at: string;
  team: CareerTeam;
  role: string;
  status: CareerApplicationStatus;
  source_url: string | null;
  form_version: string;
  applicant: CareerApplicant;
  role_specific: Record<string, unknown>;
  availability: CareerAvailability;
  consents: CareerConsents;
  attachments: Record<string, unknown>;
}

export interface CareerOpening {
  id: string;
  team: CareerTeam;
  role: string;
  location: string | null;
  employment_type: string | null;
  pay_range: string | null;
  is_active: boolean;
  description: string | null;
  apply_route: string | null;
  sort_order: number;
}

export interface SubmitApplicationData {
  team: CareerTeam;
  role: string;
  sourceUrl: string;
  applicant: CareerApplicant;
  roleSpecific: Record<string, unknown>;
  availability: CareerAvailability;
  consents: CareerConsents;
}

export function useCareerOpenings(team?: CareerTeam) {
  return useQuery({
    queryKey: ["career-openings", team],
    queryFn: async () => {
      let query = supabase
        .from("career_openings")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (team) {
        query = query.eq("team", team);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CareerOpening[];
    },
  });
}

export function useCareerApplications(filters?: {
  team?: CareerTeam;
  status?: CareerApplicationStatus;
}) {
  return useQuery({
    queryKey: ["career-applications", filters],
    queryFn: async () => {
      let query = supabase
        .from("career_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.team) {
        query = query.eq("team", filters.team);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as CareerApplication[];
    },
  });
}

export function useSubmitCareerApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitApplicationData) => {
      const insertData = {
        team: data.team,
        role: data.role,
        source_url: data.sourceUrl,
        applicant: JSON.parse(JSON.stringify(data.applicant)),
        role_specific: JSON.parse(JSON.stringify(data.roleSpecific)),
        availability: JSON.parse(JSON.stringify(data.availability)),
        consents: JSON.parse(JSON.stringify(data.consents)),
      };

      const { data: result, error } = await supabase
        .from("career_applications")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      // Send notification email
      try {
        await supabase.functions.invoke("career-application-notification", {
          body: {
            applicationId: result.id,
            team: data.team,
            role: data.role,
            applicantEmail: data.applicant.email,
            applicantName: `${data.applicant.firstName} ${data.applicant.lastName}`,
            applicantPhone: data.applicant.phone || null,
          },
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
        // Don't fail the submission if notification fails
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-applications"] });
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      console.error("Failed to submit application:", error);
      toast.error("Failed to submit application. Please try again.");
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      previousStatus,
    }: {
      id: string;
      status: CareerApplicationStatus;
      previousStatus?: CareerApplicationStatus;
    }) => {
      const { data, error } = await supabase
        .from("career_applications")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Log the status change activity
      await supabase.from("career_application_activity").insert([
        {
          application_id: id,
          action: "status_changed",
          metadata: {
            from_status: previousStatus || "unknown",
            to_status: status,
          },
        },
      ]);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-applications"] });
      toast.success("Application status updated");
    },
    onError: (error) => {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    },
  });
}
