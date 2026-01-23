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
  ChevronDown,
  Settings,
  Calendar,
  Trophy,
  Tag,
  Percent,
  Package,
  UserPlus,
  LogIn,
} from "lucide-react";
import { useState } from "react";
import azLogoIcon from "@/assets/az-monogram-transparent-tightest.png";

// Experiences dropdown items
const experienceItems = [
  { label: "Summit", href: "/summit", icon: Building2, description: "Event center & venue" },
  { label: "Hive Coworking", href: "/coworking", icon: Building2, description: "Private offices & coworking" },
  { label: "Spa", href: "/spa", icon: Sparkles, description: "Massage & wellness" },
  { label: "Fitness", href: "/fitness", icon: Dumbbell, description: "Gym & training" },
  { label: "360 Photo Booth", href: "/360-photo-booth", icon: Camera, description: "Event photo experiences" },
  { label: "Voice Vault", href: "/voice-vault", icon: Mic, description: "Private recording studio" },
  { label: "Spin & Win", href: "/dopamine-drop", icon: CircleDot, description: "Daily rewards & prizes" },
];

// Shop dropdown items
const shopItems = [
  { label: "Gift Cards", href: "/gift-cards", icon: Gift, description: "Give the gift of experience" },
  { label: "BEEAM Lights", href: "/shop", icon: ShoppingBag, description: "Curated products" },
];

// Promotions dropdown items
const promotionItems = [
  { label: "Current Promotions", href: "/promotions", icon: Percent, description: "Active deals & offers" },
  { label: "Limited Time Offers", href: "/promotions?filter=limited", icon: Tag, description: "Don't miss out" },
  { label: "Bundles & Packages", href: "/promotions?filter=bundles", icon: Package, description: "Save with bundles" },
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

      <div className="container flex h-16 items-center gap-4 lg:px-4 xl:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
          <img src={azLogoIcon} alt="A-Z Enterprises" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gold-gradient hidden lg:inline">A-Z Enterprises</span>
        </Link>

        {/* Desktop Navigation - 6 Primary Tabs (Book Now, Experiences, Shop, Promotions, Account, Spin & Win) */}
        <nav className="hidden md:flex items-center gap-0.5 md:gap-0.5 lg:gap-1 ml-2" aria-label="Primary">
          {/* 1. Book Now - Direct Link (Primary CTA) */}
          <Link
            to="/booking"
            className={cn(
              "flex items-center gap-1 md:gap-1 lg:gap-1.5 px-2 md:px-2 lg:px-4 py-2 text-xs md:text-xs lg:text-sm font-semibold rounded-md transition-colors",
              location.pathname === "/booking"
                ? "bg-accent text-primary"
                : "bg-accent/20 text-accent hover:bg-accent/30"
            )}
          >
            <CalendarDays className="h-4 w-4" />
            Book Now
          </Link>

          {/* 2. Experiences - Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 md:gap-1 lg:gap-1.5 px-2 md:px-2 lg:px-3 text-xs md:text-xs lg:text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Building2 className="h-4 w-4" />
                <span>Experiences</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-popover z-[60]">
              {experienceItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link to={item.href} className="flex items-center gap-3 py-2">
                    <item.icon className="h-4 w-4 text-accent" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Shop - Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 md:gap-1 lg:gap-1.5 px-2 md:px-2 lg:px-3 text-xs md:text-xs lg:text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Shop</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-popover z-[60]">
              {shopItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link to={item.href} className="flex items-center gap-3 py-2">
                    <item.icon className="h-4 w-4 text-accent" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 4. Promotions - Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 md:gap-1 lg:gap-1.5 px-2 md:px-2 lg:px-3 text-xs md:text-xs lg:text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Layers className="h-4 w-4" />
                <span>Promotions</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60 bg-popover z-[60]">
              {promotionItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link to={item.href} className="flex items-center gap-3 py-2">
                    <item.icon className="h-4 w-4 text-accent" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 5. Account - Dropdown (auth-aware) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 md:gap-1 lg:gap-1.5 px-2 md:px-2 lg:px-3 text-xs md:text-xs lg:text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
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

          {/* 6. Spin & Win - Direct Link */}
          <Link
            to="/dopamine-drop"
            className={cn(
              "flex items-center gap-1 md:gap-1 lg:gap-1.5 px-2 md:px-2 lg:px-3 py-2 text-xs md:text-xs lg:text-sm font-medium rounded-md transition-colors",
              location.pathname === "/dopamine-drop"
                ? "bg-accent/20 text-accent"
                : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            )}
          >
            <CircleDot className="h-4 w-4" />
            Spin & Win
          </Link>
        </nav>

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

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-primary-foreground/10 bg-primary p-4 space-y-1 animate-fade-in max-h-[80vh] overflow-y-auto" aria-label="Mobile">
          {/* 1. Book Now - Primary CTA */}
          <Link
            to="/booking"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-md bg-accent/20 text-accent"
          >
            <CalendarDays className="h-5 w-5" />
            Book Now
          </Link>

          {/* 2. Experiences - Collapsible */}
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
                {experienceItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                  >
                    <item.icon className="h-4 w-4 text-accent" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-primary-foreground/50">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 3. Shop - Collapsible */}
          <div>
            <button
              onClick={() => toggleMobileSection("shop")}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5" />
                Shop
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMobileSection === "shop" && "rotate-180")} />
            </button>
            {expandedMobileSection === "shop" && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-foreground/10 pl-4">
                {shopItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                  >
                    <item.icon className="h-4 w-4 text-accent" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-primary-foreground/50">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 4. Promotions - Collapsible */}
          <div>
            <button
              onClick={() => toggleMobileSection("promotions")}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
            >
              <span className="flex items-center gap-3">
                <Layers className="h-5 w-5" />
                Promotions
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMobileSection === "promotions" && "rotate-180")} />
            </button>
            {expandedMobileSection === "promotions" && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-foreground/10 pl-4">
                {promotionItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                  >
                    <item.icon className="h-4 w-4 text-accent" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-primary-foreground/50">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 5. Account - Collapsible */}
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

          {/* 6. Spin & Win - Direct Link */}
          <Link
            to="/dopamine-drop"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
              location.pathname === "/dopamine-drop"
                ? "bg-accent/20 text-accent"
                : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            )}
          >
            <CircleDot className="h-5 w-5" />
            Spin & Win
          </Link>
        </nav>
      )}
    </header>
  );
}
