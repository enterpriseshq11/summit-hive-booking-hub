import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { Package } from "lucide-react";

export default function AdminPackages() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Packages & Add-ons"
        description="Configure service packages and optional add-ons"
        icon={<Package className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
