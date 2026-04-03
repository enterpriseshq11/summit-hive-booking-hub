
-- 1. Add event_category to crm_activity_events
ALTER TABLE public.crm_activity_events
ADD COLUMN IF NOT EXISTS event_category text;

-- 2. Add is_manual and payment_method to crm_revenue_events
ALTER TABLE public.crm_revenue_events
ADD COLUMN IF NOT EXISTS is_manual boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_method text;

-- 3. Create stripe_business_unit_mappings table
CREATE TABLE IF NOT EXISTS public.stripe_business_unit_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata_key text NOT NULL,
  metadata_value text NOT NULL,
  business_unit text NOT NULL,
  active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_business_unit_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage stripe mappings"
  ON public.stripe_business_unit_mappings FOR ALL
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- 4. Filtered RLS on crm_activity_events for non-owner roles
-- Drop existing SELECT policies first
DROP POLICY IF EXISTS "Staff can view activity events" ON public.crm_activity_events;
DROP POLICY IF EXISTS "staff_select_activity" ON public.crm_activity_events;

-- Owner sees all
CREATE POLICY "Owner can view all activity events"
  ON public.crm_activity_events FOR SELECT
  USING (public.has_role(auth.uid(), 'owner'));

-- Non-owner staff see only operational categories (excludes payroll, commission approval, settings, revenue manual, role changes)
CREATE POLICY "Staff can view operational activity events"
  ON public.crm_activity_events FOR SELECT
  USING (
    public.is_staff(auth.uid())
    AND NOT public.has_role(auth.uid(), 'owner')
    AND (
      event_category IS NULL
      OR event_category NOT IN (
        'payroll_initiated', 'payroll_approved', 'payroll_paid',
        'commission_approved', 'commission_rejected',
        'settings_change', 'revenue_manual_entry', 'user_role_changed'
      )
    )
  );

-- Ensure INSERT policy still exists for staff
DROP POLICY IF EXISTS "Staff can insert activity events" ON public.crm_activity_events;
DROP POLICY IF EXISTS "staff_insert_activity" ON public.crm_activity_events;
CREATE POLICY "Staff can insert activity events"
  ON public.crm_activity_events FOR INSERT
  WITH CHECK (public.is_staff(auth.uid()));

-- 5. Add fallback_business_unit to admin_settings if not already there
INSERT INTO public.admin_settings (key, value)
VALUES ('stripe_fallback_business_unit', 'unattributed')
ON CONFLICT (key) DO NOTHING;
