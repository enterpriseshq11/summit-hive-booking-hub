import { Link, useLocation } from "react-router-dom";
import { SITE_CONFIG } from "@/config/siteConfig";
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
  CalendarDays,
  Building2,
  Sparkles,
  Dumbbell,
  Scissors,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Phone,
  Clock,
  Mic,
  Camera,
  ChevronDown,
  Settings,
  UserPlus,
  LogIn,
  Briefcase,
  Heart,
} from "lucide-react";
import { useState } from "react";
import azLogoIcon from "@/assets/az-monogram-transparent-tightest.png";

// Experiences dropdown items — grouped by division with subpage
const experiencesItems = [
  { heading: "The Summit", icon: CalendarDays, href: "/summit", sub: { label: "Book an Event", href: "/book-summit" } },
  { heading: "The Hive", icon: Building2, href: "/the-hive", sub: { label: "Coworking Space", href: "/the-hive" } },
  { heading: "360 Photo Booth", icon: Camera, href: "/360-photo-booth", sub: { label: "Book a Session", href: "/book-360" } },
  { heading: "Voice Vault", icon: Mic, href: "/voice-vault", sub: { label: "Book Studio Time", href: "/book-voice-vault" } },
];

// Health & Wellness dropdown items
const healthItems = [
  { heading: "Restoration Lounge & Spa", icon: Sparkles, href: "/spa", sub: { label: "Book a Spa Service", href: "/book-spa" } },
  { heading: "Total Fitness", icon: Dumbbell, href: "/fitness", sub: { label: "Explore Memberships", href: "/join-fitness" } },
  { heading: "Beauty Haven", icon: Scissors, href: "/beauty-haven", sub: null },
];

