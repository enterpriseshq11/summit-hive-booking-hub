import { AdminLayout } from "@/components/admin";
import { AdminStubPage } from "@/components/admin";
import { CalendarDays } from "lucide-react";

export default function AdminSchedule() {
  return (
    <AdminLayout>
      <AdminStubPage
        title="Schedule"
        description="View and manage all bookings across businesses"
        icon={<CalendarDays className="h-5 w-5 text-muted-foreground" />}
      />
    </AdminLayout>
  );
}
