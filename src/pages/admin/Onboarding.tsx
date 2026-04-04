import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ROLE_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  owner: {
    title: "Owner",
    description: "You have full access to all features including settings, team management, revenue, and every business unit. You can configure integrations, manage employees, and view all reports.",
  },
  manager: {
    title: "Operations Manager",
    description: "You can access the Command Center, manage leads across business units, view revenue reports, and oversee daily operations. Settings and integrations are managed by the owner.",
  },
  head_of_operations: {
    title: "Head of Operations",
    description: "You can access the Command Center, manage leads, oversee operations, and view revenue data. Use the pipeline board to track lead progress across all units.",
  },
  marketing: {
    title: "Marketing",
    description: "You can access Sales and Marketing tools including lead management, promotions, and the Elevated by Elyse business unit. Revenue data is view-only.",
  },
  ads: {
    title: "Ads Specialist",
    description: "You have access to the Dashboard with your KPI tiles and the Marketing section including Ad Tracking. You can view lead source data and cost per lead metrics.",
  },
  sales: {
    title: "Sales & Acquisitions",
    description: "You have access to Sales tools across all business units, plus full management of Summit and Mobile Homes divisions. Use the pipeline to track your leads.",
  },
  spa_lead: {
    title: "Spa Lead Therapist",
    description: "You can manage your schedule, view your bookings, and access spa-specific data. Your calendar and availability are visible to clients for online booking.",
  },
  spa_worker: {
    title: "Spa Therapist",
    description: "You can manage your personal schedule and availability. Clients can book appointments with you directly through the spa booking system.",
  },
};

export default function Onboarding() {
  const { user, authUser } = useAuth();
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);

  const primaryRole = authUser?.roles?.[0] || "staff";
  const roleInfo = ROLE_DESCRIPTIONS[primaryRole] || {
    title: "Team Member",
    description: "You have access to the A-Z Command platform. Your dashboard shows the tools and data relevant to your role.",
  };

  const firstName = user?.user_metadata?.first_name || user?.email?.split("@")[0] || "there";

  const handleComplete = async () => {
    if (!user?.id) return;
    setIsCompleting(true);
    try {
      const { error } = await supabase.from("user_onboarding").insert({
        user_id: user.id,
        role_at_completion: primaryRole,
      });
      if (error && error.code !== "23505") throw error; // 23505 = already exists
      toast.success("Welcome aboard! Let's get started.");
      navigate("/admin");
    } catch (err) {
      console.error("Onboarding error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-premium border-accent/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome to A-Z Command, {firstName}</h1>
            <p className="text-muted-foreground">Your account is set up and ready to go.</p>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm font-semibold text-accent">Your Role: {roleInfo.title}</p>
            <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
          </div>

          <Button
            size="lg"
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full bg-accent hover:bg-accent/90 text-primary font-bold"
          >
            {isCompleting ? "Setting up..." : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
