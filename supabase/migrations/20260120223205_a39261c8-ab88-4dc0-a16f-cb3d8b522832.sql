-- Fix for error 55P04: enum value must be committed before use.
-- Step 1/2: add business_type value 'photo_booth' only.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'business_type'
      AND e.enumlabel = 'photo_booth'
  ) THEN
    ALTER TYPE public.business_type ADD VALUE 'photo_booth';
  END IF;
END $$;