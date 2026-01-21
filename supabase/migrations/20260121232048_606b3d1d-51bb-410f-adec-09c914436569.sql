-- Add explicit decision states for request/approval workflows
DO $$
BEGIN
  -- Add 'approved' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'booking_status' AND e.enumlabel = 'approved'
  ) THEN
    ALTER TYPE public.booking_status ADD VALUE 'approved' BEFORE 'confirmed';
  END IF;

  -- Add 'denied' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'booking_status' AND e.enumlabel = 'denied'
  ) THEN
    ALTER TYPE public.booking_status ADD VALUE 'denied' BEFORE 'cancelled';
  END IF;
END $$;