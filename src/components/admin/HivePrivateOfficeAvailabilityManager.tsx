import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useHivePrivateOffices, useUpdateHivePrivateOffice } from "@/hooks/useHivePrivateOffices";
import { Building2, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Draft = {
  status: "available" | "booked";
  booked_until: string;
  notes: string;
};

export function HivePrivateOfficeAvailabilityManager() {
  const { data, isLoading } = useHivePrivateOffices();
  const update = useUpdateHivePrivateOffice();

  const initial = useMemo(() => {
    const map: Record<string, Draft> = {};
    (data || []).forEach((o) => {
      map[o.code] = {
        status: o.status,
        booked_until: o.booked_until || "",
        notes: o.notes || "",
      };
    });
    return map;
  }, [data]);

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  // keep drafts in sync when data changes (but don't clobber if user has typed)
  const mergedDrafts = useMemo(() => ({ ...initial, ...drafts }), [initial, drafts]);

  const setDraft = (code: string, patch: Partial<Draft>) => {
    setDrafts((prev) => ({
      ...prev,
      [code]: { ...(mergedDrafts[code] || { status: "available", booked_until: "", notes: "" }), ...patch },
    }));
  };

  const handleSave = async (code: string) => {
    const d = mergedDrafts[code];
    if (!d) return;

    await update.mutateAsync({
      code,
      updates: {
        status: d.status,
        booked_until: d.booked_until ? d.booked_until : null,
        notes: d.notes ? d.notes : null,
      },
    });

    toast.success(`Saved ${code} availability`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Hive Private Office Availability (S1/S2/P1/P2)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(data || []).map((o) => {
              const d = mergedDrafts[o.code];
              const isBooked = d?.status === "booked";

              return (
                <div key={o.code} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{o.code}</div>
                      <div className="text-sm text-muted-foreground">{o.label}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        isBooked
                          ? "bg-muted/40 text-muted-foreground border-border"
                          : "bg-accent/15 text-accent border-accent/30"
                      }
                    >
                      {isBooked ? "Booked" : "Available"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Select
                        value={d?.status || o.status}
                        onValueChange={(v) => setDraft(o.code, { status: v as Draft["status"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="booked">Booked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Booked until (optional)</Label>
                      <Input
                        type="date"
                        value={d?.booked_until || ""}
                        onChange={(e) => setDraft(o.code, { booked_until: e.target.value })}
                        disabled={!isBooked}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={d?.notes || ""}
                      onChange={(e) => setDraft(o.code, { notes: e.target.value })}
                      rows={2}
                      placeholder={isBooked ? "e.g., Booked for next 6 months" : "e.g., Window walls"}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleSave(o.code)}
                      disabled={update.isPending}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
