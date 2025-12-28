import { Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { UserCog, Loader2 } from "lucide-react";

export default function AdminUsersRoles() {
  const { authUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Owner-only access
  if (!authUser?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout>
      <AdminStubPage
        title="Users & Roles"
        description="Manage staff accounts and role assignments (Owner only)"
        icon={<UserCog className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
