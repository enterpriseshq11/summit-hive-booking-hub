import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDebugScreen } from "@/components/debug/AuthDebugScreen";

/**
 * SECURITY: Previously rendered full authUser/user objects (PII, roles) to
 * anyone with the URL. Now restricted to admins (owner/manager). Non-admins
 * are redirected to the home page and the raw JSON dumps are no longer shown.
 */
export default function AuthDebug() {
  const { user, session, authUser, isLoading, isRolesLoaded } = useAuth();
  const location = useLocation();

  if (isLoading || !isRolesLoaded) {
    return null;
  }

  const roles = authUser?.roles ?? [];
  const isAdmin = roles.some((r: string) => r === "owner" || r === "manager");
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthDebugScreen
      title="/__debug/auth"
      subtitle="Admin-only debug route."
      pathname={location.pathname}
      search={location.search}
      requireAuth={true}
      requireStaff={true}
      requireAdmin={true}
      isLoading={isLoading}
      isRolesLoaded={isRolesLoaded}
      hasUser={!!user}
      hasSession={!!session}
      authUserId={authUser?.id ?? null}
      rolesLength={roles.length}
      hasAccess={true}
      denialReason={"allowed" as const}
      authUser={null}
      user={null}
    />
  );
}
