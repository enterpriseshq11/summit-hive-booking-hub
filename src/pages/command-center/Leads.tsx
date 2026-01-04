import { useState } from "react";
import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import { useCrmLeads, useCreateCrmLead, useUpdateCrmLead, useBulkUpdateLeads, type CrmLeadWithRelations } from "@/hooks/useCrmLeads";
import { useCrmEmployees } from "@/hooks/useCrmEmployees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type CrmLeadStatus = Database["public"]["Enums"]["crm_lead_status"];
type CrmLeadSource = Database["public"]["Enums"]["crm_lead_source"];
type BusinessType = Database["public"]["Enums"]["business_type"];

const statusColors: Record<CrmLeadStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  qualified: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  proposal_sent: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  won: "bg-green-500/20 text-green-400 border-green-500/50",
  lost: "bg-red-500/20 text-red-400 border-red-500/50",
};

const businessUnitLabels: Record<BusinessType, string> = {
  spa: "Spa",
  fitness: "Fitness",
  coworking: "Coworking",
  summit: "Summit",
  voice_vault: "Voice Vault",
};

export default function CommandCenterLeads() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    lead_name: "",
    email: "",
    phone: "",
    company_name: "",
    business_unit: "spa" as BusinessType,
    source: "website" as CrmLeadSource,
  });

  const statusFilter = searchParams.get("status") as CrmLeadStatus | null;
  const unitFilter = searchParams.get("unit") as BusinessType | null;

  const { data: leads, isLoading } = useCrmLeads({
    status: statusFilter || undefined,
    businessUnit: unitFilter || undefined,
    search: search || undefined,
  });
  const { data: employees } = useCrmEmployees();
  const createLead = useCreateCrmLead();
  const updateLead = useUpdateCrmLead();
  const bulkUpdate = useBulkUpdateLeads();

  const handleCreateLead = async () => {
    await createLead.mutateAsync(newLead);
    setIsCreateDialogOpen(false);
    setNewLead({
      lead_name: "",
      email: "",
      phone: "",
      company_name: "",
      business_unit: "spa",
      source: "website",
    });
  };

  const handleBulkAssign = async (employeeId: string) => {
    if (selectedLeads.length === 0) return;
    await bulkUpdate.mutateAsync({
      ids: selectedLeads,
      updates: { assigned_employee_id: employeeId },
    });
    setSelectedLeads([]);
  };

  const handleBulkStatusChange = async (status: CrmLeadStatus) => {
    if (selectedLeads.length === 0) return;
    await bulkUpdate.mutateAsync({
      ids: selectedLeads,
      updates: { status },
    });
    setSelectedLeads([]);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === (leads?.length || 0)) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads?.map((l) => l.id) || []);
    }
  };

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Leads</h1>
            <p className="text-zinc-400">Manage and track all sales leads</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Add New Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-zinc-300">Name *</Label>
                  <Input
                    value={newLead.lead_name}
                    onChange={(e) => setNewLead({ ...newLead, lead_name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="John Smith"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300">Email</Label>
                    <Input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Phone</Label>
                    <Input
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-zinc-300">Company</Label>
                  <Input
                    value={newLead.company_name}
                    onChange={(e) => setNewLead({ ...newLead, company_name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300">Business Unit</Label>
                    <Select
                      value={newLead.business_unit}
                      onValueChange={(v) => setNewLead({ ...newLead, business_unit: v as BusinessType })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="coworking">Coworking</SelectItem>
                        <SelectItem value="summit">Summit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-zinc-300">Source</Label>
                    <Select
                      value={newLead.source}
                      onValueChange={(v) => setNewLead({ ...newLead, source: v as CrmLeadSource })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="walk_in">Walk-in</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-zinc-700 text-zinc-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateLead}
                    disabled={!newLead.lead_name || createLead.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    Create Lead
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <Select
                value={statusFilter || "all"}
                onValueChange={(v) => {
                  if (v === "all") {
                    searchParams.delete("status");
                  } else {
                    searchParams.set("status", v);
                  }
                  setSearchParams(searchParams);
                }}
              >
                <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-zinc-100">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={unitFilter || "all"}
                onValueChange={(v) => {
                  if (v === "all") {
                    searchParams.delete("unit");
                  } else {
                    searchParams.set("unit", v);
                  }
                  setSearchParams(searchParams);
                }}
              >
                <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Business Unit" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="spa">Spa</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="coworking">Coworking</SelectItem>
                  <SelectItem value="summit">Summit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedLeads.length > 0 && (
              <div className="flex items-center gap-4 mt-4 p-3 bg-amber-500/10 rounded-lg">
                <span className="text-amber-500 text-sm font-medium">
                  {selectedLeads.length} selected
                </span>
                <Select onValueChange={handleBulkStatusChange}>
                  <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={handleBulkAssign}>
                  <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Assign To" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLeads([])}
                  className="text-zinc-400"
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.length === (leads?.length || 0) && leads?.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-zinc-600"
                    />
                  </TableHead>
                  <TableHead className="text-zinc-400">Lead</TableHead>
                  <TableHead className="text-zinc-400">Contact</TableHead>
                  <TableHead className="text-zinc-400">Unit</TableHead>
                  <TableHead className="text-zinc-400">Source</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Assigned To</TableHead>
                  <TableHead className="text-zinc-400">Follow-up</TableHead>
                  <TableHead className="text-zinc-400 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-zinc-500">
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : leads?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-zinc-500">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  leads?.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer"
                      onClick={() => navigate(`/command-center/leads/${lead.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLeads([...selectedLeads, lead.id]);
                            } else {
                              setSelectedLeads(selectedLeads.filter((id) => id !== lead.id));
                            }
                          }}
                          className="border-zinc-600"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-zinc-100">{lead.lead_name}</div>
                          {lead.company_name && (
                            <div className="text-xs text-zinc-500">{lead.company_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-zinc-700 text-zinc-300 capitalize">
                          {businessUnitLabels[lead.business_unit]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 capitalize text-sm">
                        {lead.source?.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("capitalize", statusColors[lead.status as CrmLeadStatus])}>
                          {lead.status?.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.assigned_employee ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-zinc-500" />
                            <span className="text-zinc-300 text-sm">
                              {lead.assigned_employee.first_name} {lead.assigned_employee.last_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.follow_up_due ? (
                          <div className="flex items-center gap-1 text-zinc-400 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(lead.follow_up_due), "MMM d")}
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-zinc-400">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                            <DropdownMenuItem
                              onClick={() => navigate(`/command-center/leads/${lead.id}`)}
                              className="text-zinc-100"
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-700" />
                            <DropdownMenuItem
                              onClick={() => updateLead.mutate({ id: lead.id, status: "contacted" })}
                              className="text-zinc-100"
                            >
                              Mark Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateLead.mutate({ id: lead.id, status: "qualified" })}
                              className="text-zinc-100"
                            >
                              Mark Qualified
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateLead.mutate({ id: lead.id, status: "won" })}
                              className="text-green-400"
                            >
                              Mark Won
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateLead.mutate({ id: lead.id, status: "lost" })}
                              className="text-red-400"
                            >
                              Mark Lost
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </CommandCenterLayout>
  );
}
