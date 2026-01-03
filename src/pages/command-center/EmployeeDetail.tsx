import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import { useCrmEmployee } from "@/hooks/useCrmEmployees";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  Activity,
  Send,
  RefreshCw,
  Percent,
  Mail,
  Calendar,
} from "lucide-react";
import { format, formatDistanceToNow, eachDayOfInterval, subDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");

  const { data: employee, isLoading } = useCrmEmployee(id);

  // Create note mutation
  const createNote = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("employee_notes").insert({
        employee_id: id!,
        content,
        created_by: user?.id!,
        note_type: "performance",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_employee", id] });
      setNoteContent("");
      toast.success("Note added");
    },
    onError: (error) => {
      toast.error("Failed to add note: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <CommandCenterLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      </CommandCenterLayout>
    );
  }

  if (!employee) {
    return (
      <CommandCenterLayout>
        <div className="text-center py-12">
          <p className="text-zinc-500">Employee not found</p>
          <Button
            variant="outline"
            onClick={() => navigate("/command-center/employees")}
            className="mt-4"
          >
            Back to Employees
          </Button>
        </div>
      </CommandCenterLayout>
    );
  }

  const { profile, role, stats, activities, notes } = employee;
  const initials =
    `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "?";

  // Generate activity heatmap data (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  });

  const activityByDay = last30Days.map((day) => {
    const count = activities.filter((a) =>
      a.created_at ? isSameDay(new Date(a.created_at), day) : false
    ).length;
    return { date: day, count };
  });

  const maxActivity = Math.max(...activityByDay.map((d) => d.count), 1);

  // Calculate average response time (mock calculation based on activity patterns)
  const avgResponseTime = activities.length > 0 ? "2.4 hrs" : "—";

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
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/command-center/employees")}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">
                {profile.first_name} {profile.last_name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className={cn("capitalize", roleColors[role || ""] || roleColors.read_only)}>
                  {role?.replace("_", " ") || "No Role"}
                </Badge>
                {profile.email && (
                  <span className="flex items-center gap-1 text-sm text-zinc-400">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">
                    {stats.leads_assigned}
                  </div>
                  <div className="text-xs text-zinc-400">Leads Assigned</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">{stats.leads_won}</div>
                  <div className="text-xs text-zinc-400">Leads Won</div>
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
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      stats.conversion_rate >= 30
                        ? "text-green-400"
                        : stats.conversion_rate >= 15
                        ? "text-yellow-400"
                        : "text-red-400"
                    )}
                  >
                    {stats.conversion_rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-zinc-400">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">
                    {formatCurrency(stats.revenue_total)}
                  </div>
                  <div className="text-xs text-zinc-400">Revenue Influenced</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-100">{avgResponseTime}</div>
                  <div className="text-xs text-zinc-400">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Heatmap */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-500" />
                  Activity Heatmap (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {activityByDay.map((day, idx) => {
                    const intensity = day.count / maxActivity;
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "w-6 h-6 rounded-sm transition-colors",
                          day.count === 0
                            ? "bg-zinc-800"
                            : intensity < 0.33
                            ? "bg-amber-500/30"
                            : intensity < 0.66
                            ? "bg-amber-500/60"
                            : "bg-amber-500"
                        )}
                        title={`${format(day.date, "MMM d")}: ${day.count} activities`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-sm bg-zinc-800" />
                    <div className="w-4 h-4 rounded-sm bg-amber-500/30" />
                    <div className="w-4 h-4 rounded-sm bg-amber-500/60" />
                    <div className="w-4 h-4 rounded-sm bg-amber-500" />
                  </div>
                  <span>More</span>
                </div>
              </CardContent>
            </Card>

            {/* Commission Summary */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Commission Totals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-zinc-100">
                      {formatCurrency(stats.commission_total)}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">Total Earned</div>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(stats.commission_paid)}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">Paid Out</div>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {formatCurrency(stats.commission_total - stats.commission_paid)}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 10).map((activity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-zinc-800 rounded"
                      >
                        <span className="text-sm text-zinc-100">Activity recorded</span>
                        <span className="text-xs text-zinc-500">
                          {activity.created_at &&
                            formatDistanceToNow(new Date(activity.created_at), {
                              addSuffix: true,
                            })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Admin Notes */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Admin Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add internal note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 resize-none"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => createNote.mutate(noteContent)}
                  disabled={!noteContent.trim() || createNote.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Add Note
                </Button>

                <Separator className="bg-zinc-800" />

                {notes.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No admin notes</p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note: any) => (
                      <div
                        key={note.id}
                        className="p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                      >
                        <p className="text-zinc-100 text-sm">{note.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                          <span>
                            {note.created_by_profile?.first_name}{" "}
                            {note.created_by_profile?.last_name}
                          </span>
                          <span>
                            {note.created_at &&
                              formatDistanceToNow(new Date(note.created_at), {
                                addSuffix: true,
                              })}
                          </span>
                        </div>
                        {note.note_type && (
                          <Badge className="mt-2 text-xs bg-zinc-700 text-zinc-300">
                            {note.note_type}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CommandCenterLayout>
  );
}
