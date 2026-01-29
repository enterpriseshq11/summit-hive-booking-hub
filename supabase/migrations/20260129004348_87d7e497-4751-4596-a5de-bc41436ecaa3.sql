-- =============================================================
-- SPA WORKERS SYSTEM: Complete Database Setup
-- =============================================================

-- 1. Add 'spa_worker' role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'spa_worker';

-- 2. Create spa_workers table for worker profiles
CREATE TABLE public.spa_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  display_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  invited_at timestamptz,
  invite_accepted_at timestamptz,
  invite_token uuid DEFAULT gen_random_uuid(),
  invite_expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deactivated_at timestamptz,
  deactivated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text
);

-- 3. Create indexes for performance
CREATE INDEX idx_spa_workers_user_id ON public.spa_workers(user_id);
CREATE INDEX idx_spa_workers_email ON public.spa_workers(email);
CREATE INDEX idx_spa_workers_is_active ON public.spa_workers(is_active);
CREATE INDEX idx_spa_workers_invite_token ON public.spa_workers(invite_token) WHERE invite_token IS NOT NULL;

-- 4. Enable RLS on spa_workers
ALTER TABLE public.spa_workers ENABLE ROW LEVEL SECURITY;

-- 5. Create helper function to check if user is a spa worker
CREATE OR REPLACE FUNCTION public.is_spa_worker(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.spa_workers
    WHERE user_id = _user_id AND is_active = true
  )
$$;

-- 6. Create helper function to get spa worker id for a user
CREATE OR REPLACE FUNCTION public.get_spa_worker_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.spa_workers
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1
$$;

-- 7. RLS Policies for spa_workers table

-- Owners and managers can do everything
CREATE POLICY "Owners and managers can manage spa workers"
  ON public.spa_workers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'manager'));

-- Spa leads can view and manage workers
CREATE POLICY "Spa leads can manage spa workers"
  ON public.spa_workers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'spa_lead'))
  WITH CHECK (public.has_role(auth.uid(), 'spa_lead'));

-- Workers can view their own record
CREATE POLICY "Workers can view own record"
  ON public.spa_workers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Public can view active workers (for booking dropdown)
CREATE POLICY "Public can view active workers for booking"
  ON public.spa_workers FOR SELECT
  USING (is_active = true);

-- 8. Add trigger for updated_at
CREATE TRIGGER update_spa_workers_updated_at
  BEFORE UPDATE ON public.spa_workers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Create spa_worker_availability table for worker-specific availability
CREATE TABLE public.spa_worker_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES public.spa_workers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE INDEX idx_spa_worker_availability_worker ON public.spa_worker_availability(worker_id);
CREATE INDEX idx_spa_worker_availability_day ON public.spa_worker_availability(day_of_week);

ALTER TABLE public.spa_worker_availability ENABLE ROW LEVEL SECURITY;

-- RLS for worker availability
CREATE POLICY "Owners managers spa_leads can manage worker availability"
  ON public.spa_worker_availability FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'manager') OR 
    public.has_role(auth.uid(), 'spa_lead')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'manager') OR 
    public.has_role(auth.uid(), 'spa_lead')
  );

-- Workers can view and manage their own availability
CREATE POLICY "Workers can manage own availability"
  ON public.spa_worker_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.spa_workers sw
      WHERE sw.id = worker_id AND sw.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.spa_workers sw
      WHERE sw.id = worker_id AND sw.user_id = auth.uid()
    )
  );

-- Public can view active worker availability (for booking)
CREATE POLICY "Public can view active worker availability"
  ON public.spa_worker_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.spa_workers sw
      WHERE sw.id = worker_id AND sw.is_active = true
    )
  );

CREATE TRIGGER update_spa_worker_availability_updated_at
  BEFORE UPDATE ON public.spa_worker_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Create spa_worker_blackouts table for worker-specific blackouts
CREATE TABLE public.spa_worker_blackouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES public.spa_workers(id) ON DELETE CASCADE,
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz NOT NULL,
  reason text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_blackout_range CHECK (start_datetime < end_datetime)
);

CREATE INDEX idx_spa_worker_blackouts_worker ON public.spa_worker_blackouts(worker_id);
CREATE INDEX idx_spa_worker_blackouts_dates ON public.spa_worker_blackouts(start_datetime, end_datetime);

ALTER TABLE public.spa_worker_blackouts ENABLE ROW LEVEL SECURITY;

-- RLS for worker blackouts
CREATE POLICY "Owners managers spa_leads can manage worker blackouts"
  ON public.spa_worker_blackouts FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'manager') OR 
    public.has_role(auth.uid(), 'spa_lead')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR 
    public.has_role(auth.uid(), 'manager') OR 
    public.has_role(auth.uid(), 'spa_lead')
  );

-- Workers can manage their own blackouts
CREATE POLICY "Workers can manage own blackouts"
  ON public.spa_worker_blackouts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.spa_workers sw
      WHERE sw.id = worker_id AND sw.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.spa_workers sw
      WHERE sw.id = worker_id AND sw.user_id = auth.uid()
    )
  );

-- 11. Add spa_worker_id column to bookings table for worker assignment
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS spa_worker_id uuid REFERENCES public.spa_workers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_spa_worker ON public.bookings(spa_worker_id);

-- 12. Create RLS policy for workers to only see their own bookings
-- First, check if a similar policy exists and drop it if needed
DO $$
BEGIN
  -- Add policy for spa workers to see only their bookings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Spa workers can view own bookings'
  ) THEN
    CREATE POLICY "Spa workers can view own bookings"
      ON public.bookings FOR SELECT
      TO authenticated
      USING (
        spa_worker_id IS NOT NULL AND
        spa_worker_id = public.get_spa_worker_id(auth.uid())
      );
  END IF;
END
$$;

-- 13. Create notification log entry type for worker invites
-- (Uses existing notification_logs table if available, otherwise just audit_log)