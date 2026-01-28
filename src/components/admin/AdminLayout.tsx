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
import { useUnreadApplicationsCount } from "@/hooks/useCareerApplications";

interface AdminLayoutProps {
  children: ReactNode;
}

// Type for navigation items with role visibility
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  adminOnly?: boolean;
  ownerOnly?: boolean;
  visibleToRoles?: string[];
}

interface NavSection {
  label: string;
  visibleToRoles?: string[];
  items: NavItem[];
}

// Unified navigation configuration with role-based visibility
const navSections: NavSection[] = [
  {
    label: "Command Center",
    visibleToRoles: ["owner", "manager"],
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
      { title: "Resources", href: "/admin/resources", icon: Box, visibleToRoles: ["owner", "manager"] },
      { title: "Packages", href: "/admin/packages", icon: Package, visibleToRoles: ["owner", "manager"] },
      { title: "Pricing Rules", href: "/admin/pricing-rules", icon: DollarSign, visibleToRoles: ["owner", "manager"] },
      { title: "Blackouts", href: "/admin/blackouts", icon: CalendarX },
      { title: "Documents", href: "/admin/documents", icon: FileText, visibleToRoles: ["owner", "manager"] },
      { title: "Reviews", href: "/admin/reviews", icon: Star, visibleToRoles: ["owner", "manager"] },
      { title: "Leads & Waitlists", href: "/admin/leads-waitlists", icon: Users, visibleToRoles: ["owner", "manager"] },
    ],
  },
  {
    label: "Spa (Restoration Lounge)",
    visibleToRoles: ["owner", "manager", "spa_lead"],
    items: [
      { title: "My Schedule", href: "/admin/my-schedule", icon: CalendarDays },
    ],
  },
  {
    label: "Voice Vault",
    visibleToRoles: ["owner", "manager"],
    items: [
      { title: "Voice Vault", href: "/admin/voice-vault", icon: Mic },
    ],
  },
  {
    label: "Coworking (The Hive)",
    visibleToRoles: ["owner", "manager", "coworking_manager"],
    items: [
      { title: "Office Listings", href: "/admin/office-listings", icon: Building2 },
      { title: "Office Promotions", href: "/admin/office-promotions", icon: Tag },
      { title: "Office Inquiries", href: "/admin/office-inquiries", icon: MessageSquare },
    ],
  },
  {
    label: "Hiring",
    visibleToRoles: ["owner", "manager"],
    items: [
      { title: "Careers Applications", href: "/admin/careers", icon: Users },
    ],
  },
  {
    label: "Marketing",
    visibleToRoles: ["owner", "manager"],
    items: [
      { title: "Promotions", href: "/admin/promotions", icon: Tag },
      { title: "Dopamine Drop", href: "/admin/dopamine-drop", icon: Gift },
    ],
  },
  {
    label: "System",
    visibleToRoles: ["owner", "manager"],
    items: [
      { title: "Users & Roles", href: "/admin/users-roles", icon: UserCog, ownerOnly: true },
      { title: "Payment Settings", href: "/admin/payment-settings", icon: DollarSign, adminOnly: true },
      { title: "Audit Log", href: "/admin/audit-log", icon: Shield },
      { title: "Assumptions", href: "/admin/assumptions", icon: Lightbulb },
      { title: "Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
    ],
  },
];

