import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Users, DollarSign, FileText, Settings, ClipboardList, Bell, Shield } from "lucide-react";

const adminModules = [
  { title: "Schedule", icon: CalendarDays, href: "/admin/schedule", description: "View and manage bookings" },
  { title: "Approvals", icon: ClipboardList, href: "/admin/approvals", description: "Pending requests" },
  { title: "Revenue", icon: DollarSign, href: "/admin/revenue", description: "Payments and reports" },
  { title: "Resources", icon: Settings, href: "/admin/resources", description: "Manage inventory" },
  { title: "Documents", icon: FileText, href: "/admin/documents", description: "Templates and signatures" },
  { title: "Users", icon: Users, href: "/admin/users", description: "Customer and staff management" },
  { title: "Notifications", icon: Bell, href: "/admin/notifications", description: "Message logs" },
  { title: "Audit Log", icon: Shield, href: "/admin/audit", description: "System activity" },
];

export default function AdminDashboard() {
  const { authUser } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Console</h1>
          <p className="text-muted-foreground">
            Welcome, {authUser?.profile?.first_name || "Admin"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminModules.map((module) => (
            <Link key={module.href} to={module.href}>
              <Card className="hover:shadow-lg hover:border-primary/50 transition-all h-full">
                <CardHeader className="pb-2">
                  <module.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