export function Header() {
  const { user, authUser, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const showCommandCenter = !!authUser?.isStaff;

  const toggleMobileSection = (section: string) => {
    setExpandedMobileSection(expandedMobileSection === section ? null : section);
  };

  const btnClass = "gap-1.5 lg:gap-2 px-3 lg:px-4 text-sm lg:text-base font-bold text-accent hover:text-accent hover:bg-accent/10 drop-shadow-[0_0_10px_hsl(43,74%,49%,0.6)] hover:drop-shadow-[0_0_16px_hsl(43,74%,49%,0.8)] transition-all [text-shadow:0_0_8px_hsl(43,74%,49%,0.5)]";

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
            href={SITE_CONFIG.contact.phoneLink}
            className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
          >
            <Phone className="h-3 w-3" />
            <span>{SITE_CONFIG.contact.phone}</span>
          </a>
        </div>
      </div>

      <div className="container flex h-16 items-center gap-4 lg:px-4 xl:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
          <img src={azLogoIcon} alt="A-Z Enterprises" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gold-gradient hidden lg:inline">A-Z Enterprises</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 ml-4" aria-label="Primary">
          {/* 1. Experiences Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={btnClass}>
                <Building2 className="h-4 w-4" />
                <span>Experiences</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 bg-popover z-[60] p-2">
              {experiencesItems.map((item, i) => (
                <div key={item.heading}>
                  {i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem asChild>
                    <Link to={item.href} className="flex items-center gap-3 py-2">
                      <item.icon className="h-4 w-4 text-accent" />
                      <div className="font-medium">{item.heading}</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={item.sub.href} className="flex items-center gap-3 py-1.5 pl-11">
                      <div className="text-sm text-muted-foreground hover:text-foreground">{item.sub.label}</div>
                    </Link>
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Health & Wellness Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={btnClass}>
                <Heart className="h-4 w-4" />
                <span>Health & Wellness</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 bg-popover z-[60] p-2">
              {healthItems.map((item, i) => (
                <div key={item.heading}>
                  {i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem asChild>
                    <Link to={item.href} className="flex items-center gap-3 py-2">
                      <item.icon className="h-4 w-4 text-accent" />
                      <div className="font-medium">{item.heading}</div>
                    </Link>
                  </DropdownMenuItem>
                  {item.sub && (
                    <DropdownMenuItem asChild>
                      <Link to={item.sub.href} className="flex items-center gap-3 py-1.5 pl-11">
                        <div className="text-sm text-muted-foreground hover:text-foreground">{item.sub.label}</div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Careers - Direct Link */}
          <Link
            to="/careers"
            className={cn(
              "flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 text-sm lg:text-base font-bold rounded-md transition-all drop-shadow-[0_0_10px_hsl(43,74%,49%,0.6)] hover:drop-shadow-[0_0_16px_hsl(43,74%,49%,0.8)] [text-shadow:0_0_8px_hsl(43,74%,49%,0.5)]",
              location.pathname.startsWith("/careers")
                ? "bg-accent/20 text-accent"
                : "text-accent hover:text-accent hover:bg-accent/10"
            )}
          >
            <Briefcase className="h-4 w-4" />
            Careers
          </Link>

          {/* 4. Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={btnClass}>
                <User className="h-4 w-4" />
                <span>{user ? (authUser?.profile?.first_name || "Account") : "Account"}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover z-[60]">
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {showCommandCenter && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 text-accent">
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/login?mode=signup" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex-1 md:hidden" />
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

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-primary-foreground/10 bg-primary p-4 space-y-1 animate-fade-in max-h-[80vh] overflow-y-auto" aria-label="Mobile">

          {/* 1. Experiences - Collapsible */}
          <div>
            <button
              onClick={() => toggleMobileSection("experiences")}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
            >
              <span className="flex items-center gap-3">
                <Building2 className="h-5 w-5" />
                Experiences
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMobileSection === "experiences" && "rotate-180")} />
            </button>
            {expandedMobileSection === "experiences" && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-foreground/10 pl-4">
                {experiencesItems.map((item) => (
                  <div key={item.heading}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                    >
                      <item.icon className="h-4 w-4 text-accent" />
                      {item.heading}
                    </Link>
                    <Link
                      to={item.sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 pl-10 text-sm text-primary-foreground/50 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                    >
                      {item.sub.label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Health & Wellness - Collapsible */}
          <div>
            <button
              onClick={() => toggleMobileSection("health")}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
            >
              <span className="flex items-center gap-3">
                <Heart className="h-5 w-5" />
                Health & Wellness
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMobileSection === "health" && "rotate-180")} />
            </button>
            {expandedMobileSection === "health" && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-foreground/10 pl-4">
                {healthItems.map((item) => (
                  <div key={item.heading}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                    >
                      <item.icon className="h-4 w-4 text-accent" />
                      {item.heading}
                    </Link>
                    {item.sub && (
                      <Link
                        to={item.sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 pl-10 text-sm text-primary-foreground/50 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                      >
                        {item.sub.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Careers - Direct Link */}
          <Link
            to="/careers"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
              location.pathname.startsWith("/careers")
                ? "bg-accent/20 text-accent"
                : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            )}
          >
            <Briefcase className="h-5 w-5" />
            Careers
          </Link>

          {/* 4. Account - Collapsible */}
          <div>
            <button
              onClick={() => toggleMobileSection("account")}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
            >
              <span className="flex items-center gap-3">
                <User className="h-5 w-5" />
                {user ? (authUser?.profile?.first_name || "Account") : "Account"}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMobileSection === "account" && "rotate-180")} />
            </button>
            {expandedMobileSection === "account" && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-foreground/10 pl-4">
                {user ? (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                    >
                      <LayoutDashboard className="h-4 w-4 text-accent" />
                      Dashboard
                    </Link>
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                    >
                      <Settings className="h-4 w-4 text-accent" />
                      Settings
                    </Link>
                    {showCommandCenter && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-accent font-medium rounded-md hover:bg-accent/10"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive rounded-md hover:bg-destructive/10 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                    >
                      <LogIn className="h-4 w-4 text-accent" />
                      Login
                    </Link>
                    <Link
                      to="/login?mode=signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                    >
                      <UserPlus className="h-4 w-4 text-accent" />
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile trust bar */}
          <div className="mt-3 pt-3 border-t border-primary-foreground/10 flex items-center justify-between px-4 text-xs text-primary-foreground/50">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>Open 7 Days</span>
            </div>
            <a
              href={SITE_CONFIG.contact.phoneLink}
              className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>{SITE_CONFIG.contact.phone}</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
