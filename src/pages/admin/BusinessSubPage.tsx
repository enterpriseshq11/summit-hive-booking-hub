import { useParams, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

// Pages that are stubs
const STUB_PAGES = new Set([
  "summit/bookings", "summit/revenue", "summit/settings",
  "spa/bookings", "spa/revenue", "spa/workers", "spa/settings",
  "fitness/memberships", "fitness/revenue", "fitness/settings",
  "hive/office-listings", "hive/inquiries", "hive/revenue", "hive/settings",
  "voice-vault/bookings", "voice-vault/revenue", "voice-vault/settings",
  "mobile-homes/revenue", "mobile-homes/settings",
  "elevated-by-elyse/bookings", "elevated-by-elyse/revenue", "elevated-by-elyse/settings",
]);

const UNIT_LABELS: Record<string, string> = {
  summit: "The Summit Event Center",
  spa: "Restoration Lounge Spa",
  fitness: "A-Z Total Fitness",
  hive: "The Hive",
  "voice-vault": "Voice Vault",
  "mobile-homes": "Mobile Homes",
  "elevated-by-elyse": "Elevated by Elyse",
};

const UNIT_ROLE_ACCESS: Record<string, string[]> = {
  summit: ["owner", "manager", "ops_lead", "marketing_lead", "event_coordinator", "sales_acquisitions"],
  spa: ["owner", "manager", "ops_lead", "marketing_lead", "spa_lead", "spa_worker"],
  fitness: ["owner", "manager", "ops_lead", "marketing_lead", "fitness_lead"],
  hive: ["owner", "manager", "ops_lead", "marketing_lead", "coworking_manager"],
  "voice-vault": ["owner", "manager", "ops_lead", "marketing_lead"],
  "mobile-homes": ["owner", "manager", "ops_lead", "sales_acquisitions"],
  "elevated-by-elyse": ["owner", "marketing_lead"],
};

export default function BusinessSubPage() {
  const { unit, page } = useParams<{ unit: string; page: string }>();
  const { authUser } = useAuth();
  const userRoles = authUser?.roles || [];

  const allowedRoles = unit ? UNIT_ROLE_ACCESS[unit] || [] : [];
  const hasAccess = allowedRoles.some((r: string) => userRoles.includes(r));

  if (!hasAccess) {
    return <Navigate to="/admin" replace />;
  }

  const key = `${unit}/${page}`;
  const unitLabel = unit ? UNIT_LABELS[unit] || unit : "";
  const pageLabel = page ? page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, " ") : "";

  if (STUB_PAGES.has(key)) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Construction className="h-16 w-16 text-amber-500/50 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{unitLabel} — {pageLabel}</h1>
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-sm px-4 py-1">
            Coming in Phase 2
          </Badge>
          <p className="text-zinc-500 mt-4 max-w-md">
            This page is scheduled for the next development phase. Core functionality will be added once Phase 1 is confirmed complete.
          </p>
        </div>
      </AdminLayout>
    );
  }

  // Non-stub pages are handled by dedicated route components
  return null;
}