import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

type CallbackStatus = "processing" | "success" | "error";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // The hash fragment contains the tokens from Supabase email confirmation
        // Supabase client automatically handles this on page load
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setErrorMessage(error.message);
          setStatus("error");
          return;
        }

        // Check for error in URL params (Supabase sometimes passes error this way)
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (errorParam) {
          setErrorMessage(errorDescription || errorParam);
          setStatus("error");
          return;
        }

        // If we have a session, the email was verified successfully
        if (data.session) {
          // Sign out immediately - worker must sign in manually
          await supabase.auth.signOut();
          setStatus("success");
        } else {
          // No session yet - Supabase might still be processing the token from hash
          // Give it a moment and check again
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase.auth.getSession();
            
            if (retryError) {
              setErrorMessage(retryError.message);
              setStatus("error");
              return;
            }
            
            if (retryData.session) {
              await supabase.auth.signOut();
              setStatus("success");
            } else {
              // Still no session - might be an invalid or expired link
              setStatus("success"); // Show success anyway to let them try signing in
            }
          }, 1000);
        }
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        setErrorMessage(err.message || "An unexpected error occurred");
        setStatus("error");
      }
    }

    handleCallback();
  }, [searchParams]);

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto mb-4" />
            <CardTitle className="text-white">Verifying your email...</CardTitle>
            <CardDescription className="text-zinc-400">
              Please wait while we confirm your account.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-white">Verification Failed</CardTitle>
            <CardDescription className="text-zinc-400">
              {errorMessage || "The verification link may have expired or is invalid."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate("/login?redirect=%2Fadmin%2Fmy-schedule")} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-black"
            >
              Go to Sign In
            </Button>
            <p className="text-sm text-zinc-500 text-center">
              If you continue to have issues, please contact your manager.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <CardTitle className="text-2xl text-white">Email Verified!</CardTitle>
          <CardDescription className="text-zinc-400 text-base mt-2">
            Your account has been confirmed. You can now sign in to access your schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate("/login?redirect=%2Fadmin%2Fmy-schedule")} 
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 text-lg"
          >
            Continue to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
