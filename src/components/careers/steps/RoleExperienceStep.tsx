import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CareerApplicant } from "@/hooks/useCareerApplications";

interface RoleExperienceStepProps {
  applicant: Partial<CareerApplicant>;
  setApplicant: (applicant: Partial<CareerApplicant>) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  roles: { value: string; label: string }[];
}

const EXPERIENCE_LEVELS = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

export function RoleExperienceStep({
  applicant,
  setApplicant,
  selectedRole,
  setSelectedRole,
  roles,
}: RoleExperienceStepProps) {
  const updateField = <K extends keyof CareerApplicant>(
    field: K,
    value: CareerApplicant[K]
  ) => {
    setApplicant({ ...applicant, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Role & Experience</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about the role you're interested in and your experience.
        </p>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <Label>Which role are you applying for? *</Label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role..." />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Years of Experience *</Label>
          <Select
            value={applicant.yearsExperience || ""}
            onValueChange={(v) => updateField("yearsExperience", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentEmployer">Current/Previous Employer</Label>
          <Input
            id="currentEmployer"
            value={applicant.currentEmployer || ""}
            onChange={(e) => updateField("currentEmployer", e.target.value)}
            placeholder="Company name"
          />
        </div>
      </div>

      {/* Resume */}
      <div className="space-y-2">
        <Label htmlFor="resumeLink">Resume Link or File URL *</Label>
        <Input
          id="resumeLink"
          value={applicant.resumeLink || ""}
          onChange={(e) => updateField("resumeLink", e.target.value)}
          placeholder="https://drive.google.com/... or https://linkedin.com/in/..."
        />
        <p className="text-xs text-muted-foreground">
          Paste a link to your resume (Google Drive, Dropbox, LinkedIn, etc.)
        </p>
      </div>

      {/* Intro */}
      <div className="space-y-2">
        <Label htmlFor="intro">Tell us about yourself *</Label>
        <Textarea
          id="intro"
          value={applicant.intro || ""}
          onChange={(e) => updateField("intro", e.target.value)}
          placeholder="Share your background, what motivates you, and why you'd be a great fit for this role..."
          className="min-h-[150px]"
        />
        <p className="text-xs text-muted-foreground">
          Minimum 50 characters. {(applicant.intro?.length || 0)}/50
        </p>
      </div>
    </div>
  );
}
