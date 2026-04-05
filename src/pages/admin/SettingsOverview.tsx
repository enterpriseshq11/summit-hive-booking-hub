import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings, UserCog, CreditCard, Link2, Shield, Lightbulb, Rocket, BookOpen,
  AlertTriangle, FileText, Clock, ChevronRight, Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const settingsCards = [
  { title: "Users & Roles", description: "Manage team members, roles, and access permissions", icon: UserCog, href: "/admin/settings/users" },
  { title: "Payment Settings", description: "Configure payment modes per business unit", icon: CreditCard, href: "/admin/settings/payment" },
  { title: "Integrations", description: "GHL, PandaDoc, Facebook & Google Ads credentials", icon: Link2, href: "/admin/settings/integrations" },
  { title: "Stripe Connection", description: "Manage Stripe API keys and webhook configuration", icon: CreditCard, href: "/admin/settings/stripe-connection" },
  { title: "Stripe Mapping", description: "Map Stripe products to business units", icon: CreditCard, href: "/admin/settings/stripe-mapping" },
  { title: "Audit Log", description: "View complete history of all system changes", icon: Shield, href: "/admin/settings/audit-log" },
  { title: "Assumptions", description: "Track platform assumptions and decisions", icon: Lightbulb, href: "/admin/settings/assumptions" },
  { title: "Deployment Checklist", description: "Pre-launch checklist for production readiness", icon: Rocket, href: "/admin/settings/deployment-checklist" },
  { title: "Platform Guide", description: "Living documentation for the platform", icon: BookOpen, href: "/admin/settings/platform-guide" },
  { title: "Error Log", description: "Monitor edge function errors and failures", icon: AlertTriangle, href: "/admin/settings/error-log" },
  { title: "Orphaned Files", description: "Find and clean up unused storage files", icon: Trash2, href: "/admin/settings/orphaned-files" },
  { title: "Cadences", description: "Automated follow-up sequences for leads", icon: Clock, href: "/admin/settings/cadences" },
  { title: "Phase 1 Checklist", description: "Original phase 1 implementation tracker", icon: FileText, href: "/admin/settings/phase1-checklist" },
];

export default function SettingsOverview() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400">Platform configuration and administration tools</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsCards.map((card) => (
            <Card
              key={card.href}
              className="bg-zinc-900 border-zinc-800 hover:border-amber-500/50 transition-colors cursor-pointer group"
              onClick={() => navigate(card.href)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0">
                  <card.icon className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white">{card.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{card.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-amber-400 flex-shrink-0 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
