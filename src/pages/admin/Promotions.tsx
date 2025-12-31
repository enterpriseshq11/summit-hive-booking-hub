import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePromotions, usePromotionLeads, useUpdatePromotion, useUpdatePromotionLead, type Promotion, type PromotionLead } from "@/hooks/usePromotions";
import { format } from "date-fns";
import { Gift, Users, TrendingUp, Clock, Eye, Pause, Play, Archive } from "lucide-react";

const STATUS_COLORS = {
  active: "bg-green-500/20 text-green-400 border-green-500/50",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  expired: "bg-gray-500/20 text-gray-400 border-gray-500/50",
};

const LEAD_STATUS_COLORS = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  closed: "bg-green-500/20 text-green-400 border-green-500/50",
  archived: "bg-gray-500/20 text-gray-400 border-gray-500/50",
};

export default function AdminPromotions() {
  const [activeTab, setActiveTab] = useState("promotions");
  const { data: promotions = [], isLoading: loadingPromotions } = usePromotions();
  const { data: leads = [], isLoading: loadingLeads } = usePromotionLeads();
  const updatePromotion = useUpdatePromotion();
  const updateLead = useUpdatePromotionLead();

  const activePromotions = promotions.filter((p) => p.status === "active").length;
  const newLeads = leads.filter((l) => l.status === "new").length;

  const handleUpdatePromotionStatus = (promo: Promotion, status: "active" | "paused" | "expired") => {
    updatePromotion.mutate({ id: promo.id, status });
  };

  const handleUpdateLeadStatus = (lead: PromotionLead, status: "new" | "contacted" | "closed" | "archived") => {
    updateLead.mutate({ id: lead.id, status });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">Manage offers and track lead conversion.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promotions.length}</div>
              <p className="text-xs text-muted-foreground">{activePromotions} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
              <p className="text-xs text-muted-foreground">{newLeads} new</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.length > 0 
                  ? `${Math.round((leads.filter((l) => l.status === "closed").length / leads.length) * 100)}%`
                  : "0%"
                }
              </div>
              <p className="text-xs text-muted-foreground">Leads to closed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">&lt; 24h</div>
              <p className="text-xs text-muted-foreground">Target SLA</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="leads">
              Leads
              {newLeads > 0 && (
                <Badge variant="outline" className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/50">
                  {newLeads}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="promotions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Promotions</CardTitle>
                <CardDescription>Manage offer status and visibility.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPromotions ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Offer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Leads</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promotions.map((promo) => {
                        const promoLeads = leads.filter((l) => l.offer_id === promo.id);
                        return (
                          <TableRow key={promo.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{promo.title}</div>
                                <div className="text-xs text-muted-foreground">{promo.slug}</div>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">{promo.category}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={STATUS_COLORS[promo.status]}>
                                {promo.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{promoLeads.length}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {promo.status === "active" ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUpdatePromotionStatus(promo, "paused")}
                                  >
                                    <Pause className="w-4 h-4" />
                                  </Button>
                                ) : promo.status === "paused" ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUpdatePromotionStatus(promo, "active")}
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                ) : null}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(`/promotions?view=${promo.slug}`, "_blank")}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Promotion Leads</CardTitle>
                <CardDescription>Track and manage interested prospects.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLeads ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                    ))}
                  </div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No leads yet. Leads will appear here when users submit interest.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Offer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{lead.name}</div>
                              <div className="text-xs text-muted-foreground">{lead.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{lead.offer_title_snapshot || "Custom Bundle"}</TableCell>
                          <TableCell className="capitalize">{lead.lead_type}</TableCell>
                          <TableCell>
                            <Select
                              value={lead.status}
                              onValueChange={(value) => handleUpdateLeadStatus(lead, value as "new" | "contacted" | "closed" | "archived")}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(lead.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateLeadStatus(lead, "archived")}
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
