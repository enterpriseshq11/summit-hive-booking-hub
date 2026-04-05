import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Shield, Database, TestTube, Rocket } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";

const CATEGORY_ICONS: Record<string, any> = {
  Infrastructure: Shield,
  Data: Database,
  Testing: TestTube,
  "Go Live": Rocket,
};

export default function DeploymentChecklist() {
  const { authUser } = useAuth();
  const qc = useQueryClient();
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [goingLive, setGoingLive] = useState(false);

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
  const totalItems = items.length || 22;
  const pct = totalItems ? Math.round((totalChecked / totalItems) * 100) : 0;
  const allChecked = totalChecked === totalItems && totalItems > 0;

  // Item 40: Go Live handler
  const handleGoLive = async () => {
    setGoingLive(true);
    try {
      // Send notification email via Resend
      const completedItems = (items as any[]).filter(i => i.checked).map(i => ({
        label: i.label,
        completed_at: i.checked_at ? format(new Date(i.checked_at), "MMM d, yyyy h:mm a") : "—",
      }));

      const htmlBody = `
        <h2>A-Z Command Platform is Live!</h2>
        <p>All ${totalItems} deployment checklist items have been completed.</p>
        <p>Marked as live at: ${format(new Date(), "MMM d, yyyy h:mm a")}</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
          <tr><th>Item</th><th>Completed At</th></tr>
          ${completedItems.map(i => `<tr><td>${i.label}</td><td>${i.completed_at}</td></tr>`).join("")}
        </table>
      `;

      await supabase.functions.invoke("send-accountability-report", {
        body: {
          custom_email: true,
          to: "dylan@a-zenterpriseshq.com",
          subject: "A-Z Command is Live",
          html: htmlBody,
        },
      });

      // Log to activity
      await supabase.from("crm_activity_events").insert({
        event_type: "setting_changed" as any,
        event_category: "settings_change",
        entity_type: "deployment",
        actor_id: authUser?.id,
        metadata: {
          action: "platform_go_live",
          description: `Platform marked as live by ${authUser?.profile?.first_name} ${authUser?.profile?.last_name} at ${new Date().toISOString()}`,
        },
      });

      toast.success("Platform is now LIVE! Notification sent.");
      setGoLiveOpen(false);
    } catch (err: any) {
      toast.error("Failed to send go-live notification: " + err.message);
    } finally {
      setGoingLive(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Production Deployment Checklist</h1>
            <p className="text-zinc-400">Complete all items before going live</p>
          </div>
          <Badge variant="outline" className={`text-lg px-4 py-1 ${pct === 100 ? "border-green-500 text-green-400" : "border-amber-500 text-amber-400"}`}>
            {totalChecked}/{totalItems} ({pct}%)
          </Badge>
        </div>

        {/* Item 40: Progress bar and Go Live button */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Progress value={pct} className="flex-1 h-3 bg-zinc-800 [&>div]:bg-amber-500" />
              <span className="text-sm font-medium text-amber-400 whitespace-nowrap">{pct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                {allChecked ? "All items complete — ready to go live!" : `${totalItems - totalChecked} items remaining`}
              </p>
              <Button
                disabled={!allChecked}
                onClick={() => setGoLiveOpen(true)}
                className={allChecked ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-zinc-700 text-zinc-500 cursor-not-allowed"}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            </div>
          </CardContent>
        </Card>

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

      {/* Go Live confirmation dialog */}
      <Dialog open={goLiveOpen} onOpenChange={setGoLiveOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Are you sure you are ready to go live?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will send a notification to your team and mark the platform as live. All {totalItems} checklist items are confirmed complete.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGoLiveOpen(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
            <Button onClick={handleGoLive} disabled={goingLive} className="bg-amber-500 text-black hover:bg-amber-400">
              {goingLive ? "Sending..." : "Confirm Go Live"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
