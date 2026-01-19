import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Target,
  Kanban,
  Activity,
  DollarSign,
  Percent,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  Menu,
  Wallet,
  Mic,
  CalendarDays,
  ClipboardList,
  Package,
  CalendarX,
  FileText,
  Star,
  Shield,
  Lightbulb,
  Box,
  UserCog,
  Building2,
  ImagePlus,
  Tag,
  MessageSquare,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface UnifiedAdminLayoutProps {
  children: ReactNode;
}

// Unified navigation configuration - all admin features in one place
const navSections = [
  {
    label: "Command Center",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true },
      { title: "Leads", href: "/admin/leads", icon: Target },
      { title: "Pipeline", href: "/admin/pipeline", icon: Kanban },
      { title: "Employees", href: "/admin/employees", icon: Users },
      { title: "Activity Log", href: "/admin/activity", icon: Activity },
      { title: "Revenue", href: "/admin/revenue", icon: DollarSign },
      { title: "Commissions", href: "/admin/commissions", icon: Percent },
      { title: "Payroll", href: "/admin/payroll", icon: Wallet, adminOnly: true },
      { title: "Alerts", href: "/admin/alerts", icon: Bell },
    ],
  },
  {
    label: "Booking Operations",
    items: [
      { title: "Schedule", href: "/admin/schedule", icon: CalendarDays },
      { title: "Approvals", href: "/admin/approvals", icon: ClipboardList },
      { title: "Resources", href: "/admin/resources", icon: Box },
      { title: "Packages", href: "/admin/packages", icon: Package },
      { title: "Pricing Rules", href: "/admin/pricing-rules", icon: DollarSign },
      { title: "Blackouts", href: "/admin/blackouts", icon: CalendarX },
      { title: "Documents", href: "/admin/documents", icon: FileText },
      { title: "Reviews", href: "/admin/reviews", icon: Star },
      { title: "Leads & Waitlists", href: "/admin/leads-waitlists", icon: Users },
    ],
  },
  {
    label: "Voice Vault",
    items: [
      { title: "Voice Vault", href: "/admin/voice-vault", icon: Mic },
    ],
  },
  {
    label: "Coworking (The Hive)",
    items: [
      { title: "Office Listings", href: "/admin/office-listings", icon: Building2 },
      { title: "Office Promotions", href: "/admin/office-promotions", icon: Tag },
      { title: "Office Inquiries", href: "/admin/office-inquiries", icon: MessageSquare },
    ],
  },
  {
    label: "Marketing",
    items: [
      { title: "Promotions", href: "/admin/promotions", icon: Tag },
      { title: "Dopamine Drop", href: "/admin/dopamine-drop", icon: Gift },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Users & Roles", href: "/admin/users-roles", icon: UserCog, ownerOnly: true },
      { title: "Audit Log", href: "/admin/audit-log", icon: Shield },
      { title: "Assumptions", href: "/admin/assumptions", icon: Lightbulb },
      { title: "Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
    ],
  },
];

export function UnifiedAdminLayout({ children }: UnifiedAdminLayoutProps) {
  const { authUser, isLoading, isRolesLoaded, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  // Check if user has admin access (only evaluate when roles are loaded)
  const rolesLength = authUser?.roles?.length ?? 0;
  const hasAccess =
    isRolesLoaded && rolesLength
      ? authUser!.roles.some((r) =>
          [
            "owner",
            "manager",
            "department_lead",
            "front_desk",
            "read_only",
            "spa_lead",
            "fitness_lead",
            "coworking_manager",
            "event_coordinator",
          ].includes(r)
        )
      : false;

  const isAdmin = authUser?.roles?.some((r) => ["owner", "manager"].includes(r)) ?? false;
  const isOwner = authUser?.roles?.some((r) => r === "owner") ?? false;

  useEffect(() => {
    // Wait for both auth loading AND roles to be loaded before making access decisions
    if (isLoading || !isRolesLoaded) return;

    if (!authUser) {
      navigate("/login", { state: { from: location }, replace: true });
    } else if (!hasAccess) {
      navigate("/login", { state: { from: location, reason: "unauthorized" }, replace: true });
    }
  }, [isLoading, isRolesLoaded, authUser, hasAccess, navigate, location]);

  // Fetch unread alerts count
  useEffect(() => {
    if (authUser) {
      supabase
        .from("crm_alerts")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false)
        .eq("is_dismissed", false)
        .then(({ count }) => {
          setUnreadAlerts(count || 0);
        });
    }
  }, [authUser]);

  // Show loading while auth or roles are being hydrated
  if (isLoading || !isRolesLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const userInitials = authUser?.profile
    ? `${authUser.profile.first_name?.[0] || ""}${authUser.profile.last_name?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
          {!collapsed && (
            <Link to="/admin" className="font-bold text-lg text-amber-500 hover:text-amber-400 transition-colors">
              A-Z Command
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-zinc-400 hover:text-zinc-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {!collapsed && (
                <div className="px-4 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {section.label}
                </div>
              )}
              <ul className="space-y-1 px-2">
                {section.items.map((item) => {
                  // Skip admin-only items for non-admins
                  if (item.adminOnly && !isAdmin) return null;
                  // Skip owner-only items for non-owners
                  if (item.ownerOnly && !isOwner) return null;

                  const isActive = item.end 
                    ? location.pathname === item.href
                    : location.pathname === item.href || location.pathname.startsWith(item.href + "/");

                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          isActive
                            ? "bg-amber-500/10 text-amber-500"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                        )}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                        {item.title === "Alerts" && unreadAlerts > 0 && !collapsed && (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            {unreadAlerts}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-zinc-800">
          {!collapsed && (
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-zinc-100">
                  {authUser?.profile?.first_name} {authUser?.profile?.last_name}
                </p>
                <p className="truncate text-xs capitalize">
                  {authUser?.roles?.[0]?.replace("_", " ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={cn("flex-1 flex flex-col", collapsed ? "md:ml-16" : "md:ml-64")}>
        {/* Top bar */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-400"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Global search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alerts bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:text-zinc-100"
              onClick={() => navigate("/admin/alerts")}
            >
              <Bell className="h-5 w-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-zinc-400 hover:text-zinc-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                <div className="px-2 py-1.5 text-sm text-zinc-400">
                  {authUser?.profile?.email}
                </div>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem
                  className="text-zinc-100 focus:bg-zinc-700 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  Back to Website
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-zinc-100 focus:bg-zinc-700 cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
