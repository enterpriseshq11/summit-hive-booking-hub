import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarDays,
  Building2,
  Sparkles,
  Dumbbell,
  Gift,
  CircleDot,
  ShoppingBag,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Phone,
  Clock,
  Mic,
  Layers,
  Camera,
} from "lucide-react";
import { useState } from "react";
import azLogoIcon from "@/assets/az-monogram-transparent-tightest.png";

const navItems = [
  { label: "Book Now", href: "/booking", icon: CalendarDays, primary: true },
  { 
    label: "Spin & Win", 
    href: "/dopamine-drop", 
    icon: CircleDot, 
    highlight: true,
    pulse: true,
    tooltip: "Monthly giveaways"
  },
  { label: "Summit", href: "/summit", icon: Building2 },
  { label: "Coworking", href: "/coworking", icon: Building2 },
  { label: "Spa", href: "/spa", icon: Sparkles },
  { label: "Fitness", href: "/fitness", icon: Dumbbell },
  { label: "360 Photo Booth", href: "/360-photo-booth", icon: Camera },
  { label: "Gift Cards", href: "/gift-cards", icon: Gift },
  { 
    label: "Voice Vault", 
    mobileLabel: "Voice Vault", 
    desktopLabel: "Voice Vault", 
    href: "/voice-vault", 
    icon: Mic, 
    highlight: true,
    tooltip: "Podcast studio booking"
  },
  { label: "Shop", href: "/shop", icon: ShoppingBag },
  { label: "Promotions", href: "/promotions", icon: Layers },
];

export function Header() {
  const { user, authUser, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const showCommandCenter = !!authUser?.isStaff;

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = location.pathname === item.href;
    const displayLabel = (item as any).desktopLabel || item.label;
    
    const linkContent = (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center gap-1.5 px-2 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap lg:gap-2 lg:px-2.5 xl:px-3",
          isActive
            ? "bg-accent text-primary"
            : item.primary
              ? "bg-accent/20 text-accent hover:bg-accent/30"
              : item.highlight
                ? "text-accent hover:text-accent hover:bg-accent/10"
                : (item as any).secondary
                  ? "text-primary-foreground/50 hover:text-primary-foreground/80 hover:bg-primary-foreground/5"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10",
          (item as any).pulse && !isActive && "animate-pulse"
        )}
      >
        <item.icon className={cn("h-4 w-4 flex-shrink-0", (item as any).pulse && !isActive && "text-primary")} />
        {displayLabel}
      </Link>
    );

    // Wrap with tooltip if item has tooltip text
    if ((item as any).tooltip) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {(item as any).tooltip}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary text-primary-foreground">
      {/* Desktop micro-trust line */}
      <div className="hidden lg:block border-b border-primary-foreground/10 bg-primary/95">
        <div className="container flex items-center justify-end gap-6 h-8 text-xs text-primary-foreground/70">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>Open 7 Days</span>
          </div>
          <a
            href="tel:+15673796340"
            className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
          >
            <Phone className="h-3 w-3" />
            <span>567-379-6340</span>
          </a>
        </div>
      </div>

      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
          <img src={azLogoIcon} alt="A-Z Enterprises" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gold-gradient hidden sm:inline">A-Z Enterprises</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Primary">
          {navItems.map(renderNavItem)}

          {showCommandCenter && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors",
                isAdminRoute ? "bg-accent text-primary" : "bg-accent/20 text-accent hover:bg-accent/30"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground hover:bg-primary-foreground/10">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{authUser?.profile?.first_name || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                </DropdownMenuItem>

                {authUser?.isStaff && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-primary font-semibold">
              <Link to="/login">Login</Link>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-primary-foreground/10 bg-primary p-4 space-y-2 animate-fade-in" aria-label="Mobile">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const displayLabel = item.mobileLabel || item.label;
            const tooltip = (item as any).tooltip;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-accent text-primary"
                    : item.highlight
                      ? "text-accent hover:text-accent hover:bg-accent/10"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                )}
              >
                <item.icon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span>{displayLabel}</span>
                  {tooltip && (
                    <span className="text-xs text-primary-foreground/50">{tooltip}</span>
                  )}
                </div>
              </Link>
            );
          })}

          {showCommandCenter && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-md transition-colors",
                isAdminRoute ? "bg-accent text-primary" : "text-accent bg-accent/20 hover:bg-accent/30"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              Admin
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
