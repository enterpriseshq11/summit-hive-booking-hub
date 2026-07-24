import { Navigate } from "react-router-dom";

// Desiree is no longer on the team. Old /beauty-haven/nails route now
// redirects to the rebranded Afterglow Salon & Spa page.
export default function BeautyHavenNails() {
  return <Navigate to="/beauty-haven" replace />;
}
