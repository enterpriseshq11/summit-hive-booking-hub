import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function MainLayout() {
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
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
