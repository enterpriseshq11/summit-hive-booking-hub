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
  Gift,
  Scissors,
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
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import azLogoIcon from "@/assets/az-monogram-transparent-tightest.png";

// Experiences dropdown items
const experienceItems = [
  { label: "Book an Event", href: "/book-summit", icon: CalendarDays, description: "Request a Summit event" },
  { label: "Book a Spa Service", href: "/book-spa", icon: Sparkles, description: "Massage & wellness" },
  { label: "Book Studio Time", href: "/book-voice-vault", icon: Mic, description: "Private recording studio" },
  { label: "Join the Gym", href: "/join-fitness", icon: Dumbbell, description: "Gym memberships" },
  { label: "Coworking Space", href: "/the-hive", icon: Building2, description: "Private offices & coworking" },
  { label: "Summit Venue", href: "/summit", icon: Building2, description: "Event center & venue" },
  { label: "Spa Info", href: "/spa", icon: Sparkles, description: "Service details" },
  { label: "Fitness Info", href: "/fitness", icon: Dumbbell, description: "Gym & training" },
  { label: "Voice Vault", href: "/voice-vault", icon: Mic, description: "Studio info" },
];

// Shop dropdown items
const shopItems = [
  { label: "Gift Cards", href: "/gift-cards", icon: Gift, description: "Give the gift of experience" },
  { label: "BEEAM Lights", href: "/shop", icon: ShoppingBag, description: "Curated products" },
  { label: "Elevated by Elyse", href: "/shop/elevated-by-elyse", icon: Gift, description: "Personalized gifts" },
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

        {/* Desktop Navigation - Experiences, Shop, Promotions, Account, Careers, Spin & Win */}
        <nav className="hidden md:flex items-center gap-0.5 md:gap-0.5 lg:gap-1 ml-2" aria-label="Primary">
          {/* 1. Experiences - Dropdown */}
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

          {/* 2. Beauty Haven - Link + Dropdown */}
          <DropdownMenu>
            <div className={cn(
              "flex items-center rounded-md",
              location.pathname.startsWith("/beauty-haven")
                ? "text-[#FF0099]"
                : "text-primary-foreground/70 hover:text-primary-foreground"
            )}>
              <Link
                to="/beauty-haven"
                className="flex items-center gap-1 md:gap-1 lg:gap-1.5 pl-2 md:pl-2 lg:pl-3 pr-1 py-1.5 text-xs md:text-xs lg:text-sm rounded-l-md hover:bg-primary-foreground/10"
              >
                <Scissors className="h-4 w-4" />
                <span>Beauty Haven</span>
              </Link>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open Beauty Haven menu"
                  className="pr-2 md:pr-2 lg:pr-3 pl-1 py-1.5 rounded-r-md hover:bg-primary-foreground/10"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent align="start" className="w-56 bg-popover z-[60]">
              <DropdownMenuItem asChild>
                <Link to="/beauty-haven" className="flex items-center gap-3 py-2">
                  <Scissors className="h-4 w-4 text-[#FF0099]" />
                  <div>
                    <div className="font-medium">High Maintenance Beauty Haven</div>
                    <p className="text-xs text-muted-foreground">Main page</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/beauty-haven/hair" className="flex items-center gap-3 py-2">
                  <Scissors className="h-4 w-4 text-[#FF0099]" />
                  <div>
                    <div className="font-medium">Hair by Hannah</div>
                    <p className="text-xs text-muted-foreground">Color, cuts & styles</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/beauty-haven/nails" className="flex items-center gap-3 py-2">
                  <Sparkles className="h-4 w-4 text-[#FF0099]" />
                  <div>
                    <div className="font-medium">Nails by Desiree</div>
                    <p className="text-xs text-muted-foreground">Nail art & sets</p>
                  </div>
                </Link>
              </DropdownMenuItem>
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

          {/* 6. Careers - Direct Link */}
          <Link
            to="/careers"
            className={cn(
              "flex items-center gap-1 md:gap-1 lg:gap-1.5 px-2 md:px-2 lg:px-3 py-2 text-xs md:text-xs lg:text-sm font-medium rounded-md transition-colors",
              location.pathname.startsWith("/careers")
                ? "bg-accent/20 text-accent"
                : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            )}
          >
            <Briefcase className="h-4 w-4" />
            Careers
          </Link>

          {/* 7. Spin & Win - Direct Link */}
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

          {/* Beauty Haven - Collapsible */}
          <div>
            <button
              onClick={() => toggleMobileSection("beautyhaven")}
              className={cn(
                "flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-md hover:bg-primary-foreground/10",
                location.pathname.startsWith("/beauty-haven") ? "text-[#FF0099]" : "text-primary-foreground/70 hover:text-primary-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Scissors className="h-5 w-5" />
                Beauty Haven
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMobileSection === "beautyhaven" && "rotate-180")} />
            </button>
            {expandedMobileSection === "beautyhaven" && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#FF0099]/30 pl-4">
                <Link
                  to="/beauty-haven"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                >
                  <Scissors className="h-4 w-4 text-[#FF0099]" />
                  <div>
                    <div>High Maintenance Beauty Haven</div>
                    <div className="text-xs text-primary-foreground/50">Main page</div>
                  </div>
                </Link>
                <Link
                  to="/beauty-haven/hair"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                >
                  <Scissors className="h-4 w-4 text-[#FF0099]" />
                  <div>
                    <div>Hair by Hannah</div>
                    <div className="text-xs text-primary-foreground/50">Color, cuts & styles</div>
                  </div>
                </Link>
                <Link
                  to="/beauty-haven/nails"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-md hover:bg-primary-foreground/10"
                >
                  <Sparkles className="h-4 w-4 text-[#FF0099]" />
                  <div>
                    <div>Nails by Desiree</div>
                    <div className="text-xs text-primary-foreground/50">Nail art & sets</div>
                  </div>
                </Link>
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

          {/* 6. Careers - Direct Link */}
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

          {/* 7. Spin & Win - Direct Link */}
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
