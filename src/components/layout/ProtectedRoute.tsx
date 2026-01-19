import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { AuthDebugScreen } from "@/components/debug/AuthDebugScreen";

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
  const { user, session, authUser, isLoading, isRolesLoaded } = useAuth();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const debugMode = params.get("debug") === "1" || location.search.includes("debug=1");

  if (isAdminRoute) {
    // eslint-disable-next-line no-console
    console.log("ProtectedRoute", location.pathname, location.search, {
      debugMode,
      isLoading,
      isRolesLoaded,
      authUser: !!authUser,
    });
  }

  const denialReason = (() => {
    if (isLoading) return "loading_auth" as const;
    if (requireAuth && !user) return "unauthenticated" as const;
    if ((requireStaff || requireAdmin) && user && !isRolesLoaded) return "waiting_for_roles" as const;
    if (requireAdmin && !authUser?.isAdmin) return "not_admin" as const;
    if (requireStaff && !authUser?.isStaff) return "not_staff" as const;
    return "allowed" as const;
  })();

  // Debug bypass: if debugMode is true AND this is a command-center path, NEVER redirect.
  // Must render immediately (before any redirect / loading gating).
  if (debugMode && isAdminRoute) {
    const rolesCount = authUser?.roles?.length ?? 0;
    const hasAccess = requireAdmin ? !!authUser?.isAdmin : requireStaff ? !!authUser?.isStaff : true;

    return (
      <AuthDebugScreen
        title="Admin Debug"
        subtitle="Rendered from ProtectedRoute for /admin?debug=1 (no redirects)."
        pathname={location.pathname}
        search={location.search}
        requireAuth={requireAuth}
        requireStaff={requireStaff}
        requireAdmin={requireAdmin}
        isLoading={isLoading}
        isRolesLoaded={isRolesLoaded}
        hasUser={!!user}
        hasSession={!!session}
        authUserId={authUser?.id ?? null}
        rolesLength={rolesCount}
        hasAccess={hasAccess}
        denialReason={denialReason}
        authUser={authUser}
        user={user}
      />
    );
  }

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
