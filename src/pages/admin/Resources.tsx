import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { Box } from "lucide-react";

export default function AdminResources() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Resources"
        description="Manage rooms, offices, equipment, and service providers"
        icon={<Box className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
