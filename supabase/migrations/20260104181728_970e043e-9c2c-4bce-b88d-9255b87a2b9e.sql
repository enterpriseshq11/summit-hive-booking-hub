-- Add RLS policies for voice_vault_bookings
ALTER TABLE public.voice_vault_bookings ENABLE ROW LEVEL SECURITY;

-- Staff can view all bookings
CREATE POLICY "Staff can view all voice vault bookings" 
ON public.voice_vault_bookings 
FOR SELECT 
TO authenticated
USING (public.is_staff(auth.uid()));

-- Staff can insert bookings (for admin override)
CREATE POLICY "Staff can insert voice vault bookings" 
ON public.voice_vault_bookings 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

-- Staff can update bookings
CREATE POLICY "Staff can update voice vault bookings" 
ON public.voice_vault_bookings 
FOR UPDATE 
TO authenticated
USING (public.is_staff(auth.uid()));

-- Public can insert (for customer checkout flow - edge function uses service role)
CREATE POLICY "Service role can manage voice vault bookings" 
ON public.voice_vault_bookings 
FOR ALL
USING (true)
WITH CHECK (true);

-- Add RLS policies for voice_vault_packages
ALTER TABLE public.voice_vault_packages ENABLE ROW LEVEL SECURITY;

-- Staff can view all packages
CREATE POLICY "Staff can view all voice vault packages" 
ON public.voice_vault_packages 
FOR SELECT 
TO authenticated
USING (public.is_staff(auth.uid()));

-- Staff can update packages (for content status, notes, rights release)
CREATE POLICY "Staff can update voice vault packages" 
ON public.voice_vault_packages 
FOR UPDATE 
TO authenticated
USING (public.is_staff(auth.uid()));

-- Service role can manage packages (for checkout and webhook)
CREATE POLICY "Service role can manage voice vault packages" 
ON public.voice_vault_packages 
FOR ALL
USING (true)
WITH CHECK (true);

-- Add function to check for overlapping bookings
CREATE OR REPLACE FUNCTION public.check_voice_vault_booking_overlap(
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.voice_vault_bookings
    WHERE booking_date = p_booking_date
      AND payment_status NOT IN ('pending', 'defaulted')
      AND (p_exclude_id IS NULL OR id != p_exclude_id)
      AND (
        (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      )
  );
END;
$$;

-- Add constraint to enforce 2-hour minimum via check constraint
ALTER TABLE public.voice_vault_bookings
ADD CONSTRAINT min_duration_hours CHECK (duration_hours >= 2);

-- Add admin_override column for bookings
ALTER TABLE public.voice_vault_bookings
ADD COLUMN IF NOT EXISTS admin_override BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_override_by UUID,
ADD COLUMN IF NOT EXISTS admin_override_reason TEXT;