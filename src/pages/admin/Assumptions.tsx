import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lightbulb, Plus, Loader2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Assumption {
  id: string;
  created_at: string;
  created_by: string | null;
  category: string;
  assumption_text: string;
  reason: string;
  status: string;
  replaced_by: string | null;
}

export default function AdminAssumptions() {
  const { authUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "General",
    assumption_text: "",
    reason: "",
  });

  const { data: assumptions, isLoading, error } = useQuery({
    queryKey: ["assumptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assumptions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Assumption[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { category: string; assumption_text: string; reason: string }) => {
      const { error } = await supabase.from("assumptions").insert({
        ...data,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assumptions"] });
      setIsDialogOpen(false);
      setFormData({ category: "General", assumption_text: "", reason: "" });
      toast({ title: "Assumption created", description: "The assumption has been logged." });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create assumption.", variant: "destructive" });
    },
  });

  const supersedeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("assumptions")
        .update({ status: "superseded" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assumptions"] });
      toast({ title: "Assumption superseded", description: "The assumption has been marked as superseded." });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assumption_text.trim() || !formData.reason.trim()) return;
    createMutation.mutate(formData);
  };

  const canEdit = authUser?.isAdmin;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assumptions Register</h1>
            <p className="text-muted-foreground">
              Production-safe defaults made during development
            </p>
          </div>

          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assumption
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log New Assumption</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Branding">Branding</SelectItem>
                        <SelectItem value="Payments">Payments</SelectItem>
                        <SelectItem value="Scheduling">Scheduling</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assumption">Assumption</Label>
                    <Input
                      id="assumption"
                      value={formData.assumption_text}
                      onChange={(e) => setFormData({ ...formData, assumption_text: e.target.value })}
                      placeholder="What was assumed?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Rationale</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Why was this assumption made?"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Assumption
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card className="border-destructive/50">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p>Failed to load assumptions. Please try again.</p>
            </CardContent>
          </Card>
        ) : assumptions && assumptions.length > 0 ? (
          <div className="space-y-4">
            {assumptions.map((assumption) => (
              <Card 
                key={assumption.id}
                className={assumption.status === "superseded" ? "opacity-60" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{assumption.category}</Badge>
                        <Badge variant={assumption.status === "active" ? "default" : "secondary"}>
                          {assumption.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{assumption.assumption_text}</CardTitle>
                    </div>
                    {canEdit && assumption.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => supersedeMutation.mutate(assumption.id)}
                        disabled={supersedeMutation.isPending}
                      >
                        Supersede
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{assumption.reason}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(assumption.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No assumptions logged yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
