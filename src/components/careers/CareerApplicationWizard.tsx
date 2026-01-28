import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { CareerTeam, useSubmitCareerApplication, CareerApplicant, CareerAvailability, CareerConsents } from "@/hooks/useCareerApplications";
import { ApplicantInfoStep } from "./steps/ApplicantInfoStep";
import { RoleExperienceStep } from "./steps/RoleExperienceStep";
import { AvailabilityStep } from "./steps/AvailabilityStep";
import { RoleSpecificStep } from "./steps/RoleSpecificStep";
import { ConsentsStep } from "./steps/ConsentsStep";
import { ReviewStep } from "./steps/ReviewStep";

interface CareerApplicationWizardProps {
  team: CareerTeam;
  teamName: string;
  roles: { value: string; label: string }[];
  preSelectedRole?: string;
}

export type WizardStep = "applicant" | "role" | "availability" | "role-specific" | "consents" | "review";

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "applicant", label: "Your Info" },
  { id: "role", label: "Role & Experience" },
  { id: "availability", label: "Availability" },
  { id: "role-specific", label: "Role Details" },
  { id: "consents", label: "Agreements" },
  { id: "review", label: "Review" },
];

const STORAGE_KEY = "career-application-draft";

export function CareerApplicationWizard({ team, teamName, roles, preSelectedRole }: CareerApplicationWizardProps) {
  const location = useLocation();
  const submitMutation = useSubmitCareerApplication();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>("applicant");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  
  // Form state
  const [applicant, setApplicant] = useState<Partial<CareerApplicant>>({
    authorizedToWork: true,
    requiresSponsorship: false,
    employmentType: "either",
    preferredLocations: [],
    schedulePreference: [],
  });
  const [selectedRole, setSelectedRole] = useState(preSelectedRole || "");
  const [roleSpecific, setRoleSpecific] = useState<Record<string, unknown>>({});
  const [availability, setAvailability] = useState<Partial<CareerAvailability>>({
    daysAvailable: [],
    timeBlocks: [],
  });
  const [consents, setConsents] = useState<Partial<CareerConsents>>({
    certifyTruthful: false,
    agreeToContact: false,
    signatureFullName: "",
    signatureDate: new Date().toISOString().split("T")[0],
  });

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-${team}`);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.applicant) setApplicant(draft.applicant);
        if (draft.selectedRole && !preSelectedRole) setSelectedRole(draft.selectedRole);
        if (draft.roleSpecific) setRoleSpecific(draft.roleSpecific);
        if (draft.availability) setAvailability(draft.availability);
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, [team, preSelectedRole]);

  // Save draft to localStorage
  useEffect(() => {
    const draft = { applicant, selectedRole, roleSpecific, availability };
    localStorage.setItem(`${STORAGE_KEY}-${team}`, JSON.stringify(draft));
  }, [team, applicant, selectedRole, roleSpecific, availability]);

  // Clear draft on successful submit
  useEffect(() => {
    if (submittedId) {
      localStorage.removeItem(`${STORAGE_KEY}-${team}`);
    }
  }, [submittedId, team]);

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case "applicant":
        return !!(
          applicant.firstName?.trim() &&
          applicant.lastName?.trim() &&
          applicant.phone?.trim() &&
          applicant.email?.trim() &&
          applicant.address?.street?.trim() &&
          applicant.address?.city?.trim() &&
          applicant.address?.state?.trim() &&
          applicant.address?.zip?.trim() &&
          applicant.desiredStartDate &&
          applicant.employmentType
        );
      case "role":
        return !!(selectedRole && applicant.yearsExperience && applicant.intro?.trim());
      case "availability":
        return !!(
          availability.daysAvailable?.length &&
          availability.timeBlocks?.length &&
          availability.earliestStartDate
        );
      case "role-specific":
        return true; // Role-specific validation handled per team
      case "consents":
        return !!(
          consents.certifyTruthful &&
          consents.agreeToContact &&
          consents.signatureFullName?.trim()
        );
      case "review":
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1].id);
      window.scrollTo(0, 0);
    }
  };

  const goBack = () => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1].id);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    const result = await submitMutation.mutateAsync({
      team,
      role: selectedRole,
      sourceUrl: window.location.href,
      applicant: applicant as CareerApplicant,
      roleSpecific,
      availability: availability as CareerAvailability,
      consents: consents as CareerConsents,
    });
    setSubmittedId(result.id);
  };

  // Success state
  if (submittedId) {
    const shortId = submittedId.slice(0, 8).toUpperCase();
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Application Submitted!</CardTitle>
          <CardDescription>
            Thank you for applying to {teamName}. We've received your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Your confirmation number:</p>
            <p className="text-2xl font-mono font-bold">{shortId}</p>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>A confirmation email has been sent to <strong>{applicant.email}</strong>.</p>
            <p>Our team will review your application and reach out within 5-7 business days.</p>
          </div>
          <Button asChild className="mt-4">
            <a href="/careers">Back to Careers</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">{STEPS[currentStepIndex].label}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`text-xs ${
                idx <= currentStepIndex ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === "applicant" && (
            <ApplicantInfoStep
              applicant={applicant}
              setApplicant={setApplicant}
            />
          )}
          {currentStep === "role" && (
            <RoleExperienceStep
              applicant={applicant}
              setApplicant={setApplicant}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              roles={roles}
            />
          )}
          {currentStep === "availability" && (
            <AvailabilityStep
              availability={availability}
              setAvailability={setAvailability}
            />
          )}
          {currentStep === "role-specific" && (
            <RoleSpecificStep
              team={team}
              role={selectedRole}
              roleSpecific={roleSpecific}
              setRoleSpecific={setRoleSpecific}
            />
          )}
          {currentStep === "consents" && (
            <ConsentsStep
              consents={consents}
              setConsents={setConsents}
            />
          )}
          {currentStep === "review" && (
            <ReviewStep
              team={team}
              teamName={teamName}
              role={selectedRole}
              applicant={applicant as CareerApplicant}
              availability={availability as CareerAvailability}
              roleSpecific={roleSpecific}
              consents={consents as CareerConsents}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep === "review" ? (
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!canGoNext()}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
