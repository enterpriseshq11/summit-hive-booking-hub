import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  useFitnessMemberships,
  useFitnessMembershipStats,
  useCreateFitnessMembership,
  useUpdateMembershipStatus,
  type FitnessMembership,
} from "@/hooks/useFitnessMemberships";
import { format } from "date-fns";
import { Plus, Users, DollarSign, AlertTriangle, UserMinus, Eye, Pause, XCircle, Play } from "lucide-react";

const MEMBERSHIP_TYPES = [
  "Monthly Standard",
  "Monthly Premium",
  "Day Pass",
  "Personal Training Package",
];

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: "bg-green-500 text-white", label: "Active" },
  paused: { color: "bg-muted text-muted-foreground", label: "Paused" },
  cancelled: { color: "bg-destructive text-destructive-foreground", label: "Cancelled" },
  payment_failed: { color: "bg-yellow-500 text-white", label: "Payment Failed" },
};

export default function FitnessMemberships() {
  const { data: members = [], isLoading } = useFitnessMemberships();
  const { data: stats } = useFitnessMembershipStats();
  const createMutation = useCreateFitnessMembership();
  const statusMutation = useUpdateMembershipStatus();

  const [createOpen, setCreateOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<FitnessMembership | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "pause" | "cancel" | "resume";
    member: FitnessMembership;
  } | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    membership_type: "Monthly Standard",
    monthly_amount: "49.99",
    start_date: format(new Date(), "yyyy-MM-dd"),
  });

  const handleCreate = () => {
    createMutation.mutate(
      {
        ...form,
        monthly_amount: parseFloat(form.monthly_amount),
      },
      { onSuccess: () => { setCreateOpen(false); resetForm(); } }
    );
  };

  const resetForm = () =>
    setForm({
      first_name: "", last_name: "", email: "", phone: "",
      membership_type: "Monthly Standard", monthly_amount: "49.99",
      start_date: format(new Date(), "yyyy-MM-dd"),
    });

  const handleStatusAction = () => {
    if (!confirmAction) return;
    const { type, member } = confirmAction;
    const statusMap = { pause: "paused", cancel: "cancelled", resume: "active" };
    statusMutation.mutate(
      {
        id: member.id,
        status: statusMap[type],
        stripeAction: type,
        subscriptionId: member.stripe_subscription_id,
      },
      { onSuccess: () => { setConfirmAction(null); setDetailMember(null); } }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fitness Memberships</h1>
            <p className="text-muted-foreground">Manage A-Z Total Fitness members and billing</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Add Member
          </Button>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" /><span className="text-sm">Active Members</span>
              </div>
              <p className="text-2xl font-bold">{stats?.totalActive ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" /><span className="text-sm">Monthly Recurring</span>
              </div>
              <p className="text-2xl font-bold">${(stats?.mrr ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <AlertTriangle className="h-4 w-4" /><span className="text-sm">Payment Failed</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats?.paymentFailed ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <UserMinus className="h-4 w-4" /><span className="text-sm">Cancelled This Month</span>
              </div>
              <p className="text-2xl font-bold">{stats?.cancelledThisMonth ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader><CardTitle>Members</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : members.length === 0 ? (
              <p className="text-muted-foreground">No members yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.first_name} {m.last_name}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>{m.membership_type}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig[m.status]?.color || ""}>
                          {statusConfig[m.status]?.label || m.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${Number(m.monthly_amount).toFixed(2)}</TableCell>
                      <TableCell>{m.next_billing_date ? format(new Date(m.next_billing_date), "MMM d, yyyy") : "—"}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => setDetailMember(m)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Member</DialogTitle>
              <DialogDescription>Create a new fitness membership with Stripe billing.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name *</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
                <div><Label>Last Name *</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
              </div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Membership Type</Label>
                <Select value={form.membership_type} onValueChange={(v) => setForm({ ...form, membership_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Monthly Amount ($)</Label><Input type="number" step="0.01" value={form.monthly_amount} onChange={(e) => setForm({ ...form, monthly_amount: e.target.value })} /></div>
                <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending || !form.first_name || !form.last_name || !form.email}>
                {createMutation.isPending ? "Creating..." : "Create Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Sheet */}
        <Sheet open={!!detailMember} onOpenChange={() => setDetailMember(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {detailMember && (
              <>
                <SheetHeader>
                  <SheetTitle>{detailMember.first_name} {detailMember.last_name}</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-muted-foreground">Email</Label><p>{detailMember.email}</p></div>
                    <div><Label className="text-muted-foreground">Phone</Label><p>{detailMember.phone || "—"}</p></div>
                    <div><Label className="text-muted-foreground">Type</Label><p>{detailMember.membership_type}</p></div>
                    <div><Label className="text-muted-foreground">Monthly Amount</Label><p>${Number(detailMember.monthly_amount).toFixed(2)}</p></div>
                    <div><Label className="text-muted-foreground">Start Date</Label><p>{format(new Date(detailMember.start_date), "MMM d, yyyy")}</p></div>
                    <div><Label className="text-muted-foreground">Next Billing</Label><p>{detailMember.next_billing_date ? format(new Date(detailMember.next_billing_date), "MMM d, yyyy") : "—"}</p></div>
                    <div><Label className="text-muted-foreground">Status</Label>
                      <Badge className={statusConfig[detailMember.status]?.color || ""}>{statusConfig[detailMember.status]?.label || detailMember.status}</Badge>
                    </div>
                    <div><Label className="text-muted-foreground">Stripe Customer</Label><p className="text-xs font-mono">{detailMember.stripe_customer_id || "—"}</p></div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    {detailMember.status === "active" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setConfirmAction({ type: "pause", member: detailMember })}>
                          <Pause className="h-4 w-4 mr-1" />Pause
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setConfirmAction({ type: "cancel", member: detailMember })}>
                          <XCircle className="h-4 w-4 mr-1" />Cancel
                        </Button>
                      </>
                    )}
                    {(detailMember.status === "paused" || detailMember.status === "payment_failed") && (
                      <Button size="sm" onClick={() => setConfirmAction({ type: "resume", member: detailMember })}>
                        <Play className="h-4 w-4 mr-1" />Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Confirm Action Dialog */}
        <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction?.type === "cancel" ? "Cancel Membership" :
                 confirmAction?.type === "pause" ? "Pause Membership" : "Reactivate Membership"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction?.type === "cancel"
                  ? "Are you sure you want to cancel this membership? This cannot be undone."
                  : confirmAction?.type === "pause"
                  ? "This will pause billing for this member. They can be reactivated later."
                  : "This will resume billing and reactivate the membership."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStatusAction} disabled={statusMutation.isPending}>
                {statusMutation.isPending ? "Processing..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
