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

      {/* Opening announcement banner */}
      <a
        href="https://thelandingzonewapak.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-accent text-primary text-center text-sm font-semibold py-2 px-4 hover:opacity-90 transition-opacity"
      >
        The Family Hub Landing Zone opens August 1st. We pushed the date back while safety inspections are approved. See hours and passes →
      </a>




      <Header />
      <main id="main-content" className="flex-1" role="main">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
