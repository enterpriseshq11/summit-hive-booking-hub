import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCrmEmployees } from "@/hooks/useCrmEmployees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Percent, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BUSINESS_UNITS = [
  { value: "summit", label: "Summit" },
  { value: "spa", label: "Spa" },
  { value: "fitness", label: "Fitness" },
  { value: "coworking", label: "Hive / Coworking" },
  { value: "voice_vault", label: "Voice Vault" },
  { value: "elevated_by_elyse", label: "Elevated by Elyse" },
  { value: "photo_booth", label: "360 Photo Booth" },
];

export default function CommissionRulesPage() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { data: employees } = useCrmEmployees();

  const [form, setForm] = useState({
    employee_id: "",
    business_unit: "spa",
    rule_type: "percentage",
    amount: "",
    applies_to_service: "",
    is_active: true,
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["commission_rules_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select("*, employee:employee_id(first_name, last_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (ruleData: typeof form) => {
      const { error } = await supabase.from("commission_rules").insert({
        name: `${ruleData.rule_type === "percentage" ? ruleData.amount + "%" : "$" + ruleData.amount} for ${BUSINESS_UNITS.find((u) => u.value === ruleData.business_unit)?.label || ruleData.business_unit}`,
        employee_id: ruleData.employee_id || null,
        business_unit: ruleData.business_unit as any,
        commission_percent: ruleData.rule_type === "percentage" ? parseFloat(ruleData.amount) : 0,
        min_revenue: ruleData.rule_type === "flat" ? parseFloat(ruleData.amount) : null,
        is_active: ruleData.is_active,
        created_by: authUser?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission_rules_list"] });
      setIsAddOpen(false);
      setForm({ employee_id: "", business_unit: "spa", rule_type: "percentage", amount: "", applies_to_service: "", is_active: true });
      toast.success("Commission rule created");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("commission_rules").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission_rules_list"] });
      toast.success("Rule deactivated");
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Percent className="h-6 w-6 text-amber-400" />
              Commission Rules
            </h1>
            <p className="text-zinc-400 mt-1">Configure commission rates per employee and business unit</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="h-4 w-4 mr-1" /> Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Add Commission Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-zinc-300">Employee</Label>
                  <Select value={form.employee_id || "none"} onValueChange={(v) => setForm({ ...form, employee_id: v === "none" ? "" : v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="none">All Employees (Default)</SelectItem>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Business Unit</Label>
                  <Select value={form.business_unit} onValueChange={(v) => setForm({ ...form, business_unit: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {BUSINESS_UNITS.map((u) => (<SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Rule Type</Label>
                  <RadioGroup value={form.rule_type} onValueChange={(v) => setForm({ ...form, rule_type: v })} className="flex gap-4 mt-1">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="percentage" id="pct" />
                      <Label htmlFor="pct" className="text-zinc-300">Percentage</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="flat" id="flat" />
                      <Label htmlFor="flat" className="text-zinc-300">Flat Amount</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-zinc-300">{form.rule_type === "percentage" ? "Percentage (%)" : "Flat Amount ($)"}</Label>
                  <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" placeholder={form.rule_type === "percentage" ? "e.g. 10" : "e.g. 50.00"} />
                </div>
                <div>
                  <Label className="text-zinc-300">Applies to Service (optional)</Label>
                  <Input value={form.applies_to_service} onChange={(e) => setForm({ ...form, applies_to_service: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" placeholder="Leave blank for all services" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label className="text-zinc-300">Active</Label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-zinc-700">Cancel</Button>
                  <Button onClick={() => createMutation.mutate(form)} disabled={!form.amount || createMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-black">
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save Rule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Employee</TableHead>
                  <TableHead className="text-zinc-400">Business Unit</TableHead>
                  <TableHead className="text-zinc-400">Type</TableHead>
                  <TableHead className="text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-400">Active</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading...</TableCell></TableRow>
                ) : rules.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500">No commission rules configured</TableCell></TableRow>
                ) : (
                  rules.map((rule: any) => (
                    <TableRow key={rule.id} className="border-zinc-800">
                      <TableCell className="text-zinc-200">
                        {rule.employee ? `${rule.employee.first_name} ${rule.employee.last_name}` : "All Employees"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {BUSINESS_UNITS.find((u) => u.value === rule.business_unit)?.label || rule.business_unit || "All"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {rule.commission_percent > 0 ? (
                          <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> Percentage</span>
                        ) : (
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Flat</span>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-100 font-medium">
                        {rule.commission_percent > 0 ? `${rule.commission_percent}%` : `$${rule.min_revenue || 0}`}
                      </TableCell>
                      <TableCell>
                        <Badge className={rule.is_active ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rule.is_active && (
                          <Button variant="ghost" size="sm" onClick={() => deactivateMutation.mutate(rule.id)} className="text-zinc-400 hover:text-red-400">
                            Deactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
