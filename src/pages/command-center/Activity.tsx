import { useState } from "react";
import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import { useCrmActivity } from "@/hooks/useCrmActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type CrmActivityType = Database["public"]["Enums"]["crm_activity_type"];

const activityTypeLabels: Record<CrmActivityType, { label: string; color: string }> = {
  login: { label: "Login", color: "bg-gray-500/20 text-gray-400" },
  logout: { label: "Logout", color: "bg-gray-500/20 text-gray-400" },
  lead_created: { label: "Lead Created", color: "bg-blue-500/20 text-blue-400" },
  lead_updated: { label: "Lead Updated", color: "bg-yellow-500/20 text-yellow-400" },
  lead_status_changed: { label: "Status Changed", color: "bg-purple-500/20 text-purple-400" },
  lead_assigned: { label: "Lead Assigned", color: "bg-cyan-500/20 text-cyan-400" },
  lead_note_added: { label: "Note Added", color: "bg-green-500/20 text-green-400" },
  revenue_created: { label: "Revenue Added", color: "bg-emerald-500/20 text-emerald-400" },
  commission_approved: { label: "Commission Approved", color: "bg-amber-500/20 text-amber-400" },
  commission_paid: { label: "Commission Paid", color: "bg-green-500/20 text-green-400" },
  admin_override: { label: "Admin Override", color: "bg-red-500/20 text-red-400" },
  setting_changed: { label: "Setting Changed", color: "bg-orange-500/20 text-orange-400" },
  user_disabled: { label: "User Disabled", color: "bg-red-500/20 text-red-400" },
  user_enabled: { label: "User Enabled", color: "bg-green-500/20 text-green-400" },
  impersonation_started: { label: "Impersonation Started", color: "bg-pink-500/20 text-pink-400" },
  impersonation_ended: { label: "Impersonation Ended", color: "bg-pink-500/20 text-pink-400" },
  payroll_created: { label: "Payroll Created", color: "bg-indigo-500/20 text-indigo-400" },
  payroll_locked: { label: "Payroll Locked", color: "bg-yellow-500/20 text-yellow-400" },
  payroll_approved: { label: "Payroll Approved", color: "bg-blue-500/20 text-blue-400" },
  payroll_paid: { label: "Payroll Paid", color: "bg-green-500/20 text-green-400" },
};

export default function CommandCenterActivity() {
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");

  const { data: activities, isLoading } = useCrmActivity({
    eventType: eventTypeFilter !== "all" ? (eventTypeFilter as CrmActivityType) : undefined,
    entityType: entityTypeFilter !== "all" ? entityTypeFilter : undefined,
    limit: 200,
  });

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Activity Log</h1>
          <p className="text-zinc-400">Complete audit trail of all system activities</p>
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-zinc-100">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 max-h-[300px]">
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="lead_created">Lead Created</SelectItem>
                  <SelectItem value="lead_updated">Lead Updated</SelectItem>
                  <SelectItem value="lead_status_changed">Status Changed</SelectItem>
                  <SelectItem value="lead_assigned">Lead Assigned</SelectItem>
                  <SelectItem value="lead_note_added">Note Added</SelectItem>
                  <SelectItem value="revenue_created">Revenue Added</SelectItem>
                  <SelectItem value="commission_approved">Commission Approved</SelectItem>
                  <SelectItem value="commission_paid">Commission Paid</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="admin_override">Admin Override</SelectItem>
                  <SelectItem value="setting_changed">Setting Changed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="commission">Commissions</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Timestamp</TableHead>
                  <TableHead className="text-zinc-400">Actor</TableHead>
                  <TableHead className="text-zinc-400">Event</TableHead>
                  <TableHead className="text-zinc-400">Entity</TableHead>
                  <TableHead className="text-zinc-400">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                      Loading activity log...
                    </TableCell>
                  </TableRow>
                ) : activities?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                      No activity found
                    </TableCell>
                  </TableRow>
                ) : (
                  activities?.map((activity) => {
                    const eventInfo = activityTypeLabels[activity.event_type] || {
                      label: activity.event_type,
                      color: "bg-zinc-500/20 text-zinc-400",
                    };
                    const actorInitials = activity.actor
                      ? `${activity.actor.first_name?.[0] || ""}${activity.actor.last_name?.[0] || ""}`.toUpperCase()
                      : "SYS";

                    return (
                      <TableRow key={activity.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="text-zinc-400 text-sm whitespace-nowrap">
                          {format(new Date(activity.created_at), "MMM d, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
                                {actorInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-zinc-300 text-sm">
                              {activity.actor
                                ? `${activity.actor.first_name} ${activity.actor.last_name}`
                                : "System"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", eventInfo.color)}>
                            {eventInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {activity.entity_type && (
                            <div className="text-zinc-300 text-sm">
                              <span className="capitalize">{activity.entity_type}</span>
                              {activity.entity_name && (
                                <span className="text-zinc-500"> - {activity.entity_name}</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          {activity.after_data && (
                            <div className="text-xs text-zinc-500 truncate">
                              {typeof activity.after_data === "object"
                                ? JSON.stringify(activity.after_data).slice(0, 100)
                                : String(activity.after_data).slice(0, 100)}
                            </div>
                          )}
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
