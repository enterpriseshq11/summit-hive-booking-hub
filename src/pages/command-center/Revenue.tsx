import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import { useCrmRevenue, useCreateCrmRevenue } from "@/hooks/useCrmRevenue";
import { useCrmEmployees } from "@/hooks/useCrmEmployees";
import { useCrmLeads } from "@/hooks/useCrmLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type BusinessType = Database["public"]["Enums"]["business_type"];

const businessUnitLabels: Record<BusinessType, string> = {
  spa: "Spa",
  fitness: "Fitness",
  coworking: "Coworking",
  summit: "Summit",
};

const businessUnitColors: Record<BusinessType, string> = {
  spa: "bg-pink-500/20 text-pink-400 border-pink-500/50",
  fitness: "bg-green-500/20 text-green-400 border-green-500/50",
  coworking: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  summit: "bg-purple-500/20 text-purple-400 border-purple-500/50",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CommandCenterRevenue() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    amount: "",
    description: "",
    business_unit: "spa" as BusinessType,
    employee_attributed_id: "",
    lead_id: "",
  });

  const unitFilter = searchParams.get("unit") as BusinessType | null;
  const employeeFilter = searchParams.get("employee");

  const { data: revenue, isLoading } = useCrmRevenue({
    businessUnit: unitFilter || undefined,
    employeeId: employeeFilter || undefined,
  });
  const { data: employees } = useCrmEmployees();
  const { data: leads } = useCrmLeads({ status: "won" });
  const createRevenue = useCreateCrmRevenue();

  const handleCreate = async () => {
    if (!newRevenue.amount) return;
    await createRevenue.mutateAsync({
      amount: parseFloat(newRevenue.amount),
      description: newRevenue.description,
      business_unit: newRevenue.business_unit,
      employee_attributed_id: newRevenue.employee_attributed_id || null,
      lead_id: newRevenue.lead_id || null,
      recorded_by: "", // Will be set by hook
    });
    setIsCreateOpen(false);
    setNewRevenue({
      amount: "",
      description: "",
      business_unit: "spa",
      employee_attributed_id: "",
      lead_id: "",
    });
  };

  const totalRevenue = revenue?.reduce((s, r) => s + Number(r.amount), 0) || 0;
  const byUnit = revenue?.reduce((acc, r) => {
    acc[r.business_unit] = (acc[r.business_unit] || 0) + Number(r.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Revenue</h1>
            <p className="text-zinc-400">Track all revenue events and attribution</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Record Revenue
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Record Revenue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-zinc-300">Amount *</Label>
                  <Input
                    type="number"
                    value={newRevenue.amount}
                    onChange={(e) =>
                      setNewRevenue({ ...newRevenue, amount: e.target.value })
                    }
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Business Unit *</Label>
                  <Select
                    value={newRevenue.business_unit}
                    onValueChange={(v) =>
                      setNewRevenue({ ...newRevenue, business_unit: v as BusinessType })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="spa">Spa</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="coworking">Coworking</SelectItem>
                      <SelectItem value="summit">Summit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Attribute to Employee</Label>
                  <Select
                    value={newRevenue.employee_attributed_id || "none"}
                    onValueChange={(v) =>
                      setNewRevenue({
                        ...newRevenue,
                        employee_attributed_id: v === "none" ? "" : v,
                      })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="none">None</SelectItem>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Link to Lead</Label>
                  <Select
                    value={newRevenue.lead_id || "none"}
                    onValueChange={(v) =>
                      setNewRevenue({ ...newRevenue, lead_id: v === "none" ? "" : v })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="none">None</SelectItem>
                      {leads?.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.lead_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Description</Label>
                  <Textarea
                    value={newRevenue.description}
                    onChange={(e) =>
                      setNewRevenue({ ...newRevenue, description: e.target.value })
                    }
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="Booking, package sale, etc."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="border-zinc-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!newRevenue.amount || createRevenue.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    Record Revenue
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div className="text-xs text-zinc-400">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {(["spa", "fitness", "coworking", "summit"] as BusinessType[]).map((unit) => (
            <Card key={unit} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", businessUnitColors[unit].split(" ")[0])}>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-zinc-100">
                      {formatCurrency(byUnit[unit] || 0)}
                    </div>
                    <div className="text-xs text-zinc-400">{businessUnitLabels[unit]}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select
                value={unitFilter || "all"}
                onValueChange={(v) => {
                  if (v === "all") {
                    searchParams.delete("unit");
                  } else {
                    searchParams.set("unit", v);
                  }
                  setSearchParams(searchParams);
                }}
              >
                <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-zinc-100">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Business Unit" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="spa">Spa</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="coworking">Coworking</SelectItem>
                  <SelectItem value="summit">Summit</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={employeeFilter || "all"}
                onValueChange={(v) => {
                  if (v === "all") {
                    searchParams.delete("employee");
                  } else {
                    searchParams.set("employee", v);
                  }
                  setSearchParams(searchParams);
                }}
              >
                <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Revenue Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-400">Unit</TableHead>
                  <TableHead className="text-zinc-400">Description</TableHead>
                  <TableHead className="text-zinc-400">Attributed To</TableHead>
                  <TableHead className="text-zinc-400">Lead</TableHead>
                  <TableHead className="text-zinc-400">Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                      Loading revenue...
                    </TableCell>
                  </TableRow>
                ) : revenue?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                      No revenue recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  revenue?.map((rev) => (
                    <TableRow key={rev.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-zinc-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-zinc-500" />
                          {rev.revenue_date
                            ? format(new Date(rev.revenue_date), "MMM d, yyyy")
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-100 font-medium">
                        {formatCurrency(Number(rev.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(businessUnitColors[rev.business_unit])}>
                          {businessUnitLabels[rev.business_unit]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300 max-w-[200px] truncate">
                        {rev.description || "—"}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {rev.employee_attributed
                          ? `${rev.employee_attributed.first_name} ${rev.employee_attributed.last_name}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {rev.lead ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/command-center/leads/${rev.lead_id}`)
                            }
                            className="text-amber-500 hover:text-amber-400 p-0 h-auto"
                          >
                            {rev.lead.lead_name}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {rev.recorded_by_profile
                          ? `${rev.recorded_by_profile.first_name} ${rev.recorded_by_profile.last_name}`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </CommandCenterLayout>
  );
}
