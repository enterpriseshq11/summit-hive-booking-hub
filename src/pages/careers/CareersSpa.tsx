import { useParams } from "react-router-dom";
import { SEOHead } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CareerApplicationWizard } from "@/components/careers/CareerApplicationWizard";

const SPA_ROLES = [
  { value: "Massage Therapist", label: "Massage Therapist" },
  { value: "Yoga Instructor", label: "Yoga Instructor" },
  { value: "Pilates Instructor", label: "Pilates Instructor" },
  { value: "Esthetician", label: "Esthetician" },
  { value: "Nail Tech", label: "Nail Tech" },
  { value: "Front Desk", label: "Front Desk / Guest Services" },
  { value: "Spa Attendant", label: "Spa Attendant" },
  { value: "Other", label: "Other" },
];

// Map URL slugs to role names
const ROLE_SLUG_MAP: Record<string, string> = {
  "massage-therapist": "Massage Therapist",
  "yoga-instructor": "Yoga Instructor",
  "pilates-instructor": "Pilates Instructor",
  "esthetician": "Esthetician",
  "nail-tech": "Nail Tech",
  "front-desk": "Front Desk",
};

export default function CareersSpa() {
  const { role: roleSlug } = useParams();
  const preSelectedRole = roleSlug ? ROLE_SLUG_MAP[roleSlug] : undefined;

  return (
    <>
      <SEOHead
        title="Spa Careers | Restoration Lounge by A-Z Enterprises"
        description="Join our spa team at Restoration Lounge. We're hiring massage therapists, yoga instructors, estheticians, and more in Wapakoneta, Ohio."
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-purple-500/10 to-background">
          <div className="container">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/careers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Careers
              </Link>
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <Badge variant="outline" className="mb-1">Spa Team</Badge>
                <h1 className="text-3xl font-bold">Restoration Lounge</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Join our wellness team and help guests relax, rejuvenate, and restore. 
              We offer flexible scheduling, competitive pay, and a supportive work environment.
            </p>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-12 container">
          <CareerApplicationWizard
            team="spa"
            teamName="Restoration Lounge (Spa)"
            roles={SPA_ROLES}
            preSelectedRole={preSelectedRole}
          />
        </section>
      </div>
    </>
  );
}
