import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin";
import { 
  useOfficeListingById,
  useOfficePhotos, 
  useCreateOfficePhoto, 
  useDeleteOfficePhoto,
  useReorderOfficePhotos,
  useUpdateOfficePhoto
} from "@/hooks/useOfficeListings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Plus, Trash2, GripVertical, Star, Upload, Image as ImageIcon, Link as LinkIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminOfficePhotos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: office, isLoading: officeLoading } = useOfficeListingById(id || "");
  const { data: photos, isLoading: photosLoading } = useOfficePhotos(id || "");
  const createPhoto = useCreateOfficePhoto();
  const deletePhoto = useDeleteOfficePhoto();
  const reorderPhotos = useReorderOfficePhotos();
  const updatePhoto = useUpdateOfficePhoto();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoAltText, setPhotoAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddPhoto = () => {
    if (!photoUrl.trim() || !id) return;
    
    createPhoto.mutate({
      office_id: id,
      url: photoUrl.trim(),
      alt_text: photoAltText.trim() || null,
      sort_order: photos?.length || 0,
      is_primary: photos?.length === 0, // First photo is primary
    }, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        setPhotoUrl("");
        setPhotoAltText("");
      }
    });
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('office-photos')
        .upload(fileName, file);

      if (uploadError) {
        // If bucket doesn't exist, show helpful message
        if (uploadError.message.includes('bucket')) {
          toast.error("Storage bucket not configured. Please add photos via URL for now.");
          return;
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('office-photos')
        .getPublicUrl(fileName);

      createPhoto.mutate({
        office_id: id,
        url: publicUrl,
        alt_text: file.name,
        sort_order: photos?.length || 0,
        is_primary: photos?.length === 0,
      });
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (photoId: string) => {
    if (!id || !confirm("Delete this photo?")) return;
    deletePhoto.mutate({ id: photoId, officeId: id });
  };

  const handleSetPrimary = (photoId: string) => {
    if (!id || !photos) return;
    
    // Set all others to non-primary first (we'll handle this in a batch)
    photos.forEach(p => {
      if (p.id !== photoId && p.is_primary) {
        updatePhoto.mutate({ id: p.id, officeId: id, updates: { is_primary: false } });
      }
    });
    
    updatePhoto.mutate({ id: photoId, officeId: id, updates: { is_primary: true } });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || !photos || !id) return;

    const newPhotos = [...photos];
    const [draggedItem] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex === null || !photos || !id) return;
    
    const photoIds = photos.map(p => p.id);
    reorderPhotos.mutate({ officeId: id, photoIds });
    setDraggedIndex(null);
  };

  if (!id) {
    navigate("/admin/office-listings");
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/office-listings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {officeLoading ? <Skeleton className="h-8 w-64" /> : `Photos: ${office?.name}`}
            </h1>
            <p className="text-muted-foreground">Manage photos for this office listing</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Photo
          </Button>
        </div>

        {/* Photos Grid */}
        {photosLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-video" />)}
          </div>
        ) : !photos?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No photos yet</h3>
              <p className="text-muted-foreground mb-4">Add photos to showcase this office</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Photo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <Card 
                key={photo.id}
                className="group relative overflow-hidden cursor-move"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="aspect-video relative">
                  <img 
                    src={photo.url} 
                    alt={photo.alt_text || office?.name || "Office photo"}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={photo.is_primary}
                    >
                      <Star className={`h-4 w-4 ${photo.is_primary ? "fill-accent text-accent" : ""}`} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded p-1">
                      <GripVertical className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Primary badge */}
                  {photo.is_primary && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-accent text-primary">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Primary
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {photo.alt_text || "No alt text"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Photo Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Photo</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFile}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />
                <label htmlFor="photo-upload" className="cursor-pointer block">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    {uploading ? "Uploading..." : "Click to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or add by URL</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Image URL
                </label>
                <Input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Alt Text (for accessibility)</label>
                <Input
                  value={photoAltText}
                  onChange={(e) => setPhotoAltText(e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAddPhoto} 
                disabled={!photoUrl.trim() || createPhoto.isPending}
              >
                Add Photo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
