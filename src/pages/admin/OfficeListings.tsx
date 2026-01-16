import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { 
  useOfficeListings, 
  useCreateOfficeListing, 
  useUpdateOfficeListing, 
  useDeleteOfficeListing,
  type OfficeListing,
  type OfficeStatus,
  type OfficeType,
  type PricingVisibility
} from "@/hooks/useOfficeListings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Plus, Pencil, Trash2, Users, Square, Eye, EyeOff, 
  Star, Filter, ImagePlus, Tag, ArrowUpDown
} from "lucide-react";
import { Link } from "react-router-dom";

const officeTypes: { value: OfficeType; label: string }[] = [
  { value: "private_office", label: "Private Office" },
  { value: "dedicated_desk", label: "Dedicated Desk" },
  { value: "day_pass", label: "Day Pass" },
  { value: "executive_suite", label: "Executive Suite" },
];

const officeStatuses: { value: OfficeStatus; label: string; color: string }[] = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "renovating", label: "Renovating", color: "bg-yellow-500" },
  { value: "waitlist", label: "Waitlist", color: "bg-blue-500" },
  { value: "reserved", label: "Reserved", color: "bg-orange-500" },
  { value: "leased", label: "Leased", color: "bg-red-500" },
];

const pricingVisibilities: { value: PricingVisibility; label: string }[] = [
  { value: "hidden", label: "Hidden" },
  { value: "qualitative", label: "Qualitative (Range)" },
  { value: "exact", label: "Exact Price" },
];

