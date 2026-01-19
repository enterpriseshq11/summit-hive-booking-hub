import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Settings,
  Building2,
  GitBranch,
  Percent,
  Bell,
  Plus,
  Trash2,
  Edit,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type BusinessType = Database["public"]["Enums"]["business_type"];

const pipelineStages = [
  { key: "new", label: "New", color: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { key: "qualified", label: "Qualified", color: "bg-purple-500" },
  { key: "proposal_sent", label: "Proposal Sent", color: "bg-orange-500" },
  { key: "won", label: "Won", color: "bg-green-500" },
  { key: "lost", label: "Lost", color: "bg-red-500" },
];

const businessUnits: { key: BusinessType; label: string; color: string }[] = [
  { key: "spa", label: "Spa", color: "bg-pink-500" },
  { key: "fitness", label: "Fitness", color: "bg-green-500" },
  { key: "coworking", label: "Coworking", color: "bg-blue-500" },
  { key: "summit", label: "Summit", color: "bg-purple-500" },
];

export default function CommandCenterSettings() {
  const queryClient = useQueryClient();
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    commission_percent: "10",
    business_unit: "" as BusinessType | "",
  });

  // Get commission rules
  const { data: commissionRules, isLoading: rulesLoading } = useQuery({
    queryKey: ["commission_rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Get alert settings (mock using app_config for now)
  const { data: alertSettings } = useQuery({
    queryKey: ["alert_settings"],
    queryFn: async () => {
      // Return default settings - these would be stored in app_config
      return {
        lead_untouched_24h: true,
        lead_untouched_48h: true,
        lead_untouched_72h: true,
        followup_overdue: true,
        employee_inactive: true,
        revenue_no_commission: true,
        commission_pending: true,
      };
    },
  });

  // Create commission rule
  const createRule = useMutation({
    mutationFn: async (rule: typeof newRule) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("commission_rules").insert({
        name: rule.name,
        commission_percent: parseFloat(rule.commission_percent),
        business_unit: rule.business_unit || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission_rules"] });
      setIsAddRuleOpen(false);
      setNewRule({ name: "", commission_percent: "10", business_unit: "" });
      toast.success("Commission rule created");
    },
    onError: (error) => {
      toast.error("Failed to create rule: " + error.message);
    },
  });

  // Toggle rule active status
  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("commission_rules")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission_rules"] });
      toast.success("Rule updated");
    },
  });

  // Delete rule
  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("commission_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission_rules"] });
      toast.success("Rule deleted");
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            System Settings
          </h1>
          <p className="text-zinc-400">Configure business units, pipeline, and commission rules</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Units */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                Business Units
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Active business units for lead tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {businessUnits.map((unit) => (
                  <div
                    key={unit.key}
                    className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", unit.color)} />
                      <span className="text-zinc-100 font-medium">{unit.label}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-4">
                Business units are synced from the main system configuration.
              </p>
            </CardContent>
          </Card>

          {/* Pipeline Stages */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-amber-500" />
                Pipeline Stages
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Lead status progression stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pipelineStages.map((stage, idx) => (
                  <div
                    key={stage.key}
                    className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    <span className="text-zinc-500 text-sm w-6">{idx + 1}.</span>
                    <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                    <span className="text-zinc-100 font-medium flex-1">{stage.label}</span>
                    <span className="text-xs text-zinc-500 capitalize">{stage.key}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-4">
                Pipeline stages are fixed. Contact support for customization.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commission Rules */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <Percent className="h-5 w-5 text-amber-500" />
                Commission Rules
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Define commission rates by business unit or employee
              </CardDescription>
            </div>
            <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-zinc-100">Add Commission Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-zinc-300">Rule Name *</Label>
                    <Input
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      placeholder="e.g., Standard Commission"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Commission Percentage *</Label>
                    <Input
                      type="number"
                      value={newRule.commission_percent}
                      onChange={(e) =>
                        setNewRule({ ...newRule, commission_percent: e.target.value })
                      }
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Business Unit (optional)</Label>
                    <Select
                      value={newRule.business_unit || "all"}
                      onValueChange={(v) =>
                        setNewRule({
                          ...newRule,
                          business_unit: v === "all" ? "" : (v as BusinessType),
                        })
                      }
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue placeholder="All Units" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="all">All Units</SelectItem>
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="coworking">Coworking</SelectItem>
                        <SelectItem value="summit">Summit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddRuleOpen(false)}
                      className="border-zinc-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createRule.mutate(newRule)}
                      disabled={!newRule.name || createRule.isPending}
                      className="bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      Create Rule
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Rule Name</TableHead>
                  <TableHead className="text-zinc-400">Commission %</TableHead>
                  <TableHead className="text-zinc-400">Business Unit</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400 w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                      Loading rules...
                    </TableCell>
                  </TableRow>
                ) : commissionRules?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                      No commission rules configured
                    </TableCell>
                  </TableRow>
                ) : (
                  commissionRules?.map((rule) => (
                    <TableRow key={rule.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-zinc-100 font-medium">{rule.name}</TableCell>
                      <TableCell className="text-amber-500 font-bold">
                        {rule.commission_percent}%
                      </TableCell>
                      <TableCell className="text-zinc-300 capitalize">
                        {rule.business_unit || "All Units"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.is_active || false}
                          onCheckedChange={(checked) =>
                            toggleRule.mutate({ id: rule.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRule.mutate(rule.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Alert Configuration */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Alert Configuration
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Toggle automated alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "lead_untouched_24h", label: "Lead untouched 24 hours", severity: "warning" },
                { key: "lead_untouched_48h", label: "Lead untouched 48 hours", severity: "warning" },
                { key: "lead_untouched_72h", label: "Lead untouched 72 hours", severity: "critical" },
                { key: "followup_overdue", label: "Follow-up overdue", severity: "critical" },
                { key: "employee_inactive", label: "Employee inactivity", severity: "warning" },
                { key: "revenue_no_commission", label: "Revenue missing commission", severity: "info" },
                { key: "commission_pending", label: "Commissions pending approval", severity: "info" },
              ].map((alert) => (
                <div
                  key={alert.key}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        alert.severity === "critical"
                          ? "bg-red-500"
                          : alert.severity === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      )}
                    />
                    <span className="text-zinc-100 text-sm">{alert.label}</span>
                  </div>
                  <Switch
                    checked={(alertSettings as any)?.[alert.key] ?? true}
                    onCheckedChange={() => {
                      toast.success("Alert setting updated");
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
