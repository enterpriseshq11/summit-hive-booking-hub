import { useState } from "react";
import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayrollRuns, useCreatePayrollRun, useLockPayrollRun, useApprovePayrollRun, useMarkPayrollPaid, usePayrollRunCommissions } from "@/hooks/usePayrollRuns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek } from "date-fns";
import { Plus, Lock, CheckCircle, DollarSign, Download, FileJson, Eye } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  locked: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function Payroll() {
  const [activeTab, setActiveTab] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [periodStart, setPeriodStart] = useState(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return format(monday, "yyyy-MM-dd");
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return format(addDays(monday, 13), "yyyy-MM-dd");
  });

  const { toast } = useToast();
  const { data: payrollRuns = [], isLoading } = usePayrollRuns(activeTab === "all" ? undefined : activeTab);
  const { data: runCommissions = [] } = usePayrollRunCommissions(selectedRunId || "");
  const createMutation = useCreatePayrollRun();
  const lockMutation = useLockPayrollRun();
  const approveMutation = useApprovePayrollRun();
  const markPaidMutation = useMarkPayrollPaid();

  const handleCreate = () => {
    createMutation.mutate({ period_start: periodStart, period_end: periodEnd });
    setCreateOpen(false);
  };

  const handleExport = async (runId: string, format: "csv" | "json") => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("export-payroll", {
        body: { payroll_run_id: runId, format },
      });

      if (response.error) throw response.error;

      // Create download
      const blob = new Blob(
        [format === "json" ? JSON.stringify(response.data, null, 2) : response.data],
        { type: format === "json" ? "application/json" : "text/csv" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: `Exported as ${format.toUpperCase()}` });
    } catch (error: any) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    }
  };

  const openDetail = (runId: string) => {
    setSelectedRunId(runId);
    setDetailOpen(true);
  };

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payroll</h1>
            <p className="text-muted-foreground">Manage bi-weekly payroll runs and commission payouts</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Payroll Run
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Payroll Run</DialogTitle>
                <DialogDescription>Define the bi-weekly period for this payroll run.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="period_start">Period Start</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="period_end">Period End</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Runs</CardTitle>
                <CardDescription>
                  {activeTab === "all" ? "All payroll runs" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} payroll runs`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : payrollRuns.length === 0 ? (
                  <p className="text-muted-foreground">No payroll runs found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Commissions</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollRuns.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">
                            {format(new Date(run.period_start), "MMM d")} – {format(new Date(run.period_end), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[run.status]}>{run.status}</Badge>
                          </TableCell>
                          <TableCell>{run.commission_count}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${Number(run.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openDetail(run.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {run.status === "draft" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => lockMutation.mutate(run.id)}
                                  disabled={lockMutation.isPending}
                                >
                                  <Lock className="h-4 w-4 mr-1" />
                                  Lock
                                </Button>
                              )}
                              {run.status === "locked" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => approveMutation.mutate(run.id)}
                                  disabled={approveMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              )}
                              {run.status === "approved" && (
                                <Button
                                  size="sm"
                                  onClick={() => markPaidMutation.mutate(run.id)}
                                  disabled={markPaidMutation.isPending}
                                >
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                              {(run.status === "approved" || run.status === "paid") && (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => handleExport(run.id, "csv")}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleExport(run.id, "json")}>
                                    <FileJson className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payroll Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payroll Run Details</DialogTitle>
              <DialogDescription>Commission breakdown for this payroll period</DialogDescription>
            </DialogHeader>
            {runCommissions.length === 0 ? (
              <p className="text-muted-foreground py-4">No commissions in this payroll run.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Business Unit</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runCommissions.map((comm: any) => (
                    <TableRow key={comm.id}>
                      <TableCell>
                        {comm.employee?.first_name} {comm.employee?.last_name}
                      </TableCell>
                      <TableCell>${Number(comm.revenue_event?.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{comm.revenue_event?.business_unit}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(comm.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[comm.status] || ""}>{comm.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CommandCenterLayout>
  );
}
