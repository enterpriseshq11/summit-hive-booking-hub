import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { UserCog, Loader2, Plus, Trash2, Shield, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AppRole, BusinessType } from "@/types";

const ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: "owner", label: "Owner", description: "Full system access" },
  { value: "manager", label: "Manager", description: "Cross-department operations" },
  { value: "event_coordinator", label: "Event Coordinator", description: "Summit events only" },
  { value: "spa_lead", label: "Spa Lead", description: "Restoration Lounge lead" },
  { value: "spa_worker", label: "Spa Worker", description: "Spa therapist (own schedule only)" },
  { value: "coworking_manager", label: "Coworking Manager", description: "Coworking only" },
  { value: "fitness_lead", label: "Fitness Lead", description: "Gym only" },
  { value: "front_desk", label: "Front Desk", description: "Limited creation/view" },
  { value: "read_only", label: "Read Only", description: "Reports only" },
];

const DEPARTMENTS: { value: BusinessType; label: string }[] = [
  { value: "summit", label: "The Summit" },
  { value: "spa", label: "Restoration Lounge" },
  { value: "coworking", label: "Coworking" },
  { value: "fitness", label: "Total Fitness" },
];

export default function AdminUsersRoles() {
  const { authUser, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { data: userRoles, isLoading } = useUserRoles();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    role: "" as AppRole | "",
    department: "" as BusinessType | "",
  });

  // Owner-only access - check roles array for "owner"
  const isOwner = authUser?.roles?.includes("owner");

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isOwner) {
    return <Navigate to="/admin" replace />;
  }

  const logAudit = async (actionType: string, entityId: string, before: any, after: any) => {
    await supabase.from("audit_log").insert({
      action_type: actionType,
      entity_type: "user_role",
      entity_id: entityId,
      actor_user_id: authUser?.id,
      before_json: before,
      after_json: after,
    });
  };

  const handleAddRole = async () => {
    if (!form.email || !form.role) {
      toast.error("Email and role are required");
      return;
    }

    setIsSubmitting(true);
    try {
      // First, find the user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", form.email)
        .single();

      if (profileError || !profile) {
        toast.error("User not found. They must sign up first.");
        return;
      }

      // Check if role already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", profile.id)
        .eq("role", form.role)
        .single();

      if (existing) {
        toast.error("User already has this role");
        return;
      }

      // Add the role
      const payload = {
        user_id: profile.id,
        role: form.role,
        department: form.department || null,
        created_by: authUser?.id,
      };

      const { data, error } = await supabase
        .from("user_roles")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      await logAudit("assign_role", data.id, null, payload);
      toast.success(`Role "${form.role}" assigned to ${form.email}`);
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      setShowAddDialog(false);
      setForm({ email: "", role: "", department: "" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeRole = async (roleRecord: any) => {
    if (!confirm(`Revoke ${roleRecord.role} role from this user?`)) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleRecord.id);

      if (error) throw error;

      await logAudit("revoke_role", roleRecord.id, roleRecord, null);
      toast.success("Role revoked");
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getRoleLabel = (role: string) => ROLES.find((r) => r.value === role)?.label || role;
  const getDepartmentLabel = (dept: string | null) => {
    if (!dept) return null;
    return DEPARTMENTS.find((d) => d.value === dept)?.label || dept;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserCog className="h-6 w-6" />
              Users & Roles
            </h1>
            <p className="text-muted-foreground">
              Manage staff accounts and role assignments (Owner only)
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Role changes are logged in the audit trail. Users must sign up before roles can be assigned.
          </AlertDescription>
        </Alert>

        {/* Role Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          {ROLES.slice(0, 4).map((role) => (
            <Card key={role.value}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{role.label}</CardTitle>
                <CardDescription className="text-xs">{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userRoles?.filter((ur) => ur.role === role.value).length || 0}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Roles Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles?.map((ur) => (
                  <TableRow key={ur.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {(ur as any).profiles?.first_name} {(ur as any).profiles?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(ur as any).profiles?.email || ur.user_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        ur.role === "owner" ? "default" :
                        ur.role === "manager" ? "secondary" : "outline"
                      }>
                        <Shield className="h-3 w-3 mr-1" />
                        {getRoleLabel(ur.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ur.department ? (
                        <Badge variant="outline">
                          <Building className="h-3 w-3 mr-1" />
                          {getDepartmentLabel(ur.department)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">All</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(ur.created_at), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRevokeRole(ur)}
                        disabled={ur.user_id === authUser?.id && ur.role === "owner"}
                        title={ur.user_id === authUser?.id && ur.role === "owner" ? "Cannot revoke own owner role" : "Revoke role"}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!userRoles || userRoles.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No roles assigned
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Role Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User Email *</Label>
                <Input 
                  type="email"
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  User must have an existing account
                </p>
              </div>
              <div>
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(v: AppRole) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div>{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department Scope (optional)</Label>
                <Select value={form.department} onValueChange={(v: BusinessType) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for cross-department access
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddRole} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Assign Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
