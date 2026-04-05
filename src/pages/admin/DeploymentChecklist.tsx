import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Database, TestTube, Rocket } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

const CATEGORY_ICONS: Record<string, any> = {
  Infrastructure: Shield,
  Data: Database,
  Testing: TestTube,
  "Go Live": Rocket,
};

export default function DeploymentChecklist() {
  const { authUser } = useAuth();
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["deployment_checklist"],
    queryFn: async () => {
      const { data } = await supabase.from("deployment_checklist").select("*").order("sort_order");
      return data || [];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await supabase.from("deployment_checklist").update({
        checked,
        checked_at: checked ? new Date().toISOString() : null,
        checked_by: checked ? authUser?.id : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deployment_checklist"] }),
  });

  const notesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase.from("deployment_checklist").update({ notes }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Notes saved"),
  });

  const categories = [...new Set((items as any[]).map((i) => i.category))];
  const totalChecked = (items as any[]).filter((i) => i.checked).length;
  const pct = items.length ? Math.round((totalChecked / items.length) * 100) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Production Deployment Checklist</h1>
            <p className="text-zinc-400">Complete all items before going live</p>
          </div>
          <Badge variant="outline" className={`text-lg px-4 py-1 ${pct === 100 ? "border-green-500 text-green-400" : "border-amber-500 text-amber-400"}`}>
            {totalChecked}/{items.length} ({pct}%)
          </Badge>
        </div>

        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] || Shield;
          const catItems = (items as any[]).filter((i) => i.category === cat);
          const catDone = catItems.filter((i) => i.checked).length;
          return (
            <Card key={cat} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-amber-400" />
                  <CardTitle className="text-white">{cat}</CardTitle>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400 ml-auto">{catDone}/{catItems.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {catItems.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: item.id, checked: !!v })}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${item.checked ? "text-zinc-500 line-through" : "text-zinc-200"}`}>{item.label}</p>
                      {item.checked_at && (
                        <p className="text-xs text-zinc-500 mt-0.5">Checked {format(new Date(item.checked_at), "MMM d, yyyy h:mm a")}</p>
                      )}
                      <Input
                        className="mt-1 h-7 text-xs bg-zinc-800 border-zinc-700"
                        placeholder="Notes..."
                        defaultValue={item.notes || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (item.notes || "")) {
                            notesMutation.mutate({ id: item.id, notes: e.target.value });
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
