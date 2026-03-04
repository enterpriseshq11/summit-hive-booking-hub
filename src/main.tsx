import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDataEventTracking } from "./lib/analytics";

// eslint-disable-next-line no-console
console.log("BOOT_URL", window.location.href);

// BrowserRouter handles clean URLs natively — no hash normalizer needed.

// Initialize analytics tracking (events should reflect the raw, unmodified URL)
initDataEventTracking();

createRoot(document.getElementById("root")!).render(<App />);
