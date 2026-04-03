import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, FileWarning } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function OrphanedFiles() {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["orphaned-files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orphaned_files")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (file: any) => {
      // Delete from storage bucket
      const { error: storageError } = await supabase.storage
        .from("lead-documents")
        .remove([file.file_path]);

      if (storageError) {
        // Update cleanup status
        await supabase.from("orphaned_files").update({
          cleanup_attempted: true,
          cleanup_status: `storage_delete_failed: ${storageError.message}`,
          cleanup_attempted_at: new Date().toISOString(),
        } as any).eq("id", file.id);
        throw storageError;
      }

      // Remove the orphaned_files record
      const { error: dbError } = await supabase
        .from("orphaned_files")
        .delete()
        .eq("id", file.id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orphaned-files"] });
      toast.success("File deleted from storage and record removed");
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileWarning className="h-6 w-6 text-amber-400" /> Orphaned Files
          </h1>
          <p className="text-zinc-400">Files uploaded to storage that failed to save in the database. Review and clean up.</p>
        </div>

        {isLoading ? (
          <p className="text-zinc-500 text-center py-8">Loading...</p>
        ) : files.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <FileWarning className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-500">No orphaned files found. Everything is clean.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {files.map((file: any) => (
              <Card key={file.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-white text-sm font-medium">{file.file_path}</p>
                    <div className="flex gap-2 flex-wrap">
                      {file.lead_id && (
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">Lead: {file.lead_id}</Badge>
                      )}
                      {file.intended_for && (
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">{file.intended_for}</Badge>
                      )}
                      {file.cleanup_status && (
                        <Badge className="bg-red-500/20 text-red-400 text-xs">{file.cleanup_status}</Badge>
                      )}
                      <span className="text-zinc-600 text-xs">
                        {format(new Date(file.upload_timestamp || file.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(file)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete from Storage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}