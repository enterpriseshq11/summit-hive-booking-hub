import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { Shield } from "lucide-react";

export default function AdminAuditLog() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Audit Log"
        description="View system activity and privileged action history"
        icon={<Shield className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
