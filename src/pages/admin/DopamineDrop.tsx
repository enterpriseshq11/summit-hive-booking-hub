import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Gift, Trophy, Users, Settings, AlertTriangle, 
  Download, CheckCircle, XCircle, Clock, RefreshCw,
  Crown, Ticket, TrendingUp, Edit, Save, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminLayout } from "@/components/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminDopamineDrop() {
  const queryClient = useQueryClient();
  const [editingPrize, setEditingPrize] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [claimFilter, setClaimFilter] = useState<"all" | "pending" | "verified" | "redeemed" | "expired" | "disqualified">("all");

  // Fetch prizes
  const { data: prizes, isLoading: prizesLoading } = useQuery({
    queryKey: ["admin-prizes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*")
        .order("id");
      if (error) throw error;
      return data;
    }
  });

  // Fetch wheel segments
  const { data: segments } = useQuery({
    queryKey: ["admin-segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wheel_segments")
        .select(`*, prizes(name)`)
        .order("segment_index");
      if (error) throw error;
      return data;
    }
  });

  // Fetch claims
  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ["admin-claims", claimFilter],
    queryFn: async () => {
      let query = supabase
        .from("claims")
        .select(`
          *,
          spins(prize_id, prizes(name)),
          profiles:user_id(first_name, last_name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (claimFilter !== "all") {
        query = query.eq("status", claimFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch giveaway stats
  const { data: giveawayStats } = useQuery({
    queryKey: ["admin-giveaway-stats"],
    queryFn: async () => {
      const { data: tickets, error } = await supabase
        .from("giveaway_tickets")
        .select("pool, multiplier");
      if (error) throw error;
      
      const standard = tickets?.filter(t => t.pool === "standard")
        .reduce((sum, t) => sum + (t.multiplier || 1), 0) || 0;
      const vip = tickets?.filter(t => t.pool === "vip")
        .reduce((sum, t) => sum + (t.multiplier || 1), 0) || 0;
      
      return { standard, vip, total: standard + vip };
    }
  });

  // Fetch VIP members
  const { data: vipMembers } = useQuery({
    queryKey: ["admin-vip-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vip_subscriptions")
        .select(`*, profiles:user_id(first_name, last_name, email)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch today's stats
  const { data: todayStats } = useQuery({
    queryKey: ["admin-today-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      const [spinsResult, claimsResult, vipResult] = await Promise.all([
        supabase.from("spins").select("id", { count: "exact" })
          .gte("created_at", today),
        supabase.from("claims").select("id", { count: "exact" })
          .gte("created_at", today),
        supabase.from("vip_subscriptions").select("id", { count: "exact" })
          .gte("created_at", today)
      ]);
      
      return {
        spins: spinsResult.count || 0,
        claims: claimsResult.count || 0,
        vipSignups: vipResult.count || 0
      };
    }
  });

  // Update prize mutation
  const updatePrizeMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("prizes")
        .update(data.updates)
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prizes"] });
      toast.success("Prize updated");
      setEditingPrize(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update prize");
    }
  });

  // Update segment mutation
  const updateSegmentMutation = useMutation({
    mutationFn: async (data: { segment_index: number; prize_id: string }) => {
      const { error } = await supabase
        .from("wheel_segments")
        .update({ prize_id: data.prize_id })
        .eq("segment_index", data.segment_index);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-segments"] });
      toast.success("Segment updated");
    }
  });

  // Update claim status mutation
  const updateClaimMutation = useMutation({
    mutationFn: async (data: { id: string; status: "pending" | "verified" | "redeemed" | "expired" | "disqualified"; admin_notes?: string }) => {
      const { error } = await supabase
        .from("claims")
        .update({ status: data.status, admin_notes: data.admin_notes })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
      toast.success("Claim updated");
    }
  });

  // Export giveaway CSV
  const exportGiveawayCSV = async (pool: "standard" | "vip") => {
    const { data, error } = await supabase
      .from("giveaway_tickets")
      .select(`user_id, multiplier, created_at, profiles:user_id(first_name, last_name, email)`)
      .eq("pool", pool);
    
    if (error) {
      toast.error("Export failed");
      return;
    }

    const csv = [
      ["User ID", "Name", "Email", "Tickets", "Created At"].join(","),
      ...(data || []).map((t: any) => [
        t.user_id,
        `${t.profiles?.first_name || ""} ${t.profiles?.last_name || ""}`.trim(),
        t.profiles?.email || "",
        t.multiplier || 1,
        t.created_at
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `giveaway-${pool}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const startEditing = (prize: any) => {
    setEditingPrize(prize.id);
    setEditForm({
      name: prize.name,
      description: prize.description || "",
      instructions: prize.instructions || "",
      access_level: prize.access_level,
      free_weight: prize.free_weight,
      vip_weight: prize.vip_weight,
      daily_cap: prize.daily_cap || "",
      weekly_cap: prize.weekly_cap || "",
      expiry_days: prize.expiry_days || 30,
      booking_url: prize.booking_url || "",
      requires_manual_approval: prize.requires_manual_approval || false,
      active: prize.active
    });
  };

  const saveEditing = () => {
    if (!editingPrize) return;
    updatePrizeMutation.mutate({
      id: editingPrize,
      updates: {
        ...editForm,
        daily_cap: editForm.daily_cap ? parseInt(editForm.daily_cap) : null,
        weekly_cap: editForm.weekly_cap ? parseInt(editForm.weekly_cap) : null,
        free_weight: parseInt(editForm.free_weight),
        vip_weight: parseInt(editForm.vip_weight),
        expiry_days: parseInt(editForm.expiry_days)
      }
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dopamine Drop Admin</h1>
            <p className="text-muted-foreground">Manage prizes, claims, and giveaways</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats?.spins || 0}</p>
                <p className="text-sm text-muted-foreground">Spins Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats?.claims || 0}</p>
                <p className="text-sm text-muted-foreground">Claims Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Crown className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats?.vipSignups || 0}</p>
                <p className="text-sm text-muted-foreground">VIP Signups Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Ticket className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{giveawayStats?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="prizes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="prizes">Prize Manager</TabsTrigger>
            <TabsTrigger value="segments">Wheel Segments</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="giveaway">Giveaway</TabsTrigger>
            <TabsTrigger value="vip">VIP Members</TabsTrigger>
          </TabsList>

          {/* Prize Manager */}
          <TabsContent value="prizes" className="space-y-4">
            <Card className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Free Weight</TableHead>
                    <TableHead>VIP Weight</TableHead>
                    <TableHead>Daily Cap</TableHead>
                    <TableHead>Weekly Cap</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prizes?.map((prize) => (
                    <TableRow key={prize.id}>
                      {editingPrize === prize.id ? (
                        <>
                          <TableCell>
                            <Input 
                              value={editForm.name} 
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="w-40"
                            />
                          </TableCell>
                          <TableCell>
                            <Select value={editForm.access_level} onValueChange={(v) => setEditForm({...editForm, access_level: v})}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={editForm.free_weight} 
                              onChange={(e) => setEditForm({...editForm, free_weight: e.target.value})}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={editForm.vip_weight} 
                              onChange={(e) => setEditForm({...editForm, vip_weight: e.target.value})}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={editForm.daily_cap} 
                              onChange={(e) => setEditForm({...editForm, daily_cap: e.target.value})}
                              className="w-20"
                              placeholder="∞"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={editForm.weekly_cap} 
                              onChange={(e) => setEditForm({...editForm, weekly_cap: e.target.value})}
                              className="w-20"
                              placeholder="∞"
                            />
                          </TableCell>
                          <TableCell>
                            <Switch 
                              checked={editForm.active} 
                              onCheckedChange={(v) => setEditForm({...editForm, active: v})}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" onClick={saveEditing}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingPrize(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{prize.name}</TableCell>
                          <TableCell>
                            <Badge variant={prize.access_level === "vip" ? "default" : "secondary"}>
                              {prize.access_level}
                            </Badge>
                          </TableCell>
                          <TableCell>{prize.free_weight}</TableCell>
                          <TableCell>{prize.vip_weight}</TableCell>
                          <TableCell>{prize.daily_cap || "∞"}</TableCell>
                          <TableCell>{prize.weekly_cap || "∞"}</TableCell>
                          <TableCell>
                            <Badge variant={prize.active ? "default" : "destructive"}>
                              {prize.active ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => startEditing(prize)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Edit Details Panel */}
            {editingPrize && (
              <Card className="p-4 space-y-4">
                <h3 className="font-semibold">Additional Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={editForm.description} 
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Redemption Instructions</Label>
                    <Textarea 
                      value={editForm.instructions} 
                      onChange={(e) => setEditForm({...editForm, instructions: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Booking URL</Label>
                    <Input 
                      value={editForm.booking_url} 
                      onChange={(e) => setEditForm({...editForm, booking_url: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Days</Label>
                    <Input 
                      type="number"
                      value={editForm.expiry_days} 
                      onChange={(e) => setEditForm({...editForm, expiry_days: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={editForm.requires_manual_approval} 
                      onCheckedChange={(v) => setEditForm({...editForm, requires_manual_approval: v})}
                    />
                    <Label>Requires Manual Approval</Label>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Wheel Segments */}
          <TabsContent value="segments">
            <Card className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment #</TableHead>
                    <TableHead>Current Prize</TableHead>
                    <TableHead>Assign Prize</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments?.map((seg) => (
                    <TableRow key={seg.segment_index}>
                      <TableCell className="font-bold">{seg.segment_index}</TableCell>
                      <TableCell>{(seg.prizes as any)?.name || "None"}</TableCell>
                      <TableCell>
                        <Select 
                          value={seg.prize_id} 
                          onValueChange={(v) => updateSegmentMutation.mutate({ segment_index: seg.segment_index, prize_id: v })}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {prizes?.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.access_level})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Claims */}
          <TabsContent value="claims" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={claimFilter} onValueChange={(v) => setClaimFilter(v as typeof claimFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Claims</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="redeemed">Redeemed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="disqualified">Disqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims?.map((claim: any) => (
                    <TableRow key={claim.id}>
                      <TableCell>{format(new Date(claim.created_at), "MMM d, h:mm a")}</TableCell>
                      <TableCell>
                        {claim.profiles?.first_name} {claim.profiles?.last_name}
                        <br />
                        <span className="text-xs text-muted-foreground">{claim.profiles?.email}</span>
                      </TableCell>
                      <TableCell>{claim.spins?.prizes?.name}</TableCell>
                      <TableCell className="font-mono">{claim.claim_code}</TableCell>
                      <TableCell>
                        <Badge variant={
                          claim.status === "verified" ? "default" :
                          claim.status === "redeemed" ? "secondary" :
                          claim.status === "pending" ? "outline" :
                          "destructive"
                        }>
                          {claim.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={claim.status} 
                          onValueChange={(v) => updateClaimMutation.mutate({ id: claim.id, status: v as "pending" | "verified" | "redeemed" | "expired" | "disqualified" })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="redeemed">Redeemed</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="disqualified">Disqualified</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Giveaway */}
          <TabsContent value="giveaway" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Standard Pool</h3>
                <p className="text-3xl font-bold text-primary">{giveawayStats?.standard || 0}</p>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => exportGiveawayCSV("standard")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">VIP Pool</h3>
                <p className="text-3xl font-bold text-yellow-500">{giveawayStats?.vip || 0}</p>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => exportGiveawayCSV("vip")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </Card>
              <Card className="p-6 bg-muted/50">
                <h3 className="font-semibold mb-2">Drawing Date</h3>
                <p className="text-2xl font-bold">March 31, 2026</p>
                <p className="text-sm text-muted-foreground">Grand Giveaway</p>
              </Card>
            </div>
          </TabsContent>

          {/* VIP Members */}
          <TabsContent value="vip">
            <Card className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Stripe ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vipMembers?.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.profiles?.first_name} {member.profiles?.last_name}
                        <br />
                        <span className="text-xs text-muted-foreground">{member.profiles?.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.is_active ? "default" : "destructive"}>
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.expires_at ? format(new Date(member.expires_at), "MMM d, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{member.stripe_subscription_id || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}