import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import { useCrmEmployees, useCrmEmployee } from "@/hooks/useCrmEmployees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Target,
  TrendingUp,
  DollarSign,
  Percent,
  Activity,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CommandCenterEmployees() {
  const navigate = useNavigate();
  const { data: employees, isLoading } = useCrmEmployees();

  const roleColors: Record<string, string> = {
    owner: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    manager: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    event_coordinator: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    spa_lead: "bg-pink-500/20 text-pink-400 border-pink-500/50",
    fitness_lead: "bg-green-500/20 text-green-400 border-green-500/50",
    coworking_manager: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    front_desk: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    read_only: "bg-zinc-500/20 text-zinc-400 border-zinc-500/50",
  };

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Employees</h1>
          <p className="text-zinc-400">Track employee performance and productivity</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Activity className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">
                    {employees?.length || 0}
                  </div>
                  <div className="text-xs text-zinc-400">Total Staff</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">
                    {employees?.reduce((s, e) => s + e.leads_assigned, 0) || 0}
                  </div>
                  <div className="text-xs text-zinc-400">Total Leads Assigned</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">
                    {formatCurrency(employees?.reduce((s, e) => s + e.revenue_influenced, 0) || 0)}
                  </div>
                  <div className="text-xs text-zinc-400">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Percent className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">
                    {formatCurrency(employees?.reduce((s, e) => s + e.commission_earned, 0) || 0)}
                  </div>
                  <div className="text-xs text-zinc-400">Total Commission Paid</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Employee Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Employee</TableHead>
                  <TableHead className="text-zinc-400">Role</TableHead>
                  <TableHead className="text-zinc-400 text-right">Leads Assigned</TableHead>
                  <TableHead className="text-zinc-400 text-right">Contacted</TableHead>
                  <TableHead className="text-zinc-400 text-right">Conversion</TableHead>
                  <TableHead className="text-zinc-400 text-right">Revenue</TableHead>
                  <TableHead className="text-zinc-400 text-right">Commission</TableHead>
                  <TableHead className="text-zinc-400">Last Activity</TableHead>
                  <TableHead className="text-zinc-400 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-zinc-500">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : employees?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-zinc-500">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  employees?.map((emp) => {
                    const initials = `${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase() || "?";
                    return (
                      <TableRow
                        key={emp.id}
                        className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer"
                        onClick={() => navigate(`/command-center/employees/${emp.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-zinc-100">
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div className="text-xs text-zinc-500">{emp.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", roleColors[emp.role] || roleColors.read_only)}>
                            {emp.role?.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-zinc-300">{emp.leads_assigned}</TableCell>
                        <TableCell className="text-right text-zinc-300">{emp.leads_contacted}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "font-medium",
                              emp.conversion_rate >= 30
                                ? "text-green-400"
                                : emp.conversion_rate >= 15
                                ? "text-yellow-400"
                                : "text-red-400"
                            )}
                          >
                            {emp.conversion_rate.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-zinc-300">
                          {formatCurrency(emp.revenue_influenced)}
                        </TableCell>
                        <TableCell className="text-right text-zinc-300">
                          {formatCurrency(emp.commission_earned)}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-sm">
                          {emp.last_activity
                            ? formatDistanceToNow(new Date(emp.last_activity), { addSuffix: true })
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-zinc-500" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </CommandCenterLayout>
  );
}
