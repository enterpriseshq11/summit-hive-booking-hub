-- Add category column to existing assumptions table
ALTER TABLE public.assumptions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Update category to NOT NULL after setting default
UPDATE public.assumptions SET category = 'General' WHERE category IS NULL;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assumptions' AND policyname = 'Staff can read assumptions'
  ) THEN
    CREATE POLICY "Staff can read assumptions"
      ON public.assumptions FOR SELECT
      TO authenticated
      USING (public.is_staff(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assumptions' AND policyname = 'Admins can insert assumptions'
  ) THEN
    CREATE POLICY "Admins can insert assumptions"
      ON public.assumptions FOR INSERT
      TO authenticated
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assumptions' AND policyname = 'Admins can update assumptions'
  ) THEN
    CREATE POLICY "Admins can update assumptions"
      ON public.assumptions FOR UPDATE
      TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Seed initial assumptions if none exist
INSERT INTO public.assumptions (category, assumption_text, reason, status)
SELECT 'Branding', 'Neutral styling used throughout the application', 'No brand assets were provided. Business-specific color palettes are deferred until assets are received.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.assumptions WHERE assumption_text LIKE '%Neutral styling%');

INSERT INTO public.assumptions (category, assumption_text, reason, status)
SELECT 'Admin', 'Phase 2 admin pages are stubs only', 'Operational functionality is deferred to Phase 3 to ensure proper architecture and testing.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.assumptions WHERE assumption_text LIKE '%Phase 2 admin%');