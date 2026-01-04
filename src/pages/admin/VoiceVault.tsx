import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Mic,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  XCircle,
  Lock,
  Unlock,
  Download,
  Search,
  RefreshCw,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type PaymentStatus = "pending" | "active_payment" | "paused_payment" | "paid_in_full" | "defaulted";
type ContentStatus = "not_applicable" | "recording_in_progress" | "editing_in_progress" | "payment_active" | "paid_in_full" | "rights_released";

interface HourlyBooking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_amount: number;
  payment_status: PaymentStatus;
  internal_notes: string | null;
  created_at: string;
}

interface PackageOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product_type: "core_series" | "white_glove";
  payment_plan: "full" | "weekly";
  package_price: number;
  paid_amount: number;
  balance_remaining: number;
  next_payment_date: string | null;
  payment_status: PaymentStatus;
  content_status: ContentStatus;
  rights_released_at: string | null;
  rights_released_by: string | null;
  internal_notes: string | null;
  created_at: string;
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  active_payment: { label: "Active", icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/30" },
  paused_payment: { label: "Paused", icon: PauseCircle, className: "bg-orange-500/10 text-orange-500 border-orange-500/30" },
  paid_in_full: { label: "Paid in Full", icon: CheckCircle2, className: "bg-accent/10 text-accent border-accent/30" },
  defaulted: { label: "Defaulted", icon: XCircle, className: "bg-red-500/10 text-red-500 border-red-500/30" },
};

const contentStatusConfig: Record<ContentStatus, { label: string; icon: typeof Lock }> = {
  not_applicable: { label: "N/A", icon: FileText },
  recording_in_progress: { label: "Recording", icon: Mic },
  editing_in_progress: { label: "Editing", icon: Clock },
  payment_active: { label: "Payment Active", icon: Clock },
  paid_in_full: { label: "Paid - Awaiting Release", icon: Lock },
  rights_released: { label: "Rights Released", icon: Unlock },
};

