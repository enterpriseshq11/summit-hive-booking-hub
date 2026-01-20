import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar as CalendarIcon, Plus, Trash2, Save, User, AlertCircle } from 'lucide-react';
import { useProviderScheduleManagement } from '@/hooks/useProviderScheduleManagement';
import { useBookings } from '@/hooks/useBookings';
import { format, parseISO, addDays } from 'date-fns';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIME_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6; // Start at 6 AM
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const display = format(new Date(`2000-01-01T${time}`), 'h:mm a');
  return { value: time, label: display };
});

export default function ProviderSchedule() {
  const { 
    schedule, 
    blackouts, 
    isLoading, 
    updateSchedule, 
    addBlackout, 
    removeBlackout,
    isUpdating 
  } = useProviderScheduleManagement();
  
  const { data: upcomingBookings } = useBookings({ 
    businessId: undefined, 
    status: 'confirmed',
    startDate: new Date().toISOString()
  });

  const [newBlackout, setNewBlackout] = useState({
    startDate: new Date(),
    endDate: new Date(),
    startTime: '09:00',
    endTime: '21:00',
    reason: '',
    isAllDay: true
  });
  const [showBlackoutDialog, setShowBlackoutDialog] = useState(false);

  // Local state for schedule editing
  const [localSchedule, setLocalSchedule] = useState<Record<number, { enabled: boolean; start: string; end: string }>>(() => {
    const defaultSchedule: Record<number, { enabled: boolean; start: string; end: string }> = {};
    for (let i = 0; i < 7; i++) {
      defaultSchedule[i] = { enabled: true, start: '09:00', end: '21:00' };
    }
    return defaultSchedule;
  });

  // Sync local schedule with fetched data
  React.useEffect(() => {
    if (schedule && schedule.length > 0) {
      const newLocal: Record<number, { enabled: boolean; start: string; end: string }> = {};
      for (let i = 0; i < 7; i++) {
        const daySchedule = schedule.find(s => s.day_of_week === i);
        if (daySchedule) {
          newLocal[i] = {
            enabled: daySchedule.is_active ?? true,
            start: daySchedule.start_time?.slice(0, 5) || '09:00',
            end: daySchedule.end_time?.slice(0, 5) || '21:00'
          };
        } else {
          newLocal[i] = { enabled: true, start: '09:00', end: '21:00' };
        }
      }
      setLocalSchedule(newLocal);
    }
  }, [schedule]);

  const handleScheduleChange = (day: number, field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    setLocalSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSaveSchedule = async () => {
    try {
      for (const [dayStr, config] of Object.entries(localSchedule)) {
        const day = parseInt(dayStr);
        await updateSchedule({
          day_of_week: day,
          start_time: config.start + ':00',
          end_time: config.end + ':00',
          is_active: config.enabled
        });
      }
      toast.success('Schedule saved successfully');
    } catch (error) {
      toast.error('Failed to save schedule');
    }
  };

  const handleAddBlackout = async () => {
    try {
      const startDatetime = newBlackout.isAllDay 
        ? format(newBlackout.startDate, 'yyyy-MM-dd') + 'T00:00:00'
        : format(newBlackout.startDate, 'yyyy-MM-dd') + 'T' + newBlackout.startTime + ':00';
      
      const endDatetime = newBlackout.isAllDay
        ? format(newBlackout.endDate, 'yyyy-MM-dd') + 'T23:59:59'
        : format(newBlackout.endDate, 'yyyy-MM-dd') + 'T' + newBlackout.endTime + ':00';

      await addBlackout({
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        reason: newBlackout.reason || 'Time off'
      });
      
      setShowBlackoutDialog(false);
      setNewBlackout({
        startDate: new Date(),
        endDate: new Date(),
        startTime: '09:00',
        endTime: '21:00',
        reason: '',
        isAllDay: true
      });
      toast.success('Time off added successfully');
    } catch (error) {
      toast.error('Failed to add time off');
    }
  };

  const handleRemoveBlackout = async (id: string) => {
    try {
      await removeBlackout(id);
      toast.success('Time off removed');
    } catch (error) {
      toast.error('Failed to remove time off');
    }
  };

  // Filter bookings for spa/massage by business name
  const spaBookings = upcomingBookings?.filter(b => 
    b.businesses?.name?.toLowerCase().includes('spa') ||
    b.businesses?.name?.toLowerCase().includes('restoration') ||
    b.businesses?.name?.toLowerCase().includes('lounge')
  ) || [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Schedule</h1>
        <p className="text-zinc-400">Manage your availability, time off, and view upcoming appointments</p>
      </div>
      <Tabs defaultValue="hours" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="hours" className="text-base">
            <Clock className="h-4 w-4 mr-2" />
            Working Hours
          </TabsTrigger>
          <TabsTrigger value="timeoff" className="text-base">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Time Off
          </TabsTrigger>
          <TabsTrigger value="appointments" className="text-base">
            <User className="h-4 w-4 mr-2" />
            Appointments
          </TabsTrigger>
        </TabsList>

        {/* Working Hours Tab */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Weekly Schedule</CardTitle>
              <CardDescription className="text-base">
                Set your available hours for each day. Changes apply immediately to the booking calendar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS_OF_WEEK.map(day => (
                <div 
                  key={day.value} 
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <Switch
                      checked={localSchedule[day.value]?.enabled ?? true}
                      onCheckedChange={(checked) => handleScheduleChange(day.value, 'enabled', checked)}
                    />
                    <span className={`font-medium text-base ${!localSchedule[day.value]?.enabled ? 'text-muted-foreground' : ''}`}>
                      {day.label}
                    </span>
                  </div>
                  
                  {localSchedule[day.value]?.enabled && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select
                        value={localSchedule[day.value]?.start || '09:00'}
                        onValueChange={(value) => handleScheduleChange(day.value, 'start', value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map(time => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">to</span>
                      <Select
                        value={localSchedule[day.value]?.end || '21:00'}
                        onValueChange={(value) => handleScheduleChange(day.value, 'end', value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map(time => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {!localSchedule[day.value]?.enabled && (
                    <Badge variant="secondary" className="text-sm">Closed</Badge>
                  )}
                </div>
              ))}
              
              <div className="pt-4">
                <Button onClick={handleSaveSchedule} disabled={isUpdating} size="lg" className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Schedule'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Off Tab */}
        <TabsContent value="timeoff">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Time Off & Blocked Dates</CardTitle>
                <CardDescription className="text-base">
                  Block out dates or times when you're unavailable.
                </CardDescription>
              </div>
              <Dialog open={showBlackoutDialog} onOpenChange={setShowBlackoutDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Off
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Add Time Off</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={newBlackout.isAllDay}
                        onCheckedChange={(checked) => setNewBlackout(prev => ({ ...prev, isAllDay: checked }))}
                      />
                      <Label className="text-base">All day</Label>
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label className="text-base mb-2 block">Start Date</Label>
                        <Calendar
                          mode="single"
                          selected={newBlackout.startDate}
                          onSelect={(date) => date && setNewBlackout(prev => ({ ...prev, startDate: date, endDate: date }))}
                          className="rounded-md border"
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-base mb-2 block">End Date</Label>
                        <Calendar
                          mode="single"
                          selected={newBlackout.endDate}
                          onSelect={(date) => date && setNewBlackout(prev => ({ ...prev, endDate: date }))}
                          className="rounded-md border"
                          disabled={(date) => date < newBlackout.startDate}
                        />
                      </div>
                      
                      {!newBlackout.isAllDay && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-base mb-2 block">Start Time</Label>
                            <Select
                              value={newBlackout.startTime}
                              onValueChange={(value) => setNewBlackout(prev => ({ ...prev, startTime: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map(time => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-base mb-2 block">End Time</Label>
                            <Select
                              value={newBlackout.endTime}
                              onValueChange={(value) => setNewBlackout(prev => ({ ...prev, endTime: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map(time => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-base mb-2 block">Reason (optional)</Label>
                        <Textarea
                          value={newBlackout.reason}
                          onChange={(e) => setNewBlackout(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="e.g., Vacation, Personal appointment, Lunch break"
                          className="text-base"
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleAddBlackout} className="w-full" size="lg">
                      Add Time Off
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {blackouts && blackouts.length > 0 ? (
                <div className="space-y-3">
                  {blackouts.map(blackout => (
                    <div 
                      key={blackout.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                    >
                      <div>
                        <p className="font-medium text-base">
                          {format(parseISO(blackout.start_datetime), 'MMM d, yyyy')}
                          {blackout.start_datetime !== blackout.end_datetime && 
                            ` - ${format(parseISO(blackout.end_datetime), 'MMM d, yyyy')}`
                          }
                        </p>
                        {blackout.reason && (
                          <p className="text-muted-foreground text-sm mt-1">{blackout.reason}</p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveBlackout(blackout.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-base">No time off scheduled</p>
                  <p className="text-sm">Click "Add Time Off" to block dates.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
              <CardDescription className="text-base">
                View and manage your scheduled appointments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {spaBookings.length > 0 ? (
                <div className="space-y-3">
                  {spaBookings.slice(0, 20).map(booking => (
                    <div 
                      key={booking.id} 
                      className="p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-base">
                            {booking.guest_name || 'Guest'}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {format(parseISO(booking.start_datetime), 'EEEE, MMM d, yyyy')} at{' '}
                            {format(parseISO(booking.start_datetime), 'h:mm a')}
                          </p>
                          {booking.guest_email && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {booking.guest_email}
                            </p>
                          )}
                          {booking.guest_phone && (
                            <p className="text-sm text-muted-foreground">
                              {booking.guest_phone}
                            </p>
                          )}
                          {booking.notes && (
                            <p className="text-sm mt-2 p-2 bg-muted rounded">
                              {booking.notes}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                          className="text-sm"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-base">No upcoming appointments</p>
                  <p className="text-sm">New bookings will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="mt-6 border-accent/30 bg-accent/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-base mb-1">How this works:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Changes to your working hours apply immediately to the public booking calendar</li>
              <li>• Time off blocks prevent customers from booking during those times</li>
              <li>• You'll receive email notifications for new bookings</li>
              <li>• Default buffer time between appointments is 15 minutes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
