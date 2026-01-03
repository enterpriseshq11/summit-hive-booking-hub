import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDataEventTracking } from "./lib/analytics";

// NOTE: HashRouter is the guaranteed deep-link fix on lovable.app.
// We intentionally do NOT run any boot-time URL rewriting that could clobber #/ routes.
// (Previously: SPA deep-link fallback using __redirect + history.replaceState)

// Normalize encoded-hash deep links (some environments encode "#" as "%23" in the pathname).
// Example: /%23/command-center  ->  /#/command-center
(() => {
  try {
    const decodedPath = decodeURIComponent(window.location.pathname || "");
    if (decodedPath.startsWith("/#/")) {
      const targetHash = decodedPath.slice(1); // "#/..."
      window.history.replaceState(null, "", "/");
      window.location.hash = targetHash;
    }
  } catch {
    // no-op
  }
})();

// Safety guard: if the user deep-links into Command Center, ignore any attempt to replaceState() to '/'.
(() => {
  const initialHash = window.location.hash || "";
  if (!initialHash.startsWith("#/command-center")) return;

  const originalReplaceState = window.history.replaceState.bind(window.history);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.history.replaceState = ((state: any, title: string, url?: string | URL | null) => {
    const urlStr = typeof url === "string" ? url : url?.toString();
    if (urlStr === "/" || urlStr === "") return;
    return originalReplaceState(state, title, url as any);
  }) as any;
})();


// Initialize analytics tracking (after path restore so events have correct URL)
initDataEventTracking();

createRoot(document.getElementById("root")!).render(<App />);
