-- Add type enum if not exists
DO $$ BEGIN
  CREATE TYPE promotion_type AS ENUM ('cross_bundle', 'volume_incentive', 'seasonal', 'role_based', 'manual_special');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add type column to promotions table
ALTER TABLE public.promotions 
ADD COLUMN IF NOT EXISTS type promotion_type DEFAULT 'manual_special',
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS primary_business_id UUID REFERENCES businesses(id),
ADD COLUMN IF NOT EXISTS progress_target INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS progress_window_days INTEGER DEFAULT NULL;

-- Update existing promotions with types based on category
UPDATE public.promotions SET type = 'cross_bundle' WHERE category = 'signature';
UPDATE public.promotions SET type = 'seasonal' WHERE category = 'monthly';
UPDATE public.promotions SET type = 'role_based' WHERE category = 'vault';