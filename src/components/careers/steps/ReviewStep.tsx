import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CareerTeam, CareerApplicant, CareerAvailability, CareerConsents } from "@/hooks/useCareerApplications";
import { CheckCircle2 } from "lucide-react";

interface ReviewStepProps {
  team: CareerTeam;
  teamName: string;
  role: string;
  applicant: CareerApplicant;
  availability: CareerAvailability;
  roleSpecific: Record<string, unknown>;
  consents: CareerConsents;
}

export function ReviewStep({
  team,
  teamName,
  role,
  applicant,
  availability,
  roleSpecific,
  consents,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review Your Application</h2>
        <p className="text-muted-foreground text-sm">
          Please review your information before submitting. Click "Back" to make any changes.
        </p>
      </div>

      {/* Position */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Position
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Team:</span>
            <Badge variant="outline" className="capitalize">{team}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role:</span>
            <span className="font-medium">{role}</span>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">
              {applicant.firstName} {applicant.lastName}
              {applicant.preferredName && ` (${applicant.preferredName})`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone:</span>
            <span>{applicant.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{applicant.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Address:</span>
            <span className="text-right">
              {applicant.address.street}, {applicant.address.city}, {applicant.address.state} {applicant.address.zip}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Work Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Work Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Employment Type:</span>
            <span className="uppercase">{applicant.employmentType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Desired Start:</span>
            <span>{new Date(applicant.desiredStartDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Experience:</span>
            <span>{applicant.yearsExperience} years</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Schedule:</span>
            <span className="text-right">{applicant.schedulePreference.join(", ")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Days:</span>
            <span className="text-right capitalize">{availability.daysAvailable.join(", ")}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Time Blocks:</span>
            <span className="text-right capitalize">{availability.timeBlocks.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Earliest Start:</span>
            <span>{new Date(availability.earliestStartDate).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Summary */}
      {Object.keys(roleSpecific).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Role Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">
              {Object.keys(roleSpecific).length} role-specific fields completed
            </p>
          </CardContent>
        </Card>
      )}

      {/* Agreements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Agreements & Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Certification:</span>
            <span className="text-green-600">✓ Accepted</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Communication:</span>
            <span className="text-green-600">✓ Accepted</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Signed:</span>
            <span className="font-serif italic">{consents.signatureFullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{new Date(consents.signatureDate).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          By clicking "Submit Application", your information will be sent to our hiring team.
          You'll receive a confirmation email at <strong>{applicant.email}</strong>.
        </p>
      </div>
    </div>
  );
}
