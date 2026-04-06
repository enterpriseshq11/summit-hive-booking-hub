import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, Ban } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUSES = ["In Renovation", "Listed", "Under Contract", "Under Due Diligence", "Sold", "Canceled"];
const STATUS_COLORS: Record<string, string> = {
  "In Renovation": "bg-orange-500/20 text-orange-400",
  "Listed": "bg-blue-500/20 text-blue-400",
  "Under Contract": "bg-purple-500/20 text-purple-400",
  "Under Due Diligence": "bg-yellow-500/20 text-yellow-400",
  "Sold": "bg-green-500/20 text-green-400",
  "Canceled": "bg-red-500/20 text-red-400",
};

const VOID_REASONS = ["Entered in Error", "Duplicate Entry", "Cost Covered Separately", "Other"];

interface RenoLineItem {
  description: string;
  cost: number;
  date_added: string;
  added_by: string;
  is_voided?: boolean;
  void_reason?: string;
  voided_by?: string;
  voided_at?: string;
}

interface MobileHome {
  id: string;
  property_address: string;
  status: string;
  purchase_price: number;
  renovation_cost: number;
  renovation_line_items: RenoLineItem[];
  list_price: number | null;
  sale_price: number | null;
  gross_profit: number | null;
  date_purchased: string | null;
  date_listed: string | null;
  date_sold: string | null;
  assigned_agent: string | null;
  notes: string | null;
}

