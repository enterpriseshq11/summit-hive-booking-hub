import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type InviteStatus = "loading" | "valid" | "expired" | "invalid" | "already_used" | "success";

interface WorkerInvite {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
}

export default function WorkerSignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [inviteStatus, setInviteStatus] = useState<InviteStatus>("loading");
  const [worker, setWorker] = useState<WorkerInvite | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate invite token
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setInviteStatus("invalid");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("spa_workers")
          .select("id, first_name, last_name, display_name, email, invite_expires_at, invite_accepted_at, user_id")
          .eq("invite_token", token)
          .single();

        if (error || !data) {
          setInviteStatus("invalid");
          return;
        }

        // Check if already accepted - redirect to sign-in with proper redirect
        if (data.invite_accepted_at || data.user_id) {
          setInviteStatus("already_used");
          return;
        }

        // Check if expired
        if (data.invite_expires_at && new Date(data.invite_expires_at) < new Date()) {
          setInviteStatus("expired");
          return;
        }

        setWorker({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          display_name: data.display_name,
          email: data.email,
        });
        setInviteStatus("valid");
      } catch {
        setInviteStatus("invalid");
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!worker) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the edge function to create the user account (auto-confirms email)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complete-worker-signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      // If the account already existed, prompt to sign in
      if (result.existingAccount) {
        toast.info("Account already exists. Please sign in.");
        navigate("/login?redirect=%2Fadmin%2Fmy-schedule");
        return;
      }

      toast.success("Account created successfully!");
      
      // Show success state with sign-in prompt
      setInviteStatus("success");
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.message?.includes("already registered") || err.message?.includes("already exists")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render based on invite status
  if (inviteStatus === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (inviteStatus === "invalid") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-white">Invalid Invite Link</CardTitle>
            <CardDescription className="text-zinc-400">
              This invite link is not valid. Please contact your manager for a new invitation.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (inviteStatus === "expired") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <CardTitle className="text-white">Invite Expired</CardTitle>
            <CardDescription className="text-zinc-400">
              This invite link has expired. Please contact your manager to resend the invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-zinc-500">
              Invites expire 48 hours after being sent. Ask Lindsey or your manager to send a new invite from the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteStatus === "already_used") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-white">Already Activated</CardTitle>
            <CardDescription className="text-zinc-400">
              This account has already been activated. You can sign in with your email and password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/login?redirect=%2Fadmin%2Fmy-schedule")} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-black"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - account created, prompt to sign in
  if (inviteStatus === "success") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-white">Account Created!</CardTitle>
            <CardDescription className="text-zinc-400 text-base mt-2">
              Your account has been set up successfully. Please sign in to access your schedule and manage your bookings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate("/login?redirect=%2Fadmin%2Fmy-schedule")} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 text-lg"
            >
              Sign In Now
            </Button>
            <p className="text-sm text-zinc-500 text-center">
              Use your email <span className="text-white font-medium">{worker?.email}</span> and the password you just created.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="text-amber-400 font-bold text-lg mb-2">Restoration Lounge</div>
          <CardTitle className="text-white">Welcome, {worker?.first_name}!</CardTitle>
          <CardDescription className="text-zinc-400">
            Create your account to access your schedule and manage bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input
                value={worker?.email || ""}
                disabled
                className="bg-zinc-800 border-zinc-700 text-zinc-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="bg-zinc-800 border-zinc-700 text-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-zinc-500">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Confirm Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
