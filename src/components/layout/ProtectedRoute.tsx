import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  requireAuth?: boolean;
  requireStaff?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  requireAuth = true,
  requireStaff = false,
  requireAdmin = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, authUser, isLoading, isRolesLoaded } = useAuth();
  const location = useLocation();

  // Always wait for initial auth session resolution
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If this route requires auth, redirect unauthenticated users to login
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If staff/admin is required, wait for role hydration before deciding access
  if ((requireStaff || requireAdmin) && user && !isRolesLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requireStaff && !authUser?.isStaff) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !authUser?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
