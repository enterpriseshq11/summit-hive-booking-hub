-- Create notification logs table for tracking all sent notifications
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL, -- 'confirmation', 'reminder', 'cancellation', 'reschedule'
  channel TEXT NOT NULL, -- 'email', 'sms'
  recipient_type TEXT NOT NULL, -- 'customer', 'staff'
  recipient_email TEXT,
  recipient_phone TEXT,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'skipped'
  provider TEXT, -- 'resend', 'twilio'
  provider_message_id TEXT, -- Resend email ID or Twilio SID
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- Create notification settings table for configurable timing
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, setting_key)
);

-- Create scheduled reminders table
CREATE TABLE IF NOT EXISTS public.scheduled_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- '24h', '2h', 'custom'
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'cancelled', 'failed'
  notification_log_id UUID REFERENCES public.notification_logs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE(booking_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

-- Policies for notification_logs (admin only)
CREATE POLICY "Admins can view notification logs" ON public.notification_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can manage notification logs" ON public.notification_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for notification_settings (admin only)
CREATE POLICY "Admins can manage notification settings" ON public.notification_settings
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view notification settings" ON public.notification_settings
  FOR SELECT USING (public.is_staff(auth.uid()));

-- Policies for scheduled_reminders (admin only)
CREATE POLICY "Admins can manage scheduled reminders" ON public.scheduled_reminders
  FOR ALL USING (public.is_admin(auth.uid()));

-- Insert default global notification settings
INSERT INTO public.notification_settings (business_id, setting_key, setting_value, description) VALUES
  (NULL, 'reminder_24h_enabled', 'true', 'Send reminder 24 hours before appointment'),
  (NULL, 'reminder_2h_enabled', 'true', 'Send reminder 2 hours before appointment'),
  (NULL, 'confirmation_email_enabled', 'true', 'Send email confirmation on booking'),
  (NULL, 'confirmation_sms_enabled', 'true', 'Send SMS confirmation on booking'),
  (NULL, 'staff_notification_email_enabled', 'true', 'Send staff email notification on booking'),
  (NULL, 'staff_notification_sms_enabled', 'true', 'Send staff SMS notification on booking')
ON CONFLICT (business_id, setting_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking ON public.notification_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON public.notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_status ON public.scheduled_reminders(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_booking ON public.scheduled_reminders(booking_id);

-- Add trigger for updated_at on notification_settings
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();