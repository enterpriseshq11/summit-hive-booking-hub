import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for office listings
export type OfficeStatus = 'available' | 'renovating' | 'waitlist' | 'reserved' | 'leased';
export type PricingVisibility = 'hidden' | 'qualitative' | 'exact';
export type OfficeType = 'private_office' | 'dedicated_desk' | 'day_pass' | 'executive_suite';

export interface OfficeListing {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  office_type: OfficeType;
  floor: number;
  floor_label: string | null;
  square_footage: number | null;
  capacity: number | null;
  ideal_use: string | null;
  amenities: string[];
  status: OfficeStatus;
  status_note: string | null;
  monthly_rate: number | null;
  deposit_amount: number | null;
  pricing_visibility: PricingVisibility;
  price_range_text: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfficePhoto {
  id: string;
  office_id: string;
  url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface OfficePromotion {
  id: string;
  office_id: string | null;
  is_global: boolean;
  headline: string;
  description: string | null;
  badge_text: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfficeListingInsert {
  name: string;
  slug?: string;
  description?: string | null;
  tagline?: string | null;
  office_type?: OfficeType;
  floor?: number;
  floor_label?: string | null;
  square_footage?: number | null;
  capacity?: number | null;
  ideal_use?: string | null;
  amenities?: string[];
  status?: OfficeStatus;
  status_note?: string | null;
  monthly_rate?: number | null;
  deposit_amount?: number | null;
  pricing_visibility?: PricingVisibility;
  price_range_text?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  meta_title?: string | null;
  meta_description?: string | null;
}

// =============================================
// OFFICE LISTINGS HOOKS
// =============================================

export function useOfficeListings(filters?: {
  status?: OfficeStatus;
  office_type?: OfficeType;
  floor?: number;
  activeOnly?: boolean;
}) {
  return useQuery({
    queryKey: ["office-listings", filters],
    queryFn: async () => {
      let query = supabase
        .from("office_listings")
        .select("*")
        .order("sort_order", { ascending: true });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.office_type) {
        query = query.eq("office_type", filters.office_type);
      }
      if (filters?.floor) {
        query = query.eq("floor", filters.floor);
      }
      if (filters?.activeOnly !== false) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OfficeListing[];
    },
  });
}

export function useOfficeListing(slug: string) {
  return useQuery({
    queryKey: ["office-listing", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("office_listings")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as OfficeListing;
    },
    enabled: !!slug,
  });
}

export function useOfficeListingById(id: string) {
  return useQuery({
    queryKey: ["office-listing-by-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("office_listings")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as OfficeListing;
    },
    enabled: !!id,
  });
}

export function useCreateOfficeListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: OfficeListingInsert) => {
      const slug = listing.slug || listing.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { data, error } = await supabase
        .from("office_listings")
        .insert({ ...listing, slug })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-listings"] });
      toast.success("Office listing created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create office listing: " + error.message);
    },
  });
}

export function useUpdateOfficeListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OfficeListingInsert> }) => {
      const { data, error } = await supabase
        .from("office_listings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["office-listings"] });
      queryClient.invalidateQueries({ queryKey: ["office-listing-by-id", variables.id] });
      toast.success("Office listing updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update office listing: " + error.message);
    },
  });
}

export function useDeleteOfficeListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("office_listings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-listings"] });
      toast.success("Office listing deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete office listing: " + error.message);
    },
  });
}

// =============================================
// OFFICE PHOTOS HOOKS
// =============================================

export function useOfficePhotos(officeId: string) {
  return useQuery({
    queryKey: ["office-photos", officeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("office_photos")
        .select("*")
        .eq("office_id", officeId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as OfficePhoto[];
    },
    enabled: !!officeId,
  });
}

export function useCreateOfficePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: { office_id: string; url: string; alt_text?: string; caption?: string; sort_order?: number; is_primary?: boolean }) => {
      const { data, error } = await supabase
        .from("office_photos")
        .insert(photo)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["office-photos", variables.office_id] });
      toast.success("Photo added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add photo: " + error.message);
    },
  });
}

export function useUpdateOfficePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, officeId, updates }: { id: string; officeId: string; updates: Partial<OfficePhoto> }) => {
      const { data, error } = await supabase
        .from("office_photos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { data, officeId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["office-photos", result.officeId] });
    },
    onError: (error) => {
      toast.error("Failed to update photo: " + error.message);
    },
  });
}

export function useDeleteOfficePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, officeId }: { id: string; officeId: string }) => {
      const { error } = await supabase
        .from("office_photos")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { officeId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["office-photos", result.officeId] });
      toast.success("Photo deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete photo: " + error.message);
    },
  });
}

export function useReorderOfficePhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ officeId, photoIds }: { officeId: string; photoIds: string[] }) => {
      // Update each photo's sort_order based on its position in the array
      const updates = photoIds.map((id, index) => 
        supabase
          .from("office_photos")
          .update({ sort_order: index })
          .eq("id", id)
      );
      
      await Promise.all(updates);
      return { officeId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["office-photos", result.officeId] });
    },
    onError: (error) => {
      toast.error("Failed to reorder photos: " + error.message);
    },
  });
}

// =============================================
// OFFICE PROMOTIONS HOOKS
// =============================================

export function useOfficePromotions(officeId?: string) {
  return useQuery({
    queryKey: ["office-promotions", officeId],
    queryFn: async () => {
      let query = supabase
        .from("office_promotions")
        .select("*")
        .order("created_at", { ascending: false });

      if (officeId) {
        query = query.or(`office_id.eq.${officeId},is_global.eq.true`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OfficePromotion[];
    },
  });
}

export function useActivePromotions() {
  return useQuery({
    queryKey: ["office-promotions-active"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("office_promotions")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", today)
        .or(`end_date.is.null,end_date.gte.${today}`);
      if (error) throw error;
      return data as OfficePromotion[];
    },
  });
}

export function useCreateOfficePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotion: {
      office_id?: string | null;
      is_global?: boolean;
      headline: string;
      description?: string | null;
      badge_text?: string | null;
      start_date?: string;
      end_date?: string | null;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("office_promotions")
        .insert(promotion)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-promotions"] });
      queryClient.invalidateQueries({ queryKey: ["office-promotions-active"] });
      toast.success("Promotion created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create promotion: " + error.message);
    },
  });
}

export function useUpdateOfficePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OfficePromotion> }) => {
      const { data, error } = await supabase
        .from("office_promotions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-promotions"] });
      queryClient.invalidateQueries({ queryKey: ["office-promotions-active"] });
      toast.success("Promotion updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update promotion: " + error.message);
    },
  });
}

export function useDeleteOfficePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("office_promotions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-promotions"] });
      queryClient.invalidateQueries({ queryKey: ["office-promotions-active"] });
      toast.success("Promotion deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete promotion: " + error.message);
    },
  });
}
