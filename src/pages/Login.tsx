import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowLeft, Check, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const OTP_RESEND_COOLDOWN = 60; // seconds
const PASSWORD_MIN_LENGTH = 8;

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

function isPasswordValid(validation: PasswordValidation): boolean {
  return validation.minLength && validation.hasUppercase && validation.hasLowercase && validation.hasNumber;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"otp" | "password">("otp");
  const [passwordMode, setPasswordMode] = useState<"signin" | "signup" | "forgot">("signin");
  
  // OTP resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastOtpEmail, setLastOtpEmail] = useState("");

  const { signInWithOtp, verifyOtp, signInWithPassword, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Deterministic redirect: return-to from protected route OR default /account
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/account";

  // Track page view
  useEffect(() => {
    trackEvent("view_login", { tab: activeTab });
  }, []);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Password validation state
  const passwordValidation = validatePassword(password);
  const passwordIsValid = isPasswordValid(passwordValidation);

  // Email Code (OTP) - unified flow for both new and existing users
  const handleSendOtp = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    trackEvent("otp_continue", { email: trimmedEmail });
    
    const { error } = await signInWithOtp(trimmedEmail);
    setIsLoading(false);

    if (error) {
      trackEvent("otp_send_fail", { error: error.message });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOtpSent(true);
      setLastOtpEmail(trimmedEmail);
      setResendCooldown(OTP_RESEND_COOLDOWN);
      toast({
        title: "Check your email",
        description: "We sent you a code. Enter it below to continue.",
      });
    }
  }, [email, signInWithOtp, toast]);

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0 || isLoading) return;
    
    setIsLoading(true);
    const { error } = await signInWithOtp(lastOtpEmail);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setResendCooldown(OTP_RESEND_COOLDOWN);
      toast({
        title: "Code resent",
        description: "Check your email for the new code.",
      });
    }
  }, [resendCooldown, isLoading, lastOtpEmail, signInWithOtp, toast]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();
    
    if (!lastOtpEmail || !trimmedOtp) {
      toast({
        title: "Code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await verifyOtp(lastOtpEmail, trimmedOtp);
    setIsLoading(false);

    if (error) {
      trackEvent("otp_verify_fail", { error: error.message });
      toast({
        title: "Invalid or expired code",
        description: "Please check the code and try again, or request a new one.",
        variant: "destructive",
      });
    } else {
      trackEvent("otp_verify_success");
      toast({
        title: "Welcome!",
        description: "You've successfully signed in.",
      });
      navigate(from, { replace: true });
    }
  };

  // Password - explicit sign in
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    trackEvent("password_login_attempt");
    const { error } = await signInWithPassword(trimmedEmail, password);
    setIsLoading(false);

    if (error) {
      trackEvent("password_login_fail", { error: error.message });
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } else {
      trackEvent("password_login_success");
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate(from, { replace: true });
    }
  };

  // Password - explicit sign up
  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter email and password.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordIsValid) {
      toast({
        title: "Weak password",
        description: "Please meet all password requirements.",
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
    trackEvent("password_signup_attempt");
    const { error } = await signUp(trimmedEmail, password);
    setIsLoading(false);

    if (error) {
      trackEvent("password_signup_fail", { error: error.message });
      toast({
        title: "Sign up failed",
        description: error.message || "Could not create account.",
        variant: "destructive",
      });
    } else {
      trackEvent("password_signup_success");
      toast({
        title: "Check your email",
        description: "We sent you a confirmation link. Please verify your email to complete signup.",
      });
      // Don't navigate - user needs to confirm email first
    }
  };

  // Forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    trackEvent("forgot_password_start");
    const { error } = await resetPassword(trimmedEmail);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      trackEvent("forgot_password_success");
      toast({
        title: "Check your email",
        description: "We sent you a password reset link.",
      });
      setPasswordMode("signin");
    }
  };

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtp("");
    setResendCooldown(0);
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center gap-1.5 text-xs ${valid ? "text-green-600" : "text-muted-foreground"}`}>
      {valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {text}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-muted/50 to-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="text-2xl font-bold">Welcome to A-Z Enterprises</h1>
          <p className="text-muted-foreground">
            Sign in to manage your bookings and memberships
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => {
                setActiveTab(v as "otp" | "password");
                trackEvent("view_login", { tab: v });
                resetOtpFlow();
                setPasswordMode("signin");
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="otp">Email Code</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>

              {/* EMAIL CODE (OTP) TAB */}
              <TabsContent value="otp" className="space-y-4 mt-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-otp">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email-otp"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We'll email you a code. If you're new, this creates your account.
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Continue
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        required
                        autoFocus
                        disabled={isLoading}
                      />
                      <p className="text-sm text-muted-foreground">
                        Check your email for the 6-digit code sent to <strong>{lastOtpEmail}</strong>
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Verify & Continue
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || isLoading}
                      >
                        {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend Code"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex-1"
                        onClick={resetOtpFlow}
                        disabled={isLoading}
                      >
                        Change Email
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>

              {/* PASSWORD TAB */}
              <TabsContent value="password" className="space-y-4 mt-4">
                {passwordMode !== "forgot" && (
                  <div className="flex rounded-md border border-border overflow-hidden">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        passwordMode === "signin"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setPasswordMode("signin")}
                      disabled={isLoading}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        passwordMode === "signup"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setPasswordMode("signup")}
                      disabled={isLoading}
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                {passwordMode === "signin" && (
                  <form onSubmit={handlePasswordSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-signin">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email-signin"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signin">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password-signin"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Sign In
                    </Button>
                    <button
                      type="button"
                      className="w-full text-sm text-muted-foreground hover:text-foreground underline"
                      onClick={() => setPasswordMode("forgot")}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </form>
                )}

                {passwordMode === "signup" && (
                  <form onSubmit={handlePasswordSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email-signup"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password-signup"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      {password.length > 0 && (
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          <ValidationItem valid={passwordValidation.minLength} text="8+ characters" />
                          <ValidationItem valid={passwordValidation.hasUppercase} text="Uppercase" />
                          <ValidationItem valid={passwordValidation.hasLowercase} text="Lowercase" />
                          <ValidationItem valid={passwordValidation.hasNumber} text="Number" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <X className="h-3 w-3" /> Passwords don't match
                        </p>
                      )}
                      {confirmPassword && password === confirmPassword && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Passwords match
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading || !passwordIsValid || password !== confirmPassword}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Create Account
                    </Button>
                  </form>
                )}

                {passwordMode === "forgot" && (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter your email and we'll send you a link to reset your password.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="email-forgot">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email-forgot"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Send Reset Link
                    </Button>
                    <button
                      type="button"
                      className="w-full text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setPasswordMode("signin")}
                      disabled={isLoading}
                    >
                      ← Back to sign in
                    </button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
