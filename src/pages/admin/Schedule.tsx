import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout, RescheduleModal, DayAvailabilityModal } from "@/components/admin";
import { useBookings } from "@/hooks/useBookings";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useAvailabilityOverrides, formatOverrideDisplay } from "@/hooks/useAvailabilityOverrides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Clock, ChevronLeft, ChevronRight, Calendar, CalendarRange, RefreshCw, Settings2 } from "lucide-react";
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

// Check if a business is Spa/Restoration for reschedule functionality
const isSpaBooking = (booking: any) => {
  const type = booking?.businesses?.type;
  const sourceBrand = booking?.source_brand;
  return type === "spa" || sourceBrand === "restoration";
};

// Check if the current selected business is Spa
const isSpaBusinessSelected = (businesses: any[], selectedBusinessId: string) => {
  if (selectedBusinessId === "all") return false;
  const business = businesses?.find(b => b.id === selectedBusinessId);
  return business?.type === "spa";
};

function formatMoneyOrEstimate(b: any) {
  const t = b?.businesses?.type ?? b?.source_brand;
  const isSummit = t === "summit";
  const amount = b?.total_amount;
  if (isSummit && (!Number.isFinite(amount) || amount <= 0)) return "Estimate pending";
  if (!Number.isFinite(amount)) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

export default function AdminSchedule() {
  const { authUser } = useAuth();
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [moreOpenDayKey, setMoreOpenDayKey] = useState<string | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [selectedDayForAvailability, setSelectedDayForAvailability] = useState<Date | null>(null);

  // Determine if user is spa-only (has spa_lead but not owner/manager)
  const isSpaLeadOnly = useMemo(() => {
    const roles = authUser?.roles || [];
    return roles.includes("spa_lead") && 
           !roles.includes("owner") && 
           !roles.includes("manager");
  }, [authUser?.roles]);

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

  // Get the current Spa business ID for availability modal and role filtering
  const spaBusinessId = useMemo(() => {
    const spaBusiness = businesses?.find(b => b.type === "spa");
    return spaBusiness?.id;
  }, [businesses]);

  const spaBusinessName = useMemo(() => {
    const spaBusiness = businesses?.find(b => b.type === "spa");
    return spaBusiness?.name || "Restoration Lounge";
  }, [businesses]);

  // For spa_lead, force selection to Spa business
  useEffect(() => {
    if (isSpaLeadOnly && spaBusinessId && selectedBusiness === "all") {
      setSelectedBusiness(spaBusinessId);
    }
  }, [isSpaLeadOnly, spaBusinessId, selectedBusiness]);

  // Fetch availability overrides for visual indicators
  const { data: availabilityOverrides, refetch: refetchOverrides } = useAvailabilityOverrides(
    spaBusinessId,
    viewMode === "week" ? weekStart : monthViewStart,
    viewMode === "week" ? weekEnd : monthViewEnd
  );

  // Map overrides by date for quick lookup
  const overridesByDate = useMemo(() => {
    const map = new Map<string, { is_unavailable: boolean; display: string }>();
    for (const override of availabilityOverrides || []) {
      map.set(override.override_date, {
        is_unavailable: override.is_unavailable,
        display: formatOverrideDisplay(override)
      });
    }
    return map;
  }, [availabilityOverrides]);

  const filteredBookings = useMemo(() => {
    // Hide denied and cancelled bookings to keep the calendar uncluttered.
    return (bookings || []).filter((b: any) => b?.status !== "denied" && b?.status !== "cancelled");
  }, [bookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      case "pending": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "reschedule_requested": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800";
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
      case "reschedule_requested": return "🔄 Reschedule Pending";
      case "denied": return "✗ Denied";
      case "cancelled": return "✗ Cancelled";
      case "completed": return "✓ Complete";
      case "no_show": return "– No Show";
      default: return status;
    }
  };

  const handleDayClick = (day: Date, e: React.MouseEvent) => {
    // Only show availability modal for Spa when clicking on empty area
    if (isSpaBusinessSelected(businesses || [], selectedBusiness)) {
      e.stopPropagation();
      setSelectedDayForAvailability(day);
      setAvailabilityOpen(true);
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

  const handleAvailabilitySuccess = () => {
    refetch();
    refetchOverrides();
  };

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
              <p className="text-muted-foreground">View and manage all bookings across businesses</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className={`rounded-none px-3 ${viewMode === "week" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <CalendarRange className="h-4 w-4 mr-1" />
                  Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className={`rounded-none px-3 ${viewMode === "month" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Month
                </Button>
              </div>

              {/* Business Filter - Hidden for spa_lead only users */}
              {!isSpaLeadOnly && (
                <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                  <SelectTrigger className="w-[160px] bg-card border-border text-foreground">
                    <SelectValue placeholder="All Businesses" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all" className="text-foreground focus:bg-muted focus:text-foreground">All Businesses</SelectItem>
                    {businesses?.map((b) => (
                      <SelectItem key={b.id} value={b.id} className="text-foreground focus:bg-muted focus:text-foreground">{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Helper Text */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Click any booking to view details.
            {isSpaBusinessSelected(businesses || [], selectedBusiness) && (
              <span className="ml-1">
                <Settings2 className="h-3 w-3 inline mr-1" />
                Click any day to manage availability for {spaBusinessName}.
              </span>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
            <Button variant="outline" size="sm" onClick={navigatePrevious} className="border-border text-foreground hover:bg-muted hover:text-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="text-center">
              <h2 className="font-semibold text-foreground">
                {getDateRangeLabel()}
              </h2>
              <Button variant="link" size="sm" onClick={() => setCurrentDate(new Date())} className="text-accent hover:text-accent/80">
                Today
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={navigateNext} className="border-border text-foreground hover:bg-muted hover:text-foreground">
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
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
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
                  const dayKey = format(day, "yyyy-MM-dd");
                  
                  // Check for availability override
                  const override = isSpaBusinessSelected(businesses || [], selectedBusiness) 
                    ? overridesByDate.get(dayKey) 
                    : null;
                  
                  return (
                    <Card 
                      key={day.toISOString()} 
                      className={`
                        ${viewMode === "week" ? "min-h-[200px]" : "min-h-[100px]"} 
                        bg-card border-border 
                        ${isToday ? 'ring-2 ring-primary' : ''} 
                        ${viewMode === "month" && !isCurrentMonth ? 'opacity-40' : ''}
                        ${isSpaBusinessSelected(businesses || [], selectedBusiness) ? 'cursor-pointer hover:border-accent/50 transition-colors' : ''}
                        ${override?.is_unavailable ? 'bg-destructive/5' : ''}
                      `}
                      onClick={(e) => {
                        // Only trigger if clicking the card itself, not a booking button
                        if ((e.target as HTMLElement).closest('button')) return;
                        handleDayClick(day, e);
                      }}
                    >
                      <CardHeader className={viewMode === "week" ? "p-3 pb-2" : "p-2 pb-1"}>
                        <CardTitle className={`${viewMode === "week" ? "text-sm" : "text-xs"} font-medium flex justify-between items-center text-foreground`}>
                          {viewMode === "week" && <span>{format(day, "EEE")}</span>}
                          <div className="flex items-center gap-1">
                            {override && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={`w-2 h-2 rounded-full ${override.is_unavailable ? 'bg-destructive' : 'bg-accent'}`} />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover text-popover-foreground">
                                  <p className="text-xs font-medium">{override.display}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <span className={`${viewMode === "week" ? "text-lg" : "text-sm"} ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                              {format(day, "d")}
                            </span>
                          </div>
                        </CardTitle>
                        
                        {/* Availability indicator text for week view */}
                        {viewMode === "week" && override && (
                          <p className={`text-[10px] truncate ${override.is_unavailable ? 'text-destructive' : 'text-accent'}`}>
                            {override.display}
                          </p>
                        )}
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
                                className={`text-xs text-muted-foreground text-center w-full ${viewMode === "week" ? "pt-1" : ""} hover:underline`}
                              >
                                +{dayBookings.length - maxBookingsToShow} more
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="center" className="w-72 p-2 bg-popover border-border">
                              <div className="text-xs font-medium text-popover-foreground px-1 pb-2">
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
                                    className="w-full text-left rounded border border-border hover:bg-muted px-2 py-2"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="text-sm font-medium text-foreground truncate">
                                          {booking.guest_name || "Guest"}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
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
                          <div className="text-xs text-muted-foreground text-center py-4">
                            {override?.is_unavailable ? "Unavailable" : "No bookings"}
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
            <DialogContent className="max-w-lg bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Booking Details</DialogTitle>
              </DialogHeader>
              {selectedBooking && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Booking #</label>
                      <p className="font-mono text-foreground">{selectedBooking.booking_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge className={getStatusColor(selectedBooking.status || '')}>
                        {selectedBooking.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Customer</label>
                    <p className="text-foreground">{selectedBooking.guest_name || `${selectedBooking.profiles?.first_name} ${selectedBooking.profiles?.last_name}`}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.guest_email || selectedBooking.profiles?.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                      <p className="flex items-center gap-1 text-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(selectedBooking.start_datetime), "MMM d, yyyy")}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(selectedBooking.start_datetime), "h:mm a")} - 
                        {format(new Date(selectedBooking.end_datetime), "h:mm a")}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Business</label>
                      <p className="text-foreground">{selectedBooking.businesses?.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total</label>
                      <p className="text-lg font-bold text-foreground">{formatMoneyOrEstimate(selectedBooking)}</p>
                    </div>
                    {selectedBooking.deposit_amount && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Deposit</label>
                        <p className="text-foreground">${selectedBooking.deposit_amount?.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {selectedBooking.notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                      <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-4">
                    {/* Reschedule button - only for Spa/Restoration bookings that are confirmed */}
                    {isSpaBooking(selectedBooking) && selectedBooking.status === "confirmed" && (
                      <Button
                        variant="outline"
                        className="w-full border-amber-600 text-amber-500 hover:bg-amber-900/30 hover:text-amber-400"
                        onClick={() => setRescheduleOpen(true)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reschedule Appointment
                      </Button>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 border-border text-foreground hover:bg-muted" onClick={() => setSelectedBooking(null)}>
                        Close
                      </Button>
                      <Button
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={() => setEditOpen(true)}
                      >
                        Edit Booking
                      </Button>
                    </div>
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
            onCancelled={() => {
              // Close both modals and refresh the schedule
              setEditOpen(false);
              setSelectedBooking(null);
              refetch();
            }}
          />

          {/* Reschedule Modal - Spa only */}
          <RescheduleModal
            open={rescheduleOpen}
            onOpenChange={setRescheduleOpen}
            booking={selectedBooking}
            onSuccess={() => {
              refetch();
              setSelectedBooking(null);
            }}
          />

          {/* Day Availability Modal - Spa only */}
          <DayAvailabilityModal
            open={availabilityOpen}
            onOpenChange={setAvailabilityOpen}
            selectedDate={selectedDayForAvailability}
            businessId={spaBusinessId}
            businessName={spaBusinessName}
            existingBookings={bookings || []}
            onSuccess={handleAvailabilitySuccess}
          />
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
}
