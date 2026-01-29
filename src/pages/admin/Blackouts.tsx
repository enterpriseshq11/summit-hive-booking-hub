import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin";
import { useBlackouts } from "@/hooks/useBlackouts";
import { useResources } from "@/hooks/useResources";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useSpaWorkerAvailability } from "@/hooks/useSpaWorkerAvailability";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarX, Plus, Loader2, Edit, Trash2, Ban, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { BlackoutDate } from "@/types";

export default function AdminBlackouts() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: blackouts, isLoading } = useBlackouts();
  const { data: resources } = useResources();
  const { data: businesses } = useBusinesses();
  const { currentWorker } = useSpaWorkerAvailability();
  const [showDialog, setShowDialog] = useState(false);
  const [editingBlackout, setEditingBlackout] = useState<BlackoutDate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if user is spa_worker only (not lead/manager/owner)
  const isSpaWorkerOnly = useMemo(() => {
    const roles = authUser?.roles || [];
    return roles.includes("spa_worker") && 
           !roles.includes("owner") && 
           !roles.includes("manager") &&
           !roles.includes("spa_lead");
  }, [authUser?.roles]);

  // Determine if user is spa-only (lead OR worker)
  const isSpaLeadOnly = useMemo(() => {
    const roles = authUser?.roles || [];
    return roles.includes("spa_lead") && 
           !roles.includes("owner") && 
           !roles.includes("manager");
  }, [authUser?.roles]);

  const isSpaRoleOnly = isSpaLeadOnly || isSpaWorkerOnly;

  // Get Spa business ID for auto-filtering
  const spaBusinessId = useMemo(() => {
    const spaBusiness = businesses?.find(b => b.type === "spa");
    return spaBusiness?.id;
  }, [businesses]);

  const [form, setForm] = useState({
    business_id: "",
    resource_id: "",
    start_datetime: "",
    end_datetime: "",
    reason: "",
    is_request_only: false,
  });

  const logAudit = async (actionType: string, entityId: string, before: any, after: any) => {
    await supabase.from("audit_log").insert({
      action_type: actionType,
      entity_type: "blackout_date",
      entity_id: entityId,
      actor_user_id: authUser?.id,
      before_json: before,
      after_json: after,
    });
  };

  const openEdit = (blackout: BlackoutDate) => {
    setEditingBlackout(blackout);
    setForm({
      business_id: blackout.business_id || "",
      resource_id: blackout.resource_id || "",
      start_datetime: blackout.start_datetime ? format(new Date(blackout.start_datetime), "yyyy-MM-dd'T'HH:mm") : "",
      end_datetime: blackout.end_datetime ? format(new Date(blackout.end_datetime), "yyyy-MM-dd'T'HH:mm") : "",
      reason: blackout.reason || "",
      is_request_only: blackout.is_request_only ?? false,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.start_datetime || !form.end_datetime) {
      toast.error("Start and end times are required");
      return;
    }

    if (new Date(form.start_datetime) >= new Date(form.end_datetime)) {
      toast.error("End time must be after start time");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        business_id: form.business_id || null,
        resource_id: form.resource_id || null,
        start_datetime: form.start_datetime,
        end_datetime: form.end_datetime,
        reason: form.reason || null,
        is_request_only: form.is_request_only,
        created_by: authUser?.id,
      };

      if (editingBlackout) {
        const { error } = await supabase
          .from("blackout_dates")
          .update(payload)
          .eq("id", editingBlackout.id);
        if (error) throw error;
        await logAudit("update", editingBlackout.id, editingBlackout, payload);
        toast.success("Blackout updated");
      } else {
        const { data, error } = await supabase
          .from("blackout_dates")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        await logAudit("create", data.id, null, payload);
        toast.success("Blackout created");
      }

      queryClient.invalidateQueries({ queryKey: ["blackouts"] });
      setShowDialog(false);
      setEditingBlackout(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (blackout: BlackoutDate) => {
    if (!confirm("Delete this blackout period?")) return;
    
    try {
      const { error } = await supabase.from("blackout_dates").delete().eq("id", blackout.id);
      if (error) throw error;
      await logAudit("delete", blackout.id, blackout, null);
      toast.success("Blackout deleted");
      queryClient.invalidateQueries({ queryKey: ["blackouts"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getResourceName = (id: string | null) => {
    if (!id) return "All Resources";
    return resources?.find((r) => r.id === id)?.name || "Unknown";
  };

  const getBusinessName = (id: string | null) => {
    if (!id) return "All Businesses";
    return businesses?.find((b) => b.id === id)?.name || "Unknown";
  };

  const getBlackoutType = (blackout: BlackoutDate) => {
    if (blackout.is_request_only) {
      return { label: "Request Only", icon: AlertTriangle, variant: "outline" as const };
    }
    if (blackout.resource_id) {
      return { label: "Resource Block", icon: Lock, variant: "secondary" as const };
    }
    return { label: "Hard Block", icon: Ban, variant: "destructive" as const };
  };

  // NOTE: Must be called before any conditional returns to avoid hook order mismatches.
  const filteredBlackouts = useMemo(() => {
    let items = blackouts || [];

    // Spa workers only see their own blackouts (created_by matches their user ID)
    // OR blackouts for the spa business that don't have a specific creator
    if (isSpaWorkerOnly && authUser?.id) {
      items = items.filter(
        (b) => b.created_by === authUser.id || (b.business_id === spaBusinessId && !b.created_by)
      );
    }
    // Spa lead sees all spa blackouts
    else if (isSpaLeadOnly && spaBusinessId) {
      items = items.filter((b) => b.business_id === spaBusinessId || !b.business_id);
    }

    return items;
  }, [blackouts, isSpaWorkerOnly, isSpaLeadOnly, authUser?.id, spaBusinessId]);

  const now = new Date();
  const activeBlackouts = filteredBlackouts.filter((b) => new Date(b.end_datetime) > now) || [];
  const pastBlackouts = filteredBlackouts.filter((b) => new Date(b.end_datetime) <= now) || [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <CalendarX className="h-6 w-6" />
              Blackouts
            </h1>
            <p className="text-zinc-300">
              Manage blackout dates and availability overrides
            </p>
          </div>
          <Button onClick={() => { 
            setEditingBlackout(null); 
            setForm({ 
              business_id: isSpaRoleOnly && spaBusinessId ? spaBusinessId : "", 
              resource_id: "", 
              start_datetime: "", 
              end_datetime: "", 
              reason: "", 
              is_request_only: false 
            }); 
            setShowDialog(true); 
          }}>
            <Plus className="h-4 w-4 mr-2" />
            {isSpaWorkerOnly ? "Add Time Off" : "Add Blackout"}
          </Button>
        </div>

        {/* Active Blackouts */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Active & Upcoming Blackouts ({activeBlackouts.length})</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeBlackouts.map((blackout) => {
                  const type = getBlackoutType(blackout);
                  return (
                    <TableRow key={blackout.id}>
                      <TableCell>
                        <Badge variant={type.variant}>
                          <type.icon className="h-3 w-3 mr-1" />
                          {type.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-white">{getBusinessName(blackout.business_id)}</div>
                          {blackout.resource_id && (
                            <div className="text-zinc-400">{getResourceName(blackout.resource_id)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-white">{format(new Date(blackout.start_datetime), "MMM d, yyyy h:mm a")}</div>
                          <div className="text-zinc-400">
                            to {format(new Date(blackout.end_datetime), "MMM d, yyyy h:mm a")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-zinc-400">
                          {blackout.reason || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(blackout)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(blackout)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {activeBlackouts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No active blackouts
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Past Blackouts */}
        {pastBlackouts.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-muted-foreground">Past Blackouts ({pastBlackouts.length})</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastBlackouts.slice(0, 10).map((blackout) => {
                    const type = getBlackoutType(blackout);
                    return (
                      <TableRow key={blackout.id} className="opacity-60">
                        <TableCell>
                          <Badge variant="outline">{type.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{getBusinessName(blackout.business_id)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(blackout.start_datetime), "MMM d")} - {format(new Date(blackout.end_datetime), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{blackout.reason || "—"}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(blackout)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBlackout 
                  ? (isSpaWorkerOnly ? "Edit Time Off" : "Edit Blackout") 
                  : (isSpaWorkerOnly ? "Add Time Off" : "Add Blackout")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Business selector - hidden for spa role users */}
              {!isSpaRoleOnly && (
                <div>
                  <Label>Business (leave empty for all)</Label>
                <Select value={form.business_id || "all"} onValueChange={(v) => setForm({ ...form, business_id: v === "all" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="All businesses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Businesses</SelectItem>
                      {businesses?.filter(b => Boolean(b?.id)).map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Resource selector - hidden for spa workers */}
              {!isSpaWorkerOnly && (
                <div>
                  <Label>Resource (leave empty for all)</Label>
                <Select value={form.resource_id || "all"} onValueChange={(v) => setForm({ ...form, resource_id: v === "all" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="All resources" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      {resources?.filter(r => Boolean(r?.id)).map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start *</Label>
                  <Input 
                    type="datetime-local" 
                    value={form.start_datetime} 
                    onChange={(e) => setForm({ ...form, start_datetime: e.target.value })} 
                  />
                </div>
                <div>
                  <Label>End *</Label>
                  <Input 
                    type="datetime-local" 
                    value={form.end_datetime} 
                    onChange={(e) => setForm({ ...form, end_datetime: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea 
                  value={form.reason} 
                  onChange={(e) => setForm({ ...form, reason: e.target.value })} 
                  placeholder="e.g., Holiday closure, Private event, Maintenance"
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Request-Only Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Allow booking requests that require manual approval
                  </div>
                </div>
                <Switch 
                  checked={form.is_request_only} 
                  onCheckedChange={(v) => setForm({ ...form, is_request_only: v })} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
