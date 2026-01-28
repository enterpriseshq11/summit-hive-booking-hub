-- Add deposit tracking columns to voice_vault_bookings table for 1/3 deposit logic
ALTER TABLE public.voice_vault_bookings
ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_balance numeric DEFAULT 0;

-- Update the payment_status enum to include 'deposit_paid' if needed
-- First check existing values
DO $$
BEGIN
  -- Add deposit_paid to the enum if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'deposit_paid' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'voice_vault_payment_status')
  ) THEN
    ALTER TYPE voice_vault_payment_status ADD VALUE IF NOT EXISTS 'deposit_paid';
  END IF;
END $$;

-- Add a comment for documentation
COMMENT ON COLUMN public.voice_vault_bookings.deposit_amount IS 'The 1/3 deposit amount charged at booking time';
COMMENT ON COLUMN public.voice_vault_bookings.remaining_balance IS 'The remaining 2/3 balance due on arrival';