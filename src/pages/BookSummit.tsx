import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, Phone, Users, Clock, Heart, Building2, PartyPopper, Star, CheckCircle, ArrowRight, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG } from "@/config/siteConfig";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { SEOHead } from "@/components/seo";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isBefore, startOfDay, isToday } from "date-fns";

const EVENT_TYPES = [
  { id: "wedding", name: "Wedding / Reception", icon: Heart },
  { id: "corporate", name: "Corporate Event", icon: Building2 },
  { id: "birthday", name: "Birthday / Anniversary", icon: PartyPopper },
  { id: "graduation", name: "Graduation Party", icon: Star },
  { id: "baby_shower", name: "Baby Shower", icon: Heart },
  { id: "holiday", name: "Holiday Party", icon: PartyPopper },
  { id: "other", name: "Other Event", icon: CalendarDays },
];

const VENUE_HIGHLIGHTS = [
  { label: "Capacity", value: "50–300+ guests", icon: Users },
  { label: "Location", value: "10 W Auglaize St, Wapakoneta, OH", icon: MapPin },
  { label: "Hours", value: "9 AM – 9 PM", icon: Clock },
  { label: "Catering", value: "Full kitchen available", icon: Star },
];

function SummitCalendar({ onSelectDate, selectedDate }: { onSelectDate: (date: string) => void; selectedDate: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow = monthStart.getDay();

  // Fetch booked and blacked-out dates for the displayed month
  const monthStr = format(monthStart, "yyyy-MM");
  const { data: unavailableDates } = useQuery({
    queryKey: ["summit_availability", monthStr],
    queryFn: async () => {
      const from = format(monthStart, "yyyy-MM-dd");
      const to = format(monthEnd, "yyyy-MM-dd");

      const [bookingsRes, blackoutsRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("start_datetime, status")
          .gte("start_datetime", from + "T00:00:00")
          .lte("start_datetime", to + "T23:59:59")
          .in("status", ["confirmed", "approved", "pending", "in_progress"]),
        supabase
          .from("blackout_dates")
          .select("start_datetime, end_datetime")
          .gte("start_datetime", from + "T00:00:00")
          .lte("start_datetime", to + "T23:59:59"),
      ]);

      const confirmed = new Set<string>();
      const pending = new Set<string>();
      const blacked = new Set<string>();

      (bookingsRes.data || []).forEach((b: any) => {
        const day = b.start_datetime.split("T")[0];
        if (b.status === "confirmed" || b.status === "approved" || b.status === "in_progress") {
          confirmed.add(day);
        } else if (b.status === "pending") {
          pending.add(day);
        }
      });

      (blackoutsRes.data || []).forEach((b: any) => {
        const day = b.start_datetime.split("T")[0];
        blacked.add(day);
      });

      return { confirmed, pending, blacked };
    },
  });

  const getDayStatus = (day: Date): "available" | "booked" | "pending" | "blacked" | "past" => {
    if (isBefore(day, startOfDay(new Date())) && !isToday(day)) return "past";
    const dayStr = format(day, "yyyy-MM-dd");
    if (unavailableDates?.blacked.has(dayStr)) return "blacked";
    if (unavailableDates?.confirmed.has(dayStr)) return "booked";
    if (unavailableDates?.pending.has(dayStr)) return "pending";
    return "available";
  };

  const statusColors: Record<string, string> = {
    available: "bg-green-500/20 text-green-700 hover:bg-green-500/40 cursor-pointer",
    booked: "bg-red-500/20 text-red-600",
    pending: "bg-yellow-500/20 text-yellow-700",
    blacked: "bg-zinc-300/50 text-zinc-400",
    past: "bg-zinc-100 text-zinc-300",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const status = getDayStatus(day);
            const dayStr = format(day, "yyyy-MM-dd");
            const isSelected = selectedDate === dayStr;
            return (
              <button
                key={dayStr}
                disabled={status !== "available"}
                onClick={() => {
                  if (status === "available") onSelectDate(dayStr);
                }}
                className={`h-9 w-full rounded-md text-sm font-medium transition-all ${statusColors[status]} ${
                  isSelected ? "ring-2 ring-accent" : ""
                } ${isToday(day) ? "border-2 border-accent" : ""}`}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/30" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30" /> Booked</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/30" /> Tentative</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-zinc-300/50" /> Unavailable</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BookSummit() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [calendarMessage, setCalendarMessage] = useState("");
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    event_type: "", preferred_date: "", guest_count: "",
    duration_hours: "4", message: "", source: "website",
  });

  const handleDateSelect = (dateStr: string) => {
    setForm((f) => ({ ...f, preferred_date: dateStr }));
    const formatted = format(new Date(dateStr + "T12:00:00"), "MMMM d, yyyy");
    setCalendarMessage(`You selected ${formatted}. Complete the form below to request this date.`);
    // Scroll to form
    setTimeout(() => {
      document.getElementById("summit-inquiry-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.event_type) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("lead-intake", {
        body: {
          business_unit: "summit",
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          source: form.source,
          form_fields: {
            event_type: form.event_type,
            preferred_date: form.preferred_date,
            guest_count: form.guest_count,
            duration_hours: form.duration_hours,
            message: form.message,
          },
        },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Your event inquiry has been submitted!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Inquiry Submitted — The Summit Event Center" description="Your event inquiry has been submitted." />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-accent mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Inquiry Submitted</h1>
          <p className="text-muted-foreground text-lg">We received your event inquiry and will follow up within 24 hours.</p>
          <p className="text-muted-foreground">Questions? Call us at <a href={SITE_CONFIG.contact.phoneLink} className="text-accent font-semibold">{SITE_CONFIG.contact.phone}</a></p>
          <Button onClick={() => navigate("/summit")} variant="outline">Back to The Summit</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Book The Summit Event Center — A-Z Enterprises" description="Plan your next event at The Summit Event Center in Wapakoneta, Ohio." />

      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="bg-accent text-accent-foreground">Now Booking Events</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Book The Summit Event Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A premium event venue for weddings, corporate events, celebrations, and private parties.</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> 10 W Auglaize St, Wapakoneta, OH 45895</span>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {SITE_CONFIG.contact.phone}</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SummitCalendar onSelectDate={handleDateSelect} selectedDate={form.preferred_date} />

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Venue Details</h2>
            <div className="space-y-3">
              {VENUE_HIGHLIGHTS.map((h) => (
                <div key={h.label} className="flex items-center gap-3">
                  <h.icon className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{h.label}</p>
                    <p className="font-medium text-foreground">{h.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Want a tour first?</h3>
            <p className="text-sm text-muted-foreground mb-3">Schedule a walkthrough to see the venue in person before committing.</p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/intake/summit")}>
              <CalendarDays className="w-4 h-4 mr-2" /> Schedule a Tour
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3" id="summit-inquiry-form">
          {calendarMessage && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm text-accent font-medium mb-4">
              {calendarMessage}
            </div>
          )}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Event Inquiry</CardTitle>
              <CardDescription>Tell us about your event and we'll get back to you within 24 hours with availability and pricing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name *</Label><Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required /></div>
                  <div><Label>Last Name *</Label><Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} required /></div>
                </div>
                <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
                <div><Label>Phone *</Label><Input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required /></div>
                <div>
                  <Label>Event Type *</Label>
                  <Select value={form.event_type} onValueChange={(v) => setForm((f) => ({ ...f, event_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Preferred Date</Label><Input type="date" value={form.preferred_date} onChange={(e) => setForm((f) => ({ ...f, preferred_date: e.target.value }))} /></div>
                  <div><Label>Expected Guest Count</Label><Input type="number" min="1" max="500" value={form.guest_count} onChange={(e) => setForm((f) => ({ ...f, guest_count: e.target.value }))} placeholder="e.g. 100" /></div>
                </div>
                <div>
                  <Label>Duration (Hours)</Label>
                  <Select value={form.duration_hours} onValueChange={(v) => setForm((f) => ({ ...f, duration_hours: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (<SelectItem key={n} value={String(n)}>{n} {n === 1 ? "hour" : "hours"}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>How did you hear about us?</Label>
                  <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="google_search">Google Search</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="wedding_wire">WeddingWire</SelectItem>
                      <SelectItem value="the_knot">The Knot</SelectItem>
                      <SelectItem value="drive_by">Drive-by</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Tell us about your event</Label><Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Budget range, special requirements, theme, etc." rows={3} /></div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Event Inquiry"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
