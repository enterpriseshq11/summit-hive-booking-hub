import { CareerTeam } from "@/hooks/useCareerApplications";
import { SpaRoleFields } from "./role-specific/SpaRoleFields";
import { FitnessRoleFields } from "./role-specific/FitnessRoleFields";
import { ContractingRoleFields } from "./role-specific/ContractingRoleFields";

interface RoleSpecificStepProps {
  team: CareerTeam;
  role: string;
  roleSpecific: Record<string, unknown>;
  setRoleSpecific: (data: Record<string, unknown>) => void;
}

export function RoleSpecificStep({
  team,
  role,
  roleSpecific,
  setRoleSpecific,
}: RoleSpecificStepProps) {
  const updateField = (field: string, value: unknown) => {
    setRoleSpecific({ ...roleSpecific, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Role-Specific Details</h2>
        <p className="text-muted-foreground text-sm">
          Additional information specific to your selected role.
        </p>
      </div>

      {team === "spa" && (
        <SpaRoleFields
          role={role}
          data={roleSpecific}
          updateField={updateField}
        />
      )}

      {team === "fitness" && (
        <FitnessRoleFields
          role={role}
          data={roleSpecific}
          updateField={updateField}
        />
      )}

      {team === "contracting" && (
        <ContractingRoleFields
          role={role}
          data={roleSpecific}
          updateField={updateField}
        />
      )}
    </div>
  );
}
