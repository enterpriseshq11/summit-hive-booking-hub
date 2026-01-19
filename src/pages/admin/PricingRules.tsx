import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { usePricingRules } from "@/hooks/usePricingRules";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { useBusinesses } from "@/hooks/useBusinesses";
import { usePackages } from "@/hooks/usePackages";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DollarSign, Plus, Loader2, Edit, Trash2, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PricingRule } from "@/types";

const RULE_TYPES = [
  { value: "peak_hours", label: "Peak Hours" },
  { value: "off_peak", label: "Off-Peak" },
  { value: "weekend", label: "Weekend" },
  { value: "holiday", label: "Holiday" },
  { value: "early_bird", label: "Early Bird" },
  { value: "last_minute", label: "Last Minute" },
  { value: "group_discount", label: "Group Discount" },
  { value: "member_discount", label: "Member Discount" },
  { value: "seasonal", label: "Seasonal" },
];

export default function AdminPricingRules() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: rules, isLoading } = usePricingRules();
  const { data: bookableTypes } = useBookableTypes();
  const { data: businesses } = useBusinesses();
  const { data: packages } = usePackages();
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    business_id: "",
    bookable_type_id: "",
    package_id: "",
    rule_type: "peak_hours",
    modifier_type: "percentage" as "percentage" | "fixed_amount",
    modifier_value: 0,
    priority: 100,
    conditions: {} as Record<string, any>,
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  const [previewBase, setPreviewBase] = useState(100);

  const logAudit = async (actionType: string, entityId: string, before: any, after: any) => {
    await supabase.from("audit_log").insert({
      action_type: actionType,
      entity_type: "pricing_rule",
      entity_id: entityId,
      actor_user_id: authUser?.id,
      before_json: before,
      after_json: after,
    });
  };

  const openEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      description: rule.description || "",
      business_id: rule.business_id,
      bookable_type_id: rule.bookable_type_id || "",
      package_id: rule.package_id || "",
      rule_type: rule.rule_type,
      modifier_type: rule.modifier_type,
      modifier_value: rule.modifier_value,
      priority: rule.priority || 100,
      conditions: (rule.conditions as Record<string, any>) || {},
      valid_from: rule.valid_from || "",
      valid_until: rule.valid_until || "",
      is_active: rule.is_active ?? true,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.business_id) {
      toast.error("Name and business are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        bookable_type_id: form.bookable_type_id || null,
        package_id: form.package_id || null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
      };

      if (editingRule) {
        const { error } = await supabase
          .from("pricing_rules")
          .update(payload)
          .eq("id", editingRule.id);
        if (error) throw error;
        await logAudit("update", editingRule.id, editingRule, payload);
        toast.success("Pricing rule updated");
      } else {
        const { data, error } = await supabase
          .from("pricing_rules")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        await logAudit("create", data.id, null, payload);
        toast.success("Pricing rule created");
      }

      queryClient.invalidateQueries({ queryKey: ["pricing_rules"] });
      setShowDialog(false);
      setEditingRule(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rule: PricingRule) => {
    if (!confirm(`Delete pricing rule "${rule.name}"?`)) return;
    
    try {
      const { error } = await supabase.from("pricing_rules").delete().eq("id", rule.id);
      if (error) throw error;
      await logAudit("delete", rule.id, rule, null);
      toast.success("Pricing rule deleted");
      queryClient.invalidateQueries({ queryKey: ["pricing_rules"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleActive = async (rule: PricingRule) => {
    try {
      const newState = !rule.is_active;
      const { error } = await supabase
        .from("pricing_rules")
        .update({ is_active: newState })
        .eq("id", rule.id);
      if (error) throw error;
      await logAudit("toggle_active", rule.id, { is_active: rule.is_active }, { is_active: newState });
      toast.success(`Rule ${newState ? "activated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: ["pricing_rules"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const adjustPriority = async (rule: PricingRule, delta: number) => {
    try {
      const newPriority = (rule.priority || 100) + delta;
      const { error } = await supabase
        .from("pricing_rules")
        .update({ priority: newPriority })
        .eq("id", rule.id);
      if (error) throw error;
      await logAudit("priority_change", rule.id, { priority: rule.priority }, { priority: newPriority });
      queryClient.invalidateQueries({ queryKey: ["pricing_rules"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const calculatePreviewPrice = () => {
    if (!rules || rules.length === 0) return previewBase;
    
    // Sort by priority (higher priority = applied later = wins)
    const activeRules = rules
      .filter((r) => r.is_active)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));

    let finalPrice = previewBase;
    for (const rule of activeRules) {
      if (rule.modifier_type === "percentage") {
        finalPrice = finalPrice * (1 + rule.modifier_value / 100);
      } else {
        finalPrice = finalPrice + rule.modifier_value;
      }
    }
    return Math.round(finalPrice * 100) / 100;
  };

  const getBusinessName = (id: string) => businesses?.find((b) => b.id === id)?.name || "Unknown";
  const getRuleTypeLabel = (type: string) => RULE_TYPES.find((t) => t.value === type)?.label || type;

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
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <DollarSign className="h-6 w-6" />
              Pricing Rules
            </h1>
            <p className="text-zinc-300">
              Configure dynamic pricing, discounts, and modifiers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Price
            </Button>
            <Button onClick={() => { setEditingRule(null); setForm({ name: "", description: "", business_id: "", bookable_type_id: "", package_id: "", rule_type: "peak_hours", modifier_type: "percentage", modifier_value: 0, priority: 100, conditions: {}, valid_from: "", valid_until: "", is_active: true }); setShowDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Modifier</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules?.sort((a, b) => (b.priority || 0) - (a.priority || 0)).map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm">{rule.priority || 0}</span>
                        <div className="flex flex-col">
                          <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => adjustPriority(rule, 10)}>
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => adjustPriority(rule, -10)}>
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{rule.name}</div>
                        <div className="text-sm text-zinc-400">{getBusinessName(rule.business_id)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRuleTypeLabel(rule.rule_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={rule.modifier_value >= 0 ? "text-destructive" : "text-green-600"}>
                        {rule.modifier_value >= 0 ? "+" : ""}
                        {rule.modifier_type === "percentage" 
                          ? `${rule.modifier_value}%` 
                          : `$${rule.modifier_value}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      {rule.valid_from || rule.valid_until ? (
                        <div className="text-xs text-zinc-300">
                          {rule.valid_from && <div>From: {new Date(rule.valid_from).toLocaleDateString()}</div>}
                          {rule.valid_until && <div>Until: {new Date(rule.valid_until).toLocaleDateString()}</div>}
                        </div>
                      ) : (
                        <span className="text-zinc-400">Always</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(rule)}>
                          {rule.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rule)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!rules || rules.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No pricing rules configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRule ? "Edit Pricing Rule" : "Add Pricing Rule"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Business *</Label>
                <Select value={form.business_id} onValueChange={(v) => setForm({ ...form, business_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select business" /></SelectTrigger>
                  <SelectContent>
                    {businesses?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rule Type</Label>
                <Select value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Modifier Type</Label>
                  <Select value={form.modifier_type} onValueChange={(v: any) => setForm({ ...form, modifier_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Modifier Value</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={form.modifier_value} 
                    onChange={(e) => setForm({ ...form, modifier_value: parseFloat(e.target.value) || 0 })} 
                    placeholder="e.g., 15 for +15% or -10 for -$10"
                  />
                </div>
              </div>
              <div>
                <Label>Priority (higher = applied later, wins conflicts)</Label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valid From</Label>
                  <Input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Price Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Price Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Base Price</Label>
                <Input type="number" value={previewBase} onChange={(e) => setPreviewBase(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Final Price (after all active rules):</div>
                <div className="text-3xl font-bold">${calculatePreviewPrice()}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Rules are applied in priority order (lowest first). Higher priority rules win conflicts.
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowPreview(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
