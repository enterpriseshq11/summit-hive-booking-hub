import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDataEventTracking } from "./lib/analytics";

// SPA deep-link fallback (for hosts without History API rewrites):
// If the host serves /public/404.html for unknown paths, it redirects to / with
// the original path in ?__redirect=. We restore the path before React mounts.
(() => {
  try {
    const url = new URL(window.location.href);
    const redirect = url.searchParams.get("__redirect");
    if (redirect) {
      const target = decodeURIComponent(redirect);
      window.history.replaceState(null, "", target);
    }
  } catch {
    // no-op
  }
})();

// Initialize analytics tracking (after path restore so events have correct URL)
initDataEventTracking();

createRoot(document.getElementById("root")!).render(<App />);
