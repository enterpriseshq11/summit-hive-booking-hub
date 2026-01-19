import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { usePackages } from "@/hooks/usePackages";
import { useAddons } from "@/hooks/useAddons";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { useBusinesses } from "@/hooks/useBusinesses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, Plus, Loader2, Edit, Trash2, ToggleLeft, ToggleRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Package as PackageType, Addon } from "@/types";

export default function AdminPackages() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: packages, isLoading: packagesLoading } = usePackages();
  const { data: addons, isLoading: addonsLoading } = useAddons();
  const { data: bookableTypes } = useBookableTypes();
  const { data: businesses } = useBusinesses();
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [showAddonDialog, setShowAddonDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Package form state
  const [packageForm, setPackageForm] = useState({
    name: "",
    slug: "",
    description: "",
    bookable_type_id: "",
    duration_mins: 60,
    base_price: 0,
    member_price: 0,
    is_active: true,
    sort_order: 0,
  });

  // Addon form state
  const [addonForm, setAddonForm] = useState({
    name: "",
    slug: "",
    description: "",
    business_id: "",
    bookable_type_id: "",
    base_price: 0,
    member_price: 0,
    pricing_mode: "flat" as "flat" | "per_hour" | "per_guest" | "time_based",
    adds_duration_mins: 0,
    max_quantity: 10,
    is_active: true,
    sort_order: 0,
  });

  const logAudit = async (actionType: string, entityType: string, entityId: string, before: any, after: any) => {
    await supabase.from("audit_log").insert({
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      actor_user_id: authUser?.id,
      before_json: before,
      after_json: after,
    });
  };

  const openPackageEdit = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description || "",
      bookable_type_id: pkg.bookable_type_id,
      duration_mins: pkg.duration_mins,
      base_price: pkg.base_price,
      member_price: pkg.member_price || 0,
      is_active: pkg.is_active ?? true,
      sort_order: pkg.sort_order || 0,
    });
    setShowPackageDialog(true);
  };

  const openAddonEdit = (addon: Addon) => {
    setEditingAddon(addon);
    setAddonForm({
      name: addon.name,
      slug: addon.slug,
      description: addon.description || "",
      business_id: addon.business_id,
      bookable_type_id: addon.bookable_type_id || "",
      base_price: addon.base_price,
      member_price: addon.member_price || 0,
      pricing_mode: addon.pricing_mode || "flat",
      adds_duration_mins: addon.adds_duration_mins || 0,
      max_quantity: addon.max_quantity || 10,
      is_active: addon.is_active ?? true,
      sort_order: addon.sort_order || 0,
    });
    setShowAddonDialog(true);
  };

  const handlePackageSave = async () => {
    if (!packageForm.name || !packageForm.bookable_type_id) {
      toast.error("Name and bookable type are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = packageForm.slug || packageForm.name.toLowerCase().replace(/\s+/g, "-");
      const payload = { ...packageForm, slug };

      if (editingPackage) {
        const { error } = await supabase
          .from("packages")
          .update(payload)
          .eq("id", editingPackage.id);
        if (error) throw error;
        await logAudit("update", "package", editingPackage.id, editingPackage, payload);
        toast.success("Package updated");
      } else {
        const { data, error } = await supabase
          .from("packages")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        await logAudit("create", "package", data.id, null, payload);
        toast.success("Package created");
      }

      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setShowPackageDialog(false);
      setEditingPackage(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddonSave = async () => {
    if (!addonForm.name || !addonForm.business_id) {
      toast.error("Name and business are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = addonForm.slug || addonForm.name.toLowerCase().replace(/\s+/g, "-");
      const payload = { 
        ...addonForm, 
        slug,
        bookable_type_id: addonForm.bookable_type_id || null,
      };

      if (editingAddon) {
        const { error } = await supabase
          .from("addons")
          .update(payload)
          .eq("id", editingAddon.id);
        if (error) throw error;
        await logAudit("update", "addon", editingAddon.id, editingAddon, payload);
        toast.success("Add-on updated");
      } else {
        const { data, error } = await supabase
          .from("addons")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        await logAudit("create", "addon", data.id, null, payload);
        toast.success("Add-on created");
      }

      queryClient.invalidateQueries({ queryKey: ["addons"] });
      setShowAddonDialog(false);
      setEditingAddon(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePackageDelete = async (pkg: PackageType) => {
    if (!confirm(`Delete package "${pkg.name}"?`)) return;
    
    try {
      const { error } = await supabase.from("packages").delete().eq("id", pkg.id);
      if (error) throw error;
      await logAudit("delete", "package", pkg.id, pkg, null);
      toast.success("Package deleted");
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddonDelete = async (addon: Addon) => {
    if (!confirm(`Delete add-on "${addon.name}"?`)) return;
    
    try {
      const { error } = await supabase.from("addons").delete().eq("id", addon.id);
      if (error) throw error;
      await logAudit("delete", "addon", addon.id, addon, null);
      toast.success("Add-on deleted");
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePackageActive = async (pkg: PackageType) => {
    try {
      const newState = !pkg.is_active;
      const { error } = await supabase
        .from("packages")
        .update({ is_active: newState })
        .eq("id", pkg.id);
      if (error) throw error;
      await logAudit("toggle_active", "package", pkg.id, { is_active: pkg.is_active }, { is_active: newState });
      toast.success(`Package ${newState ? "activated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleAddonActive = async (addon: Addon) => {
    try {
      const newState = !addon.is_active;
      const { error } = await supabase
        .from("addons")
        .update({ is_active: newState })
        .eq("id", addon.id);
      if (error) throw error;
      await logAudit("toggle_active", "addon", addon.id, { is_active: addon.is_active }, { is_active: newState });
      toast.success(`Add-on ${newState ? "activated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getBookableTypeName = (id: string) => {
    return bookableTypes?.find((bt) => bt.id === id)?.name || "Unknown";
  };

  const getBusinessName = (id: string) => {
    return businesses?.find((b) => b.id === id)?.name || "Unknown";
  };

  if (packagesLoading || addonsLoading) {
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
              <Package className="h-6 w-6" />
              Packages & Add-ons
            </h1>
            <p className="text-zinc-300">
              Configure service packages and optional add-ons
            </p>
          </div>
        </div>

        <Tabs defaultValue="packages">
          <TabsList>
            <TabsTrigger value="packages">Packages ({packages?.length || 0})</TabsTrigger>
            <TabsTrigger value="addons">Add-ons ({addons?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingPackage(null); setPackageForm({ name: "", slug: "", description: "", bookable_type_id: "", duration_mins: 60, base_price: 0, member_price: 0, is_active: true, sort_order: 0 }); setShowPackageDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages?.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{pkg.name}</div>
                            {pkg.description && (
                              <div className="text-sm text-zinc-400 truncate max-w-xs">
                                {pkg.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getBookableTypeName(pkg.bookable_type_id)}</TableCell>
                        <TableCell>{pkg.duration_mins} min</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-white">
                            <DollarSign className="h-3 w-3" />
                            {pkg.base_price}
                            {pkg.member_price && pkg.member_price !== pkg.base_price && (
                              <span className="text-xs text-zinc-400">
                                (${pkg.member_price} member)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={pkg.is_active ? "default" : "secondary"}>
                            {pkg.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => togglePackageActive(pkg)}>
                              {pkg.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openPackageEdit(pkg)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handlePackageDelete(pkg)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!packages || packages.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No packages configured
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addons" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingAddon(null); setAddonForm({ name: "", slug: "", description: "", business_id: "", bookable_type_id: "", base_price: 0, member_price: 0, pricing_mode: "flat", adds_duration_mins: 0, max_quantity: 10, is_active: true, sort_order: 0 }); setShowAddonDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Add-on
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Add-on</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addons?.map((addon) => (
                      <TableRow key={addon.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{addon.name}</div>
                            {addon.description && (
                              <div className="text-sm text-zinc-400 truncate max-w-xs">
                                {addon.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getBusinessName(addon.business_id)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-white">
                            <DollarSign className="h-3 w-3" />
                            {addon.base_price}
                            <span className="text-xs text-zinc-400">
                              ({addon.pricing_mode})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={addon.is_active ? "default" : "secondary"}>
                            {addon.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => toggleAddonActive(addon)}>
                              {addon.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openAddonEdit(addon)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleAddonDelete(addon)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!addons || addons.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No add-ons configured
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Package Dialog */}
        <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit Package" : "Add Package"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={packageForm.description} onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })} />
              </div>
              <div>
                <Label>Service Type *</Label>
                <Select value={packageForm.bookable_type_id} onValueChange={(v) => setPackageForm({ ...packageForm, bookable_type_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {bookableTypes?.map((bt) => (
                      <SelectItem key={bt.id} value={bt.id}>{bt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (mins)</Label>
                  <Input type="number" value={packageForm.duration_mins} onChange={(e) => setPackageForm({ ...packageForm, duration_mins: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={packageForm.sort_order} onChange={(e) => setPackageForm({ ...packageForm, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Price</Label>
                  <Input type="number" step="0.01" value={packageForm.base_price} onChange={(e) => setPackageForm({ ...packageForm, base_price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Member Price</Label>
                  <Input type="number" step="0.01" value={packageForm.member_price} onChange={(e) => setPackageForm({ ...packageForm, member_price: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPackageDialog(false)}>Cancel</Button>
              <Button onClick={handlePackageSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Addon Dialog */}
        <Dialog open={showAddonDialog} onOpenChange={setShowAddonDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAddon ? "Edit Add-on" : "Add Add-on"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input value={addonForm.name} onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={addonForm.description} onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })} />
              </div>
              <div>
                <Label>Business *</Label>
                <Select value={addonForm.business_id} onValueChange={(v) => setAddonForm({ ...addonForm, business_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select business" /></SelectTrigger>
                  <SelectContent>
                    {businesses?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pricing Mode</Label>
                <Select value={addonForm.pricing_mode} onValueChange={(v: any) => setAddonForm({ ...addonForm, pricing_mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Rate</SelectItem>
                    <SelectItem value="per_hour">Per Hour</SelectItem>
                    <SelectItem value="per_guest">Per Guest</SelectItem>
                    <SelectItem value="time_based">Time Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Price</Label>
                  <Input type="number" step="0.01" value={addonForm.base_price} onChange={(e) => setAddonForm({ ...addonForm, base_price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Member Price</Label>
                  <Input type="number" step="0.01" value={addonForm.member_price} onChange={(e) => setAddonForm({ ...addonForm, member_price: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Adds Duration (mins)</Label>
                  <Input type="number" value={addonForm.adds_duration_mins} onChange={(e) => setAddonForm({ ...addonForm, adds_duration_mins: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Max Quantity</Label>
                  <Input type="number" value={addonForm.max_quantity} onChange={(e) => setAddonForm({ ...addonForm, max_quantity: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddonDialog(false)}>Cancel</Button>
              <Button onClick={handleAddonSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
