import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ErrorRecord {
  id: string;
  function_name: string;
  error_message: string;
  stack_trace: string | null;
  payload: any;
  occurred_at: string;
  resolved: boolean;
}

export default function ErrorLog() {
  const queryClient = useQueryClient();
  const [showResolved, setShowResolved] = useState(false);

  const { data: errors = [], isLoading, refetch } = useQuery({
    queryKey: ["edge-function-errors", showResolved],
    queryFn: async () => {
      let query = supabase
        .from("edge_function_errors")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(100);

      if (!showResolved) {
        query = query.eq("resolved", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ErrorRecord[];
    },
  });

  const toggleResolved = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const { error } = await supabase
        .from("edge_function_errors")
        .update({ resolved, resolved_at: resolved ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edge-function-errors"] });
    },
    onError: () => {
      toast.error("Failed to update error status");
    },
  });

  const unresolvedCount = errors.filter(e => !e.resolved).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Error Log</h1>
            <p className="text-sm text-muted-foreground">
              {unresolvedCount} unresolved {unresolvedCount === 1 ? "error" : "errors"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={showResolved} onCheckedChange={setShowResolved} />
              Show resolved
            </label>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : errors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold">No errors found</p>
              <p className="text-sm text-muted-foreground">All systems running smoothly.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {errors.map((err) => (
              <Card
                key={err.id}
                className={err.resolved ? "opacity-60 border-muted" : "border-amber-500/50"}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${err.resolved ? "text-muted-foreground" : "text-amber-500"}`} />
                      <CardTitle className="text-sm font-mono truncate">{err.function_name}</CardTitle>
                      <Badge variant={err.resolved ? "secondary" : "destructive"} className="flex-shrink-0">
                        {err.resolved ? "Resolved" : "Unresolved"}
                      </Badge>
                    </div>
                    <Switch
                      checked={err.resolved}
                      onCheckedChange={(checked) => toggleResolved.mutate({ id: err.id, resolved: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <p className="text-sm">{err.error_message}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(err.occurred_at), "MMM d, yyyy h:mm a")}
                  </p>
                  {err.stack_trace && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Stack trace</summary>
                      <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-x-auto whitespace-pre-wrap">{err.stack_trace}</pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
