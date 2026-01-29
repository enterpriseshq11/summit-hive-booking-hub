import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

type AuthView = "signin" | "signup" | "forgot" | "reset-sent";

const PASSWORD_MIN_LENGTH = 8;

// Helper to determine redirect path based on user roles
async function getRedirectPathForUser(userId: string, defaultPath: string): Promise<string> {
  try {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const userRoles = roles?.map((r) => r.role as string) || [];

    // If the default path is already an admin route, respect it (e.g., from invite flow)
    if (defaultPath.startsWith("/admin")) {
      // But spa_worker must always go to my-schedule, not other admin pages
      if (userRoles.includes("spa_worker") && !userRoles.some(r => ["owner", "manager", "spa_lead"].includes(r))) {
        return "/admin/my-schedule";
      }
      return defaultPath;
    }

    // spa_worker goes directly to their schedule
    if (userRoles.includes("spa_worker") && !userRoles.some(r => ["owner", "manager", "spa_lead"].includes(r))) {
      return "/admin/my-schedule";
    }

    // Other staff roles go to admin dashboard
    if (userRoles.some(r => ["owner", "manager", "spa_lead", "coworking_manager", "fitness_lead", "event_coordinator", "front_desk"].includes(r))) {
      return "/admin";
    }

    // Regular users go to default path (usually /account)
    return defaultPath;
  } catch (error) {
    console.error("Error fetching user roles for redirect:", error);
    return defaultPath;
  }
}

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<AuthView>("signin");
  const [resetEmail, setResetEmail] = useState("");

  const { signInWithPassword, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from URL query param (preferred) or state (fallback)
  const getRedirectParam = (): string => {
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get("redirect");
    if (redirectParam) {
      return decodeURIComponent(redirectParam);
    }
    // Fallback to state for backwards compatibility
    const stateFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;
    return stateFrom || "/account";
  };
  
  const from = getRedirectParam();

  useEffect(() => {
    trackEvent("view_login", { view });
  }, [view]);

  // Normalize and trim identifier
  const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

  // Check if identifier is an email
  const isEmail = (value: string) => value.includes("@");

  // Look up email by username
  const getEmailByUsername = async (username: string): Promise<string | null> => {
    const normalizedUsername = normalizeIdentifier(username);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .ilike("username", normalizedUsername)
      .maybeSingle();

    if (error || !data?.email) {
      return null;
    }

    return data.email;
  };

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedIdentifier = normalizeIdentifier(identifier);
    
    if (!normalizedIdentifier || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email or username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    trackEvent("signin_attempt");

    try {
      let emailToUse = normalizedIdentifier;

      // If not an email, look up by username
      if (!isEmail(normalizedIdentifier)) {
        const foundEmail = await getEmailByUsername(normalizedIdentifier);
        if (!foundEmail) {
          // Don't reveal if username exists - use generic error
          toast({
            title: "Sign in failed",
            description: "Incorrect email, username, or password.",
            variant: "destructive",
          });
          setIsLoading(false);
          trackEvent("signin_fail", { reason: "username_not_found" });
          return;
        }
        emailToUse = foundEmail;
      }

      const { error } = await signInWithPassword(emailToUse, password);

      if (error) {
        trackEvent("signin_fail", { error: error.message });
        
        // Check for email not confirmed error
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          toast({
            title: "Email not verified",
            description: "Please check your email and click the verification link before signing in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: "Incorrect email, username, or password.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      } else {
        trackEvent("signin_success");
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        
        // Fetch user to determine role-based redirect
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const redirectPath = await getRedirectPathForUser(user.id, from);
          navigate(redirectPath, { replace: true });
        } else {
          navigate(from, { replace: true });
        }
        setIsLoading(false);
      }
    } catch (err) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedEmail = normalizeIdentifier(identifier);
    
    if (!normalizedEmail || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    if (!isEmail(normalizedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address to create an account.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      toast({
        title: "Password too short",
        description: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    trackEvent("signup_attempt");

    const { error } = await signUp(normalizedEmail, password);

    if (error) {
      trackEvent("signup_fail", { error: error.message });
      toast({
        title: "Sign up failed",
        description: error.message || "Could not create account.",
        variant: "destructive",
      });
    } else {
      trackEvent("signup_success");
      toast({
        title: "Account created!",
        description: "Check your email to verify your account.",
      });
      setView("signin");
      setPassword("");
      setConfirmPassword("");
    }

    setIsLoading(false);
  };

  // Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedEmail = normalizeIdentifier(resetEmail);
    
    if (!normalizedEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!isEmail(normalizedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    trackEvent("forgot_password_attempt");

    const { error } = await resetPassword(normalizedEmail);

    if (error) {
      // Don't reveal if email exists - show success anyway
      console.error("Password reset error:", error);
    }

    trackEvent("forgot_password_sent");
    setView("reset-sent");
    setIsLoading(false);
  };

  // Handle key press for form submission
  const handleKeyPress = (e: React.KeyboardEvent, handler: (e: React.FormEvent) => void) => {
    if (e.key === "Enter") {
      handler(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-zinc-900 via-zinc-900 to-black">
      <div className="w-full max-w-md space-y-6">
        {/* Back to home */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-sm shadow-2xl">
          {/* SIGN IN VIEW */}
          {view === "signin" && (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white">Sign in</CardTitle>
                <CardDescription className="text-zinc-400">
                  Access your bookings, memberships, and perks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Identifier Field */}
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-zinc-300">
                      Email or username
                    </Label>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="you@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleSignIn)}
                      autoFocus
                      autoComplete="username"
                      disabled={isLoading}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-accent focus:ring-accent"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleSignIn)}
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10 focus:border-accent focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember me / Forgot password row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-zinc-600 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                      />
                      <Label htmlFor="remember" className="text-sm text-zinc-400 cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setView("forgot");
                        setResetEmail(isEmail(identifier) ? identifier : "");
                      }}
                      className="text-sm text-accent hover:text-accent/80 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-black font-semibold h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Sign in"
                    )}
                  </Button>

                  {/* Create account link */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setView("signup");
                        setPassword("");
                      }}
                      className="text-sm text-accent hover:text-accent/80 transition-colors"
                    >
                      Create account
                    </button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {/* SIGN UP VIEW */}
          {view === "signup" && (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white">Create account</CardTitle>
                <CardDescription className="text-zinc-400">
                  Join to book and manage your experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoFocus
                      autoComplete="email"
                      disabled={isLoading}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-accent focus:ring-accent"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-zinc-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10 focus:border-accent focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Minimum {PASSWORD_MIN_LENGTH} characters
                    </p>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-zinc-300">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleSignUp)}
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10 focus:border-accent focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Create Account Button */}
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-black font-semibold h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create account"
                    )}
                  </Button>

                  {/* Back to sign in */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setView("signin");
                        setPassword("");
                        setConfirmPassword("");
                      }}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      Already have an account? <span className="text-accent">Sign in</span>
                    </button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === "forgot" && (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white">Reset password</CardTitle>
                <CardDescription className="text-zinc-400">
                  Enter your email to receive a reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleForgotPassword)}
                      autoFocus
                      autoComplete="email"
                      disabled={isLoading}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-accent focus:ring-accent"
                    />
                  </div>

                  {/* Send Reset Button */}
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-black font-semibold h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Send reset link"
                    )}
                  </Button>

                  {/* Back to sign in */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setView("signin")}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      Back to <span className="text-accent">Sign in</span>
                    </button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {/* RESET SENT VIEW */}
          {view === "reset-sent" && (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
                <CardDescription className="text-zinc-400">
                  We sent you a password reset link
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-zinc-400 text-sm">
                  If an account exists for <strong className="text-white">{resetEmail}</strong>, 
                  you'll receive an email with instructions to reset your password.
                </p>

                <Button
                  onClick={() => {
                    setView("signin");
                    setResetEmail("");
                  }}
                  className="w-full bg-accent hover:bg-accent/90 text-black font-semibold h-11"
                >
                  Return to Sign in
                </Button>
              </CardContent>
            </>
          )}
        </Card>

        {/* Footer Links */}
        <div className="flex justify-center gap-4 text-xs text-zinc-500">
          <Link to="/terms" className="hover:text-zinc-300 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-zinc-300 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
