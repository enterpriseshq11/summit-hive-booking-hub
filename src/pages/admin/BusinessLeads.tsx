import { useParams, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Search, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";

const UNIT_MAP: Record<string, { businessType: string; label: string; roles: string[] }> = {
  summit: { businessType: "summit", label: "The Summit", roles: ["owner", "manager", "ops_lead", "marketing_lead", "event_coordinator", "sales_acquisitions"] },
  spa: { businessType: "spa", label: "Restoration Lounge Spa", roles: ["owner", "manager", "ops_lead", "marketing_lead", "spa_lead"] },
  "elevated-by-elyse": { businessType: "elevated_by_elyse", label: "Elevated by Elyse", roles: ["owner", "marketing_lead"] },
  fitness: { businessType: "fitness", label: "A-Z Total Fitness", roles: ["owner", "manager", "ops_lead", "marketing_lead", "fitness_lead"] },
  hive: { businessType: "coworking", label: "The Hive", roles: ["owner", "manager", "ops_lead", "marketing_lead", "coworking_manager"] },
  "voice-vault": { businessType: "voice_vault", label: "Voice Vault", roles: ["owner", "manager", "ops_lead", "marketing_lead"] },
  "mobile-homes": { businessType: "mobile_homes", label: "Mobile Homes", roles: ["owner", "manager", "ops_lead", "sales_acquisitions"] },
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  qualified: "bg-green-500/20 text-green-400",
  proposal_sent: "bg-purple-500/20 text-purple-400",
  won: "bg-emerald-500/20 text-emerald-400",
  lost: "bg-red-500/20 text-red-400",
};

export default function BusinessLeads() {
  const { unit } = useParams<{ unit: string }>();
  const { authUser } = useAuth();
  const userRoles = authUser?.roles || [];
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const config = unit ? UNIT_MAP[unit] : null;
  if (!config) return <Navigate to="/admin" replace />;

  const hasAccess = config.roles.some((r: string) => userRoles.includes(r));
  if (!hasAccess) return <Navigate to="/admin" replace />;

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["business-leads", config.businessType, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("crm_leads")
        .select("*")
        .eq("business_unit", config.businessType as any)
        .order("created_at", { ascending: false })
        .limit(200);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = leads.filter((l: any) =>
    !search || l.lead_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-amber-400" />
              {config.label} — Leads
            </h1>
            <p className="text-zinc-400">{filtered.length} leads found</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Phone</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Source</TableHead>
                <TableHead className="text-zinc-400">Follow-Up</TableHead>
                <TableHead className="text-zinc-400">Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center text-zinc-500 py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-zinc-500 py-8">No leads found</TableCell></TableRow>
              ) : (
                filtered.map((lead: any) => (
                  <TableRow key={lead.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-white font-medium">
                      <Link to={`/admin/leads/${lead.id}`} className="hover:text-amber-400 transition-colors">
                        {lead.lead_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-zinc-300">{lead.email}</TableCell>
                    <TableCell className="text-zinc-300">{lead.phone}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[lead.status] || "bg-zinc-700 text-zinc-300"}>
                        {(lead.status || "new").replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">{lead.source?.replace(/_/g, " ") || "—"}</TableCell>
                    <TableCell>
                      {lead.follow_up_due ? (
                        <span className={
                          new Date(lead.follow_up_due) < new Date() ? "text-red-400" :
                          new Date(lead.follow_up_due).toDateString() === new Date().toDateString() ? "text-amber-400" :
                          "text-green-400"
                        }>
                          {format(new Date(lead.follow_up_due), "MMM d")}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {format(new Date(lead.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/leads/${lead.id}`}>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}