export default function AdminOfficeListings() {
  const { data: listings, isLoading } = useOfficeListings({ activeOnly: false });
  const createListing = useCreateOfficeListing();
  const updateListing = useUpdateOfficeListing();
  const deleteListing = useDeleteOfficeListing();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<OfficeListing | null>(null);
  const [filterStatus, setFilterStatus] = useState<OfficeStatus | "all">("all");
  const [filterFloor, setFilterFloor] = useState<number | "all">("all");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    tagline: "",
    office_type: "private_office" as OfficeType,
    floor: 1,
    floor_label: "First Floor",
    square_footage: "",
    capacity: "1",
    ideal_use: "",
    amenities: "",
    status: "available" as OfficeStatus,
    status_note: "",
    monthly_rate: "",
    deposit_amount: "",
    pricing_visibility: "hidden" as PricingVisibility,
    price_range_text: "",
    is_featured: false,
    is_active: true,
    meta_title: "",
    meta_description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      tagline: "",
      office_type: "private_office",
      floor: 1,
      floor_label: "First Floor",
      square_footage: "",
      capacity: "1",
      ideal_use: "",
      amenities: "",
      status: "available",
      status_note: "",
      monthly_rate: "",
      deposit_amount: "",
      pricing_visibility: "hidden",
      price_range_text: "",
      is_featured: false,
      is_active: true,
      meta_title: "",
      meta_description: "",
    });
    setEditingListing(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (listing: OfficeListing) => {
    setEditingListing(listing);
    setFormData({
      name: listing.name,
      slug: listing.slug,
      description: listing.description || "",
      tagline: listing.tagline || "",
      office_type: listing.office_type,
      floor: listing.floor,
      floor_label: listing.floor_label || "",
      square_footage: listing.square_footage?.toString() || "",
      capacity: listing.capacity?.toString() || "1",
      ideal_use: listing.ideal_use || "",
      amenities: (listing.amenities as string[])?.join(", ") || "",
      status: listing.status,
      status_note: listing.status_note || "",
      monthly_rate: listing.monthly_rate?.toString() || "",
      deposit_amount: listing.deposit_amount?.toString() || "",
      pricing_visibility: listing.pricing_visibility,
      price_range_text: listing.price_range_text || "",
      is_featured: listing.is_featured,
      is_active: listing.is_active,
      meta_title: listing.meta_title || "",
      meta_description: listing.meta_description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const amenitiesArray = formData.amenities
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const data = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: formData.description || null,
      tagline: formData.tagline || null,
      office_type: formData.office_type,
      floor: formData.floor,
      floor_label: formData.floor_label || null,
      square_footage: formData.square_footage ? parseInt(formData.square_footage) : null,
      capacity: formData.capacity ? parseInt(formData.capacity) : 1,
      ideal_use: formData.ideal_use || null,
      amenities: amenitiesArray,
      status: formData.status,
      status_note: formData.status_note || null,
      monthly_rate: formData.monthly_rate ? parseFloat(formData.monthly_rate) : null,
      deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
      pricing_visibility: formData.pricing_visibility,
      price_range_text: formData.price_range_text || null,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
    };

    if (editingListing) {
      updateListing.mutate({ id: editingListing.id, updates: data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    } else {
      createListing.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteListing.mutate(id);
    }
  };

  const getStatusBadge = (status: OfficeStatus) => {
    const statusConfig = officeStatuses.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color} text-white`}>
        {statusConfig?.label}
      </Badge>
    );
  };

  // Filter listings
  const filteredListings = listings?.filter(listing => {
    if (filterStatus !== "all" && listing.status !== filterStatus) return false;
    if (filterFloor !== "all" && listing.floor !== filterFloor) return false;
    return true;
  });

  // Get unique floors
  const floors = [...new Set(listings?.map(l => l.floor) || [])].sort();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Office Listings</h1>
            <p className="text-muted-foreground">Manage The Hive coworking spaces</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/office-promotions">
                <Tag className="h-4 w-4 mr-2" />
                Promotions
              </Link>
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Office
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as OfficeStatus | "all")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {officeStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterFloor.toString()} onValueChange={(v) => setFilterFloor(v === "all" ? "all" : parseInt(v))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {floors.map((f) => (
                    <SelectItem key={f} value={f.toString()}>Floor {f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto text-sm text-muted-foreground">
                {filteredListings?.length || 0} of {listings?.length || 0} offices
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Table */}
        {isLoading ? (
          <Skeleton className="h-96" />
        ) : !listings?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No office listings yet</h3>
              <p className="text-muted-foreground mb-4">Add your first office to get started</p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Office
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Office</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings?.map((listing) => (
                  <TableRow key={listing.id} className={!listing.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {listing.is_featured && <Star className="h-4 w-4 text-accent fill-accent" />}
                        <div>
                          <p className="font-medium">{listing.name}</p>
                          <p className="text-sm text-muted-foreground">{listing.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {officeTypes.find(t => t.value === listing.office_type)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{listing.floor_label || `Floor ${listing.floor}`}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {listing.capacity}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(listing.status)}</TableCell>
                    <TableCell>
                      {listing.pricing_visibility === "exact" && listing.monthly_rate
                        ? `$${listing.monthly_rate}/mo`
                        : listing.pricing_visibility === "qualitative"
                        ? listing.price_range_text || "Range set"
                        : "Hidden"}
                    </TableCell>
                    <TableCell>
                      {listing.is_active ? (
                        <Badge variant="secondary" className="gap-1">
                          <Eye className="h-3 w-3" /> Live
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <EyeOff className="h-3 w-3" /> Hidden
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/office-listings/${listing.id}/photos`}>
                            <ImagePlus className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(listing)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(listing.id, listing.name)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingListing ? "Edit Office Listing" : "Add Office Listing"}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., The Cornerstone Executive Office"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Tagline</label>
                    <Input
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g., Where vision meets ambition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Office Type</label>
                    <Select value={formData.office_type} onValueChange={(v) => setFormData({ ...formData, office_type: v as OfficeType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {officeTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as OfficeStatus })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {officeStatuses.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this office space..."
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Floor</label>
                    <Input
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Floor Label</label>
                    <Input
                      value={formData.floor_label}
                      onChange={(e) => setFormData({ ...formData, floor_label: e.target.value })}
                      placeholder="e.g., First Floor"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Square Footage</label>
                    <Input
                      type="number"
                      value={formData.square_footage}
                      onChange={(e) => setFormData({ ...formData, square_footage: e.target.value })}
                      placeholder="e.g., 350"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Capacity</label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="Max occupants"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Ideal Use</label>
                    <Input
                      value={formData.ideal_use}
                      onChange={(e) => setFormData({ ...formData, ideal_use: e.target.value })}
                      placeholder="e.g., Teams of 2-4, Solo professionals"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Amenities (comma-separated)</label>
                    <Textarea
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      placeholder="e.g., Natural light, Built-in storage, Meeting space included"
                      rows={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Status Note</label>
                    <Input
                      value={formData.status_note}
                      onChange={(e) => setFormData({ ...formData, status_note: e.target.value })}
                      placeholder="e.g., Available March 2026"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pricing Visibility</label>
                    <Select value={formData.pricing_visibility} onValueChange={(v) => setFormData({ ...formData, pricing_visibility: v as PricingVisibility })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingVisibilities.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monthly Rate</label>
                    <Input
                      type="number"
                      value={formData.monthly_rate}
                      onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deposit Amount</label>
                    <Input
                      type="number"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price Range Text (for qualitative)</label>
                    <Input
                      value={formData.price_range_text}
                      onChange={(e) => setFormData({ ...formData, price_range_text: e.target.value })}
                      placeholder="e.g., Starting at $XXX/month"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">URL Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="Auto-generated from name"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-generate from name</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Meta Title</label>
                    <Input
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="SEO title for search engines"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Meta Description</label>
                    <Textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="SEO description for search engines"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium">Featured</label>
                      <p className="text-xs text-muted-foreground">Show prominently on listings page</p>
                    </div>
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Active</label>
                      <p className="text-xs text-muted-foreground">Show on public website</p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createListing.isPending || updateListing.isPending || !formData.name}
              >
                {editingListing ? "Save Changes" : "Create Office"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
