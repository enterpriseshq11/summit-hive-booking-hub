import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, ShieldAlert, ShieldCheck, Link2 } from "lucide-react";
import { toast } from "sonner";

function useE3AllCoordinators() {
  return useQuery({
    queryKey: ["e3_all_coordinators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_coordinators")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as any[];
    },
  });
}

function useCoordinatorStats() {
  return useQuery({
    queryKey: ["e3_coordinator_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("e3_bookings")
        .select("coordinator_id, booking_state, net_contribution");
      if (error) throw error;
      const stats: Record<string, { holds: number; completed: number; net: number }> = {};
      for (const b of data || []) {
        if (!stats[b.coordinator_id]) stats[b.coordinator_id] = { holds: 0, completed: 0, net: 0 };
        if (b.booking_state === "red_hold") stats[b.coordinator_id].holds++;
        if (b.booking_state === "completed") {
          stats[b.coordinator_id].completed++;
          stats[b.coordinator_id].net += Number(b.net_contribution) || 0;
        }
      }
      return stats;
    },
  });
}

export default function E3AdminCoordinators() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: coordinators = [], isLoading } = useE3AllCoordinators();
  const { data: stats = {} } = useCoordinatorStats();
  const [refModal, setRefModal] = useState<{ coordinatorId: string; currentRef: string | null } | null>(null);
  const [selectedRef, setSelectedRef] = useState("");

  const suspendMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase.rpc("e3_suspend_coordinator", {
        p_coordinator_id: id, p_reason: reason,
      });
      if (error) throw error;
      const r = data as any;
      if (r?.error) throw new Error(r.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_all_coordinators"] });
      toast.success("Coordinator suspended.");
    },
    onError: (e) => toast.error(e.message),
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc("e3_reactivate_coordinator", { p_coordinator_id: id });
      if (error) throw error;
      const r = data as any;
      if (r?.error) throw new Error(r.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_all_coordinators"] });
      toast.success("Coordinator reactivated.");
    },
    onError: (e) => toast.error(e.message),
  });

  const setRefMutation = useMutation({
    mutationFn: async ({ id, refId }: { id: string; refId: string }) => {
      const { data, error } = await supabase.rpc("e3_set_referred_by", {
        p_coordinator_id: id, p_referred_by_id: refId,
      });
      if (error) throw error;
      const r = data as any;
      if (r?.error) throw new Error(r.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_all_coordinators"] });
      setRefModal(null);
      toast.success("Referral link set.");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/e3")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Coordinator Management</h1>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-4">
            {coordinators.map((c: any) => {
              const s = stats[c.id] || { holds: 0, completed: 0, net: 0 };
              const isSuspended = c.coordinator_status === "suspended";
              const referrer = coordinators.find((x: any) => x.id === c.referred_by);

              return (
                <Card key={c.id} className={isSuspended ? "border-destructive/50 opacity-75" : ""}>
                  <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">{c.name || `${c.first_name} ${c.last_name}`}</span>
                          <Badge
                            variant="outline"
                            className={isSuspended ? "bg-red-500/15 text-red-700" : "bg-green-500/15 text-green-700"}
                          >
                            {isSuspended ? "Suspended" : "Active"}
                          </Badge>
                          {c.tier_level && (
                            <Badge variant="outline">{c.tier_level} ({((c.tier_percent || 0) * 100).toFixed(0)}%)</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{c.email}</p>
                        {referrer && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Referred by: {referrer.name || `${referrer.first_name} ${referrer.last_name}`}
                          </p>
                        )}
                        {c.admin_notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">Notes: {c.admin_notes}</p>
                        )}

                        <div className="flex gap-6 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Active Holds: </span>
                            <span className="font-medium">{s.holds}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completed: </span>
                            <span className="font-medium">{s.completed}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net Contribution: </span>
                            <span className="font-medium">${s.net.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {isSuspended ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reactivateMutation.mutate(c.id)}
                            disabled={reactivateMutation.isPending}
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" /> Reactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt("Suspension reason:");
                              if (reason !== null) suspendMutation.mutate({ id: c.id, reason });
                            }}
                            disabled={suspendMutation.isPending}
                          >
                            <ShieldAlert className="h-4 w-4 mr-1" /> Suspend
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRefModal({ coordinatorId: c.id, currentRef: c.referred_by })}
                        >
                          <Link2 className="h-4 w-4 mr-1" /> Set Referrer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Set Referrer Modal */}
        <Dialog open={!!refModal} onOpenChange={() => setRefModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Referred By</DialogTitle>
            </DialogHeader>
            <Select value={selectedRef} onValueChange={setSelectedRef}>
              <SelectTrigger>
                <SelectValue placeholder="Select referrer..." />
              </SelectTrigger>
              <SelectContent>
                {coordinators
                  .filter((c: any) => c.id !== refModal?.coordinatorId)
                  .map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || `${c.first_name} ${c.last_name}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (refModal && selectedRef) {
                    setRefMutation.mutate({ id: refModal.coordinatorId, refId: selectedRef });
                  }
                }}
                disabled={!selectedRef || setRefMutation.isPending}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
