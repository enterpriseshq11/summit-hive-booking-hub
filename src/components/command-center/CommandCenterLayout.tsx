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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface CommandCenterLayoutProps {
  children: ReactNode;
}

const navItems = [
  { title: "Dashboard", href: "/command-center", icon: LayoutDashboard },
  { title: "Leads", href: "/command-center/leads", icon: Target },
  { title: "Pipeline", href: "/command-center/pipeline", icon: Kanban },
  { title: "Employees", href: "/command-center/employees", icon: Users },
  { title: "Activity Log", href: "/command-center/activity", icon: Activity },
  { title: "Revenue", href: "/command-center/revenue", icon: DollarSign },
  { title: "Commissions", href: "/command-center/commissions", icon: Percent },
  { title: "Payroll", href: "/command-center/payroll", icon: Wallet, adminOnly: true },
  { title: "Alerts", href: "/command-center/alerts", icon: Bell },
  { title: "Settings", href: "/command-center/settings", icon: Settings, adminOnly: true },
];

export function CommandCenterLayout({ children }: CommandCenterLayoutProps) {
  const { authUser, isLoading, isRolesLoaded, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  // Check if user has command center access (only evaluate when roles are loaded)
  const hasAccess = isRolesLoaded && authUser?.roles?.length 
    ? authUser.roles.some(r => 
        ["owner", "manager", "department_lead", "front_desk", "read_only", "spa_lead", "fitness_lead", "coworking_manager", "event_coordinator"].includes(r)
      )
    : false;

  const isAdmin = authUser?.roles?.some(r => ["owner", "manager"].includes(r)) ?? false;

  useEffect(() => {
    // Wait for both auth loading AND roles to be loaded before making access decisions
    if (isLoading || !isRolesLoaded) return;
    
    if (!authUser) {
      navigate("/login", { state: { from: location } });
    } else if (!hasAccess) {
      navigate("/");
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
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
            <span className="font-bold text-lg text-amber-500">A-Z Command</span>
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
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              
              const isActive = location.pathname === item.href || 
                (item.href !== "/command-center" && location.pathname.startsWith(item.href));
              
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

            {/* Date range selector */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {/* Global search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search leads, employees..."
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
              onClick={() => navigate("/command-center/alerts")}
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
