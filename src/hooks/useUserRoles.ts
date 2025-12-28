import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];
type BusinessType = Database["public"]["Enums"]["business_type"];

export function useUserRoles() {
  return useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*, profiles:user_id(first_name, last_name, email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
      department,
    }: {
      userId: string;
      role: AppRole;
      department?: BusinessType;
    }) => {
      const { data, error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role, department })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "user_role",
        entity_id: data.id,
        action_type: "role_assigned",
        after_json: { user_id: userId, role, department },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role assigned successfully");
    },
    onError: (error) => {
      toast.error("Failed to assign role: " + error.message);
    },
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const { data: before } = await supabase
        .from("user_roles")
        .select()
        .eq("id", roleId)
        .single();

      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);
      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "user_role",
        entity_id: roleId,
        action_type: "role_revoked",
        before_json: before,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role revoked successfully");
    },
    onError: (error) => {
      toast.error("Failed to revoke role: " + error.message);
    },
  });
}
