import { ReactNode } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { 
  CalendarDays, 
  ClipboardList, 
  Package, 
  DollarSign, 
  CalendarX, 
  FileText, 
  Star, 
  Users, 
  Shield, 
  Lightbulb,
  LayoutDashboard,
  Box,
  UserCog,
  Loader2
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true },
  { title: "Schedule", href: "/admin/schedule", icon: CalendarDays },
  { title: "Approvals", href: "/admin/approvals", icon: ClipboardList },
  { title: "Resources", href: "/admin/resources", icon: Box },
  { title: "Packages", href: "/admin/packages", icon: Package },
  { title: "Pricing Rules", href: "/admin/pricing-rules", icon: DollarSign },
  { title: "Blackouts", href: "/admin/blackouts", icon: CalendarX },
  { title: "Documents", href: "/admin/documents", icon: FileText },
  { title: "Reviews", href: "/admin/reviews", icon: Star },
  { title: "Leads & Waitlists", href: "/admin/leads-waitlists", icon: Users },
  { title: "Users & Roles", href: "/admin/users-roles", icon: UserCog, ownerOnly: true },
  { title: "Audit Log", href: "/admin/audit-log", icon: Shield },
  { title: "Assumptions", href: "/admin/assumptions", icon: Lightbulb },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { authUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check if user is staff
  if (!authUser?.isStaff) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOwner = authUser?.isAdmin;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg text-foreground">Admin Console</h2>
            <p className="text-xs text-muted-foreground">A-Z Booking Hub</p>
          </div>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 px-2">
                  {adminNavItems.map((item) => {
                    // Skip owner-only items for non-owners
                    if (item.ownerOnly && !isOwner) {
                      return null;
                    }

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.href} 
                            end={item.end}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                            activeClassName="bg-primary/10 text-primary font-medium"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto bg-background">
          <header className="h-14 border-b border-border flex items-center px-6 gap-4 bg-card sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="text-sm text-muted-foreground">
              {authUser?.profile?.first_name} <span className="text-primary">({authUser?.roles?.join(", ") || "Staff"})</span>
            </div>
          </header>
          
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
