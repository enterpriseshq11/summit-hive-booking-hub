import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Gift, Trophy, Users, Settings, Download, 
  CheckCircle, Lock, Play, Eye, EyeOff,
  Crown, Ticket, TrendingUp, Edit, Save, X, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminLayout } from "@/components/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, endOfMonth } from "date-fns";

interface WheelSegment {
  id: string;
  segment_index: number;
  label: string;
  outcome_type: string;
  entry_type: string | null;
  entry_quantity: number;
  icon: string;
  free_weight: number;
  vip_weight: number;
  is_active: boolean;
}

interface Draw {
  id: string;
  month_key: string;
  draw_date: string;
  status: string;
  created_at: string;
}

interface Winner {
  id: string;
  draw_id: string;
  entry_type: string;
  user_id: string;
  winner_name_public: string | null;
  announced_at: string | null;
  notes: string | null;
  profiles?: { first_name: string; last_name: string; email: string };
}

export default function AdminDopamineDrop() {
  const queryClient = useQueryClient();
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WheelSegment>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Fetch wheel config
  const { data: wheelConfig, isLoading: wheelLoading } = useQuery({
    queryKey: ["admin-wheel-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wheel_config")
        .select("*")
        .order("segment_index");
      if (error) throw error;
      return data as WheelSegment[];
    }
  });

  // Fetch app config for entry rules
  const { data: appConfig } = useQuery({
    queryKey: ["admin-app-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("*");
      if (error) throw error;
      return Object.fromEntries(data.map(c => [c.key, c.value]));
    }
  });

  // Fetch draws
  const { data: draws } = useQuery({
    queryKey: ["admin-draws"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("giveaway_draws")
        .select("*")
        .order("month_key", { ascending: false });
      if (error) throw error;
      return data as Draw[];
    }
  });

  // Fetch entries for selected month
  const { data: monthEntries } = useQuery({
    queryKey: ["admin-entries", selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("giveaway_entries")
        .select("entry_type, quantity, user_id, source, created_at")
        .eq("month_key", selectedMonth);
      if (error) throw error;
      
      // Aggregate by type
      const totals = { general: 0, massage: 0, pt: 0 };
      const uniqueUsers = new Set<string>();
      
      data?.forEach(e => {
        if (e.entry_type === "general") totals.general += e.quantity;
        else if (e.entry_type === "massage") totals.massage += e.quantity;
        else if (e.entry_type === "pt") totals.pt += e.quantity;
        uniqueUsers.add(e.user_id);
      });
      
      return { totals, userCount: uniqueUsers.size, raw: data };
    }
  });

  // Fetch winners for selected month
  const { data: winners } = useQuery({
    queryKey: ["admin-winners", selectedMonth],
    queryFn: async () => {
      const draw = draws?.find(d => d.month_key === selectedMonth);
      if (!draw) return [];
      
      const { data: winnersData, error } = await supabase
        .from("giveaway_winners")
        .select("*")
        .eq("draw_id", draw.id);
      if (error) throw error;
      
      // Fetch profiles separately
      if (!winnersData?.length) return [];
      const userIds = winnersData.map(w => w.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);
      
      const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);
      
      return winnersData.map(w => ({
        ...w,
        profiles: profileMap[w.user_id] || { first_name: "", last_name: "", email: "" }
      })) as Winner[];
    },
    enabled: !!draws
  });

  // Fetch today's stats
  const { data: todayStats } = useQuery({
    queryKey: ["admin-today-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      const [spinsResult, entriesResult, vipResult] = await Promise.all([
        supabase.from("spins").select("id", { count: "exact" }).gte("created_at", today),
        supabase.from("giveaway_entries").select("quantity").gte("created_at", today),
        supabase.from("vip_subscriptions").select("id", { count: "exact" }).gte("created_at", today)
      ]);
      
      const totalEntries = entriesResult.data?.reduce((sum, e) => sum + e.quantity, 0) || 0;
      
      return {
        spins: spinsResult.count || 0,
        entries: totalEntries,
        vipSignups: vipResult.count || 0
      };
    }
  });

  // Update wheel segment mutation
  const updateSegmentMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<WheelSegment> }) => {
      const { error } = await supabase
        .from("wheel_config")
        .update(data.updates)
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-wheel-config"] });
      toast.success("Segment updated");
      setEditingSegment(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update segment");
    }
  });

  // Update app config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      const { error } = await supabase
        .from("app_config")
        .update({ value: data.value, updated_at: new Date().toISOString() })
        .eq("key", data.key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-app-config"] });
      toast.success("Config updated");
    }
  });

  // Create/get draw for month
  const ensureDrawMutation = useMutation({
    mutationFn: async (monthKey: string) => {
      const existing = draws?.find(d => d.month_key === monthKey);
      if (existing) return existing;
      
      // Create new draw
      const [year, month] = monthKey.split("-").map(Number);
      const drawDate = endOfMonth(new Date(year, month - 1));
      
      const { data, error } = await supabase
        .from("giveaway_draws")
        .insert({
          month_key: monthKey,
          draw_date: drawDate.toISOString(),
          status: "scheduled"
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-draws"] });
    }
  });

  // Lock entries mutation
  const lockEntriesMutation = useMutation({
    mutationFn: async (drawId: string) => {
      const { error } = await supabase
        .from("giveaway_draws")
        .update({ status: "locked" })
        .eq("id", drawId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-draws"] });
      toast.success("Entries locked for this draw");
    }
  });

  // Run draw mutation (pick random winner)
  const runDrawMutation = useMutation({
    mutationFn: async ({ drawId, entryType }: { drawId: string; entryType: string }) => {
      // Get all entries for this type in the month
      const draw = draws?.find(d => d.id === drawId);
      if (!draw) throw new Error("Draw not found");
      
      const { data: entries, error: entriesError } = await supabase
        .from("giveaway_entries")
        .select("user_id, quantity")
        .eq("month_key", draw.month_key)
        .eq("entry_type", entryType);
      if (entriesError) throw entriesError;
      if (!entries?.length) throw new Error("No entries for this category");
      
      // Build weighted pool
      const pool: string[] = [];
      entries.forEach(e => {
        for (let i = 0; i < e.quantity; i++) {
          pool.push(e.user_id);
        }
      });
      
      // Pick random winner
      const winnerUserId = pool[Math.floor(Math.random() * pool.length)];
      
      // Get winner profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", winnerUserId)
        .single();
      
      const publicName = profile 
        ? `${profile.first_name || ""} ${(profile.last_name || "").charAt(0)}.`.trim()
        : "Anonymous Winner";
      
      // Check if winner already exists for this type
      const { data: existingWinner } = await supabase
        .from("giveaway_winners")
        .select("id")
        .eq("draw_id", drawId)
        .eq("entry_type", entryType)
        .single();
      
      if (existingWinner) {
        // Update existing winner
        const { error } = await supabase
          .from("giveaway_winners")
          .update({
            user_id: winnerUserId,
            winner_name_public: publicName
          })
          .eq("id", existingWinner.id);
        if (error) throw error;
      } else {
        // Insert new winner
        const { error } = await supabase
          .from("giveaway_winners")
          .insert({
            draw_id: drawId,
            entry_type: entryType,
            user_id: winnerUserId,
            winner_name_public: publicName
          });
        if (error) throw error;
      }
      
      return { winnerUserId, publicName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-winners"] });
      toast.success(`Winner selected: ${data.publicName}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Publish winners mutation
  const publishWinnersMutation = useMutation({
    mutationFn: async (drawId: string) => {
      const { error } = await supabase
        .from("giveaway_winners")
        .update({ announced_at: new Date().toISOString() })
        .eq("draw_id", drawId);
      if (error) throw error;
      
      // Also mark draw as published
      await supabase
        .from("giveaway_draws")
        .update({ status: "published" })
        .eq("id", drawId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-winners"] });
      queryClient.invalidateQueries({ queryKey: ["admin-draws"] });
      toast.success("Winners published!");
    }
  });

  // Export entries CSV
  const exportEntriesCSV = async (entryType: string) => {
    const { data, error } = await supabase
      .from("giveaway_entries")
      .select("user_id, quantity, source, created_at")
      .eq("month_key", selectedMonth)
      .eq("entry_type", entryType);
    
    if (error) {
      toast.error("Export failed");
      return;
    }

    // Get user profiles
    const userIds = [...new Set(data?.map(e => e.user_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", userIds);
    
    const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);

    const csv = [
      ["User ID", "Name", "Email", "Entries", "Source", "Created At"].join(","),
      ...(data || []).map((e) => {
        const profile = profileMap[e.user_id];
        return [
          e.user_id,
          `"${profile?.first_name || ""} ${profile?.last_name || ""}".trim()`,
          profile?.email || "",
          e.quantity,
          e.source,
          e.created_at
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entries-${entryType}-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export winners CSV
  const exportWinnersCSV = async () => {
    const draw = draws?.find(d => d.month_key === selectedMonth);
    if (!draw) return;

    const { data, error } = await supabase
      .from("giveaway_winners")
      .select("*, profiles:user_id(first_name, last_name, email)")
      .eq("draw_id", draw.id);
    
    if (error) {
      toast.error("Export failed");
      return;
    }

    const csv = [
      ["Entry Type", "User ID", "Name", "Email", "Public Name", "Announced At"].join(","),
      ...(data || []).map((w: any) => [
        w.entry_type,
        w.user_id,
        `"${w.profiles?.first_name || ""} ${w.profiles?.last_name || ""}"`,
        w.profiles?.email || "",
        w.winner_name_public || "",
        w.announced_at || "Not announced"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `winners-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEditing = (segment: WheelSegment) => {
    setEditingSegment(segment.id);
    setEditForm({ ...segment });
  };

  const saveEditing = () => {
    if (!editingSegment || !editForm) return;
    updateSegmentMutation.mutate({
      id: editingSegment,
      updates: {
        label: editForm.label,
        icon: editForm.icon,
        outcome_type: editForm.outcome_type,
        entry_type: editForm.entry_type,
        entry_quantity: editForm.entry_quantity,
        free_weight: editForm.free_weight,
        vip_weight: editForm.vip_weight,
        is_active: editForm.is_active
      }
    });
  };

  const currentDraw = draws?.find(d => d.month_key === selectedMonth);
  const isDrawLocked = currentDraw?.status === "locked" || currentDraw?.status === "drawn" || currentDraw?.status === "published";

  // Calculate total weights for display
  const totalFreeWeight = wheelConfig?.reduce((sum, s) => sum + (s.is_active ? s.free_weight : 0), 0) || 0;
  const totalVipWeight = wheelConfig?.reduce((sum, s) => sum + (s.is_active ? s.vip_weight : 0), 0) || 0;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dopamine Drop V2 Admin</h1>
            <p className="text-muted-foreground">Wheel config, entry rules, and monthly draws</p>
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
                <Ticket className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats?.entries || 0}</p>
                <p className="text-sm text-muted-foreground">Entries Today</p>
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
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{monthEntries?.userCount || 0}</p>
                <p className="text-sm text-muted-foreground">Players This Month</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="wheel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="wheel">Wheel Config</TabsTrigger>
            <TabsTrigger value="rules">Entry Rules</TabsTrigger>
            <TabsTrigger value="draw">Monthly Draw</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Wheel Configuration */}
          <TabsContent value="wheel" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Wheel Segments (8 Required)</h3>
                  <p className="text-sm text-muted-foreground">
                    Total Free Weight: {totalFreeWeight} | Total VIP Weight: {totalVipWeight}
                  </p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Entry Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Free Wt</TableHead>
                    <TableHead>VIP Wt</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wheelConfig?.map((segment) => (
                    <TableRow key={segment.id}>
                      {editingSegment === segment.id ? (
                        <>
                          <TableCell>{segment.segment_index}</TableCell>
                          <TableCell>
                            <Input 
                              value={editForm.icon || ""} 
                              onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
                              className="w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={editForm.label || ""} 
                              onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={editForm.outcome_type} 
                              onValueChange={(v) => setEditForm({...editForm, outcome_type: v, entry_type: v === "miss" ? null : editForm.entry_type})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="miss">Miss</SelectItem>
                                <SelectItem value="entry">Entry</SelectItem>
                                <SelectItem value="category_entry">Category Entry</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {editForm.outcome_type !== "miss" && (
                              <Select 
                                value={editForm.entry_type || "general"} 
                                onValueChange={(v) => setEditForm({...editForm, entry_type: v})}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="massage">Massage</SelectItem>
                                  <SelectItem value="pt">PT</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            {editForm.outcome_type !== "miss" && (
                              <Input 
                                type="number" 
                                value={editForm.entry_quantity || 0} 
                                onChange={(e) => setEditForm({...editForm, entry_quantity: parseInt(e.target.value) || 0})}
                                className="w-16"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={editForm.free_weight || 0} 
                              onChange={(e) => setEditForm({...editForm, free_weight: parseInt(e.target.value) || 0})}
                              className="w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={editForm.vip_weight || 0} 
                              onChange={(e) => setEditForm({...editForm, vip_weight: parseInt(e.target.value) || 0})}
                              className="w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Switch 
                              checked={editForm.is_active} 
                              onCheckedChange={(v) => setEditForm({...editForm, is_active: v})}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" onClick={saveEditing} disabled={updateSegmentMutation.isPending}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingSegment(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{segment.segment_index}</TableCell>
                          <TableCell className="text-xl">{segment.icon}</TableCell>
                          <TableCell className="font-medium">{segment.label}</TableCell>
                          <TableCell>
                            <Badge variant={segment.outcome_type === "miss" ? "secondary" : "default"}>
                              {segment.outcome_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{segment.entry_type || "-"}</TableCell>
                          <TableCell>{segment.outcome_type !== "miss" ? segment.entry_quantity : "-"}</TableCell>
                          <TableCell>{segment.free_weight}</TableCell>
                          <TableCell>{segment.vip_weight}</TableCell>
                          <TableCell>
                            <Badge variant={segment.is_active ? "default" : "destructive"}>
                              {segment.is_active ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => startEditing(segment)}>
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
            
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Weight Distribution Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Weights determine probability. Higher weight = more likely. Example: weight 18 out of total 100 = 18% chance.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Recommended Free User Distribution:</p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>Miss segments: ~72% total (4 × 18)</li>
                    <li>+1 Entry: ~14%</li>
                    <li>+2 Entries: ~10%</li>
                    <li>Category entries: ~4% total (2 × 2)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Recommended VIP Distribution:</p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>Miss segments: ~56% total (4 × 14)</li>
                    <li>+1 Entry: ~20%</li>
                    <li>+2 Entries: ~16%</li>
                    <li>Category entries: ~8% total (2 × 4)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Entry Rules */}
          <TabsContent value="rules" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  VIP Multiplier
                </h3>
                <div className="space-y-2">
                  <Label>Entry Multiplier for VIP Users</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      value={appConfig?.vip_entry_multiplier || "2"}
                      onChange={(e) => updateConfigMutation.mutate({ key: "vip_entry_multiplier", value: e.target.value })}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground self-center">
                      x multiplier on all entry wins
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Streak Bonuses
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Days for Streak Bonus</Label>
                    <Input 
                      type="number"
                      value={appConfig?.streak_bonus_days || "3"}
                      onChange={(e) => updateConfigMutation.mutate({ key: "streak_bonus_days", value: e.target.value })}
                      className="w-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Free User Streak Bonus (entries)</Label>
                    <Input 
                      type="number"
                      value={appConfig?.streak_bonus_entries || "5"}
                      onChange={(e) => updateConfigMutation.mutate({ key: "streak_bonus_entries", value: e.target.value })}
                      className="w-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>VIP Streak Bonus (entries)</Label>
                    <Input 
                      type="number"
                      value={appConfig?.vip_streak_bonus_entries || "10"}
                      onChange={(e) => updateConfigMutation.mutate({ key: "vip_streak_bonus_entries", value: e.target.value })}
                      className="w-24"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Entry Quantities Per Segment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure these in the Wheel Config tab. Each segment's "Qty" field determines base entries awarded.
                VIP users receive Qty × VIP Multiplier entries.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {wheelConfig?.filter(s => s.outcome_type !== "miss").map(segment => (
                  <div key={segment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{segment.icon}</span>
                      <span className="font-medium">{segment.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Free: {segment.entry_quantity} entries | VIP: {segment.entry_quantity * (parseInt(appConfig?.vip_entry_multiplier || "2"))} entries
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Type: {segment.entry_type}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Monthly Draw Management */}
          <TabsContent value="draw" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Label>Select Month:</Label>
              <Input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-48"
              />
              <Button 
                variant="outline" 
                onClick={() => ensureDrawMutation.mutate(selectedMonth)}
                disabled={!!currentDraw}
              >
                {currentDraw ? "Draw Exists" : "Create Draw"}
              </Button>
            </div>

            {currentDraw && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Draw: {selectedMonth}</h3>
                    <p className="text-sm text-muted-foreground">
                      Date: {format(new Date(currentDraw.draw_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant={
                    currentDraw.status === "published" ? "default" :
                    currentDraw.status === "locked" ? "secondary" : "outline"
                  }>
                    {currentDraw.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Entry Totals */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <p className="text-3xl font-bold text-primary">{monthEntries?.totals.general || 0}</p>
                    <p className="text-sm text-muted-foreground">General Entries</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-3xl font-bold text-green-500">{monthEntries?.totals.massage || 0}</p>
                    <p className="text-sm text-muted-foreground">Massage Entries</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-3xl font-bold text-blue-500">{monthEntries?.totals.pt || 0}</p>
                    <p className="text-sm text-muted-foreground">PT Entries</p>
                  </div>
                </div>

                {/* Draw Actions */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button 
                    variant="outline"
                    onClick={() => lockEntriesMutation.mutate(currentDraw.id)}
                    disabled={isDrawLocked || lockEntriesMutation.isPending}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Lock Entries
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => runDrawMutation.mutate({ drawId: currentDraw.id, entryType: "general" })}
                    disabled={!isDrawLocked || currentDraw.status === "published"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Pick General Winner
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => runDrawMutation.mutate({ drawId: currentDraw.id, entryType: "massage" })}
                    disabled={!isDrawLocked || currentDraw.status === "published"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Pick Massage Winner
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => runDrawMutation.mutate({ drawId: currentDraw.id, entryType: "pt" })}
                    disabled={!isDrawLocked || currentDraw.status === "published"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Pick PT Winner
                  </Button>
                  
                  <Button 
                    onClick={() => publishWinnersMutation.mutate(currentDraw.id)}
                    disabled={!winners?.length || currentDraw.status === "published"}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Publish Winners
                  </Button>
                </div>

                {/* Winners Table */}
                {winners && winners.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Selected Winners</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Winner</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Public Name</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {winners.map((winner) => (
                          <TableRow key={winner.id}>
                            <TableCell className="capitalize font-medium">{winner.entry_type}</TableCell>
                            <TableCell>
                              {(winner.profiles as any)?.first_name} {(winner.profiles as any)?.last_name}
                            </TableCell>
                            <TableCell>{(winner.profiles as any)?.email}</TableCell>
                            <TableCell>{winner.winner_name_public}</TableCell>
                            <TableCell>
                              <Badge variant={winner.announced_at ? "default" : "secondary"}>
                                {winner.announced_at ? "Published" : "Pending"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {!isDrawLocked && (
                  <p className="text-sm text-yellow-600 mt-4">
                    ⚠️ Entries are still open. Lock entries before picking winners to prevent new spins from affecting the draw.
                  </p>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Export */}
          <TabsContent value="export" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Export Data</h3>
              <div className="flex items-center gap-4 mb-4">
                <Label>Month:</Label>
                <Input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-48"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Entries</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => exportEntriesCSV("general")}>
                      <Download className="w-4 h-4 mr-2" />
                      General Entries
                    </Button>
                    <Button variant="outline" onClick={() => exportEntriesCSV("massage")}>
                      <Download className="w-4 h-4 mr-2" />
                      Massage Entries
                    </Button>
                    <Button variant="outline" onClick={() => exportEntriesCSV("pt")}>
                      <Download className="w-4 h-4 mr-2" />
                      PT Entries
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Winners</h4>
                  <Button variant="outline" onClick={exportWinnersCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Winners
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}