import { ReactNode, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBookingsRealtime } from "@/hooks/useBookingsRealtime";
import {
  LayoutDashboard, Users, Target, Kanban, Activity, DollarSign, Percent,
  Bell, Settings, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Search, LogOut, Menu, Wallet, Mic, CalendarDays, CalendarRange,
  ClipboardList, Package, CalendarX, FileText, Star, Shield, Lightbulb,
  Box, UserCog, Building2, Tag, MessageSquare, Gift, Sparkles, Dumbbell,
  Home, CreditCard, Link2, ScrollText, Briefcase, BarChart3, TrendingUp,
  Megaphone, Image, Store, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useUnreadApplicationsCount } from "@/hooks/useCareerApplications";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps { children: ReactNode; }

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  badgeKey?: string;
}

interface NavSection {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleToRoles: string[];
  items: NavItem[];
  subSections?: NavSubSection[];
  defaultOpen?: boolean;
}

interface NavSubSection {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleToRoles: string[];
  items: NavItem[];
}

// ─── Role visibility constants ───
const ALL_STAFF = ["owner", "manager", "marketing_lead", "ops_lead", "ads_lead", "event_coordinator", "spa_lead", "spa_worker", "coworking_manager", "fitness_lead", "front_desk", "sales_acquisitions"];
const ADMIN_ROLES = ["owner", "manager"];
const OWNER_ONLY = ["owner"];
const COMMAND_ROLES = ["owner", "manager", "marketing_lead", "ops_lead", "ads_lead", "spa_lead", "event_coordinator", "sales_acquisitions"];
const SALES_ROLES = ["owner", "manager", "marketing_lead", "ops_lead", "event_coordinator", "sales_acquisitions"];
const OPS_ROLES = ["owner", "manager", "ops_lead", "spa_lead", "event_coordinator", "coworking_manager", "fitness_lead", "front_desk"];
const TEAM_ROLES = ["owner", "manager", "ops_lead"];
const REVENUE_ROLES = ["owner", "manager", "marketing_lead", "ops_lead", "ads_lead"];
const MARKETING_ROLES = ["owner", "manager", "marketing_lead", "ads_lead"];

