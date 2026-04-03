import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Link2, Construction } from "lucide-react";

const PLATFORMS = [
  { name: "Facebook Ads", icon: "📘", connected: false },
  { name: "Google Ads", icon: "🔍", connected: false },
  { name: "Instagram", icon: "📷", connected: false },
  { name: "TikTok", icon: "🎵", connected: false },
];

export default function AdTracking() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-400" /> Ad Tracking
          </h1>
          <p className="text-zinc-400">Connect ad platforms and track campaign performance</p>
        </div>

        {/* Platform Connections */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Platform Connections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORMS.map(p => (
              <Card key={p.name} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <p className="text-white font-medium">{p.name}</p>
                      <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">Not Connected</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400" disabled>
                    <Link2 className="h-4 w-4 mr-1" /> Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Campaign Performance</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Campaign Name</TableHead>
                  <TableHead className="text-zinc-400">Platform</TableHead>
                  <TableHead className="text-zinc-400">Spend</TableHead>
                  <TableHead className="text-zinc-400">Leads Generated</TableHead>
                  <TableHead className="text-zinc-400">Cost Per Lead</TableHead>
                  <TableHead className="text-zinc-400">Conversion Rate</TableHead>
                  <TableHead className="text-zinc-400">Date Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Construction className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-500">Connect an ad platform to see campaign data</p>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 mt-2">Coming in Phase 2</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Lead Source Attribution Chart placeholder */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Lead Source Attribution</h2>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <Construction className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-500">Chart will populate from lead source data once ad platforms are connected</p>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 mt-2">Pending Integration</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}