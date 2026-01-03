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
  const { user, session, authUser, isLoading, isRolesLoaded } = useAuth();
  const location = useLocation();

  const isCommandCenter = location.pathname.startsWith("/command-center");
  const isDebug = isCommandCenter && new URLSearchParams(location.search).get("debug") === "1";

  const denialReason = (() => {
    if (isLoading) return "loading_auth";
    if (requireAuth && !user) return "unauthenticated";
    if ((requireStaff || requireAdmin) && user && !isRolesLoaded) return "waiting_for_roles";
    if (requireAdmin && !authUser?.isAdmin) return "not_admin";
    if (requireStaff && !authUser?.isStaff) return "not_staff";
    return "allowed";
  })();

  // Debug bypass: never redirect away from /command-center?debug=1.
  if (isDebug) {
    const rolesCount = authUser?.roles?.length ?? 0;
    const hasAccess = requireAdmin ? !!authUser?.isAdmin : requireStaff ? !!authUser?.isStaff : true;

    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="container py-10">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Command Center Debug</h1>
            <p className="text-sm text-muted-foreground">
              This screen is shown only for <code>/command-center?debug=1</code> to prevent redirects while troubleshooting.
            </p>
          </header>

          <div className="rounded-lg border border-border bg-card p-4">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">isLoading</dt>
                <dd className="font-mono text-sm">{String(isLoading)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">isRolesLoaded</dt>
                <dd className="font-mono text-sm">{String(isRolesLoaded)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">roles.length</dt>
                <dd className="font-mono text-sm">{String(rolesCount)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">hasAccess</dt>
                <dd className="font-mono text-sm">{String(hasAccess)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">authUser.id</dt>
                <dd className="font-mono text-sm">{authUser?.id ?? "null"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">session</dt>
                <dd className="font-mono text-sm">{session ? "present" : "null"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">requireStaff</dt>
                <dd className="font-mono text-sm">{String(requireStaff)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">requireAdmin</dt>
                <dd className="font-mono text-sm">{String(requireAdmin)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">denialReason</dt>
                <dd className="font-mono text-sm">{denialReason}</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">Raw authUser</p>
              <pre className="mt-2 max-h-[320px] overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(authUser, null, 2)}
              </pre>
            </div>
          </div>

          {denialReason === "unauthenticated" && (
            <p className="mt-4 text-sm text-muted-foreground">
              Not logged in. After you log in, refresh this page to see updated values.
            </p>
          )}
        </section>
      </main>
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
