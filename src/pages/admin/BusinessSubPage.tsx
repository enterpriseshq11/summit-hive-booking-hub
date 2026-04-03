import { useParams, Navigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";

const UNIT_LABELS: Record<string, string> = {
  summit: "The Summit Event Center",
  spa: "Restoration Lounge Spa",
  fitness: "A-Z Total Fitness",
  hive: "The Hive",
  "voice-vault": "Voice Vault",
  "mobile-homes": "Mobile Homes",
  "elevated-by-elyse": "Elevated by Elyse",
};

const UNIT_COLORS: Record<string, string> = {
  summit: "border-amber-500/30 text-amber-400",
  spa: "border-purple-500/30 text-purple-400",
  fitness: "border-green-500/30 text-green-400",
  hive: "border-blue-500/30 text-blue-400",
  "voice-vault": "border-orange-500/30 text-orange-400",
  "mobile-homes": "border-zinc-500/30 text-zinc-400",
  "elevated-by-elyse": "border-pink-500/30 text-pink-400",
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
  const hasAccess = allowedRoles.some((r) => (userRoles as string[]).includes(r));

  if (!hasAccess) {
    return <Navigate to="/admin" replace />;
  }

  const unitLabel = unit ? UNIT_LABELS[unit] || unit : "";
  const unitColor = unit ? UNIT_COLORS[unit] || "border-zinc-500/30 text-zinc-400" : "";
  const pageLabel = page ? page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, " ") : "";

  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Construction className="h-16 w-16 text-amber-500/50 mb-4" />
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className={unitColor}>{unitLabel}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{unitLabel} — {pageLabel}</h1>
        <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-sm px-4 py-1">
          Coming in Phase 2
        </Badge>
        <p className="text-zinc-500 mt-4 max-w-md">
          This section is coming in Phase 2. Full {pageLabel.toLowerCase()} management, revenue tracking, and settings for {unitLabel} will be available here.
        </p>
        <Link to={`/admin`} className="mt-6">
          <Button variant="outline" className="border-zinc-700 text-zinc-300">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </AdminLayout>
  );
}