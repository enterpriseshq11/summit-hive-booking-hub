import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Building, Users, Home, Calculator } from "lucide-react";

const sections = [
  { title: "Marketplace", icon: Store, description: "Public listing portal for available mobile homes. Buyers can browse, filter, and inquire about properties directly from the website." },
  { title: "Operator Hub", icon: Building, description: "Tools for park operators to manage their inventory and listings. Track lot availability, tenant assignments, and park-level revenue." },
  { title: "Vendor Connect", icon: Users, description: "Directory of vendors and service providers. Manage relationships with movers, renovators, inspectors, and contractors." },
  { title: "Tenant Portal", icon: Home, description: "Self-service tools for park tenants. Rent payment tracking, maintenance requests, and lease document access." },
  { title: "MH Accounting", icon: Calculator, description: "Financial management tools for mobile home operations. Track acquisition costs, renovation ledgers, and gross profit per unit." },
];

export default function MHConnect() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">MH Connect</h1>
          <p className="text-zinc-400">Mobile home marketplace and operations platform</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <Card key={s.title} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className="h-5 w-5 text-amber-400" />
                    <CardTitle className="text-base text-white">{s.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-xs">Coming Soon</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400">{s.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
