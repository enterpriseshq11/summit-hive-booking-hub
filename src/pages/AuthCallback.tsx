import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

type CallbackStatus = "processing" | "success" | "error";

export default function AuthCallback() {
  const [status, setStatus] = useState<CallbackStatus>("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the hash fragment for token-based auth (Supabase uses hash for email verification)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        
        // Also check URL params for error handling
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          console.error("Auth callback error:", error, errorDescription);
          setErrorMessage(errorDescription || "Authentication failed");
          setStatus("error");
          return;
        }

        // If we have tokens in hash, set the session
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Session error:", sessionError);
            setErrorMessage(sessionError.message);
            setStatus("error");
            return;
          }

          // Handle signup confirmation - show success and prompt sign in
          if (type === "signup" || type === "email") {
            setStatus("success");
            return;
          }

          // For password recovery, redirect to account page
          if (type === "recovery") {
            navigate("/account", { replace: true });
            return;
          }

          // Default: redirect to account
          setStatus("success");
          return;
        }

        // If no tokens, try to get current session
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
          console.error("Get session error:", getSessionError);
          setErrorMessage(getSessionError.message);
          setStatus("error");
          return;
        }

        if (session) {
          // Already logged in
          setStatus("success");
        } else {
          // No session and no tokens - show error
          setErrorMessage("No authentication data found. Please try again.");
          setStatus("error");
        }
      } catch (err: any) {
        console.error("Callback error:", err);
        setErrorMessage(err.message || "An unexpected error occurred");
        setStatus("error");
      }
    }

    handleCallback();
  }, [navigate, searchParams]);

  const handleSignIn = () => {
    navigate("/login?redirect=%2Faccount", { replace: true });
  };

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <CardTitle className="text-foreground">Verifying...</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please wait while we verify your account.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-foreground">Verification Failed</CardTitle>
            <CardDescription className="text-muted-foreground">
              {errorMessage || "We couldn't verify your account. The link may have expired."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleSignIn} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Go to Sign In
            </Button>
            <Button 
              onClick={handleGoHome} 
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-foreground">Email Verified!</CardTitle>
          <CardDescription className="text-muted-foreground text-base mt-2">
            Your account has been verified successfully. You can now sign in to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-lg"
          >
            Sign In Now
          </Button>
          <Button 
            onClick={handleGoHome} 
            variant="outline"
            className="w-full"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
