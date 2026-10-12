import { ReactNode, Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { Outlet } from "react-router-dom";
import { AzHeader } from "@/components/az/AzHeader";
import { AzFooter } from "@/components/az/AzFooter";
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
      <AzHeader />
      <main id="main-content" className="flex-1" role="main">
        <Suspense fallback={<PageLoader />}>{children ?? <Outlet />}</Suspense>
      </main>
      <AzFooter />
    </div>
  );
}
