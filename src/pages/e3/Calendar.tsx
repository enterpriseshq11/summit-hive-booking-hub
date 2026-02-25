import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useE3Bookings, useE3Halls, useE3Venues } from "@/hooks/useE3";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, getDay } from "date-fns";

const STATE_BG: Record<string, string> = {
  red_hold: "bg-red-500",
  yellow_contract: "bg-yellow-500",
  green_booked: "bg-green-600",
  completed: "bg-blue-500",
};

const STATE_TEXT: Record<string, string> = {
  red_hold: "text-white",
  yellow_contract: "text-black",
  green_booked: "text-white",
  completed: "text-white",
};

const STATE_LABELS: Record<string, string> = {
  red_hold: "Red Hold",
  yellow_contract: "Yellow Contract",
  green_booked: "Green Booked",
  completed: "Completed",
};

export default function E3Calendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterHall, setFilterHall] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");

  const { data: venues = [] } = useE3Venues();
  const firstVenueId = (venues as any[])?.[0]?.id;
  const { data: halls = [] } = useE3Halls(firstVenueId);

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);

  const { data: bookings = [] } = useE3Bookings({
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  });

  const hallsByDate = useMemo(() => {
    const map: Record<string, Array<{ hallName: string; state: string; clientName: string; bookingId: string; timeBlock: string; hallId: string; coordinatorName: string }>> = {};
    (bookings as any[]).forEach((b) => {
      if (["cancelled", "expired"].includes(b.booking_state)) return;
      if (filterState !== "all" && b.booking_state !== filterState) return;
      const key = b.event_date;
      if (!map[key]) map[key] = [];
      const bHalls = b.e3_booking_halls || [];
      const tbName = b.e3_time_blocks?.name || "";
      const coordName = b.e3_coordinators?.name || "";
      bHalls.forEach((bh: any) => {
        if (filterHall !== "all" && bh.hall_id !== filterHall) return;
        map[key].push({
          hallName: bh.e3_halls?.name || "?",
          hallId: bh.hall_id,
          state: b.booking_state,
          clientName: b.client_name,
          bookingId: b.id,
          timeBlock: tbName,
          coordinatorName: coordName,
        });
      });
    });
    return map;
  }, [bookings, filterHall, filterState]);

  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start);

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    navigate(`/e3/submit?date=${dateStr}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">E³ Calendar</h1>
          <Button onClick={() => navigate("/e3/submit")}>
            <Plus className="h-4 w-4 mr-2" /> Submit Event
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Select value={filterHall} onValueChange={setFilterHall}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Halls" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Halls</SelectItem>
              {(halls as any[]).map((h: any) => (
                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="red_hold">Red Hold</SelectItem>
              <SelectItem value="yellow_contract">Yellow Contract</SelectItem>
              <SelectItem value="green_booked">Green Booked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 font-medium">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-background min-h-[90px]" />
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayHalls = hallsByDate[key] || [];

            return (
              <div
                key={key}
                className={`bg-background min-h-[90px] p-1 cursor-pointer hover:bg-accent/30 transition-colors ${isToday(day) ? "ring-2 ring-inset ring-accent" : ""}`}
                onDoubleClick={() => handleDayClick(day)}
              >
                <div className={`text-xs font-medium mb-0.5 ${!isSameMonth(day, currentMonth) ? "text-muted-foreground" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayHalls.slice(0, 5).map((entry, i) => (
                    <div
                      key={i}
                      className={`text-[10px] leading-tight px-1 py-0.5 rounded cursor-pointer truncate ${STATE_BG[entry.state] || "bg-muted"} ${STATE_TEXT[entry.state] || ""}`}
                      title={`${entry.hallName} · ${entry.timeBlock} · ${entry.clientName} · ${entry.coordinatorName}`}
                      onClick={(e) => { e.stopPropagation(); navigate(`/e3/bookings/${entry.bookingId}`); }}
                    >
                      {entry.hallName}
                    </div>
                  ))}
                  {dayHalls.length > 5 && (
                    <span className="text-[10px] text-muted-foreground">+{dayHalls.length - 5} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
          {Object.entries(STATE_LABELS).map(([state, label]) => (
            <div key={state} className="flex items-center gap-1.5">
              <div className={`w-3 h-2 rounded ${STATE_BG[state]}`} />
              {label}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Double-click a day to create a new booking for that date. Click a booking chip to view details.
        </p>
      </div>
    </div>
  );
}
