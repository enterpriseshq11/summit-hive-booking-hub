import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface FitnessRoleFieldsProps {
  role: string;
  data: Record<string, unknown>;
  updateField: (field: string, value: unknown) => void;
}

const CERTIFICATIONS = [
  "NASM",
  "ACE",
  "ISSA",
  "CSCS",
  "ACSM",
  "NSCA",
  "CrossFit L1",
  "CrossFit L2",
  "Other",
];

const EXPERIENCE_TYPES = [
  "1:1 Training",
  "Group Classes",
  "Sports Performance",
  "Rehab/Corrective",
  "Online Coaching",
];

const SPECIALTIES = [
  "Weight Loss",
  "Strength Training",
  "Mobility/Flexibility",
  "Rehab-Friendly",
  "Athletic Performance",
  "Seniors",
  "Youth",
  "Bodybuilding",
  "Powerlifting",
  "Olympic Lifting",
];

export function FitnessRoleFields({ role, data, updateField }: FitnessRoleFieldsProps) {
  const toggleArrayValue = (field: string, value: string) => {
    const current = (data[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateField(field, updated);
  };

  const isTrainerOrCoach = ["Personal Trainer", "Strength Coach", "Group Fitness Instructor", "Nutrition Coach"].includes(role);

  return (
    <div className="space-y-6">
      {/* Certifications */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium">Certifications</h3>
        
        <div className="space-y-2">
          <Label>Current certifications (select all) *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CERTIFICATIONS.map((cert) => (
              <div key={cert} className="flex items-center space-x-2">
                <Checkbox
                  id={`cert-${cert}`}
                  checked={((data.certifications as string[]) || []).includes(cert)}
                  onCheckedChange={() => toggleArrayValue("certifications", cert)}
                />
                <Label htmlFor={`cert-${cert}`} className="font-normal text-sm">{cert}</Label>
              </div>
            ))}
          </div>
        </div>

        {isTrainerOrCoach && (
          <div className="space-y-2">
            <Label>Certification proof link *</Label>
            <Input
              value={(data.certificationProof as string) || ""}
              onChange={(e) => updateField("certificationProof", e.target.value)}
              placeholder="https://drive.google.com/... or upload link"
            />
            <p className="text-xs text-muted-foreground">
              Link to scan/photo of your certification(s)
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>CPR/AED certified? *</Label>
          <RadioGroup
            value={data.cprCertified === true ? "yes" : data.cprCertified === false ? "no" : ""}
            onValueChange={(v) => updateField("cprCertified", v === "yes")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="cpr-yes" />
              <Label htmlFor="cpr-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="cpr-no" />
              <Label htmlFor="cpr-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Experience */}
      {isTrainerOrCoach && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium">Experience</h3>
          
          <div className="space-y-2">
            <Label>Experience types (select all) *</Label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`exp-${type}`}
                    checked={((data.experienceTypes as string[]) || []).includes(type)}
                    onCheckedChange={() => toggleArrayValue("experienceTypes", type)}
                  />
                  <Label htmlFor={`exp-${type}`} className="font-normal text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Specialties</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SPECIALTIES.map((spec) => (
                <div key={spec} className="flex items-center space-x-2">
                  <Checkbox
                    id={`spec-${spec}`}
                    checked={((data.specialties as string[]) || []).includes(spec)}
                    onCheckedChange={() => toggleArrayValue("specialties", spec)}
                  />
                  <Label htmlFor={`spec-${spec}`} className="font-normal text-sm">{spec}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sales & Style */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium">Work Style</h3>
        
        <div className="space-y-2">
          <Label>Comfortable selling packages/memberships? *</Label>
          <RadioGroup
            value={data.comfortableSelling === true ? "yes" : data.comfortableSelling === false ? "no" : ""}
            onValueChange={(v) => updateField("comfortableSelling", v === "yes")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="selling-yes" />
              <Label htmlFor="selling-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="selling-no" />
              <Label htmlFor="selling-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>

        {isTrainerOrCoach && (
          <>
            <div className="space-y-2">
              <Label>Programming style *</Label>
              <Textarea
                value={(data.programmingStyle as string) || ""}
                onChange={(e) => updateField("programmingStyle", e.target.value)}
                placeholder="Describe how you typically design programs for clients..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Client results examples</Label>
              <Textarea
                value={(data.clientResults as string) || ""}
                onChange={(e) => updateField("clientResults", e.target.value)}
                placeholder="Share any notable client transformations or achievements..."
                className="min-h-[100px]"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
