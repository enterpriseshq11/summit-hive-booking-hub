import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { ClipboardList } from "lucide-react";

export default function AdminApprovals() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Approvals"
        description="Review and process pending booking requests"
        icon={<ClipboardList className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
