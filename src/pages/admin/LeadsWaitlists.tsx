import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useLeadsWaitlists } from "@/hooks/useLeadsWaitlists";
import { useBusinesses } from "@/hooks/useBusinesses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { Users, Loader2, UserPlus, Clock, Send, ArrowRight, Mail, Phone, Calendar, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Lead, WaitlistEntry } from "@/types";

const LEAD_STATUSES = [
  { value: "new", label: "New", color: "default" },
  { value: "contacted", label: "Contacted", color: "secondary" },
  { value: "qualified", label: "Qualified", color: "outline" },
  { value: "proposal_sent", label: "Proposal Sent", color: "outline" },
  { value: "negotiating", label: "Negotiating", color: "outline" },
  { value: "won", label: "Won", color: "default" },
  { value: "lost", label: "Lost", color: "destructive" },
];

export default function AdminLeadsWaitlists() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const { leads, waitlists, isLoading } = useLeadsWaitlists();
  const { data: businesses } = useBusinesses();
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [selectedWaitlist, setSelectedWaitlist] = useState<WaitlistEntry | null>(null);
  const [offerExpiry, setOfferExpiry] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logAudit = async (actionType: string, entityType: string, entityId: string, before: any, after: any) => {
    await supabase.from("audit_log").insert({
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      actor_user_id: authUser?.id,
      before_json: before,
      after_json: after,
    });
  };

  const updateLeadStatus = async (lead: Lead, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus as any })
        .eq("id", lead.id);
      if (error) throw error;
      await logAudit("status_change", "lead", lead.id, { status: lead.status }, { status: newStatus });
      toast.success(`Lead status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const convertLeadToBooking = async (lead: Lead) => {
    toast.info("Redirecting to booking creation...");
    // In production, this would navigate to a pre-filled booking form
    await logAudit("convert_to_booking", "lead", lead.id, null, { converted: true });
  };

  const openOfferDialog = (entry: WaitlistEntry) => {
    setSelectedWaitlist(entry);
    setOfferExpiry(24);
    setShowOfferDialog(true);
  };

  const sendOffer = async () => {
    if (!selectedWaitlist) return;

    setIsSubmitting(true);
    try {
      const claimToken = crypto.randomUUID();
      const expiresAt = addDays(new Date(), offerExpiry / 24);

      const { error } = await supabase
        .from("waitlist_entries")
        .update({
          status: "offered",
          claim_token: claimToken,
          claim_expires_at: expiresAt.toISOString(),
          notified_at: new Date().toISOString(),
        })
        .eq("id", selectedWaitlist.id);

      if (error) throw error;
      
      await logAudit("send_offer", "waitlist_entry", selectedWaitlist.id, 
        { status: selectedWaitlist.status }, 
        { status: "offered", claim_expires_at: expiresAt.toISOString() }
      );
      
      toast.success(`Offer sent! Expires in ${offerExpiry} hours`);
      queryClient.invalidateQueries({ queryKey: ["waitlists"] });
      setShowOfferDialog(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markWaitlistClaimed = async (entry: WaitlistEntry) => {
    try {
      const { error } = await supabase
        .from("waitlist_entries")
        .update({
          status: "claimed",
          claimed_at: new Date().toISOString(),
        })
        .eq("id", entry.id);

      if (error) throw error;
      await logAudit("claim", "waitlist_entry", entry.id, { status: entry.status }, { status: "claimed" });
      toast.success("Marked as claimed");
      queryClient.invalidateQueries({ queryKey: ["waitlists"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getBusinessName = (id: string) => businesses?.find((b) => b.id === id)?.name || "Unknown";
  const getStatusBadge = (status: string) => {
    const s = LEAD_STATUSES.find((ls) => ls.value === status);
    return s ? <Badge variant={s.color as any}>{s.label}</Badge> : <Badge>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const activeWaitlists = waitlists?.filter((w) => w.status === "waiting" || w.status === "offered") || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Leads & Waitlists
            </h1>
            <p className="text-muted-foreground">
              Manage inquiries and waitlist entries
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Active Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads?.filter((l) => !["won", "lost"].includes(l.status || "")).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Won This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {leads?.filter((l) => l.status === "won").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Waitlist Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeWaitlists.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">VIP Waitlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeWaitlists.filter((w) => w.is_vip).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads">Leads ({leads?.length || 0})</TabsTrigger>
            <TabsTrigger value="waitlists">Waitlists ({waitlists?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads?.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lead.first_name} {lead.last_name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{lead.event_type || "General Inquiry"}</div>
                            <div className="text-sm text-muted-foreground">
                              {getBusinessName(lead.business_id)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {lead.guest_count && <div>Guests: {lead.guest_count}</div>}
                            {lead.budget_range && <div>Budget: {lead.budget_range}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={lead.status || "new"} onValueChange={(v) => updateLeadStatus(lead, v)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LEAD_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => convertLeadToBooking(lead)}>
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Convert
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!leads || leads.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No leads
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlists" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Preferences</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitlists?.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-lg">#{entry.position || "—"}</span>
                            {entry.is_vip && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <Crown className="h-3 w-3 mr-1" />
                                VIP
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {entry.guest_email && (
                              <div className="text-sm flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {entry.guest_email}
                              </div>
                            )}
                            {entry.guest_phone && (
                              <div className="text-sm flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {entry.guest_phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entry.preferred_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(entry.preferred_date), "MMM d, yyyy")}
                              </div>
                            )}
                            {entry.preferred_time_start && entry.preferred_time_end && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {entry.preferred_time_start} - {entry.preferred_time_end}
                              </div>
                            )}
                            {entry.flexibility_days && (
                              <div className="text-muted-foreground">
                                ±{entry.flexibility_days} days flexible
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={
                              entry.status === "waiting" ? "default" :
                              entry.status === "offered" ? "outline" :
                              entry.status === "claimed" ? "secondary" : "destructive"
                            }>
                              {entry.status || "waiting"}
                            </Badge>
                            {entry.claim_expires_at && entry.status === "offered" && (
                              <div className="text-xs text-muted-foreground">
                                Expires: {format(new Date(entry.claim_expires_at), "MMM d, h:mm a")}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {entry.status === "waiting" && (
                              <Button variant="outline" size="sm" onClick={() => openOfferDialog(entry)}>
                                <Send className="h-4 w-4 mr-1" />
                                Send Offer
                              </Button>
                            )}
                            {entry.status === "offered" && (
                              <Button variant="ghost" size="sm" onClick={() => markWaitlistClaimed(entry)}>
                                Mark Claimed
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!waitlists || waitlists.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No waitlist entries
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Offer Dialog */}
        <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Waitlist Offer</DialogTitle>
            </DialogHeader>
            {selectedWaitlist && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Sending offer to:</div>
                  <div className="font-medium">{selectedWaitlist.guest_email || selectedWaitlist.guest_phone}</div>
                  {selectedWaitlist.preferred_date && (
                    <div className="text-sm mt-1">
                      Preferred: {format(new Date(selectedWaitlist.preferred_date), "MMMM d, yyyy")}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Offer Expires In (hours)</Label>
                  <Select value={offerExpiry.toString()} onValueChange={(v) => setOfferExpiry(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOfferDialog(false)}>Cancel</Button>
              <Button onClick={sendOffer} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Offer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
