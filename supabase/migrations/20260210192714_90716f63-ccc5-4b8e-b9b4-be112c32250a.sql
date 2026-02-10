
-- Create specials table for admin-managed specials across all business units
CREATE TABLE public.specials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_unit TEXT NOT NULL CHECK (business_unit IN ('summit', 'hive', 'restoration', 'photo_booth_360', 'voice_vault')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_label TEXT NOT NULL DEFAULT 'Learn More',
  cta_link TEXT,
  badge TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  always_on BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.specials ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can see active specials (filtered in app by date logic)
CREATE POLICY "Anyone can read active specials"
  ON public.specials FOR SELECT
  USING (true);

-- Admin write: only owners/managers can insert/update/delete
CREATE POLICY "Admins can insert specials"
  ON public.specials FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update specials"
  ON public.specials FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete specials"
  ON public.specials FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Auto-update updated_at
CREATE TRIGGER update_specials_updated_at
  BEFORE UPDATE ON public.specials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for efficient public queries
CREATE INDEX idx_specials_business_unit ON public.specials (business_unit);
CREATE INDEX idx_specials_active_dates ON public.specials (is_active, always_on, start_date, end_date);
