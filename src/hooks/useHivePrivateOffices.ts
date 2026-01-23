import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HiveOfficeStatus = "available" | "booked";

export type HivePrivateOffice = {
  code: "S1" | "S2" | "P1" | "P2" | (string & {});
  label: string;
  tier: string;
  floor_label: string;
  monthly_rate: number;
  deposit_amount: number;
  status: HiveOfficeStatus;
  booked_until: string | null;
  notes: string | null;
  updated_at: string;
};

const QUERY_KEY = ["hive_private_offices"] as const;

export function useHivePrivateOffices() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hive_private_offices")
        .select("*")
        .order("code", { ascending: true });
      if (error) throw error;
      return (data || []) as HivePrivateOffice[];
    },
  });
}

export function useUpdateHivePrivateOffice() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      code: string;
      updates: Partial<Pick<HivePrivateOffice, "status" | "booked_until" | "notes">>;
    }) => {
      const { data, error } = await supabase
        .from("hive_private_offices")
        .update(params.updates)
        .eq("code", params.code)
        .select("*")
        .single();
      if (error) throw error;
      return data as HivePrivateOffice;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
