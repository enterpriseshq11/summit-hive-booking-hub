import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useE3Bookings } from "@/hooks/useE3";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, getDay } from "date-fns";

const STATE_DOT: Record<string, string> = {
  red_hold: "bg-red-500",
  yellow_contract: "bg-yellow-500",
  green_booked: "bg-green-500",
  completed: "bg-blue-500",
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

  const bookingsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    (bookings as any[]).forEach((b) => {
      const key = b.event_date;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start); // 0=Sun

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">E³ Calendar</h1>
          <Button onClick={() => navigate("/e3/submit")}>
            <Plus className="h-4 w-4 mr-2" /> Submit Event
          </Button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* Padding for start of month */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-background min-h-[80px]" />
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDate[key] || [];
            const activeBookings = dayBookings.filter((b: any) => !["cancelled", "expired"].includes(b.booking_state));

            return (
              <div
                key={key}
                className={`bg-background min-h-[80px] p-1.5 cursor-pointer hover:bg-muted/50 transition-colors ${
                  isToday(day) ? "ring-2 ring-inset ring-accent" : ""
                }`}
                onClick={() => {
                  if (activeBookings.length === 1) {
                    navigate(`/e3/bookings/${activeBookings[0].id}`);
                  }
                }}
              >
                <div className={`text-xs font-medium mb-1 ${!isSameMonth(day, currentMonth) ? "text-muted-foreground" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="flex flex-wrap gap-1">
                  {activeBookings.slice(0, 4).map((b: any) => (
                    <div
                      key={b.id}
                      className={`w-2.5 h-2.5 rounded-full ${STATE_DOT[b.booking_state] || "bg-muted"}`}
                      title={`${b.client_name} (${b.booking_state})`}
                    />
                  ))}
                  {activeBookings.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">+{activeBookings.length - 4}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Red Hold</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Yellow Contract</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Green Booked</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Completed</div>
        </div>
      </div>
    </div>
  );
}