// ─── Navigation configuration ───
const navSections: NavSection[] = [
  {
    label: "Command Center",
    icon: LayoutDashboard,
    visibleToRoles: COMMAND_ROLES,
    defaultOpen: true,
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true },
      { title: "Alerts", href: "/admin/alerts", icon: Bell, badgeKey: "alerts" },
      { title: "Activity Log", href: "/admin/activity", icon: Activity },
    ],
  },
  {
    label: "Sales",
    icon: Target,
    visibleToRoles: SALES_ROLES,
    items: [
      { title: "Leads", href: "/admin/leads", icon: Target },
      { title: "Pipeline", href: "/admin/pipeline", icon: Kanban },
      { title: "Approvals", href: "/admin/approvals", icon: ClipboardList },
    ],
  },
  {
    label: "Operations",
    icon: CalendarDays,
    visibleToRoles: OPS_ROLES,
    items: [
      { title: "Schedule", href: "/admin/schedule", icon: CalendarDays },
      { title: "Resources", href: "/admin/resources", icon: Box },
      { title: "Packages", href: "/admin/packages", icon: Package },
      { title: "Blackouts", href: "/admin/blackouts", icon: CalendarX },
      { title: "Documents", href: "/admin/documents", icon: FileText },
    ],
  },
  {
    label: "Team",
    icon: Users,
    visibleToRoles: TEAM_ROLES,
    items: [
      { title: "Employees", href: "/admin/employees", icon: Users },
      { title: "Payroll", href: "/admin/payroll", icon: Wallet },
      { title: "Commissions", href: "/admin/commissions", icon: Percent },
      { title: "Career Applications", href: "/admin/careers", icon: Briefcase, badgeKey: "careers" },
    ],
  },
  {
    label: "Revenue",
    icon: DollarSign,
    visibleToRoles: REVENUE_ROLES,
    items: [
      { title: "Revenue Tracker", href: "/admin/revenue", icon: BarChart3 },
      { title: "Pricing Rules", href: "/admin/pricing-rules", icon: DollarSign },
      { title: "Stripe Integration", href: "/admin/stripe", icon: CreditCard },
    ],
  },
  {
    label: "Businesses",
    icon: Building2,
    visibleToRoles: ALL_STAFF,
    items: [],
    subSections: [
      {
        label: "The Summit",
        icon: Building2,
        visibleToRoles: ["owner", "manager", "ops_lead", "marketing_lead", "event_coordinator", "sales_acquisitions"],
        items: [
          { title: "Leads", href: "/admin/business/summit/leads", icon: Target },
          { title: "Bookings", href: "/admin/business/summit/bookings", icon: CalendarDays },
          { title: "Revenue", href: "/admin/business/summit/revenue", icon: DollarSign },
          { title: "Settings", href: "/admin/business/summit/settings", icon: Settings },
        ],
      },
      {
        label: "Restoration Lounge Spa",
        icon: Sparkles,
        visibleToRoles: ["owner", "manager", "ops_lead", "marketing_lead", "spa_lead", "spa_worker"],
        items: [
          { title: "Leads", href: "/admin/business/spa/leads", icon: Target },
          { title: "Bookings", href: "/admin/business/spa/bookings", icon: CalendarDays },
          { title: "Revenue", href: "/admin/business/spa/revenue", icon: DollarSign },
          { title: "Workers", href: "/admin/business/spa/workers", icon: Users },
          { title: "Worker Calendars", href: "/admin/business/spa/worker-calendars", icon: CalendarRange },
          { title: "Settings", href: "/admin/business/spa/settings", icon: Settings },
        ],
      },
      {
        label: "A-Z Total Fitness",
        icon: Dumbbell,
        visibleToRoles: ["owner", "manager", "ops_lead", "marketing_lead", "fitness_lead"],
        items: [
          { title: "Memberships", href: "/admin/business/fitness/memberships", icon: Users },
          { title: "Revenue", href: "/admin/business/fitness/revenue", icon: DollarSign },
          { title: "Settings", href: "/admin/business/fitness/settings", icon: Settings },
        ],
      },
      {
        label: "The Hive",
        icon: Building2,
        visibleToRoles: ["owner", "manager", "ops_lead", "marketing_lead", "coworking_manager"],
        items: [
          { title: "Office Listings", href: "/admin/business/hive/office-listings", icon: Building2 },
          { title: "Inquiries", href: "/admin/business/hive/inquiries", icon: MessageSquare },
          { title: "Revenue", href: "/admin/business/hive/revenue", icon: DollarSign },
          { title: "Settings", href: "/admin/business/hive/settings", icon: Settings },
        ],
      },
      {
        label: "Voice Vault",
        icon: Mic,
        visibleToRoles: ["owner", "manager", "ops_lead", "marketing_lead"],
        items: [
          { title: "Bookings", href: "/admin/business/voice-vault/bookings", icon: CalendarDays },
          { title: "Revenue", href: "/admin/business/voice-vault/revenue", icon: DollarSign },
          { title: "Settings", href: "/admin/business/voice-vault/settings", icon: Settings },
        ],
      },
      {
        label: "Mobile Homes",
        icon: Home,
        visibleToRoles: ["owner", "manager", "ops_lead", "sales_acquisitions"],
        items: [
          { title: "Inventory", href: "/admin/business/mobile-homes/inventory", icon: Store },
          { title: "Revenue", href: "/admin/business/mobile-homes/revenue", icon: DollarSign },
          { title: "Settings", href: "/admin/business/mobile-homes/settings", icon: Settings },
        ],
      },
      {
        label: "Elevated by Elyse",
        icon: Sparkles,
        visibleToRoles: ["owner", "marketing_lead"],
        items: [
          { title: "Leads", href: "/admin/business/elevated-by-elyse/leads", icon: Target },
          { title: "Bookings", href: "/admin/business/elevated-by-elyse/bookings", icon: CalendarDays },
          { title: "Revenue", href: "/admin/business/elevated-by-elyse/revenue", icon: DollarSign },
          { title: "Settings", href: "/admin/business/elevated-by-elyse/settings", icon: Settings },
        ],
      },
    ],
  },
  {
    label: "Marketing",
    icon: Megaphone,
    visibleToRoles: MARKETING_ROLES,
    items: [
      { title: "Promotions", href: "/admin/marketing/promotions", icon: Tag },
      { title: "Dopamine Drop", href: "/admin/marketing/dopamine-drop", icon: Gift },
      { title: "Ad Tracking", href: "/admin/marketing/ad-tracking", icon: TrendingUp },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    visibleToRoles: OWNER_ONLY,
    items: [
      { title: "Overview", href: "/admin/settings", icon: Settings, end: true },
      { title: "Users & Roles", href: "/admin/settings/users", icon: UserCog },
      { title: "Payment Settings", href: "/admin/settings/payment", icon: CreditCard },
      { title: "Integrations", href: "/admin/settings/integrations", icon: Link2 },
      { title: "Audit Log", href: "/admin/settings/audit-log", icon: Shield },
      { title: "Assumptions", href: "/admin/settings/assumptions", icon: Lightbulb },
    ],
  },
];

