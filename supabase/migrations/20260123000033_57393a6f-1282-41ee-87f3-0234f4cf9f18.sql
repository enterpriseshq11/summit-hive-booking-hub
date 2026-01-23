-- Hive private office availability (for under-hero office cards)
CREATE TABLE IF NOT EXISTS public.hive_private_offices (
  code text PRIMARY KEY,
  label text NOT NULL,
  tier text NOT NULL DEFAULT 'standard',
  floor_label text NOT NULL,
  monthly_rate integer NOT NULL,
  deposit_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'available',
  booked_until date NULL,
  notes text NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Allowed values
ALTER TABLE public.hive_private_offices
  ADD CONSTRAINT hive_private_offices_status_check
  CHECK (status IN ('available','booked'));

ALTER TABLE public.hive_private_offices ENABLE ROW LEVEL SECURITY;

-- Public read (needed for public Coworking page)
CREATE POLICY "Hive private offices are viewable by everyone"
ON public.hive_private_offices
FOR SELECT
USING (true);

-- Staff can manage availability
CREATE POLICY "Staff can insert hive private offices"
ON public.hive_private_offices
FOR INSERT
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update hive private offices"
ON public.hive_private_offices
FOR UPDATE
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete hive private offices"
ON public.hive_private_offices
FOR DELETE
USING (public.is_staff(auth.uid()));

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_hive_private_offices_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_hive_private_offices_updated_at ON public.hive_private_offices;
CREATE TRIGGER update_hive_private_offices_updated_at
BEFORE UPDATE ON public.hive_private_offices
FOR EACH ROW
EXECUTE FUNCTION public.update_hive_private_offices_updated_at();

CREATE INDEX IF NOT EXISTS idx_hive_private_offices_status ON public.hive_private_offices(status);
