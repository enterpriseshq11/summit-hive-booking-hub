import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useAuditLog } from "@/hooks/useAuditLog";
import { format } from "date-fns";
import { Shield, Loader2, Search, Filter, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ENTITY_TYPES = [
  "booking", "resource", "package", "addon", "pricing_rule", "blackout_date",
  "document_template", "review", "lead", "waitlist_entry", "user_role", "payment"
];

const ACTION_TYPES = [
  "create", "update", "delete", "toggle_active", "status_change", "approve",
  "deny", "assign_role", "revoke_role", "respond", "send_offer", "claim"
];

export default function AdminAuditLog() {
  const [filters, setFilters] = useState({
    entityType: "",
    actionType: "",
    startDate: "",
    endDate: "",
    limit: 100,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const { data: auditLogs, isLoading } = useAuditLog({
    entityType: filters.entityType || undefined,
    actionType: filters.actionType || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    limit: filters.limit,
  });

  const getActionBadgeVariant = (action: string) => {
    if (action === "create") return "default";
    if (action === "delete" || action === "revoke_role") return "destructive";
    if (action === "approve" || action === "assign_role") return "outline";
    return "secondary";
  };

  const formatJson = (json: any) => {
    if (!json) return "—";
    try {
      return JSON.stringify(json, null, 2);
    } catch {
      return String(json);
    }
  };

  const openDetails = (entry: any) => {
    setSelectedEntry(entry);
    setShowDetails(entry.id);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Audit Log
            </h1>
            <p className="text-muted-foreground">
              View system activity and privileged action history
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </div>

        {/* Filters */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <Label>Entity Type</Label>
                    <Select value={filters.entityType} onValueChange={(v) => setFilters({ ...filters, entityType: v === "all" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="All entities" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Entities</SelectItem>
                        {ENTITY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Action Type</Label>
                    <Select value={filters.actionType} onValueChange={(v) => setFilters({ ...filters, actionType: v === "all" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="All actions" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        {ACTION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>From Date</Label>
                    <Input 
                      type="date" 
                      value={filters.startDate} 
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} 
                    />
                  </div>
                  <div>
                    <Label>To Date</Label>
                    <Input 
                      type="date" 
                      value={filters.endDate} 
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} 
                    />
                  </div>
                  <div>
                    <Label>Limit</Label>
                    <Select value={filters.limit.toString()} onValueChange={(v) => setFilters({ ...filters, limit: parseInt(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="250">250</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditLogs?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Creates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {auditLogs?.filter((l) => l.action_type === "create").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {auditLogs?.filter((l) => l.action_type === "update").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Deletes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {auditLogs?.filter((l) => l.action_type === "delete").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs?.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(entry.created_at), "MMM d, yyyy")}</div>
                        <div className="text-muted-foreground">{format(new Date(entry.created_at), "h:mm:ss a")}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {(entry as any).profiles ? (
                          <>
                            <div>{(entry as any).profiles.first_name} {(entry as any).profiles.last_name}</div>
                            <div className="text-muted-foreground">{(entry as any).profiles.email}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(entry.action_type)}>
                        {entry.action_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{entry.entity_type}</div>
                        {entry.entity_id && (
                          <div className="text-muted-foreground font-mono text-xs truncate max-w-[120px]">
                            {entry.entity_id}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDetails(entry)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!auditLogs || auditLogs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No audit log entries
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Audit Log Entry</DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Timestamp</Label>
                    <div>{format(new Date(selectedEntry.created_at), "PPpp")}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Action</Label>
                    <Badge variant={getActionBadgeVariant(selectedEntry.action_type)}>
                      {selectedEntry.action_type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Entity Type</Label>
                    <div>{selectedEntry.entity_type}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Entity ID</Label>
                    <div className="font-mono text-sm">{selectedEntry.entity_id || "—"}</div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Actor</Label>
                  <div>
                    {(selectedEntry as any).profiles 
                      ? `${(selectedEntry as any).profiles.first_name} ${(selectedEntry as any).profiles.last_name} (${(selectedEntry as any).profiles.email})`
                      : "System"}
                  </div>
                </div>

                {selectedEntry.ip_address && (
                  <div>
                    <Label className="text-muted-foreground">IP Address</Label>
                    <div className="font-mono text-sm">{selectedEntry.ip_address}</div>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Before</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto max-h-40">
                    {formatJson(selectedEntry.before_json)}
                  </pre>
                </div>

                <div>
                  <Label className="text-muted-foreground">After</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto max-h-40">
                    {formatJson(selectedEntry.after_json)}
                  </pre>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowDetails(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
