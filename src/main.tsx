import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDataEventTracking } from "./lib/analytics";

// Initialize analytics tracking
initDataEventTracking();

createRoot(document.getElementById("root")!).render(<App />);
