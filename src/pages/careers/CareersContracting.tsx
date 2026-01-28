import { useParams } from "react-router-dom";
import { SEOHead } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Wrench, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CareerApplicationWizard } from "@/components/careers/CareerApplicationWizard";

const CONTRACTING_ROLES = [
  { value: "General Contractor", label: "General Contractor" },
  { value: "Handyman", label: "Handyman" },
  { value: "Electrician", label: "Electrician" },
  { value: "Plumber", label: "Plumber" },
  { value: "HVAC", label: "HVAC Technician" },
  { value: "Painter", label: "Painter" },
  { value: "Flooring", label: "Flooring Specialist" },
  { value: "Carpenter", label: "Carpenter" },
  { value: "Other", label: "Other" },
];

// Map URL slugs to role names
const ROLE_SLUG_MAP: Record<string, string> = {
  "general": "General Contractor",
  "handyman": "Handyman",
  "electrician": "Electrician",
  "plumber": "Plumber",
  "hvac": "HVAC",
  "painter": "Painter",
  "flooring": "Flooring",
  "carpenter": "Carpenter",
};

export default function CareersContracting() {
  const { role: roleSlug } = useParams();
  const preSelectedRole = roleSlug ? ROLE_SLUG_MAP[roleSlug] : undefined;

  return (
    <>
      <SEOHead
        title="Contracting Careers | A-Z Enterprises"
        description="Join our contractor network. We're looking for skilled contractors, handymen, electricians, plumbers, and more in Northwest Ohio."
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-blue-500/10 to-background">
          <div className="container">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/careers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Careers
              </Link>
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <Badge variant="outline" className="mb-1">Contracting Team</Badge>
                <h1 className="text-3xl font-bold">A-Z Contracting</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Join our network of skilled contractors serving Northwest Ohio. 
              We offer steady project flow, fair pay, and professional support.
            </p>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-12 container">
          <CareerApplicationWizard
            team="contracting"
            teamName="A-Z Contracting"
            roles={CONTRACTING_ROLES}
            preSelectedRole={preSelectedRole}
          />
        </section>
      </div>
    </>
  );
}
