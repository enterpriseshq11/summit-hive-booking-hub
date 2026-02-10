
-- Create special_claims table for lead capture
CREATE TABLE public.special_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  special_id UUID REFERENCES public.specials(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.special_claims ENABLE ROW LEVEL SECURITY;

-- Public insert (anonymous visitors can submit)
CREATE POLICY "Anyone can submit a special claim"
  ON public.special_claims FOR INSERT
  WITH CHECK (true);

-- Admin read
CREATE POLICY "Admins can view special claims"
  ON public.special_claims FOR SELECT
  USING (public.is_admin(auth.uid()));
