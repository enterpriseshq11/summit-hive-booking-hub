import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CareerApplicant } from "@/hooks/useCareerApplications";

interface ApplicantInfoStepProps {
  applicant: Partial<CareerApplicant>;
  setApplicant: (applicant: Partial<CareerApplicant>) => void;
}

const SCHEDULE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "weekends", label: "Weekends" },
  { value: "evenings", label: "Evenings" },
  { value: "flexible", label: "Flexible" },
];

const REFERRAL_SOURCES = [
  "Indeed",
  "Google Search",
  "Social Media",
  "Friend/Family",
  "Walk-in",
  "Job Fair",
  "Other",
];

export function ApplicantInfoStep({ applicant, setApplicant }: ApplicantInfoStepProps) {
  const updateField = <K extends keyof CareerApplicant>(
    field: K,
    value: CareerApplicant[K]
  ) => {
    setApplicant({ ...applicant, [field]: value });
  };

  const updateAddress = (field: keyof CareerApplicant["address"], value: string) => {
    setApplicant({
      ...applicant,
      address: { ...applicant.address, [field]: value } as CareerApplicant["address"],
    });
  };

  const toggleSchedulePref = (value: string) => {
    const current = applicant.schedulePreference || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateField("schedulePreference", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Applicant Information</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about yourself. All fields marked with * are required.
        </p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Legal First Name *</Label>
          <Input
            id="firstName"
            value={applicant.firstName || ""}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Legal Last Name *</Label>
          <Input
            id="lastName"
            value={applicant.lastName || ""}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredName">Preferred Name</Label>
          <Input
            id="preferredName"
            value={applicant.preferredName || ""}
            onChange={(e) => updateField("preferredName", e.target.value)}
            placeholder="Johnny"
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={applicant.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={applicant.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="john.doe@example.com"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <Label>Address *</Label>
        <div className="space-y-4">
          <Input
            placeholder="Street Address"
            value={applicant.address?.street || ""}
            onChange={(e) => updateAddress("street", e.target.value)}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              placeholder="City"
              value={applicant.address?.city || ""}
              onChange={(e) => updateAddress("city", e.target.value)}
              className="col-span-2"
            />
            <Input
              placeholder="State"
              value={applicant.address?.state || ""}
              onChange={(e) => updateAddress("state", e.target.value)}
            />
            <Input
              placeholder="ZIP"
              value={applicant.address?.zip || ""}
              onChange={(e) => updateAddress("zip", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Work Authorization */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <Label>Are you legally authorized to work in the United States? *</Label>
          <RadioGroup
            value={applicant.authorizedToWork ? "yes" : "no"}
            onValueChange={(v) => updateField("authorizedToWork", v === "yes")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="auth-yes" />
              <Label htmlFor="auth-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="auth-no" />
              <Label htmlFor="auth-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Will you now or in the future require sponsorship? *</Label>
          <RadioGroup
            value={applicant.requiresSponsorship ? "yes" : "no"}
            onValueChange={(v) => updateField("requiresSponsorship", v === "yes")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="sponsor-yes" />
              <Label htmlFor="sponsor-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="sponsor-no" />
              <Label htmlFor="sponsor-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Work Preferences */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Desired Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={applicant.desiredStartDate || ""}
            onChange={(e) => updateField("desiredStartDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Employment Type Preference *</Label>
          <RadioGroup
            value={applicant.employmentType || "either"}
            onValueChange={(v) => updateField("employmentType", v as "w2" | "1099" | "either")}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="w2" id="emp-w2" />
              <Label htmlFor="emp-w2" className="font-normal">W2 Employee</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1099" id="emp-1099" />
              <Label htmlFor="emp-1099" className="font-normal">1099 Contractor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="either" id="emp-either" />
              <Label htmlFor="emp-either" className="font-normal">Either</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Schedule Preference *</Label>
          <div className="flex flex-wrap gap-4">
            {SCHEDULE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`schedule-${option.value}`}
                  checked={applicant.schedulePreference?.includes(option.value)}
                  onCheckedChange={() => toggleSchedulePref(option.value)}
                />
                <Label htmlFor={`schedule-${option.value}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="compensation">Compensation Expectations</Label>
          <Input
            id="compensation"
            value={applicant.compensationExpectations || ""}
            onChange={(e) => updateField("compensationExpectations", e.target.value)}
            placeholder="e.g., $20-25/hour, $50k/year, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referral">How did you hear about us?</Label>
          <select
            id="referral"
            value={applicant.referralSource || ""}
            onChange={(e) => updateField("referralSource", e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">Select...</option>
            {REFERRAL_SOURCES.map((src) => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
