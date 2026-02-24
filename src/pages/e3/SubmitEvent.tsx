import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useE3Venues, useE3Halls, useE3TimeBlocks, useE3CreateBooking } from "@/hooks/useE3";
import { ArrowLeft, Loader2 } from "lucide-react";

const EVENT_TYPES = [
  "Wedding", "Birthday", "Corporate", "Baby Shower", "Graduation",
  "Anniversary", "Fundraiser", "Concert", "Community Event", "Other",
];

export default function E3SubmitEvent() {
  const navigate = useNavigate();
  const { data: venuesRaw } = useE3Venues();
  const venues = (venuesRaw || []) as any[];
  const [venueId, setVenueId] = useState("");
  const { data: hallsRaw } = useE3Halls(venueId || undefined);
  const halls = (hallsRaw || []) as any[];
  const { data: timeBlocksRaw } = useE3TimeBlocks(venueId || undefined);
  const timeBlocks = (timeBlocksRaw || []) as any[];
  const createBooking = useE3CreateBooking();

  const [form, setForm] = useState({
    eventType: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    guestCount: "",
    eventDate: "",
    timeBlockId: "",
    grossRevenue: "",
    notes: "",
    hasAlcohol: false,
  });
  const [selectedHalls, setSelectedHalls] = useState<string[]>([]);

  if (venues.length > 0 && !venueId) {
    setVenueId(venues[0].id);
  }

  const toggleHall = (hallId: string) => {
    setSelectedHalls((prev) =>
      prev.includes(hallId) ? prev.filter((h) => h !== hallId) : [...prev, hallId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueId || !form.eventDate || !form.timeBlockId || selectedHalls.length === 0) return;

    const result = await createBooking.mutateAsync({
      p_venue_id: venueId,
      p_event_date: form.eventDate,
      p_time_block_id: form.timeBlockId,
      p_hall_ids: selectedHalls,
      p_client_name: form.clientName,
      p_client_email: form.clientEmail,
      p_client_phone: form.clientPhone || undefined,
      p_event_type: form.eventType || undefined,
      p_guest_count: form.guestCount ? parseInt(form.guestCount) : undefined,
      p_gross_revenue: form.grossRevenue ? parseFloat(form.grossRevenue) : 0,
      p_notes: form.notes || undefined,
      p_has_alcohol: form.hasAlcohol,
    });

    if (result?.booking_id) {
      navigate(`/e3/bookings/${result.booking_id}`);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/e3")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to E³
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Submit New Event</CardTitle>
            <p className="text-sm text-muted-foreground">
              Creates a red hold (48-hour expiration). Upload contract to advance.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Venue */}
              {venues.length > 1 && (
                <div className="space-y-1.5">
                  <Label>Venue</Label>
                  <Select value={venueId} onValueChange={setVenueId}>
                    <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                    <SelectContent>
                      {venues.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Event Type */}
              <div className="space-y-1.5">
                <Label>Event Type</Label>
                <Select value={form.eventType} onValueChange={(v) => setForm((p) => ({ ...p, eventType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Client Full Name *</Label>
                  <Input required value={form.clientName} onChange={set("clientName")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Client Email *</Label>
                  <Input type="email" required value={form.clientEmail} onChange={set("clientEmail")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Client Phone</Label>
                  <Input type="tel" value={form.clientPhone} onChange={set("clientPhone")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Estimated Guest Count</Label>
                  <Input type="number" min={1} value={form.guestCount} onChange={set("guestCount")} />
                </div>
              </div>

              {/* Date + Time Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Event Date *</Label>
                  <Input type="date" required value={form.eventDate} onChange={set("eventDate")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Time Block *</Label>
                  <Select value={form.timeBlockId} onValueChange={(v) => setForm((p) => ({ ...p, timeBlockId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                    <SelectContent>
                      {timeBlocks.map((tb) => (
                        <SelectItem key={tb.id} value={tb.id}>
                          {tb.name} ({tb.start_time?.slice(0, 5)} – {tb.end_time?.slice(0, 5)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Hall Selection */}
              <div className="space-y-2">
                <Label>Hall(s) *</Label>
                <div className="flex flex-wrap gap-3">
                  {halls.map((hall) => (
                    <label
                      key={hall.id}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        selectedHalls.includes(hall.id)
                          ? "bg-accent/10 border-accent text-accent-foreground"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={selectedHalls.includes(hall.id)}
                        onCheckedChange={() => toggleHall(hall.id)}
                      />
                      <span className="text-sm font-medium">{hall.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(hall.allocation_percentage * 100).toFixed(0)}%)
                      </span>
                    </label>
                  ))}
                </div>
                {selectedHalls.length === halls.length && halls.length > 0 && (
                  <p className="text-xs text-accent font-medium">Full facility selected</p>
                )}
              </div>

              {/* Alcohol Toggle */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg border">
                <div>
                  <Label className="text-sm font-medium">Alcohol at Event?</Label>
                  <p className="text-xs text-muted-foreground">Requires additional alcohol policy document</p>
                </div>
                <Switch
                  checked={form.hasAlcohol}
                  onCheckedChange={(checked) => setForm((p) => ({ ...p, hasAlcohol: checked }))}
                />
              </div>

              {/* Gross Revenue */}
              <div className="space-y-1.5">
                <Label>Gross Revenue ($) *</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={form.grossRevenue}
                  onChange={set("grossRevenue")}
                  placeholder="e.g. 3500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={set("notes")} rows={3} />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createBooking.isPending || !form.clientName || !form.clientEmail || !form.eventDate || !form.timeBlockId || selectedHalls.length === 0}
              >
                {createBooking.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Event (Red Hold)
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
