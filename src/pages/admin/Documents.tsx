import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { FileText } from "lucide-react";

export default function AdminDocuments() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Documents & Templates"
        description="Manage contracts, waivers, policies, and intake forms"
        icon={<FileText className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
