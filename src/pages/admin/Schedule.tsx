import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useBookings } from "@/hooks/useBookings";
import { useBusinesses } from "@/hooks/useBusinesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from "date-fns";

export default function AdminSchedule() {
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: businesses } = useBusinesses();
  const { data: bookings, isLoading } = useBookings({
    businessId: selectedBusiness === "all" ? undefined : selectedBusiness,
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      case "pending": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
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
      case "cancelled": return "✗ Cancelled";
      case "completed": return "✓ Complete";
      case "no_show": return "– No Show";
      default: return status;
    }
  };

  const getBookingsForDay = (date: Date) => {
    return bookings?.filter((booking) => {
      const bookingDate = new Date(booking.start_datetime);
      return isSameDay(bookingDate, date);
    }) || [];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Schedule</h1>
            <p className="text-zinc-300">View and manage all bookings across businesses</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
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
          <strong className="text-white">Tip:</strong> Click any booking to view details. Use the business filter to focus on specific locations. Today's date is highlighted with a blue border.
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg p-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="border-zinc-600 text-white hover:bg-zinc-700 hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <div className="text-center">
            <h2 className="font-semibold text-white">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </h2>
            <Button variant="link" size="sm" onClick={() => setCurrentWeek(new Date())} className="text-accent hover:text-accent/80">
              Today
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="border-zinc-600 text-white hover:bg-zinc-700 hover:text-white">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array(7).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => {
              const dayBookings = getBookingsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Card key={day.toISOString()} className={`min-h-[200px] bg-zinc-800 border-zinc-700 ${isToday ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-medium flex justify-between items-center text-white">
                      <span>{format(day, "EEE")}</span>
                      <span className={`text-lg ${isToday ? 'text-primary font-bold' : 'text-zinc-300'}`}>
                        {format(day, "d")}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    {dayBookings.slice(0, 4).map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`w-full text-left p-2 rounded text-xs transition-colors border ${getStatusColor(booking.status || '')} hover:opacity-80`}
                        aria-label={`View booking for ${booking.guest_name || 'Guest'} at ${format(new Date(booking.start_datetime), "h:mm a")}`}
                      >
                        <div className="font-medium truncate">
                          {booking.guest_name || "Guest"}
                        </div>
                        <div className="flex items-center gap-1 opacity-80">
                          <Clock className="h-3 w-3" />
                          {format(new Date(booking.start_datetime), "h:mm a")}
                        </div>
                        <div className="text-[10px] mt-1 font-medium">
                          {getStatusLabel(booking.status || '')}
                        </div>
                      </button>
                    ))}
                    {dayBookings.length > 4 && (
                      <div className="text-xs text-zinc-400 text-center pt-1">
                        +{dayBookings.length - 4} more
                      </div>
                    )}
                    {dayBookings.length === 0 && (
                      <div className="text-xs text-zinc-400 text-center py-4">
                        No bookings
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Booking Detail Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
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
                    <p className="text-lg font-bold text-white">${selectedBooking.total_amount?.toFixed(2)}</p>
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
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedBooking(null)}>
                    Close
                  </Button>
                  <Button className="flex-1">
                    Edit Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
