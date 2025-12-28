import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Users, DollarSign, FileText, ClipboardList, Shield, Box, Star } from "lucide-react";

const quickStats = [
  { title: "Today's Bookings", value: "—", icon: CalendarDays, href: "/admin/schedule" },
  { title: "Pending Approvals", value: "—", icon: ClipboardList, href: "/admin/approvals" },
  { title: "Active Resources", value: "—", icon: Box, href: "/admin/resources" },
  { title: "Pending Reviews", value: "—", icon: Star, href: "/admin/reviews" },
];

export default function AdminDashboard() {
  const { authUser } = useAuth();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {authUser?.profile?.first_name || "Admin"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Link key={stat.href} to={stat.href}>
              <Card className="hover:shadow-md hover:border-primary/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Phase 2 Notice */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Phase 2 Admin Console</CardTitle>
            <CardDescription>
              The admin console structure is in place. Full operational functionality 
              will be implemented in Phase 3+.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate between admin modules. Each page is currently 
              a placeholder that will be populated with real data and actions in future phases.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
