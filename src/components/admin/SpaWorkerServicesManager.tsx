import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Heart, Star, Sparkles, Clock, DollarSign, Gift } from "lucide-react";
import { useMyServices, useCreateService, useUpdateService, useDeleteService, SpaWorkerService } from "@/hooks/useSpaWorkerServices";
import { useSpaWorkerAvailability } from "@/hooks/useSpaWorkerAvailability";
import { format } from "date-fns";

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes" },
];

const ICON_OPTIONS = [
  { value: "heart", label: "Heart", icon: Heart },
  { value: "star", label: "Star", icon: Star },
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
];

interface ServiceFormData {
  name: string;
  description: string;
  duration_mins: number;
  price: string;
  promo_price: string;
  promo_ends_at: string;
  is_free: boolean;
  icon_name: string;
}

const defaultFormData: ServiceFormData = {
  name: "",
  description: "",
  duration_mins: 60,
  price: "",
  promo_price: "",
  promo_ends_at: "",
  is_free: false,
  icon_name: "heart",
};

export function SpaWorkerServicesManager() {
  const { currentWorker } = useSpaWorkerAvailability();
  const { data: services = [], isLoading } = useMyServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<SpaWorkerService | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData(defaultFormData);
    setShowDialog(true);
  };

  const handleOpenEdit = (service: SpaWorkerService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration_mins: service.duration_mins,
      price: service.price.toString(),
      promo_price: service.promo_price?.toString() || "",
      promo_ends_at: service.promo_ends_at ? format(new Date(service.promo_ends_at), "yyyy-MM-dd") : "",
      is_free: service.is_free,
      icon_name: service.icon_name,
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!currentWorker) return;

    const serviceData = {
      worker_id: currentWorker.id,
      name: formData.name,
      description: formData.description || null,
      duration_mins: formData.duration_mins,
      price: formData.is_free ? 0 : parseFloat(formData.price) || 0,
      promo_price: formData.promo_price ? parseFloat(formData.promo_price) : null,
      promo_ends_at: formData.promo_ends_at ? new Date(formData.promo_ends_at).toISOString() : null,
      is_free: formData.is_free,
      is_active: true,
      sort_order: services.length,
      icon_name: formData.icon_name,
    };

    if (editingService) {
      await updateService.mutateAsync({ id: editingService.id, ...serviceData });
    } else {
      await createService.mutateAsync(serviceData);
    }

    setShowDialog(false);
    setFormData(defaultFormData);
    setEditingService(null);
  };

  const handleToggleActive = async (service: SpaWorkerService) => {
    await updateService.mutateAsync({ id: service.id, is_active: !service.is_active });
  };

  const handleDelete = async (id: string) => {
    await deleteService.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const formatPrice = (service: SpaWorkerService) => {
    if (service.is_free) return "Free";
    
    const hasActivePromo = service.promo_price && service.promo_ends_at && new Date(service.promo_ends_at) > new Date();
    
    if (hasActivePromo) {
      return (
        <span className="flex items-center gap-2">
          <span className="line-through text-muted-foreground">${Number(service.price).toFixed(0)}</span>
          <span className="text-green-500 font-semibold">${Number(service.promo_price).toFixed(0)}</span>
          <Gift className="h-4 w-4 text-green-500" />
        </span>
      );
    }
    
    return `$${Number(service.price).toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">My Services</CardTitle>
            <CardDescription>
              Add the services you offer and set your pricing. These will appear on your public booking page.
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No services yet</p>
              <p className="text-sm mb-4">Add your first service to start receiving bookings</p>
              <Button onClick={handleOpenCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{service.name}</span>
                        {service.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {service.duration_mins} min
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(service)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => handleToggleActive(service)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(service.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Service Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Service Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Swedish Massage"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the service..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration *</Label>
                <Select
                  value={formData.duration_mins.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, duration_mins: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Icon</Label>
                <Select
                  value={formData.icon_name}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_free}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
              />
              <Label>Free Consultation</Label>
            </div>

            {!formData.is_free && (
              <>
                <div>
                  <Label>Price ($) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="80"
                    min="0"
                    step="5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Promo Price ($)</Label>
                    <Input
                      type="number"
                      value={formData.promo_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, promo_price: e.target.value }))}
                      placeholder="Optional"
                      min="0"
                      step="5"
                    />
                  </div>
                  <div>
                    <Label>Promo Ends</Label>
                    <Input
                      type="date"
                      value={formData.promo_ends_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, promo_ends_at: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || (!formData.is_free && !formData.price) || createService.isPending || updateService.isPending}
            >
              {editingService ? "Save Changes" : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Service?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">This action cannot be undone. The service will be permanently removed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteService.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
