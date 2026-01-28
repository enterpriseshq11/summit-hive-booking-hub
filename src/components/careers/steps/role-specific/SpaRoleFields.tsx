import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface SpaRoleFieldsProps {
  role: string;
  data: Record<string, unknown>;
  updateField: (field: string, value: unknown) => void;
}

const MASSAGE_MODALITIES = [
  "Swedish",
  "Deep Tissue",
  "Sports",
  "Prenatal",
  "Trigger Point",
  "Hot Stone",
  "Cupping",
  "Lymphatic",
  "Other",
];

const YOGA_STYLES = [
  "Vinyasa",
  "Hatha",
  "Yin",
  "Restorative",
  "Power",
  "Hot",
  "Chair",
  "Other",
];

const SESSION_LENGTHS = ["30 min", "60 min", "90 min", "120 min"];

export function SpaRoleFields({ role, data, updateField }: SpaRoleFieldsProps) {
  const toggleArrayValue = (field: string, value: string) => {
    const current = (data[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateField(field, updated);
  };

  // Common spa fields
  const commonFields = (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <h3 className="font-medium">Licensing & Certification</h3>
      
      <div className="space-y-2">
        <Label>Are you licensed/certified for this role? *</Label>
        <RadioGroup
          value={data.isLicensed === true ? "yes" : data.isLicensed === false ? "no" : ""}
          onValueChange={(v) => updateField("isLicensed", v === "yes")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="licensed-yes" />
            <Label htmlFor="licensed-yes" className="font-normal">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="licensed-no" />
            <Label htmlFor="licensed-no" className="font-normal">No</Label>
          </div>
        </RadioGroup>
      </div>

      {data.isLicensed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>License/Certification Name *</Label>
            <Input
              value={(data.licenseName as string) || ""}
              onChange={(e) => updateField("licenseName", e.target.value)}
              placeholder="e.g., LMT, RYT-200, etc."
            />
          </div>
          <div className="space-y-2">
            <Label>License Number</Label>
            <Input
              value={(data.licenseNumber as string) || ""}
              onChange={(e) => updateField("licenseNumber", e.target.value)}
              placeholder="License #"
            />
          </div>
          <div className="space-y-2">
            <Label>State Issued *</Label>
            <Input
              value={(data.licenseState as string) || ""}
              onChange={(e) => updateField("licenseState", e.target.value)}
              placeholder="OH"
            />
          </div>
          <div className="space-y-2">
            <Label>Expiration Date *</Label>
            <Input
              type="date"
              value={(data.licenseExpiration as string) || ""}
              onChange={(e) => updateField("licenseExpiration", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Years in spa/wellness industry *</Label>
        <Input
          value={(data.yearsInSpa as string) || ""}
          onChange={(e) => updateField("yearsInSpa", e.target.value)}
          placeholder="e.g., 3"
        />
      </div>

      <div className="space-y-2">
        <Label>Comfortable with upsells/memberships? *</Label>
        <RadioGroup
          value={data.comfortableWithUpsells === true ? "yes" : data.comfortableWithUpsells === false ? "no" : ""}
          onValueChange={(v) => updateField("comfortableWithUpsells", v === "yes")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="upsells-yes" />
            <Label htmlFor="upsells-yes" className="font-normal">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="upsells-no" />
            <Label htmlFor="upsells-no" className="font-normal">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Customer service comfort level (1-5) *</Label>
        <RadioGroup
          value={String(data.customerServiceLevel || "")}
          onValueChange={(v) => updateField("customerServiceLevel", parseInt(v))}
          className="flex gap-4"
        >
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="flex items-center space-x-1">
              <RadioGroupItem value={String(level)} id={`cs-${level}`} />
              <Label htmlFor={`cs-${level}`} className="font-normal">{level}</Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-xs text-muted-foreground">1 = Still learning, 5 = Expert</p>
      </div>
    </div>
  );

  // Massage Therapist specific fields
  const massageFields = role === "Massage Therapist" && (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <h3 className="font-medium">Massage Therapist Details</h3>
      
      <div className="space-y-2">
        <Label>Modalities (select all you practice) *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MASSAGE_MODALITIES.map((mod) => (
            <div key={mod} className="flex items-center space-x-2">
              <Checkbox
                id={`mod-${mod}`}
                checked={((data.modalities as string[]) || []).includes(mod)}
                onCheckedChange={() => toggleArrayValue("modalities", mod)}
              />
              <Label htmlFor={`mod-${mod}`} className="font-normal text-sm">{mod}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Comfortable with couples massage?</Label>
        <RadioGroup
          value={data.couplesMassage === true ? "yes" : data.couplesMassage === false ? "no" : ""}
          onValueChange={(v) => updateField("couplesMassage", v === "yes")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="couples-yes" />
            <Label htmlFor="couples-yes" className="font-normal">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="couples-no" />
            <Label htmlFor="couples-no" className="font-normal">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Max hours hands-on per week *</Label>
        <Input
          type="number"
          value={(data.maxHoursPerWeek as string) || ""}
          onChange={(e) => updateField("maxHoursPerWeek", e.target.value)}
          placeholder="e.g., 25"
        />
      </div>

      <div className="space-y-2">
        <Label>Preferred session lengths</Label>
        <div className="flex flex-wrap gap-3">
          {SESSION_LENGTHS.map((len) => (
            <div key={len} className="flex items-center space-x-2">
              <Checkbox
                id={`len-${len}`}
                checked={((data.sessionLengths as string[]) || []).includes(len)}
                onCheckedChange={() => toggleArrayValue("sessionLengths", len)}
              />
              <Label htmlFor={`len-${len}`} className="font-normal text-sm">{len}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Comfortable with intake + SOAP notes?</Label>
        <RadioGroup
          value={data.soapNotesComfort === true ? "yes" : data.soapNotesComfort === false ? "no" : ""}
          onValueChange={(v) => updateField("soapNotesComfort", v === "yes")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="soap-yes" />
            <Label htmlFor="soap-yes" className="font-normal">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="soap-no" />
            <Label htmlFor="soap-no" className="font-normal">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Do you have liability insurance?</Label>
        <RadioGroup
          value={data.hasLiabilityInsurance === true ? "yes" : data.hasLiabilityInsurance === false ? "no" : ""}
          onValueChange={(v) => updateField("hasLiabilityInsurance", v === "yes")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="liability-yes" />
            <Label htmlFor="liability-yes" className="font-normal">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="liability-no" />
            <Label htmlFor="liability-no" className="font-normal">No</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  // Yoga Instructor specific fields
  const yogaFields = role === "Yoga Instructor" && (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <h3 className="font-medium">Yoga Instructor Details</h3>
      
      <div className="space-y-2">
        <Label>Yoga styles taught (select all) *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {YOGA_STYLES.map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <Checkbox
                id={`style-${style}`}
                checked={((data.yogaStyles as string[]) || []).includes(style)}
                onCheckedChange={() => toggleArrayValue("yogaStyles", style)}
              />
              <Label htmlFor={`style-${style}`} className="font-normal text-sm">{style}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>RYT Level *</Label>
        <select
          value={(data.rytLevel as string) || ""}
          onChange={(e) => updateField("rytLevel", e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">Select...</option>
          <option value="RYT-200">RYT-200</option>
          <option value="RYT-300">RYT-300</option>
          <option value="RYT-500">RYT-500</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Years teaching yoga *</Label>
        <Input
          value={(data.yearsTeachingYoga as string) || ""}
          onChange={(e) => updateField("yearsTeachingYoga", e.target.value)}
          placeholder="e.g., 5"
        />
      </div>

      <div className="space-y-2">
        <Label>Comfortable with beginners? *</Label>
        <RadioGroup
          value={data.comfortableWithBeginners === true ? "yes" : data.comfortableWithBeginners === false ? "no" : ""}
          onValueChange={(v) => updateField("comfortableWithBeginners", v === "yes")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="beginners-yes" />
            <Label htmlFor="beginners-yes" className="font-normal">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="beginners-no" />
            <Label htmlFor="beginners-no" className="font-normal">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Music preference + class vibe</Label>
        <Textarea
          value={(data.classVibe as string) || ""}
          onChange={(e) => updateField("classVibe", e.target.value)}
          placeholder="Describe your typical class atmosphere, music choices, etc."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );

  // Pilates Instructor specific fields
  const pilatesFields = role === "Pilates Instructor" && (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <h3 className="font-medium">Pilates Instructor Details</h3>
      
      <div className="space-y-2">
        <Label>What do you teach? *</Label>
        <div className="flex flex-wrap gap-3">
          {["Mat", "Reformer", "Both"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`pilates-${type}`}
                checked={(data.pilatesType as string) === type}
                onCheckedChange={() => updateField("pilatesType", type)}
              />
              <Label htmlFor={`pilates-${type}`} className="font-normal">{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Certification program *</Label>
        <Input
          value={(data.certificationProgram as string) || ""}
          onChange={(e) => updateField("certificationProgram", e.target.value)}
          placeholder="e.g., BASI, Balanced Body, Peak Pilates, etc."
        />
      </div>

      <div className="space-y-2">
        <Label>Years teaching Pilates *</Label>
        <Input
          value={(data.yearsTeachingPilates as string) || ""}
          onChange={(e) => updateField("yearsTeachingPilates", e.target.value)}
          placeholder="e.g., 3"
        />
      </div>

      <div className="space-y-2">
        <Label>Comfortable with private sessions?</Label>
        <RadioGroup
          value={data.comfortableWithPrivate === true ? "yes" : data.comfortableWithPrivate === false ? "no" : ""}
          onValueChange={(v) => updateField("comfortableWithPrivate", v === "yes")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="private-yes" />
            <Label htmlFor="private-yes" className="font-normal">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="private-no" />
            <Label htmlFor="private-no" className="font-normal">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Any rehab/clinical experience?</Label>
        <Textarea
          value={(data.rehabExperience as string) || ""}
          onChange={(e) => updateField("rehabExperience", e.target.value)}
          placeholder="Describe any experience working with physical therapy patients, injuries, etc."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );

  return (
    <>
      {commonFields}
      {massageFields}
      {yogaFields}
      {pilatesFields}
    </>
  );
}