// Helper to check if user can see a section or item based on roles
function canSeeByRoles(visibleToRoles: string[] | undefined, userRoles: string[]): boolean {
  if (!visibleToRoles || visibleToRoles.length === 0) return true;
  return visibleToRoles.some(role => userRoles.includes(role));
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { authUser, isLoading, isRolesLoaded, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const { data: unreadCareersCount = 0 } = useUnreadApplicationsCount();

  const rolesLength = authUser?.roles?.length ?? 0;
  const hasAccess = isRolesLoaded && rolesLength
    ? authUser!.roles.some((r) => ["owner", "manager", "department_lead", "front_desk", "read_only", "spa_lead", "fitness_lead", "coworking_manager", "event_coordinator"].includes(r))
    : false;

  const isAdmin = authUser?.roles?.some((r) => ["owner", "manager"].includes(r)) ?? false;
  const isOwner = authUser?.roles?.some((r) => r === "owner") ?? false;

  useEffect(() => {
    if (isLoading || !isRolesLoaded) return;
    if (!authUser) {
      navigate("/login", { state: { from: location }, replace: true });
    } else if (!hasAccess) {
      navigate("/login", { state: { from: location, reason: "unauthorized" }, replace: true });
    }
  }, [isLoading, isRolesLoaded, authUser, hasAccess, navigate, location]);

  useEffect(() => {
    if (authUser) {
      supabase.from("crm_alerts").select("id", { count: "exact", head: true }).eq("is_read", false).eq("is_dismissed", false).then(({ count }) => setUnreadAlerts(count || 0));
    }
  }, [authUser]);

  if (isLoading || !isRolesLoaded) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="animate-pulse text-zinc-400">Loading...</div></div>;
  }

  if (!hasAccess) return null;

  const userInitials = authUser?.profile ? `${authUser.profile.first_name?.[0] || ""}${authUser.profile.last_name?.[0] || ""}`.toUpperCase() || "U" : "U";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex relative">
      {/* Honeycomb Watermark - Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Center honeycomb pattern - very subtle */}
        <svg className="w-full h-full opacity-[0.04]" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="honeycomb-admin-center" x="0" y="0" width="12" height="10.39" patternUnits="userSpaceOnUse">
            <polygon points="6,0 12,3 12,9 6,12 0,9 0,3" fill="none" stroke="hsl(45 70% 50%)" strokeWidth="0.3"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#honeycomb-admin-center)" />
        </svg>
      </div>

      {/* Accent glow spots */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/[0.02] rounded-full blur-3xl" />
      </div>
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300", collapsed ? "w-16" : "w-64", mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
          {!collapsed && <Link to="/admin" className="font-bold text-lg text-amber-400">A-Z Command</Link>}
          <Button variant="ghost" size="icon" className="hidden md:flex text-zinc-300 hover:text-white" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections
            .filter(section => canSeeByRoles(section.visibleToRoles, authUser?.roles || []))
            .map((section) => {
              // Filter items within the section based on role visibility
              const visibleItems = section.items.filter(item => {
                if (item.adminOnly && !isAdmin) return false;
                if (item.ownerOnly && !isOwner) return false;
                if (!canSeeByRoles(item.visibleToRoles, authUser?.roles || [])) return false;
                return true;
              });
              
              // Don't render empty sections
              if (visibleItems.length === 0) return null;
              
              return (
                <div key={section.label} className="mb-4">
                  {!collapsed && <div className="px-4 mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">{section.label}</div>}
                  <ul className="space-y-1 px-2">
                    {visibleItems.map((item) => {
                      const isActive = item.end ? location.pathname === item.href : location.pathname === item.href || location.pathname.startsWith(item.href + "/");
                      const showAlertsBadge = item.title === "Alerts" && unreadAlerts > 0 && !collapsed;
                      const showCareersBadge = item.title === "Careers Applications" && unreadCareersCount > 0 && !collapsed;
                      return (
                        <li key={item.href}>
                          <Link to={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-colors", isActive ? "bg-amber-500/15 text-amber-400 font-medium" : "text-zinc-300 hover:text-white hover:bg-zinc-800")} onClick={() => setMobileOpen(false)} title={collapsed ? item.title : undefined}>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span>{item.title}</span>}
                            {showAlertsBadge && <Badge variant="destructive" className="ml-auto text-xs">{unreadAlerts}</Badge>}
                            {showCareersBadge && <Badge className="ml-auto text-xs bg-blue-500 hover:bg-blue-600">{unreadCareersCount}</Badge>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          {!collapsed && (
            <div className="flex items-center gap-3 text-sm">
              <Avatar className="h-8 w-8"><AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">{userInitials}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-white font-medium">{authUser?.profile?.first_name} {authUser?.profile?.last_name}</p>
                <p className="truncate text-xs text-zinc-400 capitalize">{authUser?.roles?.[0]?.replace("_", " ")}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
      <div className={cn("flex-1 flex flex-col", collapsed ? "md:ml-16" : "md:ml-64")}>
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden text-zinc-300" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-64 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-zinc-300 hover:text-white" onClick={() => navigate("/admin/alerts")}>
              <Bell className="h-5 w-5" />
              {unreadAlerts > 0 && <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="gap-2 text-zinc-300 hover:text-white"><Avatar className="h-8 w-8"><AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">{userInitials}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                <div className="px-2 py-1.5 text-sm text-zinc-300">{authUser?.profile?.email}</div>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem className="text-white focus:bg-zinc-700 cursor-pointer" onClick={() => navigate("/")}>Back to Website</DropdownMenuItem>
                <DropdownMenuItem className="text-white focus:bg-zinc-700 cursor-pointer" onClick={() => signOut()}><LogOut className="h-4 w-4 mr-2" />Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
