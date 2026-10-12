import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FAMILY_HUB_URL = "https://thelandingzonewapak.com";

export function AzWordmark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="flex items-baseline gap-2.5">
      <span className={`az-display text-az-gold ${size === "lg" ? "text-[44px]" : "text-[36px]"} leading-none`}>A-Z</span>
      <span className="text-[11px] font-semibold tracking-[0.32em] text-az-paper">ENTERPRISES</span>
    </span>
  );
}

const NAV = [
  { label: "The Building", to: "/#building" },
  { label: "The Gym", to: "/gym" },
  { label: "The Family Hub Landing Zone", href: FAMILY_HUB_URL },
  { label: "Businesses", to: "/#businesses" },
  { label: "About", to: "/about" },
];

export function AzHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, authUser } = useAuth();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const linkClass = "text-[15px] font-medium text-az-paper hover:text-az-goldlight transition-colors";

  return (
    <header className="az-site sticky top-0 z-50 border-b border-[rgba(227,168,58,0.18)] bg-[rgba(12,11,9,0.92)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(12,11,9,0.82)]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-3.5 md:px-6">
        <Link to="/" aria-label="A-Z Enterprises home" className="shrink-0">
          <AzWordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) =>
            n.href ? (
              <a key={n.label} href={n.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {n.label} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <Link key={n.label} to={n.to!} className={linkClass}>
                {n.label}
              </Link>
            ),
          )}
          {authUser?.isStaff && (
            <Link to="/admin" className="text-[15px] font-medium text-az-goldlight hover:text-az-gold">
              Command Center
            </Link>
          )}
          <Link
            to="/build"
            className="inline-flex min-h-[44px] items-center rounded-md bg-az-gold px-5 text-[15px] font-semibold text-az-ink transition-colors hover:bg-az-goldlight"
          >
            Build Here
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[rgba(243,237,226,0.25)] text-az-paper lg:hidden"
          aria-expanded={open}
          aria-controls="az-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav id="az-mobile-nav" aria-label="Main" className="border-t border-[rgba(227,168,58,0.18)] px-5 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.label} className="border-b border-[rgba(243,237,226,0.08)]">
                {n.href ? (
                  <a href={n.href} target="_blank" rel="noopener noreferrer" className="block py-3.5 text-[17px] text-az-paper">
                    {n.label} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link to={n.to!} className="block py-3.5 text-[17px] text-az-paper">
                    {n.label}
                  </Link>
                )}
              </li>
            ))}
            {authUser?.isStaff && (
              <li className="border-b border-[rgba(243,237,226,0.08)]">
                <Link to="/admin" className="block py-3.5 text-[17px] text-az-goldlight">Command Center</Link>
              </li>
            )}
            {user && (
              <li className="border-b border-[rgba(243,237,226,0.08)]">
                <Link to="/account" className="block py-3.5 text-[17px] text-az-paper">Account</Link>
              </li>
            )}
          </ul>
          <Link to="/build" className="mt-5 flex min-h-[52px] items-center justify-center rounded-md bg-az-gold text-[16px] font-semibold text-az-ink">
            Build Here
          </Link>
        </nav>
      )}
    </header>
  );
}
