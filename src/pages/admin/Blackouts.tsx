import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { CalendarX } from "lucide-react";

export default function AdminBlackouts() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Blackouts"
        description="Manage blackout dates and availability overrides"
        icon={<CalendarX className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
