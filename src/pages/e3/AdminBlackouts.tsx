import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useE3Venues } from "@/hooks/useE3";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Calendar, Loader2, Zap } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

function useE3Blackouts(venueId?: string) {
  return useQuery({
    queryKey: ["e3_blackouts", venueId],
    queryFn: async () => {
      let q = supabase
        .from("e3_blackout_dates")
        .select("*, e3_venues(name)")
        .order("blackout_date", { ascending: true });
      if (venueId) q = q.eq("venue_id", venueId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export default function E3AdminBlackouts() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: venuesRaw } = useE3Venues();
  const venues = (venuesRaw || []) as any[];
  const [filterVenue, setFilterVenue] = useState<string>("");
  const { data: blackouts = [], isLoading } = useE3Blackouts(filterVenue || undefined);

  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newVenueId, setNewVenueId] = useState("");
  const [runningAutomation, setRunningAutomation] = useState(false);

  // Auto-select first venue for new blackout
  if (venues.length > 0 && !newVenueId) {
    setNewVenueId(venues[0].id);
  }

  const addBlackout = useMutation({
    mutationFn: async () => {
      if (!newDate || !newVenueId) throw new Error("Date and venue required");
      const user = (await supabase.auth.getUser()).data.user;
      const { error } = await supabase.from("e3_blackout_dates").insert({
        venue_id: newVenueId,
        blackout_date: newDate,
        reason: newReason || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_blackouts"] });
      toast.success("Blackout date added.");
      setNewDate("");
      setNewReason("");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteBlackout = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("e3_blackout_dates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["e3_blackouts"] });
      toast.success("Blackout removed.");
    },
    onError: (e) => toast.error(e.message),
  });

  const runAutomations = async () => {
    setRunningAutomation(true);
    try {
      const { data, error } = await supabase.functions.invoke("e3-expire-bookings");
      if (error) throw error;
      const result = data as any;
      toast.success(`Automations complete: ${result.expired || 0} expired, ${result.reverted || 0} reverted.`);
      qc.invalidateQueries({ queryKey: ["e3_bookings"] });
    } catch (err: any) {
      toast.error(err.message || "Automation failed");
    } finally {
      setRunningAutomation(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/e3")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">E³ Admin Tools</h1>
        </div>

        {/* Run Automations Now */}
        <Card className="mb-6 border-accent/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-4 w-4" /> Run Automations Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Manually trigger expiration of stale red holds and revert of missed deposits.
              This runs automatically every 15 minutes via scheduled job.
            </p>
            <Button onClick={runAutomations} disabled={runningAutomation}>
              {runningAutomation ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running...</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" /> Run Expire + Revert Now</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Add Blackout */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Blackout Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              {venues.length > 1 && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Venue</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={newVenueId}
                    onChange={(e) => setNewVenueId(e.target.value)}
                  >
                    {venues.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Date</Label>
                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Reason (optional)</Label>
                <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="e.g. Holiday" />
              </div>
              <Button onClick={() => addBlackout.mutate()} disabled={addBlackout.isPending || !newDate}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Blackouts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Blackouts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : (blackouts as any[]).length === 0 ? (
              <p className="text-muted-foreground text-sm">No blackout dates set.</p>
            ) : (
              <div className="space-y-2">
                {(blackouts as any[]).map((bo: any) => (
                  <div key={bo.id} className="flex items-center justify-between py-2 px-3 rounded-md border bg-card">
                    <div>
                      <span className="font-medium text-sm">
                        {format(new Date(bo.blackout_date + "T00:00:00"), "MMMM d, yyyy")}
                      </span>
                      {bo.e3_venues?.name && (
                        <Badge variant="outline" className="ml-2 text-xs">{bo.e3_venues.name}</Badge>
                      )}
                      {bo.reason && (
                        <span className="text-xs text-muted-foreground ml-2">{bo.reason}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteBlackout.mutate(bo.id)}
                      disabled={deleteBlackout.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