function canSeeByRoles(visibleToRoles: string[], userRoles: string[]): boolean {
  if (!visibleToRoles || visibleToRoles.length === 0) return true;
  return visibleToRoles.some(role => userRoles.includes(role));
}

// Item 26: Search results component
function GlobalSearchResults({ query, onClose }: { query: string; onClose: () => void }) {
  const navigate = useNavigate();
  const { data: results } = useQuery({
    queryKey: ["global_search", query],
    queryFn: async () => {
      if (query.length < 2) return { leads: [], employees: [], bookings: [] };
      const q = `%${query}%`;
      const [leadsRes, employeesRes, bookingsRes] = await Promise.all([
        supabase.from("crm_leads").select("id, lead_name, business_unit, status").ilike("lead_name", q).limit(5),
        supabase.from("profiles").select("id, first_name, last_name, email").or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q}`).limit(5),
        supabase.from("bookings").select("id, booking_number, guest_name, start_datetime, business_id").or(`booking_number.ilike.${q},guest_name.ilike.${q}`).limit(5),
      ]);
      return {
        leads: leadsRes.data || [],
        employees: employeesRes.data || [],
        bookings: bookingsRes.data || [],
      };
    },
    enabled: query.length >= 2,
  });

  if (!results || query.length < 2) return null;
  const hasResults = results.leads.length > 0 || results.employees.length > 0 || results.bookings.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
      {!hasResults && (
        <div className="p-3 text-sm text-zinc-500">No results for "{query}"</div>
      )}
      {results.leads.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 bg-zinc-900/50">Leads</div>
          {results.leads.map((lead: any) => (
            <button key={lead.id} className="w-full text-left px-3 py-2 hover:bg-zinc-700 flex items-center gap-2" onClick={() => { navigate(`/admin/leads/${lead.id}`); onClose(); }}>
              <Target className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-sm text-zinc-200">{lead.lead_name}</span>
              <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400 ml-auto">{lead.business_unit}</Badge>
            </button>
          ))}
        </div>
      )}
      {results.employees.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 bg-zinc-900/50">Employees</div>
          {results.employees.map((emp: any) => (
            <button key={emp.id} className="w-full text-left px-3 py-2 hover:bg-zinc-700 flex items-center gap-2" onClick={() => { navigate(`/admin/employees/${emp.id}`); onClose(); }}>
              <Users className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-sm text-zinc-200">{emp.first_name} {emp.last_name}</span>
            </button>
          ))}
        </div>
      )}
      {results.bookings.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 bg-zinc-900/50">Bookings</div>
          {results.bookings.map((b: any) => (
            <button key={b.id} className="w-full text-left px-3 py-2 hover:bg-zinc-700 flex items-center gap-2" onClick={() => { navigate(`/admin/schedule`); onClose(); }}>
              <CalendarDays className="h-3.5 w-3.5 text-green-400" />
              <span className="text-sm text-zinc-200">{b.guest_name || b.booking_number}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Item 32: Mobile bottom navigation bar
function MobileBottomNav({ unreadAlerts, onMenuOpen }: { unreadAlerts: number; onMenuOpen: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", end: true },
    { icon: Target, label: "Leads", href: "/admin/leads" },
    { icon: Kanban, label: "Pipeline", href: "/admin/pipeline" },
    { icon: Bell, label: "Alerts", href: "/admin/alerts", badge: unreadAlerts },
    { icon: Menu, label: "Menu", href: "__menu__" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-900 border-t border-zinc-800 flex items-center justify-around h-14 safe-area-bottom">
      {items.map((item) => {
        const isActive = item.href === "__menu__" ? false : item.end ? location.pathname === item.href : location.pathname.startsWith(item.href);
        return (
          <button
            key={item.label}
            onClick={() => item.href === "__menu__" ? onMenuOpen() : navigate(item.href)}
            className={cn("flex flex-col items-center gap-0.5 py-1 px-3 relative", isActive ? "text-amber-400" : "text-zinc-500")}
          >
            <item.icon className="h-5 w-5" />
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-0.5 right-1.5 h-4 min-w-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { authUser, isLoading, isRolesLoaded, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ "Command Center": true });
  const [openSubSections, setOpenSubSections] = useState<Record<string, boolean>>({});
  const { data: unreadCareersCount = 0 } = useUnreadApplicationsCount();

  useBookingsRealtime();

  const userRoles = authUser?.roles || [];
  const hasAccess = isRolesLoaded && userRoles.length > 0
    ? userRoles.some(r => ALL_STAFF.includes(r))
    : false;

  const isOwner = userRoles.includes("owner");

  // Auto-open section containing current route
  useEffect(() => {
    for (const section of navSections) {
      const hasActiveItem = section.items.some(item =>
        item.end ? location.pathname === item.href : location.pathname.startsWith(item.href)
      );
      const hasActiveSub = section.subSections?.some(sub =>
        sub.items.some(item => location.pathname.startsWith(item.href))
      );
      if (hasActiveItem || hasActiveSub) {
        setOpenSections(prev => ({ ...prev, [section.label]: true }));
        if (hasActiveSub) {
          section.subSections?.forEach(sub => {
            if (sub.items.some(item => location.pathname.startsWith(item.href))) {
              setOpenSubSections(prev => ({ ...prev, [sub.label]: true }));
            }
          });
        }
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isLoading || !isRolesLoaded) return;
    if (!authUser) {
      navigate("/login", { state: { from: location }, replace: true });
    } else if (!hasAccess) {
      navigate("/login", { state: { from: location, reason: "unauthorized" }, replace: true });
    }
  }, [isLoading, isRolesLoaded, authUser, hasAccess, navigate, location]);

  // Item 5: Real-time subscription for unread alerts
  useEffect(() => {
    if (!authUser) return;
    // Initial fetch
    supabase.from("crm_alerts").select("id", { count: "exact", head: true })
      .eq("is_read", false).eq("is_dismissed", false)
      .then(({ count }) => setUnreadAlerts(count || 0));

    // Subscribe to real-time changes
    const channel = supabase
      .channel("crm_alerts_badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_alerts" }, () => {
        supabase.from("crm_alerts").select("id", { count: "exact", head: true })
          .eq("is_read", false).eq("is_dismissed", false)
          .then(({ count }) => setUnreadAlerts(count || 0));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authUser]);

  if (isLoading || !isRolesLoaded) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="animate-pulse text-zinc-400">Loading...</div></div>;
  }
  if (!hasAccess) return null;

  const userInitials = authUser?.profile
    ? `${authUser.profile.first_name?.[0] || ""}${authUser.profile.last_name?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };
  const toggleSubSection = (label: string) => {
    setOpenSubSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const getBadgeValue = (key?: string): number => {
    if (key === "alerts") return unreadAlerts;
    if (key === "careers") return unreadCareersCount;
    return 0;
  };

  // Item 24/25: Determine active section for gold accent
  const getActiveSection = () => {
    for (const section of navSections) {
      if (section.items.some(item => item.end ? location.pathname === item.href : location.pathname.startsWith(item.href))) return section.label;
      if (section.subSections?.some(sub => sub.items.some(item => location.pathname.startsWith(item.href)))) return section.label;
    }
    return "";
  };
  const activeSection = getActiveSection();

  const renderNavItem = (item: NavItem) => {
    const isActive = item.end
      ? location.pathname === item.href
      : location.pathname === item.href || location.pathname.startsWith(item.href + "/");
    const badgeVal = getBadgeValue(item.badgeKey);

    return (
      <li key={item.href}>
        <Link
          to={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
            isActive
              ? "bg-amber-500/15 text-white font-medium border-l-[3px] border-l-amber-500 -ml-[3px] pl-[calc(0.75rem+3px)]"
              : "text-zinc-300 hover:text-white hover:bg-zinc-800"
          )}
          onClick={() => setMobileOpen(false)}
          title={collapsed ? item.title : undefined}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>{item.title}</span>}
          {!collapsed && badgeVal > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs h-5 min-w-5 flex items-center justify-center">
              {badgeVal > 9 ? "9+" : badgeVal}
            </Badge>
          )}
        </Link>
      </li>
    );
  };

  const renderSection = (section: NavSection) => {
    if (!canSeeByRoles(section.visibleToRoles, userRoles)) return null;

    const visibleItems = section.items;
    const visibleSubs = section.subSections?.filter(sub => canSeeByRoles(sub.visibleToRoles, userRoles)) || [];

    if (visibleItems.length === 0 && visibleSubs.length === 0) return null;

    const isOpen = openSections[section.label] ?? false;
    const isSectionActive = activeSection === section.label;

    if (collapsed) {
      return (
        <div key={section.label} className="mb-2">
          <div className="px-2 py-1 flex justify-center" title={section.label}>
            <section.icon className="h-5 w-5 text-zinc-400" />
          </div>
          <ul className="space-y-0.5 px-1">
            {visibleItems.map(renderNavItem)}
          </ul>
        </div>
      );
    }

    return (
      <div key={section.label} className="mb-1">
        {/* Item 24: Title case + gold accent on active section */}
        <button
          onClick={() => toggleSection(section.label)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-2 text-xs font-semibold tracking-wider hover:text-zinc-200 transition-colors",
            isSectionActive ? "text-amber-400 border-l-2 border-l-amber-500" : "text-zinc-400"
          )}
        >
          <span className="flex items-center gap-2">
            <section.icon className="h-3.5 w-3.5" />
            {section.label}
          </span>
          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {isOpen && (
          <div>
            <ul className="space-y-0.5 px-2">
              {visibleItems.map(renderNavItem)}
            </ul>
            {visibleSubs.map(sub => {
              const subOpen = openSubSections[sub.label] ?? false;
              return (
                <div key={sub.label} className="ml-2">
                  <button
                    onClick={() => toggleSubSection(sub.label)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <sub.icon className="h-3 w-3" />
                      <span className="truncate">{sub.label}</span>
                    </span>
                    {subOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {subOpen && (
                    <ul className="space-y-0.5 px-2 ml-2 border-l border-zinc-800">
                      {sub.items.map(renderNavItem)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex relative">
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
          {!collapsed && (
            <Link to="/admin" className="font-bold text-lg text-amber-400">A-Z Command</Link>
          )}
          <Button
            variant="ghost" size="icon"
            className="hidden md:flex text-zinc-300 hover:text-white"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          {/* Close button for mobile sidebar */}
          <Button
            variant="ghost" size="icon"
            className="md:hidden text-zinc-300 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {navSections.map(renderSection)}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          {!collapsed && (
            <div className="flex items-center gap-3 text-sm">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-white font-medium">
                  {authUser?.profile?.first_name} {authUser?.profile?.last_name}
                </p>
                <p className="truncate text-xs text-zinc-400 capitalize">
                  {authUser?.roles?.[0]?.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className={cn("flex-1 flex flex-col", collapsed ? "md:ml-16" : "md:ml-64")}>
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden text-zinc-300" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            {/* Item 26: Search with dropdown */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search leads, employees, bookings, revenue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="pl-9 w-80 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              {searchFocused && searchQuery.length >= 2 && (
                <GlobalSearchResults query={searchQuery} onClose={() => { setSearchQuery(""); setSearchFocused(false); }} />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Item 5: Bell with real-time badge */}
            <Button variant="ghost" size="icon" className="relative text-zinc-300 hover:text-white" onClick={() => navigate("/admin/alerts")}>
              <Bell className="h-5 w-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-zinc-900">
                  {unreadAlerts > 9 ? "9+" : unreadAlerts}
                </span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-zinc-300 hover:text-white">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                <div className="px-2 py-1.5 text-sm text-zinc-300">{authUser?.profile?.email}</div>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem className="text-white focus:bg-zinc-700 cursor-pointer" onClick={() => navigate("/")}>
                  Back to Website
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white focus:bg-zinc-700 cursor-pointer" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">{children}</main>
      </div>

      {/* Item 32: Mobile bottom navigation */}
      <MobileBottomNav unreadAlerts={unreadAlerts} onMenuOpen={() => setMobileOpen(true)} />
    </div>
  );
}
