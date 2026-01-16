import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { 
  useOfficeInquiries,
  useUpdateOfficeInquiry,
  useOfficeInquiryStats,
  type InquiryStatus,
  type InquiryType
} from "@/hooks/useOfficeInquiries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, Eye, Filter, Mail, Phone, Building2, Calendar, Users, Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const inquiryStatuses: { value: InquiryStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-blue-500" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { value: "scheduled", label: "Scheduled", color: "bg-purple-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "closed", label: "Closed", color: "bg-gray-500" },
];

const inquiryTypes: { value: InquiryType; label: string }[] = [
  { value: "request", label: "Workspace Request" },
  { value: "tour", label: "Tour Request" },
  { value: "waitlist", label: "Waitlist" },
  { value: "question", label: "Question" },
];

export default function AdminOfficeInquiries() {
  const { data: inquiries, isLoading } = useOfficeInquiries();
  const { data: stats } = useOfficeInquiryStats();
  const updateInquiry = useUpdateOfficeInquiry();

  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "all">("all");
  const [filterType, setFilterType] = useState<InquiryType | "all">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  const openDetail = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setInternalNotes(inquiry.internal_notes || "");
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = (status: InquiryStatus) => {
    if (!selectedInquiry) return;
    updateInquiry.mutate({
      id: selectedInquiry.id,
      updates: { status, internal_notes: internalNotes }
    }, {
      onSuccess: () => {
        setSelectedInquiry({ ...selectedInquiry, status, internal_notes: internalNotes });
      }
    });
  };

  const handleSaveNotes = () => {
    if (!selectedInquiry) return;
    updateInquiry.mutate({
      id: selectedInquiry.id,
      updates: { internal_notes: internalNotes }
    });
  };

  const getStatusBadge = (status: InquiryStatus) => {
    const config = inquiryStatuses.find(s => s.value === status);
    return <Badge className={`${config?.color} text-white`}>{config?.label}</Badge>;
  };

  const getTypeBadge = (type: InquiryType) => {
    const config = inquiryTypes.find(t => t.value === type);
    return <Badge variant="outline">{config?.label}</Badge>;
  };

  const filteredInquiries = inquiries?.filter(inquiry => {
    if (filterStatus !== "all" && inquiry.status !== filterStatus) return false;
    if (filterType !== "all" && inquiry.inquiry_type !== filterType) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Office Inquiries</h1>
          <p className="text-muted-foreground">Manage workspace requests and tour bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <div className="text-sm text-muted-foreground">Total Inquiries</div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-500">{stats?.new || 0}</div>
              <div className="text-sm text-muted-foreground">New</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-500">{stats?.contacted || 0}</div>
              <div className="text-sm text-muted-foreground">Contacted</div>
            </CardContent>
          </Card>
          <Card className="border-purple-500/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-500">{stats?.scheduled || 0}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </CardContent>
          </Card>
          <Card className="border-green-500/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">{stats?.completed || 0}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as InquiryStatus | "all")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {inquiryStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as InquiryType | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {inquiryTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto text-sm text-muted-foreground">
                {filteredInquiries?.length || 0} inquiries
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Table */}
        {isLoading ? (
          <Skeleton className="h-96" />
        ) : !inquiries?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No inquiries yet</h3>
              <p className="text-muted-foreground">Inquiries from the website will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries?.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inquiry.first_name} {inquiry.last_name}</p>
                        <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                        {inquiry.company_name && (
                          <p className="text-sm text-muted-foreground">{inquiry.company_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(inquiry.inquiry_type as InquiryType)}</TableCell>
                    <TableCell>
                      {inquiry.office_listings ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Building2 className="h-4 w-4" />
                          {inquiry.office_listings.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {inquiry.workspace_type || "General"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {inquiry.seats_needed && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {inquiry.seats_needed} seats
                          </span>
                        )}
                        {inquiry.move_in_timeframe && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {inquiry.move_in_timeframe}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(inquiry.status as InquiryStatus)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(inquiry)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
            </DialogHeader>
            
            {selectedInquiry && (
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">{selectedInquiry.first_name} {selectedInquiry.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <p>{selectedInquiry.company_name || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedInquiry.email}`} className="text-accent hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedInquiry.phone}`} className="text-accent hover:underline">
                        {selectedInquiry.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Inquiry Type</label>
                      <p>{getTypeBadge(selectedInquiry.inquiry_type)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Workspace Interest</label>
                      <p>{selectedInquiry.workspace_type || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Seats Needed</label>
                      <p>{selectedInquiry.seats_needed || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Move-in Timeframe</label>
                      <p>{selectedInquiry.move_in_timeframe || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {selectedInquiry.message && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-muted-foreground">Message</label>
                    <p className="mt-1 p-3 bg-muted rounded-md">{selectedInquiry.message}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={selectedInquiry.status} 
                    onValueChange={(v) => handleUpdateStatus(v as InquiryStatus)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm font-medium">Internal Notes</label>
                  <Textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add internal notes about this inquiry..."
                    rows={3}
                    className="mt-1"
                  />
                  <Button 
                    size="sm" 
                    className="mt-2" 
                    onClick={handleSaveNotes}
                    disabled={updateInquiry.isPending}
                  >
                    Save Notes
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground border-t pt-4">
                  Received: {format(new Date(selectedInquiry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  {selectedInquiry.source !== "website" && ` • Source: ${selectedInquiry.source}`}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
