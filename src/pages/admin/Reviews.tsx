import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { Star } from "lucide-react";

export default function AdminReviews() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Reviews"
        description="View and respond to customer reviews"
        icon={<Star className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
