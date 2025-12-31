import { Link } from "react-router-dom";
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
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Phone,
  Clock
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Book Now", href: "/booking", icon: CalendarDays, primary: true },
  { label: "Summit", href: "/summit", icon: Building2 },
  { label: "Coworking", href: "/coworking", icon: Building2 },
  { label: "Spa", href: "/spa", icon: Sparkles },
  { label: "Fitness", href: "/fitness", icon: Dumbbell },
  { label: "Gift Cards", href: "/gift-cards", icon: Gift },
  { label: "Member Exclusives", href: "/promotions", icon: Sparkles },
];

export function Header() {
  const { user, authUser, signOut } = useAuth();
  const location = window.location;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary text-primary-foreground">
      {/* Desktop micro-trust line */}
      <div className="hidden lg:block border-b border-primary-foreground/10 bg-primary/95">
        <div className="container flex items-center justify-end gap-6 h-8 text-xs text-primary-foreground/70">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>Open 7 Days</span>
          </div>
          <a href="tel:+14195550100" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
            <Phone className="h-3 w-3" />
            <span>(419) 555-0100</span>
          </a>
        </div>
      </div>

      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gold-gradient">A-Z Enterprises</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-accent text-primary"
                    : item.primary
                    ? "bg-accent/20 text-accent hover:bg-accent/30"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground hover:bg-primary-foreground/10">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {authUser?.profile?.first_name || "Account"}
                  </span>
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
                      Admin Console
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
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-primary-foreground/10 bg-primary p-4 space-y-2 animate-fade-in">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