function formatCurrency(n: number | null): string {
  if (n == null) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function activeRenoCost(items: RenoLineItem[]): number {
  return (items || []).filter(li => !li.is_voided).reduce((s, l) => s + l.cost, 0);
}

export default function MobileHomesInventory() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<MobileHome | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newLineItem, setNewLineItem] = useState({ description: "", cost: "" });
  const [voidIdx, setVoidIdx] = useState<number | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidNotes, setVoidNotes] = useState("");

  const isOwner = authUser?.roles?.includes("owner");
  const userName = `${authUser?.profile?.first_name || ""} ${authUser?.profile?.last_name || ""}`.trim() || "Admin";

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["mobile-homes-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mobile_home_inventory").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as MobileHome[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<MobileHome> & { id?: string }) => {
      const payload = { ...item } as any;
      // Recalculate renovation_cost from active line items
      if (payload.renovation_line_items) {
        payload.renovation_cost = activeRenoCost(payload.renovation_line_items);
      }
      if (item.id) {
        const { error } = await supabase.from("mobile_home_inventory").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        delete payload.id;
        const { error } = await supabase.from("mobile_home_inventory").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-homes-inventory"] });
      toast.success("Saved");
      setEditItem(null);
      setShowNew(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addLineItem = () => {
    if (!editItem || !newLineItem.description || !newLineItem.cost) return;
    const lineItems = [...(editItem.renovation_line_items || []), {
      description: newLineItem.description,
      cost: parseFloat(newLineItem.cost),
      date_added: new Date().toISOString(),
      added_by: userName,
    }];
    setEditItem({ ...editItem, renovation_line_items: lineItems, renovation_cost: activeRenoCost(lineItems) });
    setNewLineItem({ description: "", cost: "" });
  };

  const voidLineItem = () => {
    if (!editItem || voidIdx === null || !voidReason) return;
    const lineItems = editItem.renovation_line_items.map((li, i) =>
      i === voidIdx ? { ...li, is_voided: true, void_reason: voidReason === "Other" ? voidNotes : voidReason, voided_by: userName, voided_at: new Date().toISOString() } : li
    );
    setEditItem({ ...editItem, renovation_line_items: lineItems, renovation_cost: activeRenoCost(lineItems) });
    setVoidIdx(null);
    setVoidReason("");
    setVoidNotes("");
    toast.success("Line item voided");
  };

  const unvoidLineItem = (idx: number) => {
    if (!editItem || !isOwner) return;
    const lineItems = editItem.renovation_line_items.map((li, i) =>
      i === idx ? { ...li, is_voided: false, void_reason: undefined, voided_by: undefined, voided_at: undefined } : li
    );
    setEditItem({ ...editItem, renovation_line_items: lineItems, renovation_cost: activeRenoCost(lineItems) });
    toast.success("Line item restored");
  };

  const totalUnits = items.length;
  const inReno = items.filter(i => i.status === "In Renovation").length;
  const listed = items.filter(i => i.status === "Listed").length;
  const underContract = items.filter(i => i.status === "Under Contract").length;
  const soldItems = items.filter(i => i.status === "Sold");
  const totalGrossProfit = soldItems.reduce((s, i) => s + (i.gross_profit || 0), 0);
  const activeItems = items.filter(i => !["Sold", "Canceled"].includes(i.status));
  const totalInvested = activeItems.reduce((s, i) => s + (i.purchase_price || 0) + activeRenoCost(i.renovation_line_items || []), 0);

  const calcGrossProfit = (item: MobileHome) => {
    if (!item.sale_price) return null;
    return item.sale_price - item.purchase_price - activeRenoCost(item.renovation_line_items || []);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Home className="h-6 w-6 text-amber-400" /> Mobile Homes — Inventory
            </h1>
          </div>
          <Button className="bg-amber-500 text-black hover:bg-amber-400" onClick={() => {
            setEditItem({
              id: "", property_address: "", status: "In Renovation", purchase_price: 0,
              renovation_cost: 0, renovation_line_items: [], list_price: null, sale_price: null,
              gross_profit: null, date_purchased: null, date_listed: null, date_sold: null,
              assigned_agent: "Mark Leugers", notes: null,
            });
            setShowNew(true);
          }}>
            <Plus className="h-4 w-4 mr-1" /> Add Property
          </Button>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-zinc-400 text-xs">Total Units</p><p className="text-2xl font-bold text-white">{totalUnits}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-zinc-400 text-xs">In Renovation</p><p className="text-2xl font-bold text-orange-400">{inReno}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-zinc-400 text-xs">Listed</p><p className="text-2xl font-bold text-blue-400">{listed}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-zinc-400 text-xs">Under Contract</p><p className="text-2xl font-bold text-purple-400">{underContract}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-zinc-400 text-xs">Sold (Gross Profit)</p><p className="text-2xl font-bold text-green-400">{formatCurrency(totalGrossProfit)}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4 text-center"><p className="text-zinc-400 text-xs">Total Invested</p><p className="text-2xl font-bold text-amber-400">{formatCurrency(totalInvested)}</p></CardContent></Card>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Address</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Purchase</TableHead>
                <TableHead className="text-zinc-400">Reno Cost</TableHead>
                <TableHead className="text-zinc-400">List Price</TableHead>
                <TableHead className="text-zinc-400">Sale Price</TableHead>
                <TableHead className="text-zinc-400">Gross Profit</TableHead>
                <TableHead className="text-zinc-400">Agent</TableHead>
                <TableHead className="text-zinc-400">Purchased</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center text-zinc-500 py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Home className="h-12 w-12 text-zinc-600 mb-3" />
                    <p className="font-semibold text-base text-zinc-200">No properties in inventory yet</p>
                    <p className="text-sm text-zinc-400 mt-1">Add your first property to track acquisition costs, renovation expenses, and sale profits.</p>
                    <Button className="mt-4 bg-amber-500 text-black hover:bg-amber-400" onClick={() => {
                      setEditItem({
                        id: "", property_address: "", status: "In Renovation", purchase_price: 0,
                        renovation_cost: 0, renovation_line_items: [], list_price: null, sale_price: null,
                        gross_profit: null, date_purchased: null, date_listed: null, date_sold: null,
                        assigned_agent: "Mark Leugers", notes: null,
                      });
                      setShowNew(true);
                    }}><Plus className="h-4 w-4 mr-2" />Add Property</Button>
                  </div>
                </TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer" onClick={() => setEditItem(item)}>
                  <TableCell className="text-white font-medium">{item.property_address}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[item.status] || ""}>{item.status}</Badge></TableCell>
                  <TableCell className="text-zinc-300">{formatCurrency(item.purchase_price)}</TableCell>
                  <TableCell className="text-zinc-300">{formatCurrency(activeRenoCost(item.renovation_line_items || []))}</TableCell>
                  <TableCell className="text-zinc-300">{formatCurrency(item.list_price)}</TableCell>
                  <TableCell className="text-zinc-300">{formatCurrency(item.sale_price)}</TableCell>
                  <TableCell className={`font-medium ${(item.gross_profit || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatCurrency(item.gross_profit)}
                  </TableCell>
                  <TableCell className="text-zinc-400">{item.assigned_agent || "—"}</TableCell>
                  <TableCell className="text-zinc-500 text-sm">{item.date_purchased ? format(new Date(item.date_purchased), "MMM d, yyyy") : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit/New Modal */}
      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) { setEditItem(null); setShowNew(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle>{showNew ? "Add Property" : "Edit Property"}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">Property Address *</Label>
                <Input value={editItem.property_address} onChange={e => setEditItem({...editItem, property_address: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Status</Label>
                  <Select value={editItem.status} onValueChange={v => setEditItem({...editItem, status: v})}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Assigned Agent</Label>
                  <Input value={editItem.assigned_agent || ""} onChange={e => setEditItem({...editItem, assigned_agent: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Mark Leugers" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Date Purchased</Label>
                  <Input type="date" value={editItem.date_purchased || ""} onChange={e => setEditItem({...editItem, date_purchased: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300">Purchase Price</Label>
                  <Input type="number" value={editItem.purchase_price || ""} onChange={e => setEditItem({...editItem, purchase_price: parseFloat(e.target.value) || 0})} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>

              {/* Renovation Line Items with Void */}
              <div className="border border-zinc-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-zinc-300 font-semibold">Renovation Costs</Label>
                  <span className="text-amber-400 font-bold">{formatCurrency(activeRenoCost(editItem.renovation_line_items || []))}</span>
                </div>
                {(editItem.renovation_line_items || []).map((li, idx) => (
                  <div key={idx} className={`flex items-center gap-2 text-sm ${li.is_voided ? "opacity-50" : ""}`}>
                    <span className={`flex-1 ${li.is_voided ? "line-through text-zinc-500" : "text-zinc-300"}`}>{li.description}</span>
                    <span className={li.is_voided ? "line-through text-zinc-600" : "text-zinc-400"}>{formatCurrency(li.cost)}</span>
                    <span className="text-zinc-600 text-xs">{li.date_added ? format(new Date(li.date_added), "M/d") : ""}</span>
                    <span className="text-zinc-600 text-xs">{li.added_by}</span>
                    {li.is_voided ? (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">Voided</Badge>
                        {isOwner && <Button variant="ghost" size="sm" className="h-6 text-xs text-green-400" onClick={() => unvoidLineItem(idx)}>Restore</Button>}
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => setVoidIdx(idx)} title="Void this item">
                        <Ban className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="Description" value={newLineItem.description} onChange={e => setNewLineItem({...newLineItem, description: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white text-sm" />
                  <Input placeholder="Cost" type="number" value={newLineItem.cost} onChange={e => setNewLineItem({...newLineItem, cost: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white text-sm w-28" />
                  <Button size="sm" variant="outline" className="border-zinc-600 text-zinc-300" onClick={addLineItem}>Add</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-zinc-300">Date Listed</Label><Input type="date" value={editItem.date_listed || ""} onChange={e => setEditItem({...editItem, date_listed: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                <div><Label className="text-zinc-300">List Price</Label><Input type="number" value={editItem.list_price || ""} onChange={e => setEditItem({...editItem, list_price: parseFloat(e.target.value) || null})} className="bg-zinc-800 border-zinc-700 text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-zinc-300">Date Sold</Label><Input type="date" value={editItem.date_sold || ""} onChange={e => setEditItem({...editItem, date_sold: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                <div><Label className="text-zinc-300">Sale Price</Label><Input type="number" value={editItem.sale_price || ""} onChange={e => setEditItem({...editItem, sale_price: parseFloat(e.target.value) || null})} className="bg-zinc-800 border-zinc-700 text-white" /></div>
              </div>

              {/* Auto-calculated Gross Profit */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Gross Profit (auto-calculated)</span>
                  <span className={`font-bold text-lg ${(calcGrossProfit(editItem) || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {editItem.sale_price ? formatCurrency(calcGrossProfit(editItem)) : "Pending sale"}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-zinc-300">Notes</Label>
                <Textarea value={editItem.notes || ""} onChange={e => setEditItem({...editItem, notes: e.target.value})} className="bg-zinc-800 border-zinc-700 text-white" rows={3} />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => { setEditItem(null); setShowNew(false); }}>Cancel</Button>
                <Button className="bg-amber-500 text-black hover:bg-amber-400" onClick={() => saveMutation.mutate(editItem)} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Void Reason Dialog */}
      <Dialog open={voidIdx !== null} onOpenChange={(open) => { if (!open) { setVoidIdx(null); setVoidReason(""); setVoidNotes(""); } }}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader><DialogTitle>Void Line Item</DialogTitle></DialogHeader>
          <p className="text-zinc-400 text-sm">This item will be struck through and excluded from the total. It cannot be un-voided without superadmin access.</p>
          <Select value={voidReason} onValueChange={setVoidReason}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Select reason..." /></SelectTrigger>
            <SelectContent>{VOID_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          {voidReason === "Other" && (
            <Textarea value={voidNotes} onChange={e => setVoidNotes(e.target.value)} placeholder="Explain why this item is being voided..." className="bg-zinc-800 border-zinc-700 text-white" rows={2} />
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => { setVoidIdx(null); setVoidReason(""); setVoidNotes(""); }}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-400 text-white" onClick={voidLineItem} disabled={!voidReason || (voidReason === "Other" && !voidNotes)}>Void Item</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}