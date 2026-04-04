import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CreditCard, ExternalLink, MapPin, Search } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

const BUSINESS_UNITS = [
  { value: "spa", label: "Spa" },
  { value: "fitness", label: "Fitness" },
  { value: "coworking", label: "Coworking" },
  { value: "summit", label: "Summit" },
  { value: "photo_booth", label: "360 Photo Booth" },
  { value: "voice_vault", label: "Voice Vault" },
  { value: "elevated_by_elyse", label: "Elevated by Elyse" },
];

function formatCurrency(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function StripeTransactions() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [mapTxn, setMapTxn] = useState<any>(null);
  const [mapUnit, setMapUnit] = useState("spa");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["stripe_transactions", dateFrom, dateTo, unitFilter, statusFilter, showDuplicates],
    queryFn: async () => {
      let query = (supabase as any)
        .from("stripe_transactions")
        .select("*")
        .gte("created_at", dateFrom + "T00:00:00")
        .lte("created_at", dateTo + "T23:59:59")
        .order("created_at", { ascending: false })
        .limit(500);

      if (unitFilter !== "all") query = query.eq("business_unit", unitFilter);
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (!showDuplicates) query = query.or("is_duplicate.is.null,is_duplicate.eq.false");

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const mapMutation = useMutation({
    mutationFn: async ({ txnId, businessUnit }: { txnId: string; businessUnit: string }) => {
      // Update transaction
      await (supabase as any).from("stripe_transactions")
        .update({ business_unit: businessUnit })
        .eq("id", txnId);

      // If no revenue event exists, create one
      const { data: txn } = await (supabase as any).from("stripe_transactions")
        .select("*").eq("id", txnId).single();

      if (txn && !txn.revenue_event_id) {
        const { data: rev } = await supabase.from("crm_revenue_events").insert({
          amount: txn.amount / 100,
          business_unit: businessUnit as any,
          description: `Stripe Payment ending ${txn.stripe_payment_intent_id.slice(-6)}`,
          is_manual: false,
          payment_method: txn.payment_method_type,
          recorded_by: authUser?.id || "00000000-0000-0000-0000-000000000000",
          revenue_date: txn.stripe_created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        }).select("id").single();

        if (rev) {
          await (supabase as any).from("stripe_transactions")
            .update({ revenue_event_id: rev.id })
            .eq("id", txnId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripe_transactions"] });
      toast.success("Transaction mapped and revenue created");
      setMapDialogOpen(false);
      setMapTxn(null);
    },
    onError: () => toast.error("Failed to map transaction"),
  });

  // Fetch raw webhook payload for detail panel
  const { data: webhookPayload } = useQuery({
    queryKey: ["stripe_webhook_payload", selectedTxn?.stripe_payment_intent_id],
    queryFn: async () => {
      if (!selectedTxn?.stripe_payment_intent_id) return null;
      const { data } = await (supabase as any)
        .from("stripe_webhook_events")
        .select("payload")
        .ilike("payload", `%${selectedTxn.stripe_payment_intent_id}%`)
        .order("received_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.payload || null;
    },
    enabled: !!selectedTxn,
  });

  const openDetail = (txn: any) => {
    setSelectedTxn(txn);
    setDetailOpen(true);
  };

  const openMap = (txn: any) => {
    setMapTxn(txn);
    setMapUnit(txn.business_unit || "spa");
    setMapDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Stripe Transactions</h1>
          <p className="text-zinc-400">All Stripe payment activity synced in real time</p>
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Label className="text-zinc-400 text-xs">From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 w-40" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 w-40" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Business Unit</Label>
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Units</SelectItem>
                    {BUSINESS_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showDuplicates} onCheckedChange={setShowDuplicates} />
                <Label className="text-zinc-400 text-xs">Show Duplicates</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-400">Business Unit</TableHead>
                  <TableHead className="text-zinc-400">Payment Method</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Payment Intent</TableHead>
                  <TableHead className="text-zinc-400">Revenue Created</TableHead>
                  <TableHead className="text-zinc-400">Dup</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-zinc-500">Loading...</TableCell>
                  </TableRow>
                ) : !transactions?.length ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-zinc-500">
                      No transactions found for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((txn: any) => (
                    <TableRow key={txn.id} className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer"
                      onClick={() => openDetail(txn)}>
                      <TableCell className="text-zinc-300">
                        {txn.stripe_created_at ? format(new Date(txn.stripe_created_at), "MMM d, yyyy h:mm a") : "—"}
                      </TableCell>
                      <TableCell className="text-zinc-100 font-medium">{formatCurrency(txn.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-zinc-700 text-zinc-300 capitalize">
                          {txn.business_unit || "unmapped"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300 capitalize">{txn.payment_method_type || "—"}</TableCell>
                      <TableCell>
                        <Badge className={txn.status === "succeeded" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 font-mono text-xs">
                        ...{txn.stripe_payment_intent_id?.slice(-8)}
                      </TableCell>
                      <TableCell>
                        {txn.revenue_event_id ? (
                          <Badge className="bg-green-500/20 text-green-400">Yes</Badge>
                        ) : (
                          <Badge className="bg-zinc-700 text-zinc-400">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {txn.is_duplicate && (
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {!txn.revenue_event_id && (
                          <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 text-xs"
                            onClick={() => openMap(txn)}>
                            <MapPin className="h-3 w-3 mr-1" /> Map
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Sheet */}
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent className="bg-zinc-900 border-zinc-800 w-[500px] sm:w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-zinc-100">Transaction Detail</SheetTitle>
            </SheetHeader>
            {selectedTxn && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-500 text-xs">Amount</Label>
                    <p className="text-zinc-100 font-bold text-lg">{formatCurrency(selectedTxn.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs">Status</Label>
                    <p className="text-zinc-100 capitalize">{selectedTxn.status}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs">Business Unit</Label>
                    <p className="text-zinc-100 capitalize">{selectedTxn.business_unit || "Unmapped"}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs">Payment Method</Label>
                    <p className="text-zinc-100 capitalize">{selectedTxn.payment_method_type || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs">Customer Email</Label>
                    <p className="text-zinc-100">{selectedTxn.customer_email || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs">Customer Name</Label>
                    <p className="text-zinc-100">{selectedTxn.customer_name || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-zinc-500 text-xs">Payment Intent ID</Label>
                    <p className="text-zinc-100 font-mono text-sm break-all">{selectedTxn.stripe_payment_intent_id}</p>
                  </div>
                </div>
                {selectedTxn.metadata && Object.keys(selectedTxn.metadata).length > 0 && (
                  <div>
                    <Label className="text-zinc-500 text-xs">Stripe Metadata</Label>
                    <pre className="bg-zinc-800 rounded p-3 text-zinc-300 text-xs overflow-auto max-h-40 mt-1">
                      {JSON.stringify(selectedTxn.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                {webhookPayload && (
                  <div>
                    <Label className="text-zinc-500 text-xs">Raw Webhook Payload</Label>
                    <pre className="bg-zinc-800 rounded p-3 text-zinc-300 text-xs overflow-auto max-h-64 mt-1">
                      {JSON.stringify(webhookPayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Map Dialog */}
        <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">Manually Map Transaction</DialogTitle>
            </DialogHeader>
            {mapTxn && (
              <div className="space-y-4 mt-2">
                <p className="text-zinc-400 text-sm">
                  Assign a business unit to payment <span className="font-mono text-zinc-300">...{mapTxn.stripe_payment_intent_id?.slice(-8)}</span> for <span className="text-zinc-100 font-medium">{formatCurrency(mapTxn.amount)}</span>
                </p>
                <div>
                  <Label className="text-zinc-300">Business Unit</Label>
                  <Select value={mapUnit} onValueChange={setMapUnit}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {BUSINESS_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" className="border-zinc-700" onClick={() => setMapDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black"
                    onClick={() => mapMutation.mutate({ txnId: mapTxn.id, businessUnit: mapUnit })}
                    disabled={mapMutation.isPending}>
                    Save & Create Revenue
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
