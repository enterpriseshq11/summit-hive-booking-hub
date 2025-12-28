import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { DollarSign } from "lucide-react";

export default function AdminPricingRules() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Pricing Rules"
        description="Configure dynamic pricing, discounts, and modifiers"
        icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
