import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Special {
  id: string;
  business_unit: string;
  title: string;
  description: string;
  cta_label: string;
  cta_link: string | null;
  badge: string | null;
  priority: number;
  always_on: boolean;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SpecialInsert = Omit<Special, "id" | "created_at" | "updated_at">;
export type SpecialUpdate = Partial<SpecialInsert>;

/** Derive display status from dates + flags */
export function getSpecialStatus(s: Pick<Special, "is_active" | "always_on" | "start_date" | "end_date">): "active" | "scheduled" | "expired" | "inactive" {
  if (!s.is_active) return "inactive";
  const now = new Date();
  if (!s.always_on && s.end_date && new Date(s.end_date) < now) return "expired";
  if (s.start_date && new Date(s.start_date) > now) return "scheduled";
  return "active";
}

/** Check if a special should be visible on public site right now */
export function isSpecialPubliclyVisible(s: Special): boolean {
  return getSpecialStatus(s) === "active";
}

// ── Admin: fetch ALL specials (no date filter) ──
export function useAllSpecials(businessUnit?: string) {
  return useQuery({
    queryKey: ["specials", "admin", businessUnit ?? "all"],
    queryFn: async () => {
      let q = supabase.from("specials").select("*").order("priority", { ascending: false }).order("created_at", { ascending: false });
      if (businessUnit && businessUnit !== "all") {
        q = q.eq("business_unit", businessUnit);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Special[];
    },
  });
}

// ── Public: fetch only currently-active specials for a business unit ──
export function usePublicSpecials(businessUnit: string) {
  return useQuery({
    queryKey: ["specials", "public", businessUnit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specials")
        .select("*")
        .eq("business_unit", businessUnit)
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Client-side date filtering for schedule/expire
      return ((data ?? []) as Special[]).filter(isSpecialPubliclyVisible);
    },
    staleTime: 60_000,
  });
}

// ── Mutations ──
export function useCreateSpecial() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: SpecialInsert) => {
      const { data, error } = await supabase.from("specials").insert(input).select().single();
      if (error) throw error;
      return data as Special;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specials"] });
      toast({ title: "Special created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateSpecial() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: SpecialUpdate & { id: string }) => {
      const { data, error } = await supabase.from("specials").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as Special;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specials"] });
      toast({ title: "Special updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteSpecial() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("specials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specials"] });
      toast({ title: "Special deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}
