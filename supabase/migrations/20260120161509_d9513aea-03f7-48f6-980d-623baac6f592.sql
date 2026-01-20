-- Create provider_settings table for configurable slot increment, buffer times, etc.
CREATE TABLE IF NOT EXISTS public.provider_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES auth.users(id),
  business_id UUID REFERENCES public.businesses(id),
  slot_increment_mins INTEGER NOT NULL DEFAULT 30,
  buffer_before_mins INTEGER NOT NULL DEFAULT 0,
  buffer_after_mins INTEGER NOT NULL DEFAULT 15,
  min_advance_hours INTEGER NOT NULL DEFAULT 2,
  max_advance_days INTEGER NOT NULL DEFAULT 60,
  auto_confirm_bookings BOOLEAN NOT NULL DEFAULT false,
  notification_email TEXT,
  notification_sms TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.provider_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_settings
CREATE POLICY "Providers can view their own settings"
  ON public.provider_settings FOR SELECT
  USING (auth.uid() = provider_id OR public.is_admin(auth.uid()));

CREATE POLICY "Providers can update their own settings"
  ON public.provider_settings FOR UPDATE
  USING (auth.uid() = provider_id OR public.is_admin(auth.uid()));

CREATE POLICY "Providers can insert their own settings"
  ON public.provider_settings FOR INSERT
  WITH CHECK (auth.uid() = provider_id OR public.is_admin(auth.uid()));

-- Create recurring_blocks table for recurring time blocks
CREATE TABLE IF NOT EXISTS public.recurring_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES auth.users(id),
  business_id UUID REFERENCES public.businesses(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.recurring_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for recurring_blocks
CREATE POLICY "Providers can view their recurring blocks"
  ON public.recurring_blocks FOR SELECT
  USING (auth.uid() = provider_id OR public.is_admin(auth.uid()));

CREATE POLICY "Providers can manage their recurring blocks"
  ON public.recurring_blocks FOR ALL
  USING (auth.uid() = provider_id OR public.is_admin(auth.uid()));

-- Add provider_id column to availability_windows if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'availability_windows' AND column_name = 'provider_id'
  ) THEN
    ALTER TABLE public.availability_windows ADD COLUMN provider_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Add trigger for updated_at on provider_settings
CREATE TRIGGER update_provider_settings_updated_at
  BEFORE UPDATE ON public.provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings for Lindsey (spa business)
INSERT INTO public.provider_settings (business_id, slot_increment_mins, buffer_before_mins, buffer_after_mins, min_advance_hours, max_advance_days, auto_confirm_bookings)
VALUES ('4df48af2-39e4-4bd1-a9b3-963de8ef39d7', 30, 0, 15, 2, 60, false)
ON CONFLICT DO NOTHING;