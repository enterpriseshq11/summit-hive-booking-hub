import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Settings2, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const BUSINESS_UNITS = [
  { value: "summit", label: "Summit" },
  { value: "spa", label: "Spa" },
  { value: "fitness", label: "Fitness" },
  { value: "coworking", label: "Hive / Coworking" },
  { value: "voice_vault", label: "Voice Vault" },
  { value: "elevated_by_elyse", label: "Elevated by Elyse" },
  { value: "photo_booth", label: "360 Photo Booth" },
];

const FALLBACK_OPTIONS = [
  ...BUSINESS_UNITS,
  { value: "unattributed", label: "Unattributed" },
];

export default function StripeMappingPage() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMapping, setNewMapping] = useState({
    metadata_key: "",
    metadata_value: "",
    business_unit: "summit",
    active: true,
  });

  const { data: mappings = [], isLoading } = useQuery({
    queryKey: ["stripe_mappings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("stripe_business_unit_mappings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: fallbackSetting } = useQuery({
    queryKey: ["admin_settings", "stripe_fallback_business_unit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("key", "stripe_fallback_business_unit")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (mapping: typeof newMapping) => {
      const { error } = await (supabase as any)
        .from("stripe_business_unit_mappings")
        .insert({
          ...mapping,
          created_by: authUser?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripe_mappings"] });
      setIsAddOpen(false);
      setNewMapping({ metadata_key: "", metadata_value: "", business_unit: "summit", active: true });
      toast.success("Mapping created");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("stripe_business_unit_mappings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripe_mappings"] });
      toast.success("Mapping deleted");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await (supabase as any)
        .from("stripe_business_unit_mappings")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripe_mappings"] });
    },
  });

  const saveFallbackMutation = useMutation({
    mutationFn: async (value: string) => {
      const { error } = await supabase
        .from("admin_settings")
        .update({ value, updated_by: authUser?.id, updated_at: new Date().toISOString() })
        .eq("key", "stripe_fallback_business_unit");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_settings"] });
      toast.success("Fallback rule saved");
    },
  });

  const [fallbackValue, setFallbackValue] = useState<string | null>(null);
  const currentFallback = fallbackValue ?? fallbackSetting?.value ?? "unattributed";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-amber-400" />
            Stripe to Business Unit Mapping
          </h1>
          <p className="text-zinc-400 mt-1">
            Map Stripe payment metadata to business units for automated revenue attribution
          </p>
        </div>

        {/* Fallback Rule */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Fallback Rule</p>
                <p className="text-xs text-zinc-500">If no mapping matches, attribute revenue to:</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={currentFallback} onValueChange={setFallbackValue}>
                  <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {FALLBACK_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => saveFallbackMutation.mutate(currentFallback)}
                  disabled={saveFallbackMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mappings Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-zinc-100">Mappings</CardTitle>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="h-4 w-4 mr-1" /> Add Mapping
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-zinc-100">Add Stripe Mapping</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label className="text-zinc-300">Metadata Key</Label>
                    <Input value={newMapping.metadata_key} onChange={(e) => setNewMapping({ ...newMapping, metadata_key: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" placeholder="e.g. business_unit" />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Metadata Value</Label>
                    <Input value={newMapping.metadata_value} onChange={(e) => setNewMapping({ ...newMapping, metadata_value: e.target.value })} className="bg-zinc-800 border-zinc-700 text-zinc-100" placeholder="e.g. spa" />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Maps to Business Unit</Label>
                    <Select value={newMapping.business_unit} onValueChange={(v) => setNewMapping({ ...newMapping, business_unit: v })}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {BUSINESS_UNITS.map((u) => (<SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={newMapping.active} onCheckedChange={(v) => setNewMapping({ ...newMapping, active: v })} />
                    <Label className="text-zinc-300">Active</Label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-zinc-700">Cancel</Button>
                    <Button onClick={() => createMutation.mutate(newMapping)} disabled={!newMapping.metadata_key || !newMapping.metadata_value || createMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-black">
                      {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Metadata Key</TableHead>
                  <TableHead className="text-zinc-400">Metadata Value</TableHead>
                  <TableHead className="text-zinc-400">Business Unit</TableHead>
                  <TableHead className="text-zinc-400">Active</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading...</TableCell></TableRow>
                ) : mappings.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500">No mappings configured yet</TableCell></TableRow>
                ) : (
                  mappings.map((m: any) => (
                    <TableRow key={m.id} className="border-zinc-800">
                      <TableCell className="font-mono text-zinc-200">{m.metadata_key}</TableCell>
                      <TableCell className="font-mono text-zinc-200">{m.metadata_value}</TableCell>
                      <TableCell><Badge variant="outline">{BUSINESS_UNITS.find((u) => u.value === m.business_unit)?.label || m.business_unit}</Badge></TableCell>
                      <TableCell><Switch checked={m.active} onCheckedChange={(v) => toggleMutation.mutate({ id: m.id, active: v })} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(m.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
