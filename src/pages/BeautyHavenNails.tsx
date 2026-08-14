import { Navigate } from "react-router-dom";

// Old /beauty-haven/nails route now redirects to The Spa page.
export default function BeautyHavenNails() {
  return <Navigate to="/beauty-haven" replace />;
}
