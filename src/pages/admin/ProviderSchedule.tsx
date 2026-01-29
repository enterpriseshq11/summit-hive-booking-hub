import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, Calendar as CalendarIcon, Plus, Trash2, Save, User, AlertCircle, 
  Settings, RefreshCw, Mail, Phone, X, CheckCircle, Sparkles
} from 'lucide-react';
import { useProviderScheduleManagement } from '@/hooks/useProviderScheduleManagement';
import { useBookings, useUpdateBookingStatus } from '@/hooks/useBookings';
import { useSpaWorkerAvailability } from '@/hooks/useSpaWorkerAvailability';
import { useAuth } from '@/contexts/AuthContext';
import { SpaWorkerOnboardingWizard } from '@/components/admin/SpaWorkerOnboardingWizard';
import { format, parseISO } from 'date-fns';
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

const SLOT_INCREMENT_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '60 minutes' },
];

const BUFFER_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
];

export default function ProviderSchedule() {
  const { authUser } = useAuth();
  const isSpaWorkerOnly = authUser?.roles?.includes("spa_worker") && 
    !authUser?.roles?.some(r => ["owner", "manager", "spa_lead"].includes(r));
  
  // Check if this is a spa worker who needs onboarding
  const { 
    currentWorker, 
    needsOnboarding, 
    isLoading: isLoadingWorkerData,
    availability: workerAvailability,
  } = useSpaWorkerAvailability();

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding wizard for new spa workers
  useEffect(() => {
    if (isSpaWorkerOnly && needsOnboarding && !isLoadingWorkerData) {
      setShowOnboarding(true);
    }
  }, [isSpaWorkerOnly, needsOnboarding, isLoadingWorkerData]);

  const { 
    schedule, 
    blackouts, 
    settings,
    recurringBlocks,
    isLoading, 
    updateSchedule,
    updateSettings,
    addBlackout, 
    removeBlackout,
    addRecurringBlock,
    removeRecurringBlock,
    isUpdating 
  } = useProviderScheduleManagement();
  
  const { data: upcomingBookings, refetch: refetchBookings } = useBookings({ 
    businessId: undefined, 
    status: undefined,
    startDate: new Date().toISOString()
  });

  const updateBookingStatus = useUpdateBookingStatus();

  const [newBlackout, setNewBlackout] = useState({
    startDate: new Date(),
    endDate: new Date(),
    startTime: '09:00',
    endTime: '21:00',
    reason: '',
    isAllDay: true
  });
  const [showBlackoutDialog, setShowBlackoutDialog] = useState(false);
  
  const [newRecurringBlock, setNewRecurringBlock] = useState({
    day_of_week: 0,
    start_time: '12:00',
    end_time: '13:00',
    reason: 'Lunch break'
  });
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);

  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Local state for schedule editing
  const [localSchedule, setLocalSchedule] = useState<Record<number, { enabled: boolean; start: string; end: string }>>(() => {
    const defaultSchedule: Record<number, { enabled: boolean; start: string; end: string }> = {};
    for (let i = 0; i < 7; i++) {
      defaultSchedule[i] = { enabled: true, start: '09:00', end: '21:00' };
    }
    return defaultSchedule;
  });

  // Local state for settings
  const [localSettings, setLocalSettings] = useState({
    slot_increment_mins: 30,
    buffer_before_mins: 0,
    buffer_after_mins: 15,
    min_advance_hours: 2,
    max_advance_days: 60,
    notification_email: '',
    notification_sms: '',
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

  // Sync local settings with fetched data
  React.useEffect(() => {
    if (settings) {
      setLocalSettings({
        slot_increment_mins: settings.slot_increment_mins || 30,
        buffer_before_mins: settings.buffer_before_mins || 0,
        buffer_after_mins: settings.buffer_after_mins || 15,
        min_advance_hours: settings.min_advance_hours || 2,
        max_advance_days: settings.max_advance_days || 60,
        notification_email: settings.notification_email || '',
        notification_sms: settings.notification_sms || '',
      });
    }
  }, [settings]);

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
      toast.success('Schedule saved! Changes are now live on the booking calendar.');
    } catch (error) {
      toast.error('Failed to save schedule');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        slot_increment_mins: localSettings.slot_increment_mins,
        buffer_before_mins: localSettings.buffer_before_mins,
        buffer_after_mins: localSettings.buffer_after_mins,
        min_advance_hours: localSettings.min_advance_hours,
        max_advance_days: localSettings.max_advance_days,
        notification_email: localSettings.notification_email || null,
        notification_sms: localSettings.notification_sms || null,
      });
    } catch (error) {
      toast.error('Failed to save settings');
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
      toast.success('Time off added! This is now blocked on the booking calendar.');
    } catch (error) {
      toast.error('Failed to add time off');
    }
  };

  const handleRemoveBlackout = async (id: string) => {
    try {
      await removeBlackout(id);
      toast.success('Time off removed. The slot is now available for booking.');
    } catch (error) {
      toast.error('Failed to remove time off');
    }
  };

  const handleAddRecurringBlock = async () => {
    try {
      await addRecurringBlock({
        day_of_week: newRecurringBlock.day_of_week,
        start_time: newRecurringBlock.start_time + ':00',
        end_time: newRecurringBlock.end_time + ':00',
        reason: newRecurringBlock.reason,
        is_active: true,
      });
      
      setShowRecurringDialog(false);
      setNewRecurringBlock({
        day_of_week: 0,
        start_time: '12:00',
        end_time: '13:00',
        reason: 'Lunch break'
      });
      toast.success('Recurring block added!');
    } catch (error) {
      toast.error('Failed to add recurring block');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;
    
    try {
      await updateBookingStatus.mutateAsync({
        id: cancelBookingId,
        status: 'cancelled',
        notes: cancelReason || 'Cancelled by provider'
      });
      setCancelBookingId(null);
      setCancelReason('');
      refetchBookings();
      toast.success('Booking cancelled. The time slot is now available.');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus.mutateAsync({
        id: bookingId,
        status: 'confirmed',
      });
      refetchBookings();
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error('Failed to confirm booking');
    }
  };

  // Filter bookings for spa/massage by business name
  const spaBookings = upcomingBookings?.filter(b => 
    b.businesses?.name?.toLowerCase().includes('spa') ||
    b.businesses?.name?.toLowerCase().includes('restoration') ||
    b.businesses?.name?.toLowerCase().includes('lounge')
  ) || [];

  const pendingBookings = spaBookings.filter(b => b.status === 'pending');
  const confirmedBookings = spaBookings.filter(b => b.status === 'confirmed');

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
      {/* Onboarding Wizard for new spa workers */}
      {isSpaWorkerOnly && (
        <SpaWorkerOnboardingWizard
          open={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
          workerName={currentWorker?.first_name}
        />
      )}

      {/* Banner for workers who haven't set availability yet */}
      {isSpaWorkerOnly && needsOnboarding && !showOnboarding && (
        <Alert className="mb-6 bg-amber-500/10 border-amber-500/30">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200 ml-2">
            <strong>Set your availability to start receiving bookings.</strong>{" "}
            <Button
              variant="link"
              className="text-amber-400 p-0 h-auto"
              onClick={() => setShowOnboarding(true)}
            >
              Complete setup now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Schedule</h1>
        <p className="text-zinc-400">Manage your availability, time off, and view upcoming appointments</p>
      </div>
      
      <Tabs defaultValue="hours" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="hours" className="text-base">
            <Clock className="h-4 w-4 mr-2" />
            Hours
          </TabsTrigger>
          <TabsTrigger value="timeoff" className="text-base">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Time Off
          </TabsTrigger>
          <TabsTrigger value="appointments" className="text-base relative">
            <User className="h-4 w-4 mr-2" />
            Appointments
            {pendingBookings.length > 0 && (
              <Badge className="ml-2 bg-accent text-primary text-xs">
                {pendingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-base">
            <Settings className="h-4 w-4 mr-2" />
            Settings
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

          {/* Recurring Blocks */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Recurring Blocks
                </CardTitle>
                <CardDescription className="text-base">
                  Block the same time every week (e.g., lunch break every Tuesday 12-1pm)
                </CardDescription>
              </div>
              <Dialog open={showRecurringDialog} onOpenChange={setShowRecurringDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Recurring Block</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label className="text-base mb-2 block">Day of Week</Label>
                      <Select
                        value={String(newRecurringBlock.day_of_week)}
                        onValueChange={(value) => setNewRecurringBlock(prev => ({ ...prev, day_of_week: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map(day => (
                            <SelectItem key={day.value} value={String(day.value)}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-base mb-2 block">Start Time</Label>
                        <Select
                          value={newRecurringBlock.start_time}
                          onValueChange={(value) => setNewRecurringBlock(prev => ({ ...prev, start_time: value }))}
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
                          value={newRecurringBlock.end_time}
                          onValueChange={(value) => setNewRecurringBlock(prev => ({ ...prev, end_time: value }))}
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
                    <div>
                      <Label className="text-base mb-2 block">Reason</Label>
                      <Input
                        value={newRecurringBlock.reason}
                        onChange={(e) => setNewRecurringBlock(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="e.g., Lunch break, Staff meeting"
                      />
                    </div>
                    <Button onClick={handleAddRecurringBlock} className="w-full">
                      Add Recurring Block
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {recurringBlocks && recurringBlocks.length > 0 ? (
                <div className="space-y-3">
                  {recurringBlocks.map(block => (
                    <div 
                      key={block.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                    >
                      <div>
                        <p className="font-medium text-base">
                          Every {DAYS_OF_WEEK.find(d => d.value === block.day_of_week)?.label}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {format(new Date(`2000-01-01T${block.start_time}`), 'h:mm a')} - {format(new Date(`2000-01-01T${block.end_time}`), 'h:mm a')}
                          {block.reason && ` • ${block.reason}`}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeRecurringBlock(block.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <RefreshCw className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No recurring blocks set</p>
                </div>
              )}
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
                  Block out dates or times when you're unavailable. These block immediately.
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
                          {blackout.start_datetime.slice(0, 10) !== blackout.end_datetime.slice(0, 10) && 
                            ` - ${format(parseISO(blackout.end_datetime), 'MMM d, yyyy')}`
                          }
                        </p>
                        {!blackout.start_datetime.includes('00:00:00') && (
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(blackout.start_datetime), 'h:mm a')} - {format(parseISO(blackout.end_datetime), 'h:mm a')}
                          </p>
                        )}
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
          {/* Pending Approvals */}
          {pendingBookings.length > 0 && (
            <Card className="mb-6 border-accent/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  Pending Approval ({pendingBookings.length})
                </CardTitle>
                <CardDescription className="text-base">
                  These bookings need your confirmation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className="p-4 rounded-lg border border-accent/30 bg-accent/5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-base">
                            {booking.guest_name || 'Guest'}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {format(parseISO(booking.start_datetime), 'EEEE, MMM d, yyyy')} at{' '}
                            {format(parseISO(booking.start_datetime), 'h:mm a')}
                          </p>
                          {booking.guest_email && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {booking.guest_email}
                            </p>
                          )}
                          {booking.guest_phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {booking.guest_phone}
                            </p>
                          )}
                          {booking.notes && (
                            <p className="text-sm mt-2 p-2 bg-muted rounded">
                              {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleConfirmBooking(booking.id)}
                            className="bg-accent text-primary hover:bg-accent/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setCancelBookingId(booking.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmed Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
              <CardDescription className="text-base">
                View and manage your confirmed appointments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {confirmedBookings.length > 0 ? (
                <div className="space-y-3">
                  {confirmedBookings.slice(0, 20).map(booking => (
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
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {booking.guest_email}
                            </p>
                          )}
                          {booking.guest_phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {booking.guest_phone}
                            </p>
                          )}
                          {booking.notes && (
                            <p className="text-sm mt-2 p-2 bg-muted rounded">
                              {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-sm bg-accent/20 text-accent">
                            Confirmed
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setCancelBookingId(booking.id)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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

          {/* Cancel Booking Dialog */}
          <Dialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-muted-foreground">
                  Are you sure you want to cancel this booking? The time slot will become available again.
                </p>
                <div>
                  <Label>Reason (optional)</Label>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelBookingId(null)}>
                  Keep Booking
                </Button>
                <Button variant="destructive" onClick={handleCancelBooking}>
                  Cancel Booking
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Slot Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Booking Slot Settings</CardTitle>
                <CardDescription className="text-base">
                  Configure how appointment slots are generated and displayed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base">Slot Increment</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    How often time slots appear (e.g., every 30 min)
                  </p>
                  <Select
                    value={String(localSettings.slot_increment_mins)}
                    onValueChange={(value) => setLocalSettings(prev => ({ ...prev, slot_increment_mins: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLOT_INCREMENT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base">Buffer Before Appointment</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Prep time before each appointment
                  </p>
                  <Select
                    value={String(localSettings.buffer_before_mins)}
                    onValueChange={(value) => setLocalSettings(prev => ({ ...prev, buffer_before_mins: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUFFER_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base">Buffer After Appointment</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cleanup/break time after each appointment
                  </p>
                  <Select
                    value={String(localSettings.buffer_after_mins)}
                    onValueChange={(value) => setLocalSettings(prev => ({ ...prev, buffer_after_mins: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUFFER_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base">Min Advance (hours)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      How soon customers can book
                    </p>
                    <Input
                      type="number"
                      min={0}
                      value={localSettings.min_advance_hours}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, min_advance_hours: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-base">Max Advance (days)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      How far ahead they can book
                    </p>
                    <Input
                      type="number"
                      min={1}
                      value={localSettings.max_advance_days}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, max_advance_days: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Notification Settings</CardTitle>
                <CardDescription className="text-base">
                  Configure how you receive booking notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notification Email
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Receive email alerts for new bookings
                  </p>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={localSettings.notification_email}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, notification_email: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-base flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    SMS Notification Number
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Receive text alerts for new bookings (optional)
                  </p>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={localSettings.notification_sms}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, notification_sms: e.target.value }))}
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} disabled={isUpdating} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
              <li>• Recurring blocks (e.g., lunch breaks) repeat every week automatically</li>
              <li>• You'll receive notifications for new bookings at your configured email/phone</li>
              <li>• Cancelling a booking returns the slot to available immediately</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
