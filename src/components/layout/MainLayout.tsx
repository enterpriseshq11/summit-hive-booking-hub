import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
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
      <Header />
      <main id="main-content" className="flex-1" role="main">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
