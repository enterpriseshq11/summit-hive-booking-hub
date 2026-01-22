import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useBookings } from "@/hooks/useBookings";
import { useBusinesses } from "@/hooks/useBusinesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, ChevronLeft, ChevronRight, Calendar, CalendarRange } from "lucide-react";
import { BookingEditDialog } from "@/components/admin/BookingEditDialog";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  addWeeks, 
  subWeeks, 
  addMonths, 
  subMonths,
  eachDayOfInterval, 
  isSameDay,
  isSameMonth,
} from "date-fns";

type ViewMode = "week" | "month";

function formatMoneyOrEstimate(b: any) {
  const t = b?.businesses?.type ?? b?.source_brand;
  const isSummit = t === "summit";
  const amount = b?.total_amount;
  if (isSummit && (!Number.isFinite(amount) || amount <= 0)) return "Estimate pending";
  if (!Number.isFinite(amount)) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

export default function AdminSchedule() {
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [moreOpenDayKey, setMoreOpenDayKey] = useState<string | null>(null);

  // Calculate date ranges based on view mode
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // For month view, we need to include days from previous/next month to fill the grid
  const monthViewStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const monthViewEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const daysToShow = viewMode === "week" 
    ? eachDayOfInterval({ start: weekStart, end: weekEnd })
    : eachDayOfInterval({ start: monthViewStart, end: monthViewEnd });

  const { data: businesses } = useBusinesses();
  const { data: bookings, isLoading, refetch } = useBookings({
    businessId: selectedBusiness === "all" ? undefined : selectedBusiness,
    startDate: (viewMode === "week" ? weekStart : monthViewStart).toISOString(),
    endDate: (viewMode === "week" ? weekEnd : monthViewEnd).toISOString(),
  });

  const filteredBookings = useMemo(() => {
    // Hide denied bookings to keep the calendar uncluttered.
    return (bookings || []).filter((b: any) => b?.status !== "denied");
  }, [bookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      case "pending": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "denied": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "no_show": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "✓ Confirmed";
      case "pending": return "⏳ Pending";
      case "denied": return "✗ Denied";
      case "cancelled": return "✗ Cancelled";
      case "completed": return "✓ Complete";
      case "no_show": return "– No Show";
      default: return status;
    }
  };

  const getBookingsForDay = (date: Date) => {
    return filteredBookings?.filter((booking) => {
      const bookingDate = new Date(booking.start_datetime);
      return isSameDay(bookingDate, date);
    }) || [];
  };

  const navigatePrevious = () => {
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

  const getDateRangeLabel = () => {
    if (viewMode === "week") {
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Schedule</h1>
            <p className="text-zinc-300">View and manage all bookings across businesses</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("week")}
                className={`rounded-none px-3 ${viewMode === "week" ? "bg-accent text-black" : "text-zinc-300 hover:bg-zinc-700 hover:text-white"}`}
              >
                <CalendarRange className="h-4 w-4 mr-1" />
                Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("month")}
                className={`rounded-none px-3 ${viewMode === "month" ? "bg-accent text-black" : "text-zinc-300 hover:bg-zinc-700 hover:text-white"}`}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Month
              </Button>
            </div>

            {/* Business Filter */}
            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="All Businesses" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all" className="text-white focus:bg-zinc-700 focus:text-white">All Businesses</SelectItem>
                {businesses?.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-white focus:bg-zinc-700 focus:text-white">{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Helper Text */}
        <div className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-300">
          <strong className="text-white">Tip:</strong> Click any booking to view details. Use the filters to focus on specific staff or locations. Today's date is highlighted with a blue border.
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg p-4">
          <Button variant="outline" size="sm" onClick={navigatePrevious} className="border-zinc-600 text-white hover:bg-zinc-700 hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <div className="text-center">
            <h2 className="font-semibold text-white">
              {getDateRangeLabel()}
            </h2>
            <Button variant="link" size="sm" onClick={() => setCurrentDate(new Date())} className="text-accent hover:text-accent/80">
              Today
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={navigateNext} className="border-zinc-600 text-white hover:bg-zinc-700 hover:text-white">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className={`grid ${viewMode === "week" ? "grid-cols-7" : "grid-cols-7"} gap-2`}>
            {Array(viewMode === "week" ? 7 : 35).fill(0).map((_, i) => (
              <Skeleton key={i} className={viewMode === "week" ? "h-48" : "h-24"} />
            ))}
          </div>
        ) : (
          <>
            {/* Day Headers for Month View */}
            {viewMode === "month" && (
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-zinc-400 py-2">
                    {day}
                  </div>
                ))}
              </div>
            )}
            
            <div className={`grid grid-cols-7 gap-2`}>
              {daysToShow.map((day) => {
                const dayBookings = getBookingsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                const maxBookingsToShow = viewMode === "week" ? 4 : 2;
                const overflowBookings = dayBookings.slice(maxBookingsToShow);
                const dayKey = day.toISOString().slice(0, 10);
                
                return (
                  <Card 
                    key={day.toISOString()} 
                    className={`
                      ${viewMode === "week" ? "min-h-[200px]" : "min-h-[100px]"} 
                      bg-zinc-800 border-zinc-700 
                      ${isToday ? 'ring-2 ring-primary' : ''} 
                      ${viewMode === "month" && !isCurrentMonth ? 'opacity-40' : ''}
                    `}
                  >
                    <CardHeader className={viewMode === "week" ? "p-3 pb-2" : "p-2 pb-1"}>
                      <CardTitle className={`${viewMode === "week" ? "text-sm" : "text-xs"} font-medium flex justify-between items-center text-white`}>
                        {viewMode === "week" && <span>{format(day, "EEE")}</span>}
                        <span className={`${viewMode === "week" ? "text-lg" : "text-sm"} ${isToday ? 'text-primary font-bold' : 'text-zinc-300'}`}>
                          {format(day, "d")}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={viewMode === "week" ? "p-2 space-y-1" : "p-1 space-y-0.5"}>
                      {dayBookings.slice(0, maxBookingsToShow).map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className={`w-full text-left ${viewMode === "week" ? "p-2" : "p-1"} rounded text-xs transition-colors border ${getStatusColor(booking.status || '')} hover:opacity-80`}
                          aria-label={`View booking for ${booking.guest_name || 'Guest'} at ${format(new Date(booking.start_datetime), "h:mm a")}`}
                        >
                          <div className="font-medium truncate">
                            {booking.guest_name || "Guest"}
                          </div>
                          {viewMode === "week" && (
                            <>
                              <div className="flex items-center gap-1 opacity-80">
                                <Clock className="h-3 w-3" />
                                {format(new Date(booking.start_datetime), "h:mm a")}
                              </div>
                              <div className="text-[10px] mt-1 font-medium">
                                {getStatusLabel(booking.status || '')}
                              </div>
                            </>
                          )}
                        </button>
                      ))}
                      {dayBookings.length > maxBookingsToShow && (
                        <Popover open={moreOpenDayKey === dayKey} onOpenChange={(open) => setMoreOpenDayKey(open ? dayKey : null)}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={`text-xs text-zinc-400 text-center w-full ${viewMode === "week" ? "pt-1" : ""} hover:underline`}
                            >
                              +{dayBookings.length - maxBookingsToShow} more
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="center" className="w-72 p-2 bg-zinc-900 border-zinc-700">
                            <div className="text-xs font-medium text-zinc-200 px-1 pb-2">
                              {format(day, "MMM d, yyyy")}
                            </div>
                            <div className="space-y-1 max-h-64 overflow-auto pr-1">
                              {overflowBookings.map((booking) => (
                                <button
                                  key={booking.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setMoreOpenDayKey(null);
                                  }}
                                  className="w-full text-left rounded border border-zinc-800 hover:bg-zinc-800/60 px-2 py-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium text-white truncate">
                                        {booking.guest_name || "Guest"}
                                      </div>
                                      <div className="text-xs text-zinc-300 flex items-center gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(booking.start_datetime), "h:mm a")}
                                      </div>
                                    </div>
                                    <span className={`shrink-0 text-[10px] px-2 py-1 rounded border ${getStatusColor(booking.status || '')}`}>
                                      {(booking.status || "").toString()}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      {dayBookings.length === 0 && viewMode === "week" && (
                        <div className="text-xs text-zinc-400 text-center py-4">
                          No bookings
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Booking Detail Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-lg bg-zinc-900 border-zinc-700">
            <DialogHeader>
              <DialogTitle className="text-white">Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-400">Booking #</label>
                    <p className="font-mono text-white">{selectedBooking.booking_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-400">Status</label>
                    <Badge className={getStatusColor(selectedBooking.status || '')}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-zinc-400">Customer</label>
                  <p className="text-white">{selectedBooking.guest_name || `${selectedBooking.profiles?.first_name} ${selectedBooking.profiles?.last_name}`}</p>
                  <p className="text-sm text-zinc-300">{selectedBooking.guest_email || selectedBooking.profiles?.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-400">Date & Time</label>
                    <p className="flex items-center gap-1 text-white">
                      <CalendarDays className="h-4 w-4" />
                      {format(new Date(selectedBooking.start_datetime), "MMM d, yyyy")}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-zinc-300">
                      <Clock className="h-3 w-3" />
                      {format(new Date(selectedBooking.start_datetime), "h:mm a")} - 
                      {format(new Date(selectedBooking.end_datetime), "h:mm a")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-400">Business</label>
                    <p className="text-white">{selectedBooking.businesses?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-400">Total</label>
                    <p className="text-lg font-bold text-white">{formatMoneyOrEstimate(selectedBooking)}</p>
                  </div>
                  {selectedBooking.deposit_amount && (
                    <div>
                      <label className="text-sm font-medium text-zinc-400">Deposit</label>
                      <p className="text-white">${selectedBooking.deposit_amount?.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {selectedBooking.notes && (
                  <div>
                    <label className="text-sm font-medium text-zinc-400">Notes</label>
                    <p className="text-sm text-zinc-300">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 border-zinc-600 text-white hover:bg-zinc-700" onClick={() => setSelectedBooking(null)}>
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-accent text-black hover:bg-accent/90"
                    onClick={() => setEditOpen(true)}
                  >
                    Edit Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <BookingEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          booking={selectedBooking}
          onUpdated={() => {
            refetch();
          }}
        />
      </div>
    </AdminLayout>
  );
}
