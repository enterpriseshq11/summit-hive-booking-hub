import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"otp" | "password">("otp");
  const [passwordMode, setPasswordMode] = useState<"signin" | "signup">("signin");

  const { signInWithOtp, verifyOtp, signInWithPassword, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/account";

  // Email Code (OTP) - unified flow for both new and existing users
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithOtp(email.trim());
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOtpSent(true);
      toast({
        title: "Check your email",
        description: "We sent you a code. Enter it below to continue.",
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim()) {
      toast({
        title: "Code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await verifyOtp(email.trim(), otp.trim());
    setIsLoading(false);

    if (error) {
      toast({
        title: "Invalid or expired code",
        description: "Please check the code and try again, or request a new one.",
        variant: "destructive",
      });
    } else {
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
    if (!email.trim() || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithPassword(email.trim(), password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } else {
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
    if (!email.trim() || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter email and password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
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
    const { error } = await signUp(email.trim(), password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message || "Could not create account.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      navigate(from, { replace: true });
    }
  };

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtp("");
  };

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
                // Reset states when switching tabs
                setOtpSent(false);
                setOtp("");
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
                      />
                      <p className="text-sm text-muted-foreground">
                        Check your email for the 6-digit code sent to <strong>{email}</strong>
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Verify & Continue
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={resetOtpFlow}
                    >
                      Use a different email
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* PASSWORD TAB */}
              <TabsContent value="password" className="space-y-4 mt-4">
                {/* Mode Toggle */}
                <div className="flex rounded-md border border-border overflow-hidden">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      passwordMode === "signin"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setPasswordMode("signin")}
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
                  >
                    Sign Up
                  </button>
                </div>

                {passwordMode === "signin" ? (
                  /* SIGN IN FORM */
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
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Sign In
                    </Button>
                  </form>
                ) : (
                  /* SIGN UP FORM */
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
                          minLength={6}
                        />
                      </div>
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
                        />
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-destructive">Passwords don't match</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading || (confirmPassword !== "" && password !== confirmPassword)}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Create Account
                    </Button>
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
