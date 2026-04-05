import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowRight, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PIPELINE_STAGES = [
  "new_lead", "contact_attempted", "responded", "warm_lead", "hot_lead",
  "proposal_sent", "contract_sent", "deposit_pending", "booked", "completed", "lost",
];

const ACTION_TYPES = ["Send Alert to Team", "Log as Follow-Up Reminder", "Fire GHL Workflow"];
const DELAY_UNITS = ["hours", "days"];

interface CadenceStep {
  delay_value: number;
  delay_unit: string;
  action_type: string;
  ghl_workflow_name?: string;
}

export default function AdminCadences() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [triggerStage, setTriggerStage] = useState("");
  const [businessUnit, setBusinessUnit] = useState("all");
  const [steps, setSteps] = useState<CadenceStep[]>([{ delay_value: 1, delay_unit: "hours", action_type: "Send Alert to Team" }]);

  const { data: cadences = [] } = useQuery({
    queryKey: ["cadences"],
    queryFn: async () => {
      const { data } = await supabase.from("cadences").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cadences").insert({
        name,
        trigger_stage: triggerStage,
        business_unit: businessUnit === "all" ? null : businessUnit,
        steps: steps as any,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cadences"] });
      toast.success("Cadence created");
      setDialogOpen(false);
      setName(""); setTriggerStage(""); setBusinessUnit("all");
      setSteps([{ delay_value: 1, delay_unit: "hours", action_type: "Send Alert to Team" }]);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("cadences").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cadences"] }),
  });

  const addStep = () => {
    if (steps.length >= 10) return;
    setSteps([...steps, { delay_value: 1, delay_unit: "days", action_type: "Send Alert to Team" }]);
  };

  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));

  const updateStep = (i: number, field: string, value: any) => {
    const updated = [...steps];
    (updated[i] as any)[field] = value;
    setSteps(updated);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Follow-Up Cadences</h1>
            <p className="text-zinc-400">Automated follow-up sequences triggered by pipeline stage changes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 text-black hover:bg-amber-400"><Plus className="h-4 w-4 mr-1" /> Add Cadence</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New Cadence</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cadence Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hot Lead Follow-Up" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Trigger Stage</Label>
                    <Select value={triggerStage} onValueChange={setTriggerStage}>
                      <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STAGES.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Business Unit</Label>
                    <Select value={businessUnit} onValueChange={setBusinessUnit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Units</SelectItem>
                        <SelectItem value="summit">Summit</SelectItem>
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="hive">Hive</SelectItem>
                        <SelectItem value="voice_vault">Voice Vault</SelectItem>
                        <SelectItem value="mobile_homes">Mobile Homes</SelectItem>
                        <SelectItem value="elevated_by_elyse">Elevated by Elyse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Steps ({steps.length}/10)</Label>
                  <div className="space-y-3">
                    {steps.map((step, i) => (
                      <Card key={i} className="bg-zinc-800 border-zinc-700">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">Step {i + 1}</Badge>
                            {steps.length > 1 && (
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStep(i)}>
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Delay</Label>
                              <Input type="number" min={1} value={step.delay_value} onChange={(e) => updateStep(i, "delay_value", parseInt(e.target.value) || 1)} />
                            </div>
                            <div>
                              <Label className="text-xs">Unit</Label>
                              <Select value={step.delay_unit} onValueChange={(v) => updateStep(i, "delay_unit", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{DELAY_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Action</Label>
                              <Select value={step.action_type} onValueChange={(v) => updateStep(i, "action_type", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{ACTION_TYPES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                          </div>
                          {step.action_type === "Fire GHL Workflow" && (
                            <div>
                              <Label className="text-xs">GHL Workflow Name</Label>
                              <Input value={step.ghl_workflow_name || ""} onChange={(e) => updateStep(i, "ghl_workflow_name", e.target.value)} placeholder="Workflow name for documentation" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {steps.length < 10 && (
                    <Button variant="outline" size="sm" className="mt-2 border-zinc-700" onClick={addStep}>
                      <Plus className="h-3 w-3 mr-1" /> Add Step
                    </Button>
                  )}
                </div>
                <Button className="w-full bg-amber-500 text-black hover:bg-amber-400" disabled={!name || !triggerStage || createMutation.isPending} onClick={() => createMutation.mutate()}>
                  {createMutation.isPending ? "Creating..." : "Save Cadence"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {cadences.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12 text-center">
              <Zap className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No cadences configured yet. Create one to automate follow-ups.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(cadences as any[]).map((c) => {
              const stepsArr = Array.isArray(c.steps) ? c.steps : [];
              return (
                <Card key={c.id} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-amber-400" />
                        <div>
                          <p className="font-medium text-white">{c.name}</p>
                          <p className="text-xs text-zinc-400">
                            Triggers on: <span className="text-amber-400">{c.trigger_stage?.replace(/_/g, " ")}</span>
                            {c.business_unit && <> · {c.business_unit}</>}
                            {" · "}{stepsArr.length} step{stepsArr.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={c.active ? "default" : "secondary"} className={c.active ? "bg-green-500/20 text-green-400" : ""}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                        <Switch checked={c.active} onCheckedChange={(v) => toggleMutation.mutate({ id: c.id, active: v })} />
                      </div>
                    </div>
                    {stepsArr.length > 0 && (
                      <div className="flex items-center gap-1 mt-3 flex-wrap">
                        {stepsArr.map((step: any, i: number) => (
                          <div key={i} className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs border-zinc-700">
                              {step.delay_value}{step.delay_unit?.[0]} → {step.action_type}
                            </Badge>
                            {i < stepsArr.length - 1 && <ArrowRight className="h-3 w-3 text-zinc-600" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
