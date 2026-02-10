import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Sparkles, AlertTriangle } from "lucide-react";
import {
  useAllSpecials,
  useCreateSpecial,
  useUpdateSpecial,
  useDeleteSpecial,
  getSpecialStatus,
  type Special,
  type SpecialInsert,
} from "@/hooks/useSpecials";
import { cn } from "@/lib/utils";

const BUSINESS_UNITS = [
  { value: "all", label: "All" },
  { value: "summit", label: "The Summit" },
  { value: "hive", label: "The Hive" },
  { value: "restoration", label: "Restoration" },
  { value: "photo_booth_360", label: "360 Photo Booth" },
  { value: "voice_vault", label: "Voice Vault" },
] as const;

const STATUS_FILTERS = ["all", "active", "scheduled", "expired", "inactive"] as const;

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  expired: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  inactive: "bg-red-500/20 text-red-400 border-red-500/30",
};

const EMPTY_FORM: SpecialInsert = {
  business_unit: "summit",
  title: "",
  description: "",
  cta_label: "Learn More",
  cta_link: null,
  badge: null,
  priority: 0,
  always_on: true,
  start_date: null,
  end_date: null,
  is_active: true,
  action_type: "route_only",
  destination_route: null,
  promo_code: null,
  discount_type: null,
  discount_value: null,
  terms: null,
  requires_verification: false,
};

