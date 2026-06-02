import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Scissors, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CareerApplicationWizard } from "@/components/careers/CareerApplicationWizard";

const ROLES = [
  { value: "Hair Stylist", label: "Hair Stylist / Hairdresser" },
  { value: "Nail Tech", label: "Nail Tech" },
  { value: "Other", label: "Other" },
];

const ROLE_SLUG_MAP: Record<string, string> = {
  "hair-stylist": "Hair Stylist",
  "nail-tech": "Nail Tech",
};

export default function CareersHighMaintenance() {
  const { role: roleSlug } = useParams();
  const preSelectedRole = roleSlug ? ROLE_SLUG_MAP[roleSlug] : undefined;

  return (
    <>
      <SEOHead
        title="Careers at High Maintenance Co. | A-Z Enterprises"
        description="Join High Maintenance Co. — now hiring hair stylists and nail techs in Wapakoneta, Ohio."
      />
      <div className="min-h-screen bg-background">
        <section className="py-12 bg-gradient-to-b from-fuchsia-500/10 to-background">
          <div className="container">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/careers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Careers
              </Link>
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-fuchsia-500/10 flex items-center justify-center">
                <Scissors className="h-6 w-6 text-fuchsia-500" />
              </div>
              <div>
                <Badge variant="outline" className="mb-1">High Maintenance Co.</Badge>
                <h1 className="text-3xl font-bold">High Maintenance Co.</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Join our beauty team. We're hiring hair stylists and nail techs.
              Flexible scheduling, competitive pay, and a supportive environment.
            </p>
          </div>
        </section>

        <section className="py-12 container">
          <CareerApplicationWizard
            team="high_maintenance"
            teamName="High Maintenance Co."
            roles={ROLES}
            preSelectedRole={preSelectedRole}
          />
        </section>
      </div>
    </>
  );
}
