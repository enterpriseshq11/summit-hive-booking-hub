-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create photo booth inquiries table for 360 Photo Booth leads
CREATE TABLE public.photo_booth_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Contact info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Event details
  event_date DATE,
  event_type TEXT,
  event_location TEXT,
  
  -- Additional info
  notes TEXT,
  preferred_contact TEXT DEFAULT 'email',
  
  -- Status tracking
  status TEXT DEFAULT 'new',
  internal_notes TEXT,
  assigned_to UUID,
  
  -- Source tracking
  source TEXT DEFAULT 'website',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photo_booth_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit photo booth inquiries (public form)
CREATE POLICY "Anyone can create photo booth inquiries"
  ON public.photo_booth_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Staff can manage all inquiries
CREATE POLICY "Staff can manage photo booth inquiries"
  ON public.photo_booth_inquiries
  FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_photo_booth_inquiries_updated_at
  BEFORE UPDATE ON public.photo_booth_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();