export default function AdminSpecials() {
  const [unitTab, setUnitTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<SpecialInsert & { id?: string }>(EMPTY_FORM);

  const { data: specials = [], isLoading } = useAllSpecials(unitTab);
  const createMut = useCreateSpecial();
  const updateMut = useUpdateSpecial();
  const deleteMut = useDeleteSpecial();

  // Filter by derived status
  const filtered = specials.filter((s) => {
    if (statusFilter === "all") return true;
    return getSpecialStatus(s) === statusFilter;
  });

  const openNew = () => {
    setForm({ ...EMPTY_FORM, business_unit: unitTab !== "all" ? unitTab : "summit" });
    setEditOpen(true);
  };

  const openEdit = (s: Special) => {
    setForm({
      id: s.id,
      business_unit: s.business_unit,
      title: s.title,
      description: s.description,
      cta_label: s.cta_label,
      cta_link: s.cta_link,
      badge: s.badge,
      priority: s.priority,
      always_on: s.always_on,
      start_date: s.start_date,
      end_date: s.end_date,
      is_active: s.is_active,
      action_type: s.action_type || "route_only",
      destination_route: s.destination_route,
      promo_code: s.promo_code,
      discount_type: s.discount_type,
      discount_value: s.discount_value,
      terms: s.terms,
      requires_verification: s.requires_verification,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    const { id, ...data } = form;
    if (id) {
      await updateMut.mutateAsync({ id, ...data });
    } else {
      await createMut.mutateAsync(data as SpecialInsert);
    }
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMut.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Specials</h1>
          </div>
          <Button onClick={openNew} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            <Plus className="h-4 w-4 mr-2" /> Add Special
          </Button>
        </div>

        {/* Business unit tabs */}
        <Tabs value={unitTab} onValueChange={setUnitTab}>
          <TabsList className="bg-zinc-800 border border-zinc-700">
            {BUSINESS_UNITS.map((u) => (
              <TabsTrigger key={u.value} value={u.value} className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                {u.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Status filter chips */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize",
                statusFilter === s
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Specials list */}
        {isLoading ? (
          <div className="text-zinc-400 py-8 text-center">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-zinc-500 py-12 text-center">No specials found. Click "Add Special" to create one.</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((s) => {
              const status = getSpecialStatus(s);
              const showDateWarning = !s.always_on && !s.end_date && s.is_active;
              return (
                <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{s.title}</span>
                      <Badge className={cn("text-xs capitalize", STATUS_COLORS[status])}>{status}</Badge>
                      {s.badge && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">{s.badge}</Badge>}
                      <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-600 capitalize">{BUSINESS_UNITS.find((u) => u.value === s.business_unit)?.label}</Badge>
                    </div>
                    <p className="text-sm text-zinc-400">{s.description}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                      <span>CTA: {s.cta_label}</span>
                      <span>Priority: {s.priority}</span>
                      <span className="capitalize">{s.action_type === "apply_promo" ? "🏷️ Promo" : "🔗 Route"}</span>
                      {s.promo_code && <span className="text-green-400">Code: {s.promo_code}</span>}
                      {s.destination_route && <span className="text-blue-400">→ {s.destination_route}</span>}
                      {s.always_on ? <span className="text-green-500">Always On</span> : (
                        <>
                          {s.start_date && <span>Starts: {new Date(s.start_date).toLocaleDateString()}</span>}
                          {s.end_date && <span>Ends: {new Date(s.end_date).toLocaleDateString()}</span>}
                        </>
                      )}
                      {showDateWarning && (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> No end date
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-400" onClick={() => setDeleteId(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Special" : "Add Special"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-zinc-300">Business Unit</Label>
              <Select value={form.business_unit} onValueChange={(v) => setForm({ ...form, business_unit: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {BUSINESS_UNITS.filter((u) => u.value !== "all").map((u) => (
                    <SelectItem key={u.value} value={u.value} className="text-white">{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">CTA Label</Label>
                <Input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-zinc-300">CTA Link (route or URL)</Label>
                <Input value={form.cta_link ?? ""} onChange={(e) => setForm({ ...form, cta_link: e.target.value || null })} placeholder="/promotions" className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Badge (optional)</Label>
                <Input value={form.badge ?? ""} onChange={(e) => setForm({ ...form, badge: e.target.value || null })} placeholder="New, Popular, BOGO..." className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-zinc-300">Priority (higher = first)</Label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
            </div>

            {/* Action Type */}
            <div>
              <Label className="text-zinc-300">Action Type</Label>
              <Select value={form.action_type} onValueChange={(v) => setForm({ ...form, action_type: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="route_only" className="text-white">Route Only (navigate to page)</SelectItem>
                  <SelectItem value="apply_promo" className="text-white">Apply Promo (auto-apply discount)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-zinc-300">Destination Route</Label>
              <Input value={form.destination_route ?? ""} onChange={(e) => setForm({ ...form, destination_route: e.target.value || null })} placeholder="/#/summit or /#/spa" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>

            {form.action_type === "apply_promo" && (
              <>
                <div>
                  <Label className="text-zinc-300">Promo Code</Label>
                  <Input value={form.promo_code ?? ""} onChange={(e) => setForm({ ...form, promo_code: e.target.value.toUpperCase() || null })} placeholder="BOGOMASSAGE" className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300">Discount Type</Label>
                    <Select value={form.discount_type ?? "percent"} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="percent" className="text-white">Percent</SelectItem>
                        <SelectItem value="fixed" className="text-white">Fixed ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-zinc-300">Discount Value</Label>
                    <Input type="number" value={form.discount_value ?? ""} onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || null })} placeholder="10" className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label className="text-zinc-300">Terms (optional small text)</Label>
              <Input value={form.terms ?? ""} onChange={(e) => setForm({ ...form, terms: e.target.value || null })} placeholder="Valid for first-time customers only" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.requires_verification} onCheckedChange={(v) => setForm({ ...form, requires_verification: v })} />
              <Label className="text-zinc-300">Requires Verification</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.always_on} onCheckedChange={(v) => setForm({ ...form, always_on: v })} />
              <Label className="text-zinc-300">Always On (never expires)</Label>
            </div>

            {!form.always_on && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Start Date</Label>
                  <Input type="datetime-local" value={form.start_date?.slice(0, 16) ?? ""} onChange={(e) => setForm({ ...form, start_date: e.target.value ? new Date(e.target.value).toISOString() : null })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300">End Date</Label>
                  <Input type="datetime-local" value={form.end_date?.slice(0, 16) ?? ""} onChange={(e) => setForm({ ...form, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label className="text-zinc-300">Active</Label>
            </div>

            <Button onClick={handleSave} disabled={!form.title || !form.description || createMut.isPending || updateMut.isPending} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {form.id ? "Save Changes" : "Create Special"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Special?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">This will permanently remove this special from the public site.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
