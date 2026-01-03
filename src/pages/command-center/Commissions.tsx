import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import {
  useCrmCommissions,
  useApproveCommission,
  useMarkCommissionPaid,
  useCommissionStats,
} from "@/hooks/useCrmCommissions";
import { useCrmEmployees } from "@/hooks/useCrmEmployees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  Clock,
  CheckCircle,
  CreditCard,
  Filter,
  MoreHorizontal,
  Check,
  Banknote,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type CommissionStatus = Database["public"]["Enums"]["commission_status"];

const statusColors: Record<CommissionStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  approved: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  paid: "bg-green-500/20 text-green-400 border-green-500/50",
  queued: "bg-purple-500/20 text-purple-400 border-purple-500/50",
};

const statusLabels: Record<CommissionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
  queued: "Queued",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CommandCenterCommissions() {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get("status") as CommissionStatus | null;
  const employeeFilter = searchParams.get("employee");

  const { data: commissions, isLoading } = useCrmCommissions({
    status: statusFilter || undefined,
    employeeId: employeeFilter || undefined,
  });
  const { data: employees } = useCrmEmployees();
  const { data: stats } = useCommissionStats();
  const approveCommission = useApproveCommission();
  const markPaid = useMarkCommissionPaid();

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Commissions</h1>
          <p className="text-zinc-400">Manage employee commission approvals and payouts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">
                    {formatCurrency(stats?.total || 0)}
                  </div>
                  <div className="text-xs text-zinc-400">Total Commission</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(stats?.pending || 0)}
                  </div>
                  <div className="text-xs text-zinc-400">Pending Approval</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(stats?.approved || 0)}
                  </div>
                  <div className="text-xs text-zinc-400">Approved (Unpaid)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(stats?.paid || 0)}
                  </div>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={employeeFilter || "all"}
                onValueChange={(v) => {
                  if (v === "all") {
                    searchParams.delete("employee");
                  } else {
                    searchParams.set("employee", v);
                  }
                  setSearchParams(searchParams);
                }}
              >
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

        {/* Commissions Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Commission Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Employee</TableHead>
                  <TableHead className="text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-400">Revenue Event</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Created</TableHead>
                  <TableHead className="text-zinc-400">Approved By</TableHead>
                  <TableHead className="text-zinc-400 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                      Loading commissions...
                    </TableCell>
                  </TableRow>
                ) : commissions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                      No commissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions?.map((comm) => (
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
                        {comm.created_at
                          ? format(new Date(comm.created_at), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {comm.approved_by_profile
                          ? `${comm.approved_by_profile.first_name} ${comm.approved_by_profile.last_name}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-zinc-400 hover:text-zinc-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-zinc-800 border-zinc-700"
                          >
                            {comm.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => approveCommission.mutate(comm.id)}
                                className="text-zinc-100 focus:bg-zinc-700"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {comm.status === "approved" && (
                              <DropdownMenuItem
                                onClick={() => markPaid.mutate(comm.id)}
                                className="text-zinc-100 focus:bg-zinc-700"
                              >
                                <Banknote className="h-4 w-4 mr-2" />
                                Mark Paid
                              </DropdownMenuItem>
                            )}
                            {comm.status === "paid" && (
                              <DropdownMenuItem
                                disabled
                                className="text-zinc-500"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Already Paid
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
          </CardContent>
        </Card>

        {/* Per-Employee Totals */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Commission by Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees?.map((emp) => {
                const empCommissions = commissions?.filter(
                  (c) => c.employee_id === emp.id
                );
                const total = empCommissions?.reduce(
                  (s, c) => s + Number(c.amount),
                  0
                ) || 0;
                const pending = empCommissions
                  ?.filter((c) => c.status === "pending")
                  .reduce((s, c) => s + Number(c.amount), 0) || 0;
                const paid = empCommissions
                  ?.filter((c) => c.status === "paid")
                  .reduce((s, c) => s + Number(c.amount), 0) || 0;

                if (total === 0) return null;

                return (
                  <div
                    key={emp.id}
                    className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-zinc-100">
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div className="text-lg font-bold text-amber-500">
                        {formatCurrency(total)}
                      </div>
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
      </div>
    </CommandCenterLayout>
  );
}
