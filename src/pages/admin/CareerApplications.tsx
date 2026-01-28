import { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, Users, Briefcase, Dumbbell, Wrench, Phone, Mail, Circle } from "lucide-react";
import { format } from "date-fns";
import {
  useCareerApplications,
  useMarkApplicationRead,
  CareerTeam,
  CareerApplicationStatus,
  CareerApplication,
} from "@/hooks/useCareerApplications";
import { CareerApplicationDetailModal } from "@/components/admin/CareerApplicationDetailModal";

const statusColors: Record<CareerApplicationStatus, string> = {
  new: "bg-blue-500",
  reviewing: "bg-amber-500",
  interview: "bg-purple-500",
  offer: "bg-green-500",
  hired: "bg-emerald-600",
  rejected: "bg-zinc-500",
};

const teamColors: Record<CareerTeam, string> = {
  spa: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  fitness: "bg-green-500/20 text-green-300 border-green-500/30",
  contracting: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const teamLabels: Record<CareerTeam, string> = {
  spa: "Spa",
  fitness: "Fitness",
  contracting: "Contracting",
};

const spaRoles = [
  "Massage Therapist",
  "Yoga Instructor",
  "Pilates Instructor",
  "Esthetician",
  "Nail Tech",
  "Front Desk / Guest Services",
  "Spa Attendant",
  "Other",
];

const fitnessRoles = [
  "Personal Trainer",
  "Strength Coach",
  "Group Fitness Instructor",
  "Nutrition Coach",
  "Front Desk",
  "Other",
];

const contractingRoles = [
  "General Contractor",
  "Handyman",
  "Electrician",
  "Plumber",
  "HVAC",
  "Painter",
  "Flooring",
  "Carpenter",
  "Other",
];

export default function CareerApplicationsAdmin() {
  const [activeTab, setActiveTab] = useState<"all" | CareerTeam>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication | null>(null);

  const teamFilter = activeTab === "all" ? undefined : activeTab;
  const { data: applications, isLoading, refetch } = useCareerApplications({
    team: teamFilter,
    status: statusFilter !== "all" ? (statusFilter as CareerApplicationStatus) : undefined,
  });

  const markAsRead = useMarkApplicationRead();

  const filteredApplications = useMemo(() => {
    if (!applications) return [];

    return applications.filter((app) => {
      // Role filter
      if (roleFilter !== "all" && app.role !== roleFilter) return false;

      // Search filter - enhanced to include team and tags
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const applicant = app.applicant;
        const fullName = `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
        const email = applicant.email.toLowerCase();
        const phone = applicant.phone;
        const teamLabel = teamLabels[app.team].toLowerCase();
        const tagsString = (app.tags || []).join(" ").toLowerCase();

        if (
          !fullName.includes(query) &&
          !email.includes(query) &&
          !phone.includes(query) &&
          !app.role.toLowerCase().includes(query) &&
          !teamLabel.includes(query) &&
          !tagsString.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [applications, roleFilter, searchQuery]);

  const getRolesForTeam = (team: CareerTeam | "all") => {
    if (team === "all") return [...new Set([...spaRoles, ...fitnessRoles, ...contractingRoles])];
    if (team === "spa") return spaRoles;
    if (team === "fitness") return fitnessRoles;
    return contractingRoles;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | CareerTeam);
    setRoleFilter("all"); // Reset role filter when changing team
  };

  const handleViewApplication = async (app: CareerApplication) => {
    // Mark as read when viewing
    if (!app.is_read) {
      try {
        await markAsRead.mutateAsync(app.id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
    setSelectedApplication(app);
  };

  const getStatusBadge = (status: CareerApplicationStatus) => (
    <Badge className={`${statusColors[status]} text-white capitalize`}>
      {status.replace("_", " ")}
    </Badge>
  );

  const getTeamBadge = (team: CareerTeam) => (
    <Badge variant="outline" className={`${teamColors[team]} border`}>
      {teamLabels[team]}
    </Badge>
  );

  const getRoleBadge = (role: string) => (
    <Badge variant="secondary" className="bg-zinc-700/50 text-zinc-200">
      {role}
    </Badge>
  );

  const stats = useMemo(() => {
    if (!applications) return { total: 0, new: 0, reviewing: 0, interview: 0, unread: 0 };
    return {
      total: applications.length,
      new: applications.filter((a) => a.status === "new").length,
      reviewing: applications.filter((a) => a.status === "reviewing").length,
      interview: applications.filter((a) => a.status === "interview").length,
      unread: applications.filter((a) => !a.is_read).length,
    };
  }, [applications]);

  // Calculate tab counts for badges
  const tabCounts = useMemo(() => {
    if (!applications) return { all: 0, spa: 0, fitness: 0, contracting: 0 };
    
    // Get all applications for counting (need to fetch all for accurate counts)
    return {
      all: applications.length,
      spa: applications.filter(a => a.team === "spa").length,
      fitness: applications.filter(a => a.team === "fitness").length,
      contracting: applications.filter(a => a.team === "contracting").length,
    };
  }, [applications]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Careers Applications</h1>
          <p className="text-zinc-400">Review and manage job applications</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <p className="text-sm text-zinc-400">Total Applications</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
              <p className="text-sm text-zinc-400">New</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-400">{stats.reviewing}</div>
              <p className="text-sm text-zinc-400">Reviewing</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-400">{stats.interview}</div>
              <p className="text-sm text-zinc-400">Interview</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-red-400">{stats.unread}</div>
                {stats.unread > 0 && <Circle className="h-3 w-3 fill-red-500 text-red-500" />}
              </div>
              <p className="text-sm text-zinc-400">Unread</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-500/20">
              All Applications
            </TabsTrigger>
            <TabsTrigger value="spa" className="data-[state=active]:bg-pink-500/20 gap-2">
              <Users className="h-4 w-4" />
              Spa
            </TabsTrigger>
            <TabsTrigger value="fitness" className="data-[state=active]:bg-green-500/20 gap-2">
              <Dumbbell className="h-4 w-4" />
              Fitness
            </TabsTrigger>
            <TabsTrigger value="contracting" className="data-[state=active]:bg-orange-500/20 gap-2">
              <Wrench className="h-4 w-4" />
              Contracting
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {/* Filters */}
            <Card className="bg-zinc-900 border-zinc-800 mb-4">
              <CardContent className="pt-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search by name, email, phone, team, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                    />
                  </div>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="all">All Roles</SelectItem>
                      {getRolesForTeam(activeTab).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Applications Table */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Applications ({filteredApplications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
                    ))}
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    No applications found matching your criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-700 hover:bg-transparent">
                          <TableHead className="text-zinc-400 w-8"></TableHead>
                          <TableHead className="text-zinc-400">Applicant</TableHead>
                          <TableHead className="text-zinc-400">Team / Role</TableHead>
                          <TableHead className="text-zinc-400">Contact</TableHead>
                          <TableHead className="text-zinc-400">Submitted</TableHead>
                          <TableHead className="text-zinc-400">Status</TableHead>
                          <TableHead className="text-zinc-400 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((app) => (
                          <TableRow
                            key={app.id}
                            className={`border-zinc-700 hover:bg-zinc-800/50 ${!app.is_read ? 'bg-zinc-800/30' : ''}`}
                          >
                            <TableCell className="w-8">
                              {!app.is_read && (
                                <Circle className="h-2.5 w-2.5 fill-blue-500 text-blue-500" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-white">
                              <div className="flex items-center gap-2">
                                {!app.is_read && (
                                  <span className="sr-only">Unread</span>
                                )}
                                <span className={!app.is_read ? 'font-semibold' : ''}>
                                  {app.applicant.firstName} {app.applicant.lastName}
                                </span>
                              </div>
                              {app.applicant.preferredName && (
                                <span className="text-zinc-400 text-sm ml-1">
                                  ({app.applicant.preferredName})
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1.5">
                                {getTeamBadge(app.team)}
                                {getRoleBadge(app.role)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <a
                                  href={`mailto:${app.applicant.email}`}
                                  className="flex items-center gap-1 text-sm text-zinc-400 hover:text-amber-400"
                                >
                                  <Mail className="h-3 w-3" />
                                  {app.applicant.email}
                                </a>
                                <a
                                  href={`tel:${app.applicant.phone}`}
                                  className="flex items-center gap-1 text-sm text-zinc-400 hover:text-amber-400"
                                >
                                  <Phone className="h-3 w-3" />
                                  {app.applicant.phone}
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm">
                              {format(new Date(app.created_at), "MMM d, yyyy")}
                              <br />
                              <span className="text-xs">
                                {format(new Date(app.created_at), "h:mm a")}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewApplication(app)}
                                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      <CareerApplicationDetailModal
        application={selectedApplication}
        open={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdate={() => {
          refetch();
          setSelectedApplication(null);
        }}
      />
    </AdminLayout>
  );
}