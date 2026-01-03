import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDataEventTracking } from "./lib/analytics";

// eslint-disable-next-line no-console
console.log("BOOT_URL", window.location.href);

// CRITICAL: Some environments encode a hash deep-link as a real path:
//   /%23/command-center  (decoded: /#/command-center)
// HashRouter will not see this unless we convert it back into window.location.hash.
(() => {
  try {
    const { hash, pathname } = window.location;
    if (hash) return; // already a hash URL
    if (!pathname.includes("%23")) return;

    const decodedPath = decodeURIComponent(pathname || "");
    if (!decodedPath.startsWith("/#/")) return;

    const restoredHash = decodedPath.slice(1); // "#/..."
    // eslint-disable-next-line no-console
    console.log("BOOT_RESTORE_HASH", { pathname, decodedPath, restoredHash });

    // Set hash, then normalize the pathname back to '/' so refreshes stay stable.
    window.history.replaceState(null, "", "/");
    window.location.hash = restoredHash;
  } catch {
    // no-op
  }
})();

// NOTE: HashRouter is the guaranteed deep-link fix on lovable.app.
// CRITICAL: Do not perform any other boot-time URL rewriting (hash, replaceState, or cleanup).

// Initialize analytics tracking (events should reflect the raw, unmodified URL)
initDataEventTracking();

createRoot(document.getElementById("root")!).render(<App />);
