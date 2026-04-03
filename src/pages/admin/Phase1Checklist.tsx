import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Phase1Checklist() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = authUser?.roles?.includes("owner");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["phase1_checklist"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("phase1_checklist_items")
        .select("*")
        .order("item_number", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, itemNumber, description, newValue }: { id: string; itemNumber: number; description: string; newValue: boolean }) => {
      const { error } = await (supabase as any)
        .from("phase1_checklist_items")
        .update({
          confirmed_by_owner: newValue,
          confirmed_at: newValue ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;

      // Log to activity log
      await supabase.from("crm_activity_events").insert({
        event_type: "status_change" as any,
        entity_type: "phase1_checklist",
        entity_id: id,
        actor_id: authUser?.id,
        entity_name: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name}`,
        metadata: {
          action: newValue ? "confirmed" : "unconfirmed",
          message: `${authUser?.profile?.first_name} ${authUser?.profile?.last_name} ${newValue ? "confirmed" : "unconfirmed"} Phase 1 item ${itemNumber}: ${description}`,
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["phase1_checklist"] });
      toast.success(variables.newValue ? `Item ${variables.itemNumber} confirmed` : `Item ${variables.itemNumber} unconfirmed`);
    },
  });

  const confirmedCount = items.filter((i: any) => i.confirmed_by_owner).length;
  const systemConfirmedCount = items.filter((i: any) => i.confirmed_by_system).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-amber-400" /> Phase 1 Acceptance Checklist
          </h1>
          <p className="text-zinc-400 mt-1">
            {confirmedCount}/{items.length} owner-confirmed · {systemConfirmedCount}/{items.length} system-confirmed
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>
        ) : (
          <div className="space-y-2">
            {items.map((item: any) => {
              const isFullyConfirmed = item.confirmed_by_owner && item.confirmed_by_system;
              const statusBadge = isFullyConfirmed
                ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Fully Confirmed</Badge>
                : item.confirmed_by_system
                  ? <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">System Confirmed</Badge>
                  : <Badge className="bg-zinc-700 text-zinc-400 border-zinc-600">Pending Verification</Badge>;

              return (
                <Card key={item.id} className={`border ${isFullyConfirmed ? "border-green-500/30 bg-green-500/5" : "border-zinc-800 bg-zinc-900"}`}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="pt-0.5">
                      {isOwner ? (
                        <Checkbox
                          checked={item.confirmed_by_owner}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({
                              id: item.id,
                              itemNumber: item.item_number,
                              description: item.description,
                              newValue: !!checked,
                            })
                          }
                        />
                      ) : item.confirmed_by_owner ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-zinc-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-500 text-sm font-mono">#{item.item_number}</span>
                        <p className={`text-sm ${isFullyConfirmed ? "text-green-300" : "text-white"}`}>
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {statusBadge}
                        {item.confirmed_at && (
                          <span className="text-zinc-600 text-xs">
                            Confirmed {format(new Date(item.confirmed_at), "MMM d 'at' h:mm a")}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {confirmedCount === items.length && items.length > 0 && (
          <Card className="border-green-500/30 bg-green-500/10">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-bold text-lg">Phase 1 Complete — All items confirmed by owner</p>
              <p className="text-green-400/70 text-sm mt-1">Ready to proceed to Phase 2</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