export default function VoiceVaultAdmin() {
  const [hourlyBookings, setHourlyBookings] = useState<HourlyBooking[]>([]);
  const [packageOrders, setPackageOrders] = useState<PackageOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageOrder | null>(null);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, packagesRes] = await Promise.all([
        supabase
          .from("voice_vault_bookings")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("voice_vault_packages")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (packagesRes.error) throw packagesRes.error;

      setHourlyBookings(bookingsRes.data as unknown as HourlyBooking[]);
      setPackageOrders(packagesRes.data as unknown as PackageOrder[]);
    } catch (err) {
      toast.error("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReleaseRights = async () => {
    if (!selectedPackage) return;
    
    if (selectedPackage.payment_status !== "paid_in_full") {
      toast.error("Cannot release rights - payment not complete");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("voice_vault_packages")
        .update({
          content_status: "rights_released" as ContentStatus,
          rights_released_at: new Date().toISOString(),
          rights_released_by: userData.user?.id,
        })
        .eq("id", selectedPackage.id);

      if (error) throw error;

      toast.success("Rights released successfully! Customer will be notified.");
      setReleaseModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to release rights");
      console.error(err);
    }
  };

  const handleUpdateContentStatus = async (status: ContentStatus) => {
    if (!selectedPackage) return;

    // Prevent reversing rights_released
    if (selectedPackage.content_status === "rights_released") {
      toast.error("Cannot modify status after rights have been released");
      return;
    }

    try {
      const { error } = await supabase
        .from("voice_vault_packages")
        .update({ content_status: status })
        .eq("id", selectedPackage.id);

      if (error) throw error;

      toast.success("Status updated");
      setStatusModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedPackage) return;

    try {
      const { error } = await supabase
        .from("voice_vault_packages")
        .update({ internal_notes: selectedNotes })
        .eq("id", selectedPackage.id);

      if (error) throw error;

      toast.success("Notes saved");
      setNotesModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save notes");
      console.error(err);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Product", "Payment Plan", "Total", "Paid", "Balance", "Payment Status", "Content Status", "Created"];
    const rows = packageOrders.map(p => [
      p.customer_name,
      p.customer_email,
      p.product_type,
      p.payment_plan,
      p.package_price,
      p.paid_amount,
      p.balance_remaining,
      p.payment_status,
      p.content_status,
      p.created_at,
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice-vault-packages-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const filteredPackages = packageOrders.filter(p =>
    p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = hourlyBookings.filter(b =>
    b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Mic className="w-8 h-8 text-accent" />
              Voice Vault Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage bookings, packages, payments, and content rights
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Packages</div>
              <div className="text-2xl font-bold text-foreground">{packageOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Active Payments</div>
              <div className="text-2xl font-bold text-green-500">
                {packageOrders.filter(p => p.payment_status === "active_payment").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Paid in Full</div>
              <div className="text-2xl font-bold text-accent">
                {packageOrders.filter(p => p.payment_status === "paid_in_full").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Rights Released</div>
              <div className="text-2xl font-bold text-foreground">
                {packageOrders.filter(p => p.content_status === "rights_released").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="packages">
          <TabsList>
            <TabsTrigger value="packages" className="gap-2">
              <Package className="w-4 h-4" />
              Packages ({packageOrders.length})
            </TabsTrigger>
            <TabsTrigger value="hourly" className="gap-2">
              <Clock className="w-4 h-4" />
              Hourly ({hourlyBookings.length})
            </TabsTrigger>
          </TabsList>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Content Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPackages.map((pkg) => {
                      const paymentConfig = paymentStatusConfig[pkg.payment_status];
                      const contentConfig = contentStatusConfig[pkg.content_status];
                      const PaymentIcon = paymentConfig.icon;
                      const ContentIcon = contentConfig.icon;

                      return (
                        <TableRow key={pkg.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{pkg.customer_name}</div>
                              <div className="text-sm text-muted-foreground">{pkg.customer_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">
                                {pkg.product_type === "core_series" ? "Core Series" : "White Glove"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {pkg.payment_plan === "weekly" ? "Weekly" : "Full"} • ${pkg.package_price}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={paymentConfig.className}>
                              <PaymentIcon className="w-3 h-3 mr-1" />
                              {paymentConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">${pkg.paid_amount}</div>
                              <div className="text-sm text-muted-foreground">
                                ${pkg.balance_remaining} remaining
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => {
                                setSelectedPackage(pkg);
                                setStatusModalOpen(true);
                              }}
                              className="text-left"
                              disabled={pkg.content_status === "rights_released"}
                            >
                              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                                <ContentIcon className="w-3 h-3 mr-1" />
                                {contentConfig.label}
                              </Badge>
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPackage(pkg);
                                  setSelectedNotes(pkg.internal_notes || "");
                                  setNotesModalOpen(true);
                                }}
                              >
                                Notes
                              </Button>
                              {pkg.payment_status === "paid_in_full" && pkg.content_status !== "rights_released" && (
                                <Button
                                  size="sm"
                                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                  onClick={() => {
                                    setSelectedPackage(pkg);
                                    setReleaseModalOpen(true);
                                  }}
                                >
                                  <Unlock className="w-4 h-4 mr-1" />
                                  Release Rights
                                </Button>
                              )}
                              {pkg.content_status === "rights_released" && (
                                <Badge className="bg-accent/20 text-accent border-accent/30">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Released
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredPackages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No packages found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hourly Tab */}
          <TabsContent value="hourly">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const paymentConfig = paymentStatusConfig[booking.payment_status];
                      const PaymentIcon = paymentConfig.icon;

                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{booking.customer_name}</div>
                              <div className="text-sm text-muted-foreground">{booking.customer_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{booking.booking_date}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.start_time} - {booking.end_time}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {booking.duration_hours} hours
                          </TableCell>
                          <TableCell>
                            ${booking.total_amount}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={paymentConfig.className}>
                              <PaymentIcon className="w-3 h-3 mr-1" />
                              {paymentConfig.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredBookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Release Rights Modal */}
      <Dialog open={releaseModalOpen} onOpenChange={setReleaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-accent" />
              Release Content Rights
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium text-foreground">{selectedPackage.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{selectedPackage.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium text-foreground">
                    {selectedPackage.product_type === "core_series" ? "Core Series" : "White Glove"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="font-medium text-accent">Paid in Full</span>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <strong>By clicking "Release Rights", you confirm:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Full payment has been received and verified</li>
                  <li>• Content ownership will transfer to the customer</li>
                  <li>• Customer will be notified via email</li>
                  <li>• This action cannot be reversed</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReleaseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleReleaseRights}
            >
              <Unlock className="w-4 h-4 mr-2" />
              Release Rights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Status Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Content Status</DialogTitle>
            <DialogDescription>
              Track the progress of this customer's content.
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && selectedPackage.content_status !== "rights_released" && (
            <div className="space-y-4">
              <Label>Current Status: {contentStatusConfig[selectedPackage.content_status].label}</Label>
              <Select
                defaultValue={selectedPackage.content_status}
                onValueChange={(v) => handleUpdateContentStatus(v as ContentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_applicable">N/A</SelectItem>
                  <SelectItem value="recording_in_progress">Recording in Progress</SelectItem>
                  <SelectItem value="editing_in_progress">Editing in Progress</SelectItem>
                  <SelectItem value="payment_active">Payment Active</SelectItem>
                  <SelectItem value="paid_in_full">Paid - Awaiting Release</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: Rights can only be released from the "Paid in Full" status.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notes Modal */}
      <Dialog open={notesModalOpen} onOpenChange={setNotesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Internal Notes</DialogTitle>
            <DialogDescription>
              Add notes about this customer (visible to staff only).
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={selectedNotes}
            onChange={(e) => setSelectedNotes(e.target.value)}
            placeholder="Enter internal notes..."
            rows={5}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
