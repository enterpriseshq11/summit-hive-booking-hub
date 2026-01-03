import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDebugScreen } from "@/components/debug/AuthDebugScreen";

export default function AuthDebug() {
  const { user, session, authUser, isLoading, isRolesLoaded } = useAuth();
  const location = useLocation();

  const rolesLength = authUser?.roles?.length ?? 0;
  const hasAccess = true;

  const denialReason = (() => {
    if (isLoading) return "loading_auth" as const;
    // This route never denies; we just show state.
    return "allowed" as const;
  })();

  return (
    <AuthDebugScreen
      title="/__debug/auth"
      subtitle="Public debug route (never redirects)."
      pathname={location.pathname}
      search={location.search}
      requireAuth={false}
      requireStaff={false}
      requireAdmin={false}
      isLoading={isLoading}
      isRolesLoaded={isRolesLoaded}
      hasUser={!!user}
      hasSession={!!session}
      authUserId={authUser?.id ?? null}
      rolesLength={rolesLength}
      hasAccess={hasAccess}
      denialReason={denialReason}
      authUser={authUser}
      user={user}
    />
  );
}
