import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { Users } from "lucide-react";

export default function AdminLeadsWaitlists() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Leads & Waitlists"
        description="Manage inquiries and waitlist entries"
        icon={<Users className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
