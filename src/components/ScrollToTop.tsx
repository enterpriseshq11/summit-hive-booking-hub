import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that resets scroll position on route changes.
 * Must be mounted inside the Router.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll to top on every pathname change
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
