import { useParams } from "react-router-dom";
import { SEOHead } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CareerApplicationWizard } from "@/components/careers/CareerApplicationWizard";

const FITNESS_ROLES = [
  { value: "Personal Trainer", label: "Personal Trainer" },
  { value: "Strength Coach", label: "Strength Coach" },
  { value: "Group Fitness Instructor", label: "Group Fitness Instructor" },
  { value: "Nutrition Coach", label: "Nutrition Coach" },
  { value: "Front Desk", label: "Front Desk" },
  { value: "Other", label: "Other" },
];

// Map URL slugs to role names
const ROLE_SLUG_MAP: Record<string, string> = {
  "personal-trainer": "Personal Trainer",
  "coach": "Group Fitness Instructor",
  "strength-coach": "Strength Coach",
  "nutrition-coach": "Nutrition Coach",
  "front-desk": "Front Desk",
};

export default function CareersFitness() {
  const { role: roleSlug } = useParams();
  const preSelectedRole = roleSlug ? ROLE_SLUG_MAP[roleSlug] : undefined;

  return (
    <>
      <SEOHead
        title="Fitness Careers | A-Z Total Fitness"
        description="Join our fitness team at A-Z Total Fitness. We're hiring personal trainers, coaches, and group fitness instructors in Wapakoneta, Ohio."
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-orange-500/10 to-background">
          <div className="container">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/careers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Careers
              </Link>
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <Badge variant="outline" className="mb-1">Fitness Team</Badge>
                <h1 className="text-3xl font-bold">A-Z Total Fitness</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Help our members achieve their fitness goals. We offer competitive pay, 
              flexible scheduling, and opportunities to grow your client base.
            </p>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-12 container">
          <CareerApplicationWizard
            team="fitness"
            teamName="A-Z Total Fitness"
            roles={FITNESS_ROLES}
            preSelectedRole={preSelectedRole}
          />
        </section>
      </div>
    </>
  );
}
