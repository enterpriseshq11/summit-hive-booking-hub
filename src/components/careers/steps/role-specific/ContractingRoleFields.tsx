import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface ContractingRoleFieldsProps {
  role: string;
  data: Record<string, unknown>;
  updateField: (field: string, value: unknown) => void;
}

const JOB_TYPES = [
  "New Construction",
  "Remodels",
  "Repairs",
  "Commercial",
  "Residential",
  "Property Management",
  "Emergency/On-Call",
];

const LICENSED_TRADES = ["Electrician", "Plumber", "HVAC"];

export function ContractingRoleFields({ role, data, updateField }: ContractingRoleFieldsProps) {
  const toggleArrayValue = (field: string, value: string) => {
    const current = (data[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateField(field, updated);
  };

  const isLicensedTrade = LICENSED_TRADES.includes(role);

  return (
    <div className="space-y-6">
      {/* Trade & License Info */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium">Trade & Licensing</h3>
        
        <div className="space-y-2">
          <Label>Trade/License Type *</Label>
          <Input
            value={(data.tradeType as string) || ""}
            onChange={(e) => updateField("tradeType", e.target.value)}
            placeholder="e.g., General Contractor, Master Electrician, etc."
          />
        </div>

        {isLicensedTrade && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>License Number *</Label>
                <Input
                  value={(data.licenseNumber as string) || ""}
                  onChange={(e) => updateField("licenseNumber", e.target.value)}
                  placeholder="License #"
                />
              </div>
              <div className="space-y-2">
                <Label>State of License *</Label>
                <Input
                  value={(data.licenseState as string) || ""}
                  onChange={(e) => updateField("licenseState", e.target.value)}
                  placeholder="OH"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>Are you insured? *</Label>
          <RadioGroup
            value={data.isInsured === true ? "yes" : data.isInsured === false ? "no" : ""}
            onValueChange={(v) => updateField("isInsured", v === "yes")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="insured-yes" />
              <Label htmlFor="insured-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="insured-no" />
              <Label htmlFor="insured-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>

        {data.isInsured && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Insurance Provider</Label>
              <Input
                value={(data.insuranceProvider as string) || ""}
                onChange={(e) => updateField("insuranceProvider", e.target.value)}
                placeholder="Provider name"
              />
            </div>
            <div className="space-y-2">
              <Label>Policy Number</Label>
              <Input
                value={(data.policyNumber as string) || ""}
                onChange={(e) => updateField("policyNumber", e.target.value)}
                placeholder="Policy #"
              />
            </div>
          </div>
        )}
      </div>

      {/* Equipment & Logistics */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium">Equipment & Logistics</h3>
        
        <div className="space-y-2">
          <Label>Do you have reliable transportation? *</Label>
          <RadioGroup
            value={data.hasTransportation === true ? "yes" : data.hasTransportation === false ? "no" : ""}
            onValueChange={(v) => updateField("hasTransportation", v === "yes")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="transport-yes" />
              <Label htmlFor="transport-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="transport-no" />
              <Label htmlFor="transport-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Do you have your own tools? *</Label>
          <RadioGroup
            value={data.hasTools === true ? "yes" : data.hasTools === false ? "no" : ""}
            onValueChange={(v) => updateField("hasTools", v === "yes")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="tools-yes" />
              <Label htmlFor="tools-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="tools-no" />
              <Label htmlFor="tools-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Can you pull permits?</Label>
          <RadioGroup
            value={data.canPullPermits === true ? "yes" : data.canPullPermits === false ? "no" : ""}
            onValueChange={(v) => updateField("canPullPermits", v === "yes")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="permits-yes" />
              <Label htmlFor="permits-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="permits-no" />
              <Label htmlFor="permits-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Job Types & Service Area */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium">Work Preferences</h3>
        
        <div className="space-y-2">
          <Label>Typical job types you take</Label>
          <div className="grid grid-cols-2 gap-2">
            {JOB_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`job-${type}`}
                  checked={((data.jobTypes as string[]) || []).includes(type)}
                  onCheckedChange={() => toggleArrayValue("jobTypes", type)}
                />
                <Label htmlFor={`job-${type}`} className="font-normal text-sm">{type}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Service radius / areas you cover *</Label>
          <Textarea
            value={(data.serviceArea as string) || ""}
            onChange={(e) => updateField("serviceArea", e.target.value)}
            placeholder="e.g., Wapakoneta, Lima, St. Marys, and surrounding areas within 30 miles"
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Portfolio links</Label>
          <Input
            value={(data.portfolioLinks as string) || ""}
            onChange={(e) => updateField("portfolioLinks", e.target.value)}
            placeholder="https://... (website, Instagram, etc.)"
          />
        </div>
      </div>

      {/* References */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium">References (2 required)</h3>
        
        {[0, 1].map((idx) => (
          <div key={idx} className="space-y-3 p-3 border rounded-md">
            <h4 className="text-sm font-medium">Reference {idx + 1} *</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Name"
                value={((data.references as { name: string; contact: string; relationship: string }[]) || [])[idx]?.name || ""}
                onChange={(e) => {
                  const refs = [...((data.references as { name: string; contact: string; relationship: string }[]) || [{ name: "", contact: "", relationship: "" }, { name: "", contact: "", relationship: "" }])];
                  refs[idx] = { ...refs[idx], name: e.target.value };
                  updateField("references", refs);
                }}
              />
              <Input
                placeholder="Phone or Email"
                value={((data.references as { name: string; contact: string; relationship: string }[]) || [])[idx]?.contact || ""}
                onChange={(e) => {
                  const refs = [...((data.references as { name: string; contact: string; relationship: string }[]) || [{ name: "", contact: "", relationship: "" }, { name: "", contact: "", relationship: "" }])];
                  refs[idx] = { ...refs[idx], contact: e.target.value };
                  updateField("references", refs);
                }}
              />
              <Input
                placeholder="Relationship"
                value={((data.references as { name: string; contact: string; relationship: string }[]) || [])[idx]?.relationship || ""}
                onChange={(e) => {
                  const refs = [...((data.references as { name: string; contact: string; relationship: string }[]) || [{ name: "", contact: "", relationship: "" }, { name: "", contact: "", relationship: "" }])];
                  refs[idx] = { ...refs[idx], relationship: e.target.value };
                  updateField("references", refs);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
