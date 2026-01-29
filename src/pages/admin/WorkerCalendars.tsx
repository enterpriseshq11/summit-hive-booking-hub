import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useSpaWorkers } from "@/hooks/useSpaWorkers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, Mail, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOCKING_BOOKING_STATUSES } from "@/constants/bookingStatuses";

type ViewMode = "week" | "month";

interface WorkerBooking {
  id: string;
  booking_number: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  total_amount: number;
  internal_notes: string | null;
  notes: string | null;
  packages: { name: string } | null;
  bookable_types: { name: string } | null;
}

// Hook to fetch bookings for a specific worker
function useWorkerBookings(workerId: string | null, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["worker-bookings", workerId, startDate, endDate],
    queryFn: async () => {
      if (!workerId) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_number,
          start_datetime,
          end_datetime,
          status,
          guest_name,
          guest_email,
          guest_phone,
          total_amount,
          internal_notes,
          notes,
          packages(name),
          bookable_types(name)
        `)
        .eq("spa_worker_id", workerId)
        .gte("start_datetime", startDate)
        .lte("end_datetime", endDate)
        .in("status", BLOCKING_BOOKING_STATUSES)
        .order("start_datetime", { ascending: true });

      if (error) throw error;
      return data as WorkerBooking[];
    },
    enabled: !!workerId,
  });
}

// Status badge color mapping
function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "pending":
    case "pending_payment":
    case "pending_documents":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "reschedule_requested":
    case "rescheduled":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "completed":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "in_progress":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}

export default function WorkerCalendars() {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<WorkerBooking | null>(null);

  const { data: workers = [], isLoading: workersLoading } = useSpaWorkers();

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === "week") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 }),
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };
    }
  }, [currentDate, viewMode]);

  const { data: bookings = [], isLoading: bookingsLoading } = useWorkerBookings(
    selectedWorkerId,
    dateRange.start.toISOString(),
    dateRange.end.toISOString()
  );

  // Get days to display
  const days = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  // Group bookings by day
  const bookingsByDay = useMemo(() => {
    const grouped: Record<string, WorkerBooking[]> = {};
    
    days.forEach(day => {
      const dateKey = format(day, "yyyy-MM-dd");
      grouped[dateKey] = bookings.filter(booking => 
        isSameDay(parseISO(booking.start_datetime), day)
      );
    });
    
    return grouped;
  }, [bookings, days]);

  // Navigation handlers
  const navigatePrev = () => {
    if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get selected worker name for display
  const selectedWorker = workers.find(w => w.id === selectedWorkerId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Worker Calendars</h1>
            <p className="text-muted-foreground">View and monitor spa worker schedules and bookings</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Worker Selector */}
              <div className="w-full sm:w-64">
                <Select
                  value={selectedWorkerId || ""}
                  onValueChange={(value) => setSelectedWorkerId(value || null)}
                >
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Select a worker..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {workersLoading ? (
                      <SelectItem value="" disabled>Loading workers...</SelectItem>
                    ) : workers.filter(w => w.is_active).length === 0 ? (
                      <SelectItem value="" disabled>No active workers</SelectItem>
                    ) : (
                      workers.filter(w => w.is_active).map(worker => (
                        <SelectItem 
                          key={worker.id} 
                          value={worker.id}
                          className="text-foreground focus:bg-accent"
                        >
                          {worker.display_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* View Toggle */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className={cn(
                    "text-sm",
                    viewMode === "week" 
                      ? "bg-primary/20 text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className={cn(
                    "text-sm",
                    viewMode === "month" 
                      ? "bg-primary/20 text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Month
                </Button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={navigatePrev}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-foreground font-medium min-w-[150px] text-center">
                  {viewMode === "week" 
                    ? `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d, yyyy")}`
                    : format(currentDate, "MMMM yyyy")
                  }
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={navigateNext}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        {!selectedWorkerId ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a worker to view their calendar</p>
            </CardContent>
          </Card>
        ) : bookingsLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <div className="animate-pulse text-muted-foreground">Loading bookings...</div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {selectedWorker?.display_name}'s Schedule
                <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
                  {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {viewMode === "week" ? (
                <WeekView
                  days={days}
                  bookingsByDay={bookingsByDay}
                  onSelectBooking={setSelectedBooking}
                />
              ) : (
                <MonthView
                  days={days}
                  bookingsByDay={bookingsByDay}
                  currentDate={currentDate}
                  onSelectBooking={setSelectedBooking}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </AdminLayout>
  );
}

// Week View Component
function WeekView({ 
  days, 
  bookingsByDay, 
  onSelectBooking 
}: { 
  days: Date[];
  bookingsByDay: Record<string, WorkerBooking[]>;
  onSelectBooking: (booking: WorkerBooking) => void;
}) {
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day Headers */}
      {days.map(day => (
        <div 
          key={day.toISOString()} 
          className={cn(
            "text-center p-2 rounded-t-lg border-b border-border",
            isSameDay(day, today) && "bg-primary/10"
          )}
        >
          <div className="text-xs text-muted-foreground uppercase">{format(day, "EEE")}</div>
          <div className={cn(
            "text-lg font-semibold",
            isSameDay(day, today) ? "text-primary" : "text-foreground"
          )}>
            {format(day, "d")}
          </div>
        </div>
      ))}

      {/* Booking Slots */}
      {days.map(day => {
        const dateKey = format(day, "yyyy-MM-dd");
        const dayBookings = bookingsByDay[dateKey] || [];
        
        return (
          <div 
            key={`slots-${day.toISOString()}`}
            className={cn(
              "min-h-[200px] p-1 space-y-1 border border-border rounded-b-lg",
              isSameDay(day, today) && "bg-primary/5"
            )}
          >
            {dayBookings.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                No bookings
              </div>
            ) : (
              dayBookings.map(booking => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onClick={() => onSelectBooking(booking)}
                  compact
                />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

// Month View Component
function MonthView({ 
  days, 
  bookingsByDay, 
  currentDate,
  onSelectBooking 
}: { 
  days: Date[];
  bookingsByDay: Record<string, WorkerBooking[]>;
  currentDate: Date;
  onSelectBooking: (booking: WorkerBooking) => void;
}) {
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  // Pad days to start on Sunday
  const startPadding = days[0].getDay();
  const paddedDays = [
    ...Array(startPadding).fill(null),
    ...days,
  ];

  // Fill to complete the last week
  const endPadding = (7 - (paddedDays.length % 7)) % 7;
  const fullGrid = [
    ...paddedDays,
    ...Array(endPadding).fill(null),
  ];

  return (
    <div className="space-y-2">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-xs text-muted-foreground uppercase p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {fullGrid.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-[100px] bg-muted/50 rounded" />;
          }

          const dateKey = format(day, "yyyy-MM-dd");
          const dayBookings = bookingsByDay[dateKey] || [];
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday = isSameDay(day, today);

          return (
            <div 
              key={day.toISOString()}
              className={cn(
                "min-h-[100px] p-1 border border-border rounded",
                !isCurrentMonth && "opacity-40",
                isToday && "bg-primary/10 border-primary/30"
              )}
            >
              <div className={cn(
                "text-sm font-medium mb-1",
                isToday ? "text-primary" : "text-muted-foreground"
              )}>
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayBookings.slice(0, 3).map(booking => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking}
                    onClick={() => onSelectBooking(booking)}
                    compact
                    mini
                  />
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Booking Card Component
function BookingCard({ 
  booking, 
  onClick,
  compact = false,
  mini = false,
}: { 
  booking: WorkerBooking;
  onClick: () => void;
  compact?: boolean;
  mini?: boolean;
}) {
  const startTime = format(parseISO(booking.start_datetime), "h:mm a");
  const serviceName = booking.packages?.name || booking.bookable_types?.name || "Service";
  const customerName = booking.guest_name?.split(" ")[0] || "Guest";

  if (mini) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left px-1.5 py-0.5 rounded text-xs truncate border",
          getStatusColor(booking.status)
        )}
      >
        {startTime}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2 rounded border transition-colors hover:opacity-80",
        getStatusColor(booking.status)
      )}
    >
      <div className="flex items-center gap-1 text-xs font-medium">
        <Clock className="h-3 w-3" />
        {startTime}
      </div>
      {!compact && (
        <>
          <div className="text-sm font-medium truncate mt-1">{serviceName}</div>
          <div className="text-xs opacity-80 truncate">{customerName}</div>
        </>
      )}
      {compact && (
        <div className="text-xs truncate mt-0.5">{serviceName}</div>
      )}
    </button>
  );
}

// Booking Detail Modal
function BookingDetailModal({ 
  booking, 
  onClose 
}: { 
  booking: WorkerBooking | null;
  onClose: () => void;
}) {
  if (!booking) return null;

  const startTime = format(parseISO(booking.start_datetime), "h:mm a");
  const endTime = format(parseISO(booking.end_datetime), "h:mm a");
  const date = format(parseISO(booking.start_datetime), "EEEE, MMMM d, yyyy");
  const serviceName = booking.packages?.name || booking.bookable_types?.name || "Service";

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Booking Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge className={cn("capitalize", getStatusColor(booking.status))}>
              {booking.status.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Booking Number */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Booking #</span>
            <span className="font-mono text-sm">{booking.booking_number}</span>
          </div>

          {/* Service */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Service</span>
            <span className="font-medium">{serviceName}</span>
          </div>

          {/* Date & Time */}
          <div className="space-y-1">
            <div className="text-muted-foreground text-sm">Date & Time</div>
            <div className="bg-muted rounded-lg p-3">
              <div className="font-medium">{date}</div>
              <div className="text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-4 w-4" />
                {startTime} - {endTime}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-1">
            <div className="text-muted-foreground text-sm">Customer</div>
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{booking.guest_name || "Not provided"}</span>
              </div>
              {booking.guest_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${booking.guest_phone}`} className="text-primary hover:underline">
                    {booking.guest_phone}
                  </a>
                </div>
              )}
              {booking.guest_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${booking.guest_email}`} className="text-primary hover:underline text-sm truncate">
                    {booking.guest_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Total
            </span>
            <span className="font-medium text-lg">${booking.total_amount.toFixed(2)}</span>
          </div>

          {/* Notes */}
          {(booking.notes || booking.internal_notes) && (
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Notes
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                {booking.internal_notes || booking.notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
