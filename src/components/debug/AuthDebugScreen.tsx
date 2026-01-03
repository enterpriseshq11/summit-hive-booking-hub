import React from "react";

export type AuthDebugDenialReason =
  | "loading_auth"
  | "unauthenticated"
  | "waiting_for_roles"
  | "not_admin"
  | "not_staff"
  | "allowed";

interface AuthDebugScreenProps {
  title?: string;
  subtitle?: string;
  pathname: string;
  search: string;
  requireAuth: boolean;
  requireStaff: boolean;
  requireAdmin: boolean;
  isLoading: boolean;
  isRolesLoaded: boolean;
  hasUser: boolean;
  hasSession: boolean;
  authUserId: string | null;
  rolesLength: number;
  hasAccess: boolean;
  denialReason: AuthDebugDenialReason;
  authUser: unknown;
  user: unknown;
}

export function AuthDebugScreen(props: AuthDebugScreenProps) {
  const {
    title = "Auth Debug",
    subtitle,
    pathname,
    search,
    requireAuth,
    requireStaff,
    requireAdmin,
    isLoading,
    isRolesLoaded,
    hasUser,
    hasSession,
    authUserId,
    rolesLength,
    hasAccess,
    denialReason,
    authUser,
    user,
  } = props;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </header>

        <div className="rounded-lg border border-border bg-card p-4">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">pathname</dt>
              <dd className="font-mono text-sm break-all">{pathname}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">search</dt>
              <dd className="font-mono text-sm break-all">{search || "(empty)"}</dd>
            </div>
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
              <dd className="font-mono text-sm">{String(rolesLength)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">hasAccess</dt>
              <dd className="font-mono text-sm">{String(hasAccess)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">authUser.id</dt>
              <dd className="font-mono text-sm break-all">{authUserId ?? "null"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">session</dt>
              <dd className="font-mono text-sm">{hasSession ? "present" : "null"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">user</dt>
              <dd className="font-mono text-sm">{hasUser ? "present" : "null"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">requireAuth</dt>
              <dd className="font-mono text-sm">{String(requireAuth)}</dd>
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
            <pre className="mt-2 max-h-[260px] overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(authUser, null, 2)}
            </pre>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Raw user</p>
            <pre className="mt-2 max-h-[260px] overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
