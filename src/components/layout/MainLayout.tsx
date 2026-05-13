import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useBookingsRealtime } from "@/hooks/useBookingsRealtime";

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Enable real-time booking updates for all public calendars
  useBookingsRealtime();
  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        className="skip-link"
        tabIndex={0}
      >
        Skip to main content
      </a>

      {/* Sticky announcement banner */}
      <a
        href="https://go.thelandingzoneohio.com/join-the-family-hub-landing-zone-waitlist?utm_source=azenterprises&utm_medium=website&utm_campaign=landing_zone_waitlist&utm_content=sticky_banner"
        target="_blank"
        rel="noopener noreferrer"
        className="sticky top-0 z-[60] block w-full bg-gold py-2 text-center text-sm font-semibold text-primary hover:bg-gold/90 transition-colors animate-banner-glow"
      >
        <span className="inline-flex items-center gap-1.5">
          🌙 NOW BUILDING → The Family Hub Landing Zone · Coming Soon to Downtown Wapakoneta · Join the Waitlist →
        </span>
      </a>

      <Header />
      <main id="main-content" className="flex-1" role="main">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
