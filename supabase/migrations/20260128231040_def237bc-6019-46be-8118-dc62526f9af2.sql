-- Create availability_overrides table for date-specific availability windows
-- These override the default availability_windows for specific dates

CREATE TABLE public.availability_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  is_unavailable BOOLEAN NOT NULL DEFAULT false,
  -- When is_unavailable = false, availability_windows contains the available time ranges
  -- Format: [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "17:00"}]
  availability_windows JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique override per business/provider/date
  CONSTRAINT unique_override_per_date UNIQUE (business_id, provider_id, override_date)
);

-- Add index for efficient date range queries
CREATE INDEX idx_availability_overrides_date ON public.availability_overrides(override_date);
CREATE INDEX idx_availability_overrides_business ON public.availability_overrides(business_id);

-- Enable RLS
ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view availability overrides"
ON public.availability_overrides FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can manage availability overrides"
ON public.availability_overrides FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'manager', 'event_coordinator', 'spa_lead', 'coworking_manager', 'fitness_lead', 'front_desk')
  )
);

-- Allow anon users to read (for public booking pages)
CREATE POLICY "Anon users can view availability overrides"
ON public.availability_overrides FOR SELECT
TO anon
USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_availability_overrides_updated_at
BEFORE UPDATE ON public.availability_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();