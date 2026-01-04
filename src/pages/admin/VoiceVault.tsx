import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Activity,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

// Stripe mode indicator - Change this when going live
const STRIPE_MODE: "TEST" | "LIVE" = "TEST";

// Webhook URL for Stripe registration
const WEBHOOK_URL = "https://epozsuimlqdeqquiryok.supabase.co/functions/v1/voice-vault-webhook";

type PaymentStatus = "pending" | "active_payment" | "paused_payment" | "paid_in_full" | "defaulted" | "canceled";
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

interface WebhookEvent {
  id: string;
  event_type: string;
  stripe_event_id: string | null;
  record_id: string | null;
  record_type: string | null;
  result: string | null;
  result_details: string | null;
  created_at: string;
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  active_payment: { label: "Active", icon: CheckCircle2, className: "bg-green-500/10 text-green-500 border-green-500/30" },
  paused_payment: { label: "Paused", icon: PauseCircle, className: "bg-orange-500/10 text-orange-500 border-orange-500/30" },
  paid_in_full: { label: "Paid in Full", icon: CheckCircle2, className: "bg-accent/10 text-accent border-accent/30" },
  defaulted: { label: "Defaulted", icon: XCircle, className: "bg-red-500/10 text-red-500 border-red-500/30" },
  canceled: { label: "Canceled", icon: XCircle, className: "bg-muted text-muted-foreground border-muted-foreground/30" },
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
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageOrder | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<HourlyBooking | null>(null);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [markPaidModalOpen, setMarkPaidModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [cancelBookingModalOpen, setCancelBookingModalOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [webhookUrlCopied, setWebhookUrlCopied] = useState(false);

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setWebhookUrlCopied(true);
    toast.success("Webhook URL copied to clipboard");
    setTimeout(() => setWebhookUrlCopied(false), 2000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, packagesRes, webhooksRes] = await Promise.all([
        supabase
          .from("voice_vault_bookings")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("voice_vault_packages")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("voice_vault_webhook_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (packagesRes.error) throw packagesRes.error;
      // Webhooks might not exist yet, don't throw
      
      setHourlyBookings(bookingsRes.data as unknown as HourlyBooking[]);
      setPackageOrders(packagesRes.data as unknown as PackageOrder[]);
      setWebhookEvents((webhooksRes.data || []) as unknown as WebhookEvent[]);
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

  // Admin-only "Mark Paid in Full" with audit log
  const handleMarkPaidInFull = async () => {
    if (!selectedPackage) return;
    
    // Only allow if not already paid_in_full
    if (selectedPackage.payment_status === "paid_in_full") {
      toast.error("Already marked as paid in full");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData.user?.id;
      const adminEmail = userData.user?.email;
      
      // Update package to paid_in_full
      const { error: updateError } = await supabase
        .from("voice_vault_packages")
        .update({
          payment_status: "paid_in_full",
          content_status: "paid_in_full",
          paid_amount: selectedPackage.package_price,
          balance_remaining: 0,
        } as Record<string, unknown>)
        .eq("id", selectedPackage.id);

      if (updateError) throw updateError;

      // Log to audit_log table for tracking
      const { error: auditError } = await supabase
        .from("audit_log")
        .insert({
          action_type: "mark_paid_in_full",
          entity_type: "voice_vault_package",
          entity_id: selectedPackage.id,
          actor_user_id: adminId,
          before_json: {
            payment_status: selectedPackage.payment_status,
            paid_amount: selectedPackage.paid_amount,
            balance_remaining: selectedPackage.balance_remaining,
          },
          after_json: {
            payment_status: "paid_in_full",
            paid_amount: selectedPackage.package_price,
            balance_remaining: 0,
            marked_by: adminEmail,
          },
        });

      if (auditError) {
        console.error("Audit log error:", auditError);
        // Don't throw - the main action succeeded
      }

      toast.success("Package marked as Paid in Full. Audit log recorded.");
      setMarkPaidModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to mark as paid");
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

  // Cancel pending hourly booking with audit log
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    if (selectedBooking.payment_status !== "pending") {
      toast.error("Only pending bookings can be canceled");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData.user?.id;
      const adminEmail = userData.user?.email;
      const canceledAt = new Date().toISOString();
      
      // Update booking to canceled
      const { error: updateError } = await supabase
        .from("voice_vault_bookings")
        .update({
          payment_status: "canceled",
          canceled_at: canceledAt,
        } as Record<string, unknown>)
        .eq("id", selectedBooking.id);

      if (updateError) throw updateError;

      // Log to audit_log table
      const { error: auditError } = await supabase
        .from("audit_log")
        .insert({
          action_type: "cancel_booking",
          entity_type: "voice_vault_booking",
          entity_id: selectedBooking.id,
          actor_user_id: adminId,
          before_json: {
            payment_status: selectedBooking.payment_status,
            customer_email: selectedBooking.customer_email,
            booking_date: selectedBooking.booking_date,
            start_time: selectedBooking.start_time,
          },
          after_json: {
            payment_status: "canceled",
            canceled_at: canceledAt,
            canceled_by: adminEmail,
          },
        });

      if (auditError) {
        console.error("Audit log error:", auditError);
      }

      toast.success("Booking canceled. Audit log recorded.");
      setCancelBookingModalOpen(false);
      setSelectedBooking(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to cancel booking");
      console.error(err);
    }
  };

  // Auto-cleanup stale pending bookings (older than 30 minutes)
  const handleCleanupStaleBookings = async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      // Find stale pending bookings
      const { data: staleBookings, error: fetchError } = await supabase
        .from("voice_vault_bookings")
        .select("id, customer_email, booking_date, start_time, created_at")
        .eq("payment_status", "pending")
        .lt("created_at", thirtyMinutesAgo);

      if (fetchError) throw fetchError;

      if (!staleBookings || staleBookings.length === 0) {
        toast.info("No stale pending bookings to cleanup");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData.user?.id;
      const adminEmail = userData.user?.email;
      const canceledAt = new Date().toISOString();

      // Update all stale bookings to canceled
      const { error: updateError } = await supabase
        .from("voice_vault_bookings")
        .update({
          payment_status: "canceled",
          canceled_at: canceledAt,
        } as Record<string, unknown>)
        .eq("payment_status", "pending")
        .lt("created_at", thirtyMinutesAgo);

      if (updateError) throw updateError;

      // Log each cancellation to audit log
      for (const booking of staleBookings) {
        await supabase
          .from("audit_log")
          .insert({
            action_type: "auto_cancel_stale_booking",
            entity_type: "voice_vault_booking",
            entity_id: booking.id,
            actor_user_id: adminId,
            before_json: {
              payment_status: "pending",
              customer_email: booking.customer_email,
              booking_date: booking.booking_date,
              created_at: booking.created_at,
            },
            after_json: {
              payment_status: "canceled",
              canceled_at: canceledAt,
              reason: "Auto-canceled: pending > 30 minutes",
              canceled_by: adminEmail,
            },
          });
      }

      toast.success(`Cleaned up ${staleBookings.length} stale booking(s)`);
      fetchData();
    } catch (err) {
      toast.error("Failed to cleanup stale bookings");
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
        {/* Stripe Mode Indicator */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Alert className={`flex-1 ${STRIPE_MODE === "TEST" ? "border-yellow-500/50 bg-yellow-500/10" : "border-green-500/50 bg-green-500/10"}`}>
            <AlertTriangle className={`h-4 w-4 ${STRIPE_MODE === "TEST" ? "text-yellow-500" : "text-green-500"}`} />
            <AlertTitle className={STRIPE_MODE === "TEST" ? "text-yellow-500" : "text-green-500"}>
              Stripe Mode: {STRIPE_MODE}
            </AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {STRIPE_MODE === "TEST" 
                ? "Using Stripe TEST keys. All transactions are simulated."
                : "Using Stripe LIVE keys. Transactions are real."}
            </AlertDescription>
          </Alert>
          
          {/* Webhook URL Copy */}
          <Alert className="border-accent/30 bg-accent/5">
            <Activity className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent">Webhook URL</AlertTitle>
            <AlertDescription className="text-muted-foreground flex items-center gap-2 mt-1">
              <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px] sm:max-w-none">
                {WEBHOOK_URL}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyWebhookUrl}
                className="shrink-0 h-7 px-2"
              >
                {webhookUrlCopied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </AlertDescription>
          </Alert>
        </div>

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
            <TabsTrigger value="webhooks" className="gap-2">
              <Activity className="w-4 h-4" />
              Webhook Logs ({webhookEvents.length})
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
                            <div className="flex gap-2 justify-end flex-wrap">
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
                              {/* Mark Paid in Full button - only for non-paid packages */}
                              {pkg.payment_status !== "paid_in_full" && pkg.payment_status !== "canceled" && pkg.payment_status !== "defaulted" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                                  onClick={() => {
                                    setSelectedPackage(pkg);
                                    setMarkPaidModalOpen(true);
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Mark Paid
                                </Button>
                              )}
                              {/* Release Rights button - only when paid_in_full and not yet released */}
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
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Hourly Bookings</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCleanupStaleBookings}
                    className="text-orange-500 border-orange-500/50 hover:bg-orange-500/10"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Cleanup Stale Pending
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell className="text-right">
                            {booking.payment_status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelBookingModalOpen(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredBookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhook Logs Tab */}
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5" />
                  Webhook Event Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Record</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(event.created_at), "MMM d, HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {event.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {event.record_type && (
                            <span className="text-sm">
                              {event.record_type}
                              {event.record_id && (
                                <span className="text-muted-foreground ml-1 font-mono text-xs">
                                  ({event.record_id.slice(0, 8)}...)
                                </span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={event.result === "success" 
                              ? "bg-green-500/10 text-green-500 border-green-500/30" 
                              : "bg-red-500/10 text-red-500 border-red-500/30"
                            }
                          >
                            {event.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {event.result_details}
                        </TableCell>
                      </TableRow>
                    ))}
                    {webhookEvents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No webhook events recorded yet
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

      {/* Mark Paid in Full Modal */}
      <Dialog open={markPaidModalOpen} onOpenChange={setMarkPaidModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Mark as Paid in Full
            </DialogTitle>
            <DialogDescription>
              This action will mark the package as fully paid and is recorded in the audit log.
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
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium text-foreground">
                    {selectedPackage.product_type === "core_series" ? "Core Series" : "White Glove"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status</span>
                  <span className="font-medium text-foreground">{paymentStatusConfig[selectedPackage.payment_status].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package Price</span>
                  <span className="font-medium text-foreground">${selectedPackage.package_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currently Paid</span>
                  <span className="font-medium text-foreground">${selectedPackage.paid_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance Remaining</span>
                  <span className="font-medium text-orange-500">${selectedPackage.balance_remaining}</span>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <strong>⚠️ Admin Override:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• This will set paid_amount to ${selectedPackage.package_price}</li>
                  <li>• Balance will be set to $0</li>
                  <li>• Payment status will change to "Paid in Full"</li>
                  <li>• This action is recorded in the audit log</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMarkPaidModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleMarkPaidInFull}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Mark as Paid
            </Button>
          </DialogFooter>
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

      {/* Cancel Booking Modal */}
      <Dialog open={cancelBookingModalOpen} onOpenChange={setCancelBookingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription>
              This action will cancel the pending booking and is recorded in the audit log.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium text-foreground">{selectedBooking.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{selectedBooking.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{selectedBooking.booking_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">
                    {selectedBooking.start_time} - {selectedBooking.end_time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">${selectedBooking.total_amount}</span>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <strong>Warning:</strong> Canceling this booking will:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Mark the booking as canceled</li>
                  <li>• Free up the time slot for other bookings</li>
                  <li>• Record this action in the audit log</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelBookingModalOpen(false)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
