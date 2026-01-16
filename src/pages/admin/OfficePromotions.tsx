import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { 
  useOfficePromotions,
  useOfficeListings,
  useCreateOfficePromotion, 
  useUpdateOfficePromotion, 
  useDeleteOfficePromotion,
  type OfficePromotion
} from "@/hooks/useOfficeListings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tag, Plus, Pencil, Trash2, Calendar, Globe, Building2, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function AdminOfficePromotions() {
  const { data: promotions, isLoading } = useOfficePromotions();
  const { data: offices } = useOfficeListings({ activeOnly: false });
  const createPromotion = useCreateOfficePromotion();
  const updatePromotion = useUpdateOfficePromotion();
  const deletePromotion = useDeleteOfficePromotion();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<OfficePromotion | null>(null);

  const [formData, setFormData] = useState({
    office_id: "",
    is_global: false,
    headline: "",
    description: "",
    badge_text: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      office_id: "",
      is_global: false,
      headline: "",
      description: "",
      badge_text: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
      is_active: true,
    });
    setEditingPromotion(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (promotion: OfficePromotion) => {
    setEditingPromotion(promotion);
    setFormData({
      office_id: promotion.office_id || "",
      is_global: promotion.is_global,
      headline: promotion.headline,
      description: promotion.description || "",
      badge_text: promotion.badge_text || "",
      start_date: promotion.start_date,
      end_date: promotion.end_date || "",
      is_active: promotion.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      office_id: formData.is_global ? null : (formData.office_id || null),
      is_global: formData.is_global,
      headline: formData.headline,
      description: formData.description || null,
      badge_text: formData.badge_text || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
    };

    if (editingPromotion) {
      updatePromotion.mutate({ id: editingPromotion.id, updates: data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    } else {
      createPromotion.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      deletePromotion.mutate(id);
    }
  };

  const isPromotionActive = (promo: OfficePromotion) => {
    const today = new Date().toISOString().split('T')[0];
    return promo.is_active && 
           promo.start_date <= today && 
           (!promo.end_date || promo.end_date >= today);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/office-listings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Link>
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Office Promotions</h1>
            <p className="text-muted-foreground">Manage special offers and promotions</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Promotion
          </Button>
        </div>

        {/* Promotions Table */}
        {isLoading ? (
          <Skeleton className="h-96" />
        ) : !promotions?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No promotions yet</h3>
              <p className="text-muted-foreground mb-4">Create your first promotion</p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Promotion
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions?.map((promotion) => {
                  const office = offices?.find(o => o.id === promotion.office_id);
                  const active = isPromotionActive(promotion);
                  
                  return (
                    <TableRow key={promotion.id} className={!promotion.is_active ? "opacity-50" : ""}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{promotion.headline}</p>
                          {promotion.badge_text && (
                            <Badge variant="outline" className="mt-1">{promotion.badge_text}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {promotion.is_global ? (
                          <Badge className="gap-1">
                            <Globe className="h-3 w-3" />
                            All Offices
                          </Badge>
                        ) : office ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Building2 className="h-4 w-4" />
                            {office.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No office</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(promotion.start_date), "MMM d, yyyy")}</span>
                          {promotion.end_date && (
                            <span> - {format(new Date(promotion.end_date), "MMM d, yyyy")}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : promotion.is_active ? (
                          <Badge variant="secondary">Scheduled</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(promotion)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(promotion.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPromotion ? "Edit Promotion" : "Add Promotion"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Headline *</label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g., Spring Special - First Month Free"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about this promotion..."
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Badge Text</label>
                <Input
                  value={formData.badge_text}
                  onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  placeholder="e.g., Limited Time, New, Special"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-y">
                <div>
                  <label className="text-sm font-medium">Global Promotion</label>
                  <p className="text-xs text-muted-foreground">Apply to all offices</p>
                </div>
                <Switch
                  checked={formData.is_global}
                  onCheckedChange={(v) => setFormData({ ...formData, is_global: v, office_id: "" })}
                />
              </div>

              {!formData.is_global && (
                <div>
                  <label className="text-sm font-medium">Apply to Office</label>
                  <Select value={formData.office_id} onValueChange={(v) => setFormData({ ...formData, office_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an office" />
                    </SelectTrigger>
                    <SelectContent>
                      {offices?.map((office) => (
                        <SelectItem key={office.id} value={office.id}>{office.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty for no end date</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Active</label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createPromotion.isPending || updatePromotion.isPending || !formData.headline}
              >
                {editingPromotion ? "Save Changes" : "Create Promotion"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
