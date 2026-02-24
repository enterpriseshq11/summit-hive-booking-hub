import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useE3Bookings } from "@/hooks/useE3";
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

export default function E3Calendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);

  const { data: bookings = [] } = useE3Bookings({
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  });

  // Build hall-level entries per date
  const hallsByDate = useMemo(() => {
    const map: Record<string, Array<{ hallName: string; state: string; clientName: string; bookingId: string; timeBlock: string }>> = {};
    (bookings as any[]).forEach((b) => {
      if (["cancelled", "expired"].includes(b.booking_state)) return;
      const key = b.event_date;
      if (!map[key]) map[key] = [];
      const halls = b.e3_booking_halls || [];
      const tbName = b.e3_time_blocks?.name || "";
      halls.forEach((bh: any) => {
        map[key].push({
          hallName: bh.e3_halls?.name || "?",
          state: b.booking_state,
          clientName: b.client_name,
          bookingId: b.id,
          timeBlock: tbName,
        });
      });
    });
    return map;
  }, [bookings]);

  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">E³ Calendar</h1>
          <Button onClick={() => navigate("/e3/submit")}>
            <Plus className="h-4 w-4 mr-2" /> Submit Event
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 font-medium">{d}</div>
          ))}
        </div>
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
                className={`bg-background min-h-[90px] p-1 ${isToday(day) ? "ring-2 ring-inset ring-accent" : ""}`}
              >
                <div className={`text-xs font-medium mb-0.5 ${!isSameMonth(day, currentMonth) ? "text-muted-foreground" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayHalls.slice(0, 5).map((entry, i) => (
                    <div
                      key={i}
                      className={`text-[10px] leading-tight px-1 py-0.5 rounded cursor-pointer truncate ${STATE_BG[entry.state] || "bg-muted"} ${STATE_TEXT[entry.state] || ""}`}
                      title={`${entry.hallName} · ${entry.timeBlock} · ${entry.clientName}`}
                      onClick={() => navigate(`/e3/bookings/${entry.bookingId}`)}
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

        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-red-500" /> Red Hold</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-yellow-500" /> Yellow Contract</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-green-600" /> Green Booked</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-blue-500" /> Completed</div>
        </div>
      </div>
    </div>
  );
}
