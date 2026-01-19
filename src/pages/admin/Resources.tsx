import { useState } from "react";
import { UnifiedAdminLayout } from "@/components/admin";
import { useResources, useCreateResource, useUpdateResource, useDeleteResource } from "@/hooks/useResources";
import { useBusinesses } from "@/hooks/useBusinesses";
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
import { Box, Plus, Pencil, Trash2, Users, Square } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ResourceType = Database["public"]["Enums"]["resource_type"];

const resourceTypes: { value: ResourceType; label: string }[] = [
  { value: "room", label: "Room" },
  { value: "office", label: "Office" },
  { value: "equipment", label: "Equipment" },
  { value: "suite", label: "Suite" },
];

export default function AdminResources() {
  const { data: resources, isLoading } = useResources();
  const { data: businesses } = useBusinesses();
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    type: "room" as ResourceType,
    business_id: "",
    capacity: "",
    square_footage: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      type: "room",
      business_id: "",
      capacity: "",
      square_footage: "",
      is_active: true,
    });
    setEditingResource(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (resource: any) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      slug: resource.slug,
      description: resource.description || "",
      type: resource.type,
      business_id: resource.business_id,
      capacity: resource.capacity?.toString() || "",
      square_footage: resource.square_footage?.toString() || "",
      is_active: resource.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description || null,
      type: formData.type,
      business_id: formData.business_id,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      square_footage: formData.square_footage ? parseInt(formData.square_footage) : null,
      is_active: formData.is_active,
    };

    if (editingResource) {
      updateResource.mutate({ id: editingResource.id, updates: data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    } else {
      createResource.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResource.mutate(id);
    }
  };

  return (
    <UnifiedAdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Resources</h1>
            <p className="text-muted-foreground">Manage rooms, offices, and equipment</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-96" />
        ) : resources?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Box className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No resources yet</h3>
              <p className="text-muted-foreground mb-4">Add your first resource to get started</p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources?.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">{resource.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{resource.type}</Badge>
                    </TableCell>
                    <TableCell>{(resource as any).businesses?.name}</TableCell>
                    <TableCell>
                      {resource.capacity && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {resource.capacity}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={resource.is_active ? "default" : "secondary"}>
                        {resource.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(resource)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(resource.id)}>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingResource ? "Edit Resource" : "Add Resource"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Ballroom"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ResourceType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Business</label>
                <Select value={formData.business_id} onValueChange={(v) => setFormData({ ...formData, business_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Max guests"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Square Footage</label>
                  <Input
                    type="number"
                    value={formData.square_footage}
                    onChange={(e) => setFormData({ ...formData, square_footage: e.target.value })}
                    placeholder="Sq ft"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this resource..."
                />
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
              <Button onClick={handleSubmit} disabled={createResource.isPending || updateResource.isPending}>
                {editingResource ? "Save Changes" : "Create Resource"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UnifiedAdminLayout>
  );
}
