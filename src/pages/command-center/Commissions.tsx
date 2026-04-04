import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import {
  useCrmCommissions,
  useApproveCommission,
  useMarkCommissionPaid,
  useCommissionStats,
} from "@/hooks/useCrmCommissions";
import { useCrmEmployees } from "@/hooks/useCrmEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, Clock, CheckCircle, CreditCard, Filter, MoreHorizontal,
  Check, Banknote, XCircle, RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type CommissionStatus = Database["public"]["Enums"]["commission_status"];

const statusColors: Record<CommissionStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  approved: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  paid: "bg-green-500/20 text-green-400 border-green-500/50",
  queued: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  rejected: "bg-red-500/20 text-red-400 border-red-500/50",
};

const statusLabels: Record<CommissionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
  queued: "Queued",
  rejected: "Rejected",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export default function CommandCenterCommissions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Reopen confirm state
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false);
  const [reopenTarget, setReopenTarget] = useState<any>(null);

  const statusFilter = searchParams.get("status") as CommissionStatus | null;
  const employeeFilter = searchParams.get("employee");

  const { data: commissions, isLoading } = useCrmCommissions({
    status: statusFilter || undefined,
    employeeId: employeeFilter || undefined,
  });
  const { data: rejectedCommissions } = useCrmCommissions({ status: "rejected" as CommissionStatus });
  const { data: employees } = useCrmEmployees();
  const { data: stats } = useCommissionStats();
  const approveCommission = useApproveCommission();
  const markPaid = useMarkCommissionPaid();

  const rejectMutation = useMutation({
    mutationFn: async ({ commissionId, reason }: { commissionId: string; reason: string }) => {
      const userName = `${authUser?.profile?.first_name || ""} ${authUser?.profile?.last_name || ""}`.trim();

      const { data, error } = await supabase
        .from("crm_commissions")
        .update({
          status: "rejected" as any,
          rejection_reason: reason,
          rejected_by: authUser?.id,
          rejected_at: new Date().toISOString(),
        } as any)
        .eq("id", commissionId)
        .select(`*, employee:profiles!crm_commissions_employee_id_fkey(first_name, last_name)`)
        .single();
      if (error) throw error;

      const empName = `${(data as any).employee?.first_name || ""} ${(data as any).employee?.last_name || ""}`.trim();
      await supabase.from("crm_activity_events").insert({
        event_type: "status_change" as any,
        actor_id: authUser?.id,
        entity_type: "commission",
        entity_id: commissionId,
        event_category: "commission_rejected",
        entity_name: empName,
        metadata: {
          action: "commission_rejected",
          reason,
          rejected_by_name: userName,
          description: `${userName} rejected commission for ${empName} — Reason: ${reason}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_commissions"] });
      queryClient.invalidateQueries({ queryKey: ["crm_commission_stats"] });
      toast.success("Commission rejected");
      setRejectModalOpen(false);
      setRejectTarget(null);
      setRejectReason("");
    },
    onError: (err: Error) => toast.error("Failed to reject: " + err.message),
  });

  const reopenMutation = useMutation({
    mutationFn: async (commissionId: string) => {
      const userName = `${authUser?.profile?.first_name || ""} ${authUser?.profile?.last_name || ""}`.trim();

      const { data, error } = await supabase
        .from("crm_commissions")
        .update({
          status: "pending" as any,
          rejection_reason: null,
          rejected_by: null,
          rejected_at: null,
        } as any)
        .eq("id", commissionId)
        .select(`*, employee:profiles!crm_commissions_employee_id_fkey(first_name, last_name)`)
        .single();
      if (error) throw error;

      const empName = `${(data as any).employee?.first_name || ""} ${(data as any).employee?.last_name || ""}`.trim();
      await supabase.from("crm_activity_events").insert({
        event_type: "status_change" as any,
        actor_id: authUser?.id,
        entity_type: "commission",
        entity_id: commissionId,
        event_category: "commission_approved",
        entity_name: empName,
        metadata: {
          action: "commission_reopened",
          reopened_by_name: userName,
          description: `${userName} reopened commission for ${empName} — returned to Pending Approval`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_commissions"] });
      queryClient.invalidateQueries({ queryKey: ["crm_commission_stats"] });
      toast.success("Commission reopened — moved to Pending Approval");
      setReopenConfirmOpen(false);
      setReopenTarget(null);
    },
    onError: (err: Error) => toast.error("Failed to reopen: " + err.message),
  });

  const openReject = (comm: any) => {
    setRejectTarget(comm);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const openReopen = (comm: any) => {
    setReopenTarget(comm);
    setReopenConfirmOpen(true);
  };

  const activeCommissions = (commissions || []).filter(c => c.status !== "rejected");

  const renderTable = (data: any[], showRejectedCols?: boolean) => (
    <Table>
      <TableHeader>
        <TableRow className="border-zinc-800 hover:bg-transparent">
          <TableHead className="text-zinc-400">Employee</TableHead>
          <TableHead className="text-zinc-400">Amount</TableHead>
          <TableHead className="text-zinc-400">Revenue Event</TableHead>
          <TableHead className="text-zinc-400">Status</TableHead>
          <TableHead className="text-zinc-400">{showRejectedCols ? "Rejected At" : "Created"}</TableHead>
          <TableHead className="text-zinc-400">{showRejectedCols ? "Rejection Reason" : "Approved By"}</TableHead>
          <TableHead className="text-zinc-400 w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
              No commissions found
            </TableCell>
          </TableRow>
        ) : (
          data.map((comm) => (
            <TableRow key={comm.id} className="border-zinc-800 hover:bg-zinc-800/50">
              <TableCell>
                <div className="font-medium text-zinc-100">
                  {comm.employee?.first_name} {comm.employee?.last_name}
                </div>
                <div className="text-xs text-zinc-500">{comm.employee?.email}</div>
              </TableCell>
              <TableCell className="text-zinc-100 font-bold">
                {formatCurrency(Number(comm.amount))}
              </TableCell>
              <TableCell>
                <div className="text-zinc-300">
                  {formatCurrency(Number(comm.revenue_event?.amount || 0))}
                </div>
                <div className="text-xs text-zinc-500 capitalize">
                  {comm.revenue_event?.business_unit}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={cn(statusColors[comm.status || "pending"])}>
                  {statusLabels[comm.status || "pending"]}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-400 text-sm">
                {showRejectedCols
                  ? (comm.rejected_at ? format(new Date(comm.rejected_at), "MMM d, yyyy h:mm a") : "—")
                  : (comm.created_at ? format(new Date(comm.created_at), "MMM d, yyyy") : "—")}
              </TableCell>
              <TableCell className="text-zinc-400 text-sm max-w-[200px]">
                {showRejectedCols
                  ? <span className="text-red-400 text-xs">{comm.rejection_reason || "—"}</span>
                  : (comm.approved_by_profile
                    ? `${comm.approved_by_profile.first_name} ${comm.approved_by_profile.last_name}`
                    : "—")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                    {comm.status === "pending" && (
                      <>
                        <DropdownMenuItem onClick={() => approveCommission.mutate(comm.id)} className="text-zinc-100 focus:bg-zinc-700">
                          <Check className="h-4 w-4 mr-2" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openReject(comm)} className="text-red-400 focus:bg-zinc-700">
                          <XCircle className="h-4 w-4 mr-2" /> Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {comm.status === "approved" && (
                      <DropdownMenuItem onClick={() => markPaid.mutate(comm.id)} className="text-zinc-100 focus:bg-zinc-700">
                        <Banknote className="h-4 w-4 mr-2" /> Mark Paid
                      </DropdownMenuItem>
                    )}
                    {comm.status === "rejected" && (
                      <DropdownMenuItem onClick={() => openReopen(comm)} className="text-amber-400 focus:bg-zinc-700">
                        <RotateCcw className="h-4 w-4 mr-2" /> Reopen
                      </DropdownMenuItem>
                    )}
                    {comm.status === "paid" && (
                      <DropdownMenuItem disabled className="text-zinc-500">
                        <CheckCircle className="h-4 w-4 mr-2" /> Already Paid
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Commissions</h1>
          <p className="text-zinc-400">Manage employee commission approvals and payouts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg"><DollarSign className="h-5 w-5 text-amber-500" /></div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">{formatCurrency(stats?.total || 0)}</div>
                  <div className="text-xs text-zinc-400">Total Commission</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg"><Clock className="h-5 w-5 text-yellow-500" /></div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{formatCurrency(stats?.pending || 0)}</div>
                  <div className="text-xs text-zinc-400">Pending Approval</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><CheckCircle className="h-5 w-5 text-blue-500" /></div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{formatCurrency(stats?.approved || 0)}</div>
                  <div className="text-xs text-zinc-400">Approved (Unpaid)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg"><CreditCard className="h-5 w-5 text-green-500" /></div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{formatCurrency(stats?.paid || 0)}</div>
                  <div className="text-xs text-zinc-400">Total Paid Out</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={statusFilter || "all"} onValueChange={(v) => {
                if (v === "all") { searchParams.delete("status"); } else { searchParams.set("status", v); }
                setSearchParams(searchParams);
              }}>
                <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-zinc-100">
                  <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={employeeFilter || "all"} onValueChange={(v) => {
                if (v === "all") { searchParams.delete("employee"); } else { searchParams.set("employee", v); }
                setSearchParams(searchParams);
              }}>
                <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Active / Rejected */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="active" className="data-[state=active]:bg-zinc-700">Active</TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-zinc-700">
              Rejected {(rejectedCommissions?.length || 0) > 0 && (
                <Badge className="ml-2 bg-red-500/20 text-red-400 text-xs">{rejectedCommissions?.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-zinc-100">Commission Records</CardTitle></CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <p className="text-zinc-500 text-center py-8">Loading commissions...</p>
                ) : renderTable(activeCommissions)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader><CardTitle className="text-zinc-100">Rejected Commissions</CardTitle></CardHeader>
              <CardContent className="p-0">
                {renderTable(rejectedCommissions || [], true)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Per-Employee Totals */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle className="text-zinc-100">Commission by Employee</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees?.map((emp) => {
                const empComms = commissions?.filter(c => c.employee_id === emp.id);
                const total = empComms?.reduce((s, c) => s + Number(c.amount), 0) || 0;
                const pending = empComms?.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0) || 0;
                const paid = empComms?.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0) || 0;
                if (total === 0) return null;
                return (
                  <div key={emp.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-zinc-100">{emp.first_name} {emp.last_name}</div>
                      <div className="text-lg font-bold text-amber-500">{formatCurrency(total)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Pending</span>
                        <span className="text-yellow-400">{formatCurrency(pending)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Paid</span>
                        <span className="text-green-400">{formatCurrency(paid)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reject Modal */}
        <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">Reject Commission</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Provide a reason for rejecting this commission. This action can be reversed.
              </DialogDescription>
            </DialogHeader>
            {rejectTarget && (
              <div className="space-y-4 mt-2">
                <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Employee</span>
                    <span className="text-zinc-100 text-sm font-medium">
                      {rejectTarget.employee?.first_name} {rejectTarget.employee?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Amount</span>
                    <span className="text-zinc-100 text-sm font-bold">{formatCurrency(Number(rejectTarget.amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Source</span>
                    <span className="text-zinc-300 text-sm capitalize">{rejectTarget.revenue_event?.business_unit || "—"}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-zinc-300">Rejection Reason <span className="text-red-400">*</span></Label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Minimum 10 characters required..."
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    rows={3}
                  />
                  <p className="text-zinc-500 text-xs mt-1">{rejectReason.length}/10 characters minimum</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="border-zinc-700" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={rejectReason.trim().length < 10 || rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate({ commissionId: rejectTarget.id, reason: rejectReason.trim() })}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject Commission
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reopen Confirm */}
        <AlertDialog open={reopenConfirmOpen} onOpenChange={setReopenConfirmOpen}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-zinc-100">Reopen Commission?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Are you sure you want to reopen this commission for review? This will move it back to Pending Approval.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-zinc-700 text-zinc-300">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-amber-500 hover:bg-amber-600 text-black"
                onClick={() => reopenTarget && reopenMutation.mutate(reopenTarget.id)}
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Reopen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}