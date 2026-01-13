import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, AppRole, AuthUser } from "@/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authUser: AuthUser | null;
  isLoading: boolean;
  isRolesLoaded: boolean; // Explicitly track when roles have been fetched
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRolesLoaded, setIsRolesLoaded] = useState(false);

  const fetchUserDetails = async (userId: string): Promise<AuthUser | null> => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Fetch roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const userRoles = roles?.map((r) => r.role as AppRole) || [];
      const isStaff = userRoles.some((r) =>
        ["owner", "manager", "event_coordinator", "spa_lead", "coworking_manager", "fitness_lead", "front_desk"].includes(r)
      );
      const isAdmin = userRoles.some((r) => ["owner", "manager"].includes(r));

      return {
        id: userId,
        email: profile?.email || undefined,
        phone: profile?.phone || undefined,
        profile: profile || undefined,
        roles: userRoles,
        isStaff,
        isAdmin,
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  const refreshAuth = async () => {
    if (user) {
      const details = await fetchUserDetails(user.id);
      setAuthUser(details);
    }
  };

  useEffect(() => {
    // Get initial session - must wait for user details before clearing loading state
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const details = await fetchUserDetails(session.user.id);
        setAuthUser(details);
        setIsRolesLoaded(true);
      } else {
        setIsRolesLoaded(true); // No user = roles are "loaded" (empty)
      }
      setIsLoading(false);
    });

    // Listen for auth changes - use synchronous state updates only, defer Supabase calls
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Reset roles loaded state when user changes
          setIsRolesLoaded(false);
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserDetails(session.user.id).then((details) => {
              setAuthUser(details);
              setIsRolesLoaded(true);
            });
          }, 0);
        } else {
          setAuthUser(null);
          setIsRolesLoaded(true);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // Request a 6-digit OTP code instead of magic link
        emailRedirectTo: undefined,
      },
    });
    return { error: error as Error | null };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    return { error: error as Error | null };
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAuthUser(null);
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/account`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        authUser,
        isLoading,
        isRolesLoaded,
        signInWithOtp,
        verifyOtp,
        signInWithPassword,
        signUp,
        signOut,
        refreshAuth,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
