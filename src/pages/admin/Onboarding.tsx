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
    description: "You have full access to every feature in A-Z Command: all 7 business units, revenue tracking, team management, payroll, commissions, integrations, and platform settings. Your dashboard is fully customizable with drag-and-drop KPI tiles.",
  },
  manager: {
    title: "Operations Manager",
    description: "You oversee daily operations across all business units. Your dashboard shows global revenue, active leads, overdue follow-ups, and bookings. You can manage leads, approve bookings, view revenue reports, and monitor the pipeline board. Settings and integrations are managed by the owner.",
  },
  sales_acquisitions: {
    title: "Sales & Acquisitions Manager",
    description: "You manage leads across all business units with full access to Summit and Mobile Homes. Your dashboard shows your assigned leads, pipeline stage breakdown, overdue follow-ups, and your commissions. Use the pipeline board to move leads through stages.",
  },
  spa_lead: {
    title: "Lead Massage Therapist — Restoration Lounge",
    description: "You manage your daily schedule, view spa bookings, and track your commissions. Your calendar and availability are visible to clients for online booking. You have access to spa-specific data and can manage your service catalog.",
  },
  marketing_lead: {
    title: "Head of Marketing — Elevated by Elyse",
    description: "You manage promotions, lead sources, and the Elevated by Elyse business unit. Your dashboard shows total leads this week, leads by source, pipeline conversion rate, and Elevated by Elyse revenue. Revenue data across other units is view-only.",
  },
  ops_lead: {
    title: "Head of Operations",
    description: "You oversee daily operations including overdue follow-ups, bookings, pending approvals, and schedule gaps. Your dashboard shows Hive occupancy, active leads, and hot leads needing attention. Use the pipeline board to monitor lead flow across all units.",
  },
  ads_lead: {
    title: "Head of Ads",
    description: "You manage advertising performance across all channels. Your dashboard shows new leads by source and business unit, cost per lead, total ad spend, and top-of-funnel conversion rates. Use Ad Tracking to monitor Facebook and Google campaign performance.",
